import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUser, UserRole } from "@/types/auth.types";

const JWT_SECRET = process.env.JWT_SECRET || "diamond-luxury-secret-key-2026-production";

export interface IJwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: IJwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): IJwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as IJwtPayload;
  } catch {
    return null;
  }
}

export function sanitizeUser(user: {
  _id?: string | { toString(): string };
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  authProvider: "credentials" | "google";
  createdAt?: string | Date;
}): IUser {
  return {
    id: String(user.id || user._id || ""),
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    authProvider: user.authProvider,
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
  };
}
