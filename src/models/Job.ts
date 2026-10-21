import mongoose, { Schema, Model, Document } from "mongoose";
import {
  QueueJobType,
  QueueJobStatus,
  QueueJobPriority,
  QueueJobPayload,
  IQueueJobResult,
} from "@/types/queue.types";

export interface IJobDocument extends Document {
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

const JobSchema = new Schema<IJobDocument>(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "dead_letter"],
      default: "pending",
      index: true,
    },
    priority: {
      type: String,
      enum: ["critical", "high", "normal", "low"],
      default: "normal",
      index: true,
    },
    priorityWeight: {
      type: Number,
      default: 3,
      index: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    result: {
      type: Schema.Types.Mixed,
      default: null,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    nextRunAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      index: true,
    },
    lockedAt: {
      type: Date,
      default: null,
    },
    lockedBy: {
      type: String,
      default: null,
    },
    error: {
      type: String,
      default: null,
    },
    errorStack: {
      type: String,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    failedAt: {
      type: Date,
      default: null,
    },
    completedExpiresAt: {
      type: Date,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// 1. High-throughput compound index: Atomically poll next executable job ordered by priority and schedule
JobSchema.index({ status: 1, priorityWeight: 1, nextRunAt: 1, lockedAt: 1 });

// 2. Dead-letter queue telemetry index: Quick inspection of failed / stalled jobs
JobSchema.index({ status: 1, createdAt: -1 });

// 3. Native TTL index: Automatically prune completed jobs after 7 days without manual cron scripts
// Note: Only completed jobs have `completedExpiresAt` populated. DLQ jobs are preserved indefinitely.
JobSchema.index({ completedExpiresAt: 1 }, { expireAfterSeconds: 0 });

export const JobModel: Model<IJobDocument> =
  mongoose.models.Job || mongoose.model<IJobDocument>("Job", JobSchema);
