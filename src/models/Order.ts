import mongoose, { Schema, Model, Document } from "mongoose";
import { IOrder } from "@/types/order.types";

export interface IOrderDocument extends Omit<IOrder, "id">, Document {
  _id: mongoose.Types.ObjectId;
}

const ShippingAddressSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const PaymentInfoSchema = new Schema(
  {
    method: {
      type: String,
      required: true,
      enum: ["CREDIT_CARD", "WIRE_TRANSFER", "VAULT_ESCROW"],
    },
    couponCode: { type: String, uppercase: true, trim: true },
    couponDiscountPercentage: { type: Number, default: 0 },
  },
  { _id: false }
);

const TrackingInfoSchema = new Schema(
  {
    carrier: { type: String, default: "Brink's Global Armored Services" },
    trackingNumber: { type: String, required: true },
    estimatedDeliveryDate: { type: String },
    actualDeliveryDate: { type: String },
    vaultOrigin: { type: String, default: "Geneva Vault Facility A" },
    transitType: {
      type: String,
      enum: ["ARMORED_GROUND", "ARMORED_AIR_ESCORT"],
      default: "ARMORED_GROUND",
    },
    biometricSignatureRequired: { type: Boolean, default: true },
  },
  { _id: false }
);

const TimelineEventSchema = new Schema(
  {
    status: {
      type: String,
      required: true,
      enum: [
        "PENDING_APPROVAL",
        "APPROVED",
        "DISPATCHED",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ],
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String },
    timestamp: { type: String, required: true },
  },
  { _id: false }
);

const OrderItemSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    shape: { type: String, required: true },
    carat: { type: Number, required: true },
    color: { type: String, required: true },
    clarity: { type: String, required: true },
    cut: { type: String, required: true },
    price: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 },
    finalPrice: { type: Number, required: true },
    lab: { type: String, default: "GIA" },
    certificateNumber: { type: String, required: true },
    images: { type: [String], default: [] },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [(val: Array<{ diamondId: string }>) => val.length > 0, "Order must contain at least one item"],
    },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    paymentInfo: { type: PaymentInfoSchema, required: true },
    subtotal: { type: Number, required: true },
    couponDiscount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: [
        "PENDING_APPROVAL",
        "APPROVED",
        "DISPATCHED",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PENDING_APPROVAL",
      index: true,
    },
    trackingInfo: { type: TrackingInfoSchema },
    timeline: { type: [TimelineEventSchema], default: [] },
    approvedAt: { type: String },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ "shippingAddress.email": 1 });
OrderSchema.index({ createdAt: -1 });

export const OrderModel: Model<IOrderDocument> =
  mongoose.models.Order || mongoose.model<IOrderDocument>("Order", OrderSchema);
