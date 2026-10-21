import mongoose, { Schema, Model, Document } from "mongoose";
import { SecurityEventType, SecuritySeverity } from "@/types/security.types";

export interface ISecurityAuditDocument extends Document {
  auditId: string;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  ipAddress: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  userId?: string;
  userEmail?: string;
  details?: Record<string, string | number | boolean | null>;
  createdAt: Date;
}

const SecurityAuditSchema = new Schema<ISecurityAuditDocument>(
  {
    auditId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ["INFO", "WARN", "CRITICAL"],
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
      required: true,
      index: true,
    },
    userAgent: {
      type: String,
    },
    endpoint: {
      type: String,
      index: true,
    },
    method: {
      type: String,
    },
    userId: {
      type: String,
      index: true,
    },
    userEmail: {
      type: String,
      index: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// 1. Compound index for querying critical threat logs by time
SecurityAuditSchema.index({ severity: 1, createdAt: -1 });

// 2. Incident forensics index by IP address and timestamp
SecurityAuditSchema.index({ ipAddress: 1, createdAt: -1 });

// 3. Native TTL index: 30-day compliance retention policy
SecurityAuditSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const SecurityAuditModel: Model<ISecurityAuditDocument> =
  mongoose.models.SecurityAudit ||
  mongoose.model<ISecurityAuditDocument>("SecurityAudit", SecurityAuditSchema);
