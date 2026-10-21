import mongoose, { Schema, Model, Document } from "mongoose";

export interface ISessionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  refreshTokenHash: string;
  familyId: string;
  isRevoked: boolean;
  revokedAt?: Date;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
      index: true,
    },
    familyId: {
      type: String,
      required: true,
      index: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedAt: {
      type: Date,
    },
    userAgent: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// 1. Native MongoDB TTL Index: automatically prunes expired sessions without background cron jobs
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 2. Compound Indexes for O(1) session verification & revocation lookups
SessionSchema.index({ refreshTokenHash: 1, isRevoked: 1 });
SessionSchema.index({ familyId: 1, isRevoked: 1 });
SessionSchema.index({ userId: 1, isRevoked: 1 });

export const SessionModel: Model<ISessionDocument> =
  mongoose.models.Session || mongoose.model<ISessionDocument>("Session", SessionSchema);
