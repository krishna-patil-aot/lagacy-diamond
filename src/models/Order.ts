import mongoose, { Schema, Model, Document } from "mongoose";
import { IOrder } from "@/types/order.types";

export interface IOrderDocument extends Omit<IOrder, "id" | "userId">, Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId | string;
}

const ShippingAddressSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true, default: "Valued Client" },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    street: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    postalCode: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "India" },
  },
  { _id: false }
);

const PaymentInfoSchema = new Schema(
  {
    method: {
      type: String,
      required: true,
      default: "CREDIT_CARD",
    },
    couponCode: { type: String, uppercase: true, trim: true, default: "" },
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
    _id: { type: String, required: true, default: () => new mongoose.Types.ObjectId().toString() },
    name: { type: String, required: true, default: "Certified Natural Diamond" },
    sku: { type: String, required: true, default: () => `DIA-${Date.now().toString().slice(-6)}` },
    shape: { type: String, required: true, default: "Round" },
    carat: { type: Number, required: true, default: 1.0 },
    color: { type: String, required: true, default: "F" },
    clarity: { type: String, required: true, default: "VS1" },
    cut: { type: String, required: true, default: "Ideal" },
    price: { type: Number, required: true, default: 0 },
    discountPercentage: { type: Number, default: 0 },
    finalPrice: { type: Number, required: true, default: 0 },
    lab: { type: String, default: "GIA" },
    certificateNumber: {
      type: String,
      required: true,
      default: () => `GIA-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    },
    images: { type: [String], default: [] },
    dimensions: {
      length: { type: Number, default: 6.5 },
      width: { type: Number, default: 6.5 },
      depth: { type: Number, default: 4.0 },
    },
    tablePercentage: { type: Number, default: 58 },
    depthPercentage: { type: Number, default: 61.5 },
    polish: { type: String, default: "Excellent" },
    symmetry: { type: String, default: "Excellent" },
    fluorescence: { type: String, default: "None" },
    description: { type: String, default: "" },
    stockQuantity: { type: Number, default: 1 },
    featured: { type: Boolean, default: false },
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
