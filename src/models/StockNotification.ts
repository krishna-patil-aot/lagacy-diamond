import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IStockNotificationDocument extends Document {
  diamondId: Types.ObjectId;
  diamondSku: string;
  diamondName: string;
  email: string;
  clientName: string;
  notified: boolean;
  notifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StockNotificationSchema = new Schema<IStockNotificationDocument>(
  {
    diamondId: {
      type: Schema.Types.ObjectId,
      ref: "Diamond",
      required: true,
      index: true,
    },
    diamondSku: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    diamondName: {
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
    clientName: {
      type: String,
      default: "Valued Client",
      trim: true,
    },
    notified: {
      type: Boolean,
      default: false,
      index: true,
    },
    notifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate un-notified alerts for the same email and diamond
StockNotificationSchema.index(
  { diamondId: 1, email: 1, notified: 1 },
  { unique: true }
);

export const StockNotificationModel: Model<IStockNotificationDocument> =
  mongoose.models.StockNotification ||
  mongoose.model<IStockNotificationDocument>(
    "StockNotification",
    StockNotificationSchema
  );
