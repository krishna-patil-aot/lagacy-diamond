import mongoose, { Schema, Model, Document } from "mongoose";
import { OtpPurpose } from "@/types/auth.types";

export interface IOtpDocument extends Document {
  email: string;
  otpHash: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  verified: boolean;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const OtpSchema = new Schema<IOtpDocument>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["FORGOT_PASSWORD", "LOGIN_VERIFY"],
      default: "FORGOT_PASSWORD",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Automatic MongoDB TTL cleanup upon expiration
    },
    verified: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const OtpModel: Model<IOtpDocument> =
  mongoose.models.Otp || mongoose.model<IOtpDocument>("Otp", OtpSchema);
