import mongoose, { Schema, Model, Document } from "mongoose";
import { IChatParticipant, ChatSenderRole, ChatMessageStatus } from "@/types/chat.types";

export interface IChatConversationDocument extends Document {
  channelId: string;
  userId?: mongoose.Types.ObjectId;
  participant: IChatParticipant;
  lastMessage?: {
    content: string;
    sender: ChatSenderRole;
    createdAt: string;
    status: ChatMessageStatus;
  };
  unreadCountAdmin: number;
  unreadCountUser: number;
  status: "ACTIVE" | "ARCHIVED";
  createdAt: Date;
  updatedAt: Date;
}

const ChatConversationSchema = new Schema<IChatConversationDocument>(
  {
    channelId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    participant: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true, index: true },
      phone: { type: String, trim: true, default: "" },
      role: {
        type: String,
        enum: ["CUSTOMER", "GUEST", "ADMIN"],
        default: "GUEST",
      },
      avatarUrl: { type: String },
    },
    lastMessage: {
      content: { type: String, default: "" },
      sender: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
      createdAt: { type: String, default: "" },
      status: {
        type: String,
        enum: ["SENT", "DELIVERED", "READ"],
        default: "SENT",
      },
    },
    unreadCountAdmin: {
      type: Number,
      default: 0,
    },
    unreadCountUser: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "ARCHIVED"],
      default: "ACTIVE",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ChatConversationSchema.index({ updatedAt: -1 });
ChatConversationSchema.index({ "participant.email": 1, updatedAt: -1 });
ChatConversationSchema.index({ unreadCountAdmin: 1 });

export const ChatConversationModel: Model<IChatConversationDocument> =
  mongoose.models.ChatConversation ||
  mongoose.model<IChatConversationDocument>("ChatConversation", ChatConversationSchema);

