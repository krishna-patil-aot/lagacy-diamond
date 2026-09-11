import mongoose, { Schema, Model, Document } from "mongoose";
import { UserRole } from "@/types/auth.types";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  avatarUrl?: string;
  authProvider: "credentials" | "google";
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String },
    role: {
      type: String,
      enum: ["ADMIN", "CUSTOMER"],
      default: "CUSTOMER",
    },
    avatarUrl: { type: String },
    authProvider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    googleId: { type: String },
  },
  {
    timestamps: true,
  }
);

export const UserModel: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);
