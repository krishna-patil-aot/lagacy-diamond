import crypto from "crypto";
import { after } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { JobModel, IJobDocument } from "@/models/Job";
import {
  QueueJobType,
  QueueJobStatus,
  QueueJobPriority,
  QueueJobPayload,
  IEnqueueOptions,
  IEnqueueResult,
  IProcessQueueSummary,
  IQueueTelemetry,
  IQueueJobSummary,
  IRetryJobResponse,
  IPurgeJobResponse,
  IEmailOrderConfirmationPayload,
  IEmailOrderApprovedPayload,
  IEmailOrderCancelledPayload,
  IEmailOrderDocumentsPayload,
  IEmailInquiryReplyPayload,
  IEmailBackInStockPayload,
  IAIConciergeQueryPayload,
  IQueueJobResult,
} from "@/types/queue.types";
import {
  sendOrderReceiptPendingEmail,
  sendOrderApprovedEmail,
  sendOrderCancelledEmail,
  sendOrderDocumentsEmail,
  sendInquiryReplyNotificationEmail,
  sendBackInStockEmail,
} from "@/lib/mailer";
import { getOrderById } from "@/lib/order-repository";
import { executeConciergeInquiry } from "@/lib/concierge-service";
import { cacheGet, cacheSet } from "@/lib/cache-service";

/**
 * In-Memory Fallback Job Record Interface
 * Strictly typed internal record for local development and MongoDB failover resilience.
 */
