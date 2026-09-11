import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";
import { IUser, UserRole } from "@/types/auth.types";
import { sanitizeUser } from "@/lib/auth";

interface IMemoryUser {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  avatarUrl?: string;
  authProvider: "credentials" | "google";
  googleId?: string;
  createdAt: string;
}

// In-memory fallback dataset for isolated environments
const memoryUsers: IMemoryUser[] = [];

export async function findUserByEmail(email: string): Promise<{ user: IUser; passwordHash?: string } | null> {
  const normalized = email.toLowerCase().trim();
  const mongoose = await connectToDatabase();

  if (mongoose) {
    const doc = await UserModel.findOne({ email: normalized }).lean();
    if (!doc) return null;

    const rawDoc = doc as typeof doc & { password?: string; role?: string };
    const normalizedRole: UserRole =
      String(rawDoc.role || "").toUpperCase() === "ADMIN" ? "ADMIN" : "CUSTOMER";
    const resolvedPasswordHash = rawDoc.passwordHash || rawDoc.password;

    return {
      user: sanitizeUser({
        id: String(doc._id),
        name: doc.name,
        email: doc.email,
        role: normalizedRole,
        avatarUrl: doc.avatarUrl,
        authProvider: doc.authProvider,
        createdAt: doc.createdAt,
      }),
      passwordHash: resolvedPasswordHash,
    };
  }

  const found = memoryUsers.find((u) => u.email === normalized);
  if (!found) return null;
  return {
    user: sanitizeUser(found),
    passwordHash: found.passwordHash,
  };
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash?: string;
  role?: UserRole;
  authProvider?: "credentials" | "google";
  googleId?: string;
  avatarUrl?: string;
}): Promise<IUser> {
  const normalized = data.email.toLowerCase().trim();
  const role = data.role || "CUSTOMER";
  const authProvider = data.authProvider || "credentials";

  const mongoose = await connectToDatabase();
  if (mongoose) {
    const created = await UserModel.create({
      name: data.name,
      email: normalized,
      passwordHash: data.passwordHash,
      role,
      authProvider,
      googleId: data.googleId,
      avatarUrl: data.avatarUrl,
    });
    return sanitizeUser({
      id: String(created._id),
      name: created.name,
      email: created.email,
      role: created.role,
      avatarUrl: created.avatarUrl,
      authProvider: created.authProvider,
      createdAt: created.createdAt,
    });
  }

  const newUser: IMemoryUser = {
    id: `usr-${Date.now()}`,
    name: data.name,
    email: normalized,
    passwordHash: data.passwordHash,
    role,
    avatarUrl: data.avatarUrl,
    authProvider,
    googleId: data.googleId,
    createdAt: new Date().toISOString(),
  };

  memoryUsers.push(newUser);
  return sanitizeUser(newUser);
}
