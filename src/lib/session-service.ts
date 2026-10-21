import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { SessionModel } from "@/models/Session";
import { findUserById } from "@/lib/user-repository";
import { signAccessToken } from "@/lib/auth";
import { logSecurityEvent } from "@/lib/security-logger";
import { ISession, ITokenPair, IUser } from "@/types/auth.types";

export const ACCESS_TOKEN_EXPIRY_SEC = 15 * 60; // 15 minutes
export const REFRESH_TOKEN_EXPIRY_SEC = 7 * 24 * 60 * 60; // 7 days

export const ACCESS_COOKIE_NAME = "diamond_session";
export const REFRESH_COOKIE_NAME = "diamond_refresh_token";

// In-memory fallback for isolated/test environments without MongoDB
const memorySessions: ISession[] = [];

/**
 * Hashes raw refresh token using SHA-256 before database persistence.
 * Prevents plain-text token exposure even in the event of database exfiltration.
 */
export function hashRefreshToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generates a high-entropy cryptographically secure opaque token.
 */
export function generateOpaqueToken(): string {
  return crypto.randomBytes(40).toString("hex");
}

/**
 * Creates an enterprise bifurcated session:
 * Issues a 15-minute Access Token and a 7-day Refresh Token with family lineage tracking.
 */
export async function createSession(
  userId: string,
  userAgent?: string,
  ipAddress?: string,
  existingFamilyId?: string
): Promise<{ tokenPair: ITokenPair; user: IUser | null }> {
  const rawRefreshToken = generateOpaqueToken();
  const tokenHash = hashRefreshToken(rawRefreshToken);
  const familyId = existingFamilyId || crypto.randomUUID();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_SEC * 1000);
  const createdAt = new Date();

  const mongoose = await connectToDatabase();
  if (mongoose) {
    try {
      await SessionModel.create({
        userId,
        refreshTokenHash: tokenHash,
        familyId,
        isRevoked: false,
        userAgent,
        ipAddress,
        expiresAt,
      });
    } catch (err) {
      console.error("[SessionService] DB Session creation failed:", err);
    }
  } else {
    memorySessions.push({
      id: `sess-${Date.now()}`,
      userId,
      refreshTokenHash: tokenHash,
      familyId,
      isRevoked: false,
      userAgent,
      ipAddress,
      expiresAt: expiresAt.toISOString(),
      createdAt: createdAt.toISOString(),
    });
  }

  const user = await findUserById(userId);
  const accessToken = user
    ? signAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      })
    : "";

  return {
    tokenPair: {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: ACCESS_TOKEN_EXPIRY_SEC,
    },
    user,
  };
}

/**
 * Refresh Token Rotation (RTR) Engine with Automated Breach & Replay Detection:
 * If an already-revoked refresh token is presented:
 * 1. An adversary has likely intercepted a previously used refresh token.
 * 2. Immediately revokes the entire session family (invalidating all sessions for that device lineage).
 * 3. Alerts security audit trail.
 */