export interface IInternalMemoryJob {
  jobId: string;
  type: QueueJobType;
  status: QueueJobStatus;
  priority: QueueJobPriority;
  priorityWeight: number;
  payload: QueueJobPayload;
  result?: IQueueJobResult | null;
  attempts: number;
  maxRetries: number;
  nextRunAt: Date;
  idempotencyKey?: string | null;
  lockedAt?: Date | null;
  lockedBy?: string | null;
  error?: string | null;
  errorStack?: string | null;
  completedAt?: Date | null;
  failedAt?: Date | null;
  completedExpiresAt?: Date | null;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type QueueJobExecutable = IJobDocument | IInternalMemoryJob;

const inMemoryJobs = new Map<string, IInternalMemoryJob>();
let isWorkerProcessing = false;
let totalProcessedCounter = 0;
let totalProcessingTimeMs = 0;
const queueStartTime = Date.now();

const LOCK_TIMEOUT_MS = 60 * 1000; // 60 seconds distributed lock timeout
const DEFAULT_MAX_RETRIES = 3;

function getPriorityWeight(priority: QueueJobPriority): number {
  switch (priority) {
    case "critical":
      return 1;
    case "high":
      return 2;
    case "normal":
      return 3;
    case "low":
      return 4;
    default:
      return 3;
  }
}

/**
 * Trigger queue worker safely using Next.js 15+ after() or asynchronous promise
 */
export function triggerBackgroundWorker(): void {
  try {
    after(async () => {
      try {
        await processQueue();
      } catch (err) {
        console.error("[Queue Worker Background Error]:", err);
      }
    });
  } catch {
    // If called outside Next.js request lifecycle, execute via unblocked microtask
    setImmediate(() => {
      void processQueue().catch((err) => {
        console.error("[Queue Worker setImmediate Error]:", err);
      });
    });
  }
}

/**
 * Enqueue an asynchronous job with idempotency deduplication and priority weighting
 */
export async function enqueueJob<T extends QueueJobPayload>(
  type: QueueJobType,
  payload: T,
  options?: IEnqueueOptions
): Promise<IEnqueueResult> {
  const priority = options?.priority || "normal";
  const priorityWeight = getPriorityWeight(priority);
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
  const idempotencyKey = options?.idempotencyKey?.trim() || null;
  const nextRunAt = new Date(Date.now() + (options?.delayMs || 0));

  // 1. Enterprise Idempotency Check: Prevent duplicate jobs within 24h
  if (idempotencyKey) {
    const cachedJobId = await cacheGet<string>(`idemp:job:${idempotencyKey}`);
    if (cachedJobId) {
      return {
        success: true,
        jobId: cachedJobId,
        isDuplicate: true,
        status: "pending",
        message: "Duplicate job suppressed by distributed idempotency filter.",
      };
    }
  }

  const conn = await connectToDatabase();
  const generatedJobId = `job_${crypto.randomUUID()}`;

  if (conn) {
    try {
      if (idempotencyKey) {
        const existingDbJob = await JobModel.findOne({ idempotencyKey }).lean();
        if (existingDbJob) {
          await cacheSet(`idemp:job:${idempotencyKey}`, existingDbJob.jobId, { ttlSeconds: 86400 });
          return {
            success: true,
            jobId: existingDbJob.jobId,
            isDuplicate: true,
            status: existingDbJob.status,
            message: "Existing job returned via database idempotency match.",
          };
        }
      }

      await JobModel.create({
        jobId: generatedJobId,
        type,
        status: "pending",
        priority,
        priorityWeight,
        payload,
        attempts: 0,
        maxRetries,
        nextRunAt,
        idempotencyKey,
        tags: options?.tags || [],
      });
    } catch (dbError) {
      console.warn("⚠️ [Job DB Enqueue Warning - Fallback to Memory]:", dbError);
      // Fallback in-memory
      saveInMemoryJob(generatedJobId, type, payload, priority, priorityWeight, maxRetries, nextRunAt, idempotencyKey);
    }
  } else {
    saveInMemoryJob(generatedJobId, type, payload, priority, priorityWeight, maxRetries, nextRunAt, idempotencyKey);
  }

  // Register idempotency key in cache
  if (idempotencyKey) {
    await cacheSet(`idemp:job:${idempotencyKey}`, generatedJobId, { ttlSeconds: 86400 });
  }

  // Trigger non-blocking worker execution
  triggerBackgroundWorker();

  return {
    success: true,
    jobId: generatedJobId,
    isDuplicate: false,
    status: "pending",
  };
}

function saveInMemoryJob(
  jobId: string,
  type: QueueJobType,
  payload: QueueJobPayload,
  priority: QueueJobPriority,
  priorityWeight: number,
  maxRetries: number,
  nextRunAt: Date,
  idempotencyKey: string | null
): void {
  const memoryDoc: IInternalMemoryJob = {
    jobId,
    type,
    status: "pending",
    priority,
    priorityWeight,
    payload,
    attempts: 0,
    maxRetries,
    nextRunAt,
    idempotencyKey,
    lockedAt: null,
    lockedBy: null,
    error: null,
    errorStack: null,
    completedAt: null,
    failedAt: null,
    completedExpiresAt: null,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  inMemoryJobs.set(jobId, memoryDoc);
}

/**
 * Worker Engine: Polls and executes pending / retrying background tasks
 */
export async function processQueue(options?: {
  maxJobs?: number;
  workerId?: string;
}): Promise<IProcessQueueSummary> {
  const maxJobs = options?.maxJobs ?? 5;
  const workerId = options?.workerId ?? `worker_${crypto.randomBytes(4).toString("hex")}`;
  const startTime = Date.now();

  const summary: IProcessQueueSummary = {
    processedCount: 0,
    succeededCount: 0,
    failedCount: 0,
    deadLetterCount: 0,
    jobIds: [],
    durationMs: 0,
  };

  if (isWorkerProcessing) {
    summary.durationMs = Date.now() - startTime;
    return summary;
  }

  isWorkerProcessing = true;

  try {
    const conn = await connectToDatabase();

    for (let i = 0; i < maxJobs; i++) {
      const now = new Date();
      let acquiredJob: QueueJobExecutable | null = null;

      if (conn) {
        // Atomic acquisition with distributed lock
        acquiredJob = await JobModel.findOneAndUpdate(
          {
            status: { $in: ["pending", "failed"] },
            nextRunAt: { $lte: now },
            attempts: { $lt: DEFAULT_MAX_RETRIES },
            $or: [
              { lockedAt: null },
              { lockedAt: { $lt: new Date(now.getTime() - LOCK_TIMEOUT_MS) } },
            ],
          },
          {
            $set: {
              status: "processing",
              lockedAt: now,
              lockedBy: workerId,
            },
            $inc: { attempts: 1 },
          },
          {
            sort: { priorityWeight: 1, nextRunAt: 1 },
            new: true,
          }
        );
      }

      // In-Memory Fallback Acquisition if no DB job was found
      if (!acquiredJob && inMemoryJobs.size > 0) {
        for (const [id, job] of inMemoryJobs.entries()) {
          const isStaleLock = job.lockedAt && now.getTime() - job.lockedAt.getTime() > LOCK_TIMEOUT_MS;
          if (
            (job.status === "pending" || job.status === "failed") &&
            job.nextRunAt <= now &&
            job.attempts < job.maxRetries &&
            (!job.lockedAt || isStaleLock)
          ) {
            job.status = "processing";
            job.lockedAt = now;
            job.lockedBy = workerId;
            job.attempts += 1;
            acquiredJob = job;
            inMemoryJobs.set(id, job);
            break;
          }
        }
      }

      if (!acquiredJob) {
        // No more eligible jobs in queue
        break;
      }

      summary.processedCount++;
      summary.jobIds.push(acquiredJob.jobId);
      const jobExecutionStart = Date.now();

      try {
        const handlerResult = await executeJobHandler(acquiredJob.type, acquiredJob.payload);

        // Success transition
        const completedAt = new Date();
        const sevenDaysAhead = new Date(completedAt.getTime() + 7 * 24 * 60 * 60 * 1000);

        if (conn) {
          await JobModel.updateOne(
            { jobId: acquiredJob.jobId },
            {
              $set: {
                status: "completed",
                result: handlerResult,
                completedAt,
                completedExpiresAt: sevenDaysAhead,
                lockedAt: null,
                lockedBy: null,
                error: null,
                errorStack: null,
              },
            }
          );
        } else {
          acquiredJob.status = "completed";
          acquiredJob.result = handlerResult;
          acquiredJob.completedAt = completedAt;
          acquiredJob.lockedAt = null;
          acquiredJob.lockedBy = null;
        }

        summary.succeededCount++;
        totalProcessedCounter++;
        totalProcessingTimeMs += (Date.now() - jobExecutionStart);
      } catch (executionError) {
        summary.failedCount++;
        const errorMessage = executionError instanceof Error ? executionError.message : "Unknown execution error";
        const errorStack = executionError instanceof Error ? executionError.stack || null : null;
        const currentAttempts = acquiredJob.attempts;
        const maxRetries = acquiredJob.maxRetries || DEFAULT_MAX_RETRIES;

        if (currentAttempts >= maxRetries) {
          // Move to DEAD-LETTER QUEUE (DLQ)
          const failedAt = new Date();
          console.error(
            `🚨 [DLQ Alert]: Job ${acquiredJob.jobId} (${acquiredJob.type}) exceeded max retries (${maxRetries}). Moving to Dead-Letter Queue: ${errorMessage}`
          );

          if (conn) {
            await JobModel.updateOne(
              { jobId: acquiredJob.jobId },
              {
                $set: {
                  status: "dead_letter",
                  error: errorMessage,
                  errorStack,
                  failedAt,
                  lockedAt: null,
                  lockedBy: null,
                },
              }
            );
          } else {
            acquiredJob.status = "dead_letter";
            acquiredJob.error = errorMessage;
            acquiredJob.errorStack = errorStack;
            acquiredJob.failedAt = failedAt;
            acquiredJob.lockedAt = null;
            acquiredJob.lockedBy = null;
          }

          summary.deadLetterCount++;
        } else {
          // Exponential backoff with jitter: 2^attempts * 1000ms + random jitter
          const backoffDelayMs = Math.min(
            300000,
            Math.pow(2, currentAttempts) * 1000 + Math.floor(Math.random() * 500)
          );
          const nextRetryDate = new Date(Date.now() + backoffDelayMs);

          console.warn(
            `⚠️ [Queue Retry]: Job ${acquiredJob.jobId} attempt ${currentAttempts}/${maxRetries} failed. Retrying at ${nextRetryDate.toISOString()} (+${backoffDelayMs}ms)`
          );

          if (conn) {
            await JobModel.updateOne(
              { jobId: acquiredJob.jobId },
              {
                $set: {
                  status: "failed",
                  error: errorMessage,
                  errorStack,
                  nextRunAt: nextRetryDate,
                  lockedAt: null,
                  lockedBy: null,
                },
              }
            );
          } else {
            acquiredJob.status = "failed";
            acquiredJob.error = errorMessage;
            acquiredJob.errorStack = errorStack;
            acquiredJob.nextRunAt = nextRetryDate;
            acquiredJob.lockedAt = null;
            acquiredJob.lockedBy = null;
          }
        }
      }
    }
  } finally {
    isWorkerProcessing = false;
    summary.durationMs = Date.now() - startTime;
  }

  return summary;
}

/**
 * Dispatch typed job to its dedicated execution worker
 */
async function executeJobHandler(
  type: QueueJobType,
  payload: QueueJobPayload
): Promise<IQueueJobResult> {
  const processedAt = new Date().toISOString();

  switch (type) {
    case "EMAIL_ORDER_CONFIRMATION": {
      const p = payload as IEmailOrderConfirmationPayload;
      const res = await sendOrderReceiptPendingEmail({
        to: p.to,
        clientName: p.clientName,
        orderNumber: p.orderNumber,
        totalAmount: p.totalAmount,
        itemCount: p.itemCount,
      });
      if (!res.success) {
        throw new Error(res.error || "Order receipt pending email dispatch failed.");
      }
      return { success: true, messageId: res.messageId, processedAt };
    }

    case "EMAIL_ORDER_APPROVED": {
      const p = payload as IEmailOrderApprovedPayload;
      const res = await sendOrderApprovedEmail({
        to: p.to,
        clientName: p.clientName,
        orderNumber: p.orderNumber,
        totalAmount: p.totalAmount,
        itemCount: p.itemCount,
      });
      if (!res.success) {
        throw new Error(res.error || "Order approved email dispatch failed.");
      }
      return { success: true, messageId: res.messageId, processedAt };
    }

    case "EMAIL_ORDER_CANCELLED": {
      const p = payload as IEmailOrderCancelledPayload;
      const res = await sendOrderCancelledEmail({
        to: p.to,
        clientName: p.clientName,
        orderNumber: p.orderNumber,
        reason: p.reason,
      });
      if (!res.success) {
        throw new Error(res.error || "Order cancelled email dispatch failed.");
      }
      return { success: true, messageId: res.messageId, processedAt };
    }

    case "EMAIL_ORDER_DOCUMENTS": {
      const p = payload as IEmailOrderDocumentsPayload;
      const order = await getOrderById(p.orderId);
      if (!order) {
        throw new Error(`Order ${p.orderId} not found in database for document dispatch.`);
      }
      const res = await sendOrderDocumentsEmail(order, {
        subject: p.subject,
        statusTitle: p.statusTitle,
        fulfillmentStatus: p.fulfillmentStatus,
      });
      if (!res.success) {
        throw new Error(res.error || "Order PDF documents email dispatch failed.");
      }
      return { success: true, messageId: res.messageId, processedAt };
    }

    case "EMAIL_INQUIRY_REPLY": {
      const p = payload as IEmailInquiryReplyPayload;
      const res = await sendInquiryReplyNotificationEmail({
        to: p.to,
        clientName: p.clientName,
        inquiryNumber: p.inquiryNumber,
        inquiryType: p.inquiryType,
        adminReply: p.adminReply,
      });
      if (!res.success) {
        throw new Error(res.error || "Inquiry reply notification email dispatch failed.");
      }
      return { success: true, messageId: res.messageId, processedAt };
    }

    case "EMAIL_BACK_IN_STOCK": {
      const p = payload as IEmailBackInStockPayload;
      const res = await sendBackInStockEmail({
        to: p.to,
        clientName: p.clientName,
        diamond: {
          _id: p.diamondId,
          name: p.diamondName,
          sku: p.diamondSku,
          shape: p.diamondShape,
          carat: p.diamondCarat,
          color: p.diamondColor,
          clarity: p.diamondClarity,
          cut: p.diamondCut,
          finalPrice: p.diamondPrice,
          stockQuantity: p.stockQuantity,
          images: p.images,
        },
      });
      if (!res.success) {
        throw new Error(res.error || "Back in stock email dispatch failed.");
      }
      return { success: true, messageId: res.messageId, processedAt };
    }

    case "AI_CONCIERGE_QUERY": {
      const p = payload as IAIConciergeQueryPayload;
      const response = await executeConciergeInquiry(p.userQuery);
      // Cache AI response for instant recall
      const cacheHash = crypto.createHash("sha256").update(p.userQuery.trim().toLowerCase()).digest("hex");
      await cacheSet(`ai:concierge:${cacheHash}`, response, { ttlSeconds: 3600 });

      return {
        success: true,
        processedAt,
        matchedCount: response.matchedDiamonds.length,
        aiReplySnippet: response.reply.slice(0, 100),
      };
    }

    default:
      throw new Error(`Unsupported queue job type: ${String(type)}`);
  }
}

/**
 * Diagnostic & Telemetry: Get comprehensive health, metrics, and DLQ status
 */
export async function getQueueTelemetry(): Promise<IQueueTelemetry> {
  const conn = await connectToDatabase();
  const now = new Date();

  let pendingCount = 0;
  let processingCount = 0;
  let completedCount = 0;
  let failedCount = 0;
  let deadLetterCount = 0;
  let recentJobs: IQueueJobSummary[] = [];
  let deadLetterJobs: IQueueJobSummary[] = [];

  if (conn) {
    try {
      const [pending, processing, completed, failed, deadLetter] = await Promise.all([
        JobModel.countDocuments({ status: "pending" }),
        JobModel.countDocuments({ status: "processing" }),
        JobModel.countDocuments({ status: "completed" }),
        JobModel.countDocuments({ status: "failed" }),
        JobModel.countDocuments({ status: "dead_letter" }),
      ]);

      pendingCount = pending;
      processingCount = processing;
      completedCount = completed;
      failedCount = failed;
      deadLetterCount = deadLetter;

      const recentDocs = await JobModel.find().sort({ createdAt: -1 }).limit(10).lean();
      recentJobs = recentDocs.map(mapDocToSummary);

      const dlqDocs = await JobModel.find({ status: "dead_letter" }).sort({ failedAt: -1 }).limit(20).lean();
      deadLetterJobs = dlqDocs.map(mapDocToSummary);
    } catch (err) {
      console.warn("⚠️ [Queue Telemetry DB Query Error - Fallback]:", err);
    }
  }

  // Combine with in-memory jobs if any
  for (const job of inMemoryJobs.values()) {
    if (job.status === "pending") pendingCount++;
    else if (job.status === "processing") processingCount++;
    else if (job.status === "completed") completedCount++;
    else if (job.status === "failed") failedCount++;
    else if (job.status === "dead_letter") {
      deadLetterCount++;
      deadLetterJobs.push(mapDocToSummary(job));
    }
  }

  const totalJobs = pendingCount + processingCount + completedCount + failedCount + deadLetterCount;
  const elapsedMinutes = Math.max(0.1, (now.getTime() - queueStartTime) / (60 * 1000));
  const throughputPerMinute = Number((totalProcessedCounter / elapsedMinutes).toFixed(2));
  const averageProcessingTimeMs =
    totalProcessedCounter > 0 ? Math.round(totalProcessingTimeMs / totalProcessedCounter) : 0;

  return {
    totalJobs,
    pendingCount,
    processingCount,
    completedCount,
    failedCount,
    deadLetterCount,
    throughputPerMinute,
    averageProcessingTimeMs,
    recentJobs,
    deadLetterJobs,
    activeWorker: isWorkerProcessing,
    timestamp: now.toISOString(),
  };
}

function mapDocToSummary(doc: {
  jobId: string;
  type: QueueJobType;
  status: string;
  priority: QueueJobPriority;
  attempts: number;
  maxRetries: number;
  idempotencyKey?: string | null;
  error?: string | null;
  createdAt: Date;
  nextRunAt: Date;
  completedAt?: Date | null;
  failedAt?: Date | null;
  payload?: QueueJobPayload;
}): IQueueJobSummary {
  const statusTyped: QueueJobStatus =
    doc.status === "completed" ||
    doc.status === "processing" ||
    doc.status === "pending" ||
    doc.status === "failed" ||
    doc.status === "dead_letter"
      ? doc.status
      : "pending";
  let recipientOrTarget: string | undefined;

  if (doc.payload) {
    if ("to" in doc.payload && typeof doc.payload.to === "string") {
      recipientOrTarget = doc.payload.to;
    } else if ("userQuery" in doc.payload && typeof doc.payload.userQuery === "string") {
      recipientOrTarget = doc.payload.userQuery.slice(0, 30);
    } else if ("orderId" in doc.payload && typeof doc.payload.orderId === "string") {
      recipientOrTarget = `Order ${doc.payload.orderId}`;
    }
  }

  return {
    jobId: doc.jobId,
    type: doc.type,
    status: statusTyped,
    priority: doc.priority,
    attempts: doc.attempts,
    maxRetries: doc.maxRetries,
    idempotencyKey: doc.idempotencyKey || null,
    error: doc.error || null,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
    nextRunAt: doc.nextRunAt instanceof Date ? doc.nextRunAt.toISOString() : String(doc.nextRunAt),
    completedAt: doc.completedAt ? (doc.completedAt instanceof Date ? doc.completedAt.toISOString() : String(doc.completedAt)) : null,
    failedAt: doc.failedAt ? (doc.failedAt instanceof Date ? doc.failedAt.toISOString() : String(doc.failedAt)) : null,
    recipientOrTarget,
  };
}

/**
 * Replay a dead-letter job from DLQ back to active queue
 */
export async function retryDeadLetterJob(jobId: string): Promise<IRetryJobResponse> {
  const conn = await connectToDatabase();
  let retriedCount = 0;

  if (conn) {
    const res = await JobModel.updateOne(
      { jobId, status: "dead_letter" },
      {
        $set: {
          status: "pending",
          attempts: 0,
          nextRunAt: new Date(),
          lockedAt: null,
          lockedBy: null,
          error: null,
          errorStack: null,
          failedAt: null,
        },
      }
    );
    retriedCount = res.modifiedCount;
  }

  const memoryJob = inMemoryJobs.get(jobId);
  if (memoryJob && memoryJob.status === "dead_letter") {
    memoryJob.status = "pending";
    memoryJob.attempts = 0;
    memoryJob.nextRunAt = new Date();
    memoryJob.lockedAt = null;
    memoryJob.lockedBy = null;
    memoryJob.error = null;
    memoryJob.failedAt = null;
    retriedCount++;
  }

  if (retriedCount > 0) {
    triggerBackgroundWorker();
  }

  return {
    success: retriedCount > 0,
    message: retriedCount > 0 ? `Job ${jobId} restored to active queue.` : `Job ${jobId} not found in DLQ.`,
    retriedCount,
  };
}

/**
 * Mass retry all dead-letter jobs (e.g. after network or SMTP recovery)
 */
export async function retryAllDeadLetterJobs(): Promise<IRetryJobResponse> {
  const conn = await connectToDatabase();
  let retriedCount = 0;

  if (conn) {
    const res = await JobModel.updateMany(
      { status: "dead_letter" },
      {
        $set: {
          status: "pending",
          attempts: 0,
          nextRunAt: new Date(),
          lockedAt: null,
          lockedBy: null,
          error: null,
          errorStack: null,
          failedAt: null,
        },
      }
    );
    retriedCount = res.modifiedCount;
  }

  for (const job of inMemoryJobs.values()) {
    if (job.status === "dead_letter") {
      job.status = "pending";
      job.attempts = 0;
      job.nextRunAt = new Date();
      job.lockedAt = null;
      job.lockedBy = null;
      job.error = null;
      retriedCount++;
    }
  }

  if (retriedCount > 0) {
    triggerBackgroundWorker();
  }

  return {
    success: true,
    message: `Restored ${retriedCount} dead-letter job(s) to active queue.`,
    retriedCount,
  };
}

/**
 * Purge a specific job or all completed jobs
 */
export async function purgeJob(jobId: string): Promise<IPurgeJobResponse> {
  const conn = await connectToDatabase();
  let purgedCount = 0;

  if (conn) {
    const res = await JobModel.deleteOne({ jobId });
    purgedCount = res.deletedCount;
  }

  if (inMemoryJobs.has(jobId)) {
    inMemoryJobs.delete(jobId);
    purgedCount++;
  }

  return {
    success: purgedCount > 0,
    message: `Purged job ${jobId}.`,
    purgedCount,
  };
}

/**
 * Purge completed jobs older than specified hours
 */
export async function purgeCompletedJobs(olderThanHours: number = 24): Promise<IPurgeJobResponse> {
  const conn = await connectToDatabase();
  const cutoffDate = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
  let purgedCount = 0;

  if (conn) {
    const res = await JobModel.deleteMany({
      status: "completed",
      completedAt: { $lt: cutoffDate },
    });
    purgedCount = res.deletedCount;
  }

  for (const [id, job] of inMemoryJobs.entries()) {
    if (job.status === "completed" && job.completedAt && job.completedAt < cutoffDate) {
      inMemoryJobs.delete(id);
      purgedCount++;
    }
  }

  return {
    success: true,
    message: `Purged ${purgedCount} completed jobs older than ${olderThanHours}h.`,
    purgedCount,
  };
}
