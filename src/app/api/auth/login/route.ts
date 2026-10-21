import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/user-repository";
import { comparePassword } from "@/lib/auth";
import {
  checkAuthRateLimit,
  createRateLimitResponse,
  applyRateLimitHeaders,
  getClientIp,
} from "@/lib/rate-limiter";
import { createSession, setSessionCookies } from "@/lib/session-service";
import { logSecurityEvent } from "@/lib/security-logger";

// Cryptographic dummy bcrypt hash to ensure constant-time execution against user enumeration timing attacks
const DUMMY_BCRYPT_HASH =
  "$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5Fsg8u.d781G4N/80B.oO/lKjZ6cy";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // 1. Enterprise Dual-Key Rate Limiting (IP + Specific Account Protection)
    const { blocked, activeResult } = await checkAuthRateLimit(
      request,
      "login",
      normalizedEmail
    );

    if (blocked) {
      void logSecurityEvent({
        eventType: "RATE_LIMIT_TRIGGERED",
        severity: "WARN",
        ipAddress: getClientIp(request),
        endpoint: "/api/auth/login",
        method: "POST",
        userEmail: normalizedEmail,
        details: { reason: "Consecutive authentication failures triggered rate limit cooldown" },
      });

      return createRateLimitResponse(
        activeResult,
        "Too many login attempts detected. Security cooldown active to protect your account. Please try again later."
      );
    }

    // 2. Fetch User Record
    const found = await findUserByEmail(normalizedEmail);

    // 3. Timing-Attack Defense: execute constant-time comparison even if email does not exist
    if (!found || !found.passwordHash) {
      await comparePassword(password, DUMMY_BCRYPT_HASH);

      void logSecurityEvent({
        eventType: "AUTH_FAILURE",
        severity: "WARN",
        ipAddress: getClientIp(request),
        endpoint: "/api/auth/login",
        method: "POST",
        userEmail: normalizedEmail,
        details: { reason: "Non-existent account or missing password hash" },
      });

      const res = NextResponse.json(
        { success: false, error: "Invalid email or password credentials." },
        { status: 401 }
      );
      return applyRateLimitHeaders(res, activeResult);
    }

    // 4. Role Authorization Constraint
    if (found.user.role === "ADMIN" && normalizedEmail !== "engrkrishnapatil@gmail.com") {
      const res = NextResponse.json(
        { success: false, error: "Admin Vault is restricted to authorized master curator." },
        { status: 403 }
      );
      return applyRateLimitHeaders(res, activeResult);
    }

    // 5. Authenticate Password
    const isValid = await comparePassword(password, found.passwordHash);
    if (!isValid) {
      void logSecurityEvent({
        eventType: "AUTH_FAILURE",
        severity: "WARN",
        ipAddress: getClientIp(request),
        endpoint: "/api/auth/login",
        method: "POST",
        userEmail: normalizedEmail,
        userId: found.user.id,
        details: { reason: "Password mismatch" },
      });

      const res = NextResponse.json(
        { success: false, error: "Invalid email or password credentials." },
        { status: 401 }
      );
      return applyRateLimitHeaders(res, activeResult);
    }

    void logSecurityEvent({
      eventType: "AUTH_SUCCESS",
      severity: "INFO",
      ipAddress: getClientIp(request),
      endpoint: "/api/auth/login",
      method: "POST",
      userEmail: normalizedEmail,
      userId: found.user.id,
    });

    // 6. Enterprise Bifurcated Session (15-min Access Token + 7-day Refresh Token)
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || undefined;
    const { tokenPair } = await createSession(found.user.id, userAgent, ipAddress);

    const response = NextResponse.json({
      success: true,
      data: {
        user: found.user,
        token: tokenPair.accessToken, // Backward-compatible alias
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        expiresIn: tokenPair.expiresIn,
      },
    });

    setSessionCookies(response, tokenPair);
    return applyRateLimitHeaders(response, activeResult);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Authentication failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
