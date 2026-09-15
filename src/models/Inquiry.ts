import mongoose, { Schema, Model, Document } from "mongoose";
import { IInquiry } from "@/types/inquiry.types";

export interface IInquiryDocument extends Omit<IInquiry, "id" | "repliedAt">, Document {
  _id: mongoose.Types.ObjectId;
  repliedAt?: Date | null;
}

const InquirySchema = new Schema<IInquiryDocument>(
  {
    inquiryNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    inquiryType: {
      type: String,
      required: true,
      enum: [
        "CUSTOM_ENGAGEMENT_RING",
        "PRIVATE_VAULT_VIEWING",
        "INVESTMENT_GEMSTONE",
        "CERTIFICATE_AUTHENTICATION",
        "ORDER_CONCIERGE",
        "GENERAL_INQUIRY",
      ],
      default: "GENERAL_INQUIRY",
    },
    preferredCaratRange: {
      type: String,
      trim: true,
      default: "",
    },
    budgetRange: {
      type: String,
      trim: true,
      default: "",
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["NEW", "IN_PROGRESS", "RESOLVED"],
      default: "NEW",
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      default: "",
    },
    adminReply: {
      type: String,
      trim: true,
      default: "",
    },
    repliedAt: {
      type: Date,
      default: null,
    },
    repliedBy: {
      type: String,
      trim: true,
      default: "",
    },
    isClientRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    unreadClientCount: {
      type: Number,
      default: 0,
    },
    unreadAdminCount: {
      type: Number,
      default: 1,
    },
    messages: [
      {
        id: { type: String, required: true },
        sender: {
          type: String,
          enum: ["CLIENT", "ADMIN", "SYSTEM"],
          required: true,
        },
        senderName: { type: String, required: true },
        senderEmail: { type: String, required: true },
        message: { type: String, required: true },
        createdAt: { type: String, required: true },
        readAt: { type: String, default: undefined },
      },
    ],
  },
  {
    timestamps: true,
  }
);

InquirySchema.index({ createdAt: -1 });

export const InquiryModel: Model<IInquiryDocument> =
  mongoose.models.Inquiry || mongoose.model<IInquiryDocument>("Inquiry", InquirySchema);