export async function rotateRefreshToken(
  rawRefreshToken: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ tokenPair: ITokenPair; user: IUser } | null> {
  if (!rawRefreshToken || typeof rawRefreshToken !== "string") {
    return null;
  }

  const tokenHash = hashRefreshToken(rawRefreshToken);
  const now = new Date();
  const mongoose = await connectToDatabase();

  if (mongoose) {
    try {
      const existingSession = await SessionModel.findOne({ refreshTokenHash: tokenHash });
      if (!existingSession) {
        return null;
      }

      // 1. Replay / Breach Detection
      if (existingSession.isRevoked) {
        console.warn(
          `[SECURITY ALERT] Replay attack detected! Revoking entire session family: ${existingSession.familyId}`
        );
        void logSecurityEvent({
          eventType: "TOKEN_REUSE_DETECTED",
          severity: "CRITICAL",
          ipAddress: ipAddress || "127.0.0.1",
          userAgent,
          userId: String(existingSession.userId),
          details: { familyId: existingSession.familyId },
        });
        await SessionModel.updateMany(
          { familyId: existingSession.familyId },
          { $set: { isRevoked: true, revokedAt: now } }
        );
        return null;
      }

      // 2. Expiration Check
      if (now > existingSession.expiresAt) {
        existingSession.isRevoked = true;
        existingSession.revokedAt = now;
        await existingSession.save();
        return null;
      }

      // 3. Mark current session as used/revoked
      existingSession.isRevoked = true;
      existingSession.revokedAt = now;
      await existingSession.save();

      // 4. Issue next generation of token pair under the same family lineage
      const result = await createSession(
        String(existingSession.userId),
        userAgent,
        ipAddress,
        existingSession.familyId
      );

      if (!result.user) return null;
      return { tokenPair: result.tokenPair, user: result.user };
    } catch (err) {
      console.error("[SessionService] DB Session rotation failed:", err);
    }
  }

  // Memory Fallback
  const memIndex = memorySessions.findIndex((s) => s.refreshTokenHash === tokenHash);
  if (memIndex === -1) return null;

  const memSession = memorySessions[memIndex];
  if (memSession.isRevoked) {
    console.warn(`[SECURITY ALERT - Memory] Replay attack detected for family: ${memSession.familyId}`);
    void logSecurityEvent({
      eventType: "TOKEN_REUSE_DETECTED",
      severity: "CRITICAL",
      ipAddress: ipAddress || "127.0.0.1",
      userAgent,
      userId: memSession.userId,
      details: { familyId: memSession.familyId },
    });
    for (const s of memorySessions) {
      if (s.familyId === memSession.familyId) {
        s.isRevoked = true;
        s.revokedAt = now.toISOString();
      }
    }
    return null;
  }

  if (now > new Date(memSession.expiresAt)) {
    memSession.isRevoked = true;
    memSession.revokedAt = now.toISOString();
    return null;
  }

  memSession.isRevoked = true;
  memSession.revokedAt = now.toISOString();

  const memResult = await createSession(
    memSession.userId,
    userAgent,
    ipAddress,
    memSession.familyId
  );

  if (!memResult.user) return null;
  return { tokenPair: memResult.tokenPair, user: memResult.user };
}

/**
 * Revokes a single session explicitly (e.g. user logs out on current device).
 */
export async function revokeSession(rawRefreshToken: string): Promise<boolean> {
  if (!rawRefreshToken) return false;
  const tokenHash = hashRefreshToken(rawRefreshToken);
  const mongoose = await connectToDatabase();

  if (mongoose) {
    try {
      const res = await SessionModel.updateOne(
        { refreshTokenHash: tokenHash },
        { $set: { isRevoked: true, revokedAt: new Date() } }
      );
      return res.modifiedCount > 0;
    } catch (err) {
      console.error("[SessionService] Revoke session failed:", err);
    }
  }

  const mem = memorySessions.find((s) => s.refreshTokenHash === tokenHash);
  if (mem) {
    mem.isRevoked = true;
    mem.revokedAt = new Date().toISOString();
    return true;
  }
  return false;
}

/**
 * Revokes all active sessions for a user (e.g. password changed, "Log out all devices").
 */
export async function revokeAllUserSessions(userId: string): Promise<boolean> {
  const mongoose = await connectToDatabase();
  if (mongoose) {
    try {
      const res = await SessionModel.updateMany(
        { userId, isRevoked: false },
        { $set: { isRevoked: true, revokedAt: new Date() } }
      );
      return res.modifiedCount > 0;
    } catch (err) {
      console.error("[SessionService] Revoke all sessions failed:", err);
    }
  }

  let count = 0;
  for (const s of memorySessions) {
    if (s.userId === userId && !s.isRevoked) {
      s.isRevoked = true;
      s.revokedAt = new Date().toISOString();
      count++;
    }
  }
  return count > 0;
}

/**
 * Injects enterprise-hardened session cookies into the NextResponse.
 */
export function setSessionCookies(response: NextResponse, tokenPair: ITokenPair): NextResponse {
  const isProduction = process.env.NODE_ENV === "production";

  // Short-lived Access Token Cookie (15 min)
  response.cookies.set(ACCESS_COOKIE_NAME, tokenPair.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: tokenPair.expiresIn,
  });

  // Long-lived Opaque Refresh Token Cookie (7 days, restricted to auth endpoints)
  response.cookies.set(REFRESH_COOKIE_NAME, tokenPair.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/api/auth",
    maxAge: REFRESH_TOKEN_EXPIRY_SEC,
  });

  return response;
}

/**
 * Clears all session cookies securely upon logout.
 */
export function clearSessionCookies(response: NextResponse): NextResponse {
  const isProduction = process.env.NODE_ENV === "production";

  response.cookies.set(ACCESS_COOKIE_NAME, "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("diamond_access_token", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set(REFRESH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/api/auth",
    maxAge: 0,
  });

  return response;
}
