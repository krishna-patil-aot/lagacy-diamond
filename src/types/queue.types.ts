/**
 * Enterprise Queue & Asynchronous Processing Types
 * Strict typing for background jobs, retries, dead-letter queues (DLQ), and idempotency.
 */

export const QUEUE_JOB_TYPES = {
  EMAIL_ORDER_CONFIRMATION: "EMAIL_ORDER_CONFIRMATION",
  EMAIL_ORDER_APPROVED: "EMAIL_ORDER_APPROVED",
  EMAIL_ORDER_CANCELLED: "EMAIL_ORDER_CANCELLED",
  EMAIL_ORDER_DOCUMENTS: "EMAIL_ORDER_DOCUMENTS",
  EMAIL_INQUIRY_REPLY: "EMAIL_INQUIRY_REPLY",
  EMAIL_BACK_IN_STOCK: "EMAIL_BACK_IN_STOCK",
  AI_CONCIERGE_QUERY: "AI_CONCIERGE_QUERY",
} as const;

export type QueueJobType = (typeof QUEUE_JOB_TYPES)[keyof typeof QUEUE_JOB_TYPES];

export const QUEUE_JOB_STATUSES = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  DEAD_LETTER: "dead_letter",
} as const;

export type QueueJobStatus = (typeof QUEUE_JOB_STATUSES)[keyof typeof QUEUE_JOB_STATUSES];

export const QUEUE_JOB_PRIORITIES = {
  CRITICAL: "critical", // 1
  HIGH: "high",         // 2
  NORMAL: "normal",     // 3
  LOW: "low",           // 4
} as const;

export type QueueJobPriority = (typeof QUEUE_JOB_PRIORITIES)[keyof typeof QUEUE_JOB_PRIORITIES];

// --- Strongly-Typed Payloads (No 'any', No 'unknown') ---

export interface IEmailOrderConfirmationPayload {
  to: string;
  clientName: string;
  orderNumber: string;
  totalAmount: number;
  itemCount: number;
  orderId?: string;
}

export interface IEmailOrderApprovedPayload {
  to: string;
  clientName: string;
  orderNumber: string;
  totalAmount: number;
  itemCount: number;
  orderId?: string;
}

export interface IEmailOrderCancelledPayload {
  to: string;
  clientName: string;
  orderNumber: string;
  reason?: string;
  orderId?: string;
}

export interface IEmailOrderDocumentsPayload {
  orderId: string;
  recipientEmail?: string;
  subject?: string;
  statusTitle?: string;
  fulfillmentStatus?: string;
}

export interface IEmailInquiryReplyPayload {
  to: string;
  clientName: string;
  inquiryNumber: string;
  inquiryType: string;
  adminReply: string;
  inquiryId?: string;
}

export interface IEmailBackInStockPayload {
  to: string;
  clientName: string;
  diamondId: string;
  diamondName: string;
  diamondSku: string;
  diamondShape: string;
  diamondCarat: number;
  diamondColor: string;
  diamondClarity: string;
  diamondCut: string;
  diamondPrice: number;
  stockQuantity: number;
  images?: string[];
}

export interface IAIChatHistoryEntry {
  role: "user" | "assistant";
  content: string;
}

export interface IAIConciergeQueryPayload {
  userQuery: string;
  chatHistory?: IAIChatHistoryEntry[];
  sessionId?: string;
}

export type QueueJobPayload =
  | IEmailOrderConfirmationPayload
  | IEmailOrderApprovedPayload
  | IEmailOrderCancelledPayload
  | IEmailOrderDocumentsPayload
  | IEmailInquiryReplyPayload
  | IEmailBackInStockPayload
  | IAIConciergeQueryPayload;

export interface IQueueJobResult {
  success: boolean;
  messageId?: string;
  error?: string;
  processedAt: string;
  matchedCount?: number;
  aiReplySnippet?: string;
  bytesTransferred?: number;
}

export interface IEnqueueOptions {
  idempotencyKey?: string;
  priority?: QueueJobPriority;
  maxRetries?: number;
  delayMs?: number;
  tags?: string[];
}

export interface IEnqueueResult {
  success: boolean;
  jobId: string;
  isDuplicate: boolean;
  status: QueueJobStatus;
  message?: string;
}

export interface IQueueJobRecord {
  jobId: string;
  type: QueueJobType;
  status: QueueJobStatus;
  priority: QueueJobPriority;
  priorityWeight: number;
  payload: QueueJobPayload;
  result?: IQueueJobResult | null;
  attempts: number;
  maxRetries: number;
  nextRunAt: string;
  idempotencyKey?: string | null;
  lockedAt?: string | null;
  lockedBy?: string | null;
  error?: string | null;
  errorStack?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  failedAt?: string | null;
}

export interface IQueueJobSummary {
  jobId: string;
  type: QueueJobType;
  status: QueueJobStatus;
  priority: QueueJobPriority;
  attempts: number;
  maxRetries: number;
  idempotencyKey?: string | null;
  error?: string | null;
  createdAt: string;
  nextRunAt: string;
  completedAt?: string | null;
  failedAt?: string | null;
  recipientOrTarget?: string;
}

export interface IQueueTelemetry {
  totalJobs: number;
  pendingCount: number;
  processingCount: number;
  completedCount: number;
  failedCount: number;
  deadLetterCount: number;
  throughputPerMinute: number;
  averageProcessingTimeMs: number;
  recentJobs: IQueueJobSummary[];
  deadLetterJobs: IQueueJobSummary[];
  activeWorker: boolean;
  timestamp: string;
}

export interface IProcessQueueSummary {
  processedCount: number;
  succeededCount: number;
  failedCount: number;
  deadLetterCount: number;
  jobIds: string[];
  durationMs: number;
}

export interface IRetryJobResponse {
  success: boolean;
  message: string;
  retriedCount: number;
}

export interface IPurgeJobResponse {
  success: boolean;
  message: string;
  purgedCount: number;
}
