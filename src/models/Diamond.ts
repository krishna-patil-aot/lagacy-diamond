import mongoose, { Schema, Model, Document } from "mongoose";
import { IDiamond } from "@/types/diamond.types";

export interface IDiamondDocument extends Omit<IDiamond, "_id">, Document {}

const DiamondSchema = new Schema<IDiamondDocument>(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    shape: {
      type: String,
      required: true,
      enum: [
        "Round",
        "Princess",
        "Cushion",
        "Emerald",
        "Oval",
        "Radiant",
        "Pear",
        "Marquise",
        "Asscher",
        "Heart",
      ],
    },
    carat: { type: Number, required: true, min: 0.1, max: 50 },
    color: {
      type: String,
      required: true,
      enum: ["D", "E", "F", "G", "H", "I", "J", "K"],
    },
    clarity: {
      type: String,
      required: true,
      enum: ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"],
    },
    cut: {
      type: String,
      required: true,
      enum: ["Ideal", "Excellent", "Very Good", "Good"],
    },
    price: { type: Number, required: true, min: 100 },
    discountPercentage: { type: Number, default: 0, min: 0, max: 90 },
    finalPrice: { type: Number, required: true },
    lab: {
      type: String,
      required: true,
      enum: ["GIA", "IGI", "AGS", "HRD"],
    },
    certificateNumber: { type: String, required: true },
    dimensions: {
      length: { type: Number, required: true },
      width: { type: Number, required: true },
      depth: { type: Number, required: true },
    },
    tablePercentage: { type: Number, required: true },
    depthPercentage: { type: Number, required: true },
    polish: {
      type: String,
      required: true,
      enum: ["Ideal", "Excellent", "Very Good", "Good"],
    },
    symmetry: {
      type: String,
      required: true,
      enum: ["Ideal", "Excellent", "Very Good", "Good"],
    },
    fluorescence: {
      type: String,
      required: true,
      enum: ["None", "Faint", "Medium", "Strong"],
    },
    images: { type: [String], default: [] },
    description: { type: String, required: true },
    stockQuantity: { type: Number, default: 1, min: 0 },
    featured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Indexes for high performance multi-attribute filtering
DiamondSchema.index({ price: 1, carat: 1 });
DiamondSchema.index({ shape: 1, color: 1, cut: 1 });
DiamondSchema.index({ discountPercentage: -1 });

export const DiamondModel: Model<IDiamondDocument> =
  mongoose.models.Diamond || mongoose.model<IDiamondDocument>("Diamond", DiamondSchema);
