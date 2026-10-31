import mongoose, { Schema, Model, Document } from "mongoose";
import { ChatSenderRole, ChatMessageStatus } from "@/types/chat.types";

export interface IChatMessageDocument extends Document {
  conversationId: mongoose.Types.ObjectId;
  sender: ChatSenderRole;
  senderName: string;
  senderEmail: string;
  senderAvatar?: string;
  content: string;
  status: ChatMessageStatus;
  createdAt: Date;
  readAt?: Date;
}

const ChatMessageSchema = new Schema<IChatMessageDocument>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "ChatConversation",
      required: true,
      index: true,
    },
    sender: {
      type: String,
      enum: ["USER", "ADMIN"],
      required: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    senderEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    senderAvatar: {
      type: String,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["SENT", "DELIVERED", "READ"],
      default: "SENT",
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ChatMessageSchema.index({ conversationId: 1, createdAt: 1 });

export const ChatMessageModel: Model<IChatMessageDocument> =
  mongoose.models.ChatMessage ||
  mongoose.model<IChatMessageDocument>("ChatMessage", ChatMessageSchema);

