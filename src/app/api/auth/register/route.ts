import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/user-repository";
import { hashPassword } from "@/lib/auth";
import { UserRole } from "@/types/auth.types";
import {
  checkAuthRateLimit,
  createRateLimitResponse,
  applyRateLimitHeaders,
  getClientIp,
} from "@/lib/rate-limiter";
import { createSession, setSessionCookies } from "@/lib/session-service";

export async function POST(request: NextRequest) {
  try {
    // 1. Enterprise Rate Limiting on Account Registration (Prevents Sybil Bot Influx)
    const { blocked, activeResult } = await checkAuthRateLimit(request, "register");
    if (blocked) {
      return createRateLimitResponse(
        activeResult,
        "Account creation limit reached from this network. Please wait before registering another account."
      );
    }

    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      const res = NextResponse.json(
        { success: false, error: "Name, email, and password are required." },
        { status: 400 }
      );
      return applyRateLimitHeaders(res, activeResult);
    }

    if (String(password).length < 8) {
      const res = NextResponse.json(
        { success: false, error: "Security Policy: Password must be at least 8 characters long." },
        { status: 400 }
      );
      return applyRateLimitHeaders(res, activeResult);
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await findUserByEmail(normalizedEmail);
    if (existing) {
      const res = NextResponse.json(
        { success: false, error: "An account with this email already exists." },
        { status: 409 }
      );
      return applyRateLimitHeaders(res, activeResult);
    }

    const passwordHash = await hashPassword(password);
    const assignedRole: UserRole = "CUSTOMER";

    const user = await createUser({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      role: assignedRole,
      authProvider: "credentials",
    });

    try {
      const { sendRegistrationSuccessEmail } = await import("@/lib/mailer");
      await sendRegistrationSuccessEmail({
        to: user.email,
        clientName: user.name,
      });
    } catch (emailErr) {
      console.error("[Register Route Welcome Email Error]:", emailErr);
    }

    // 2. Enterprise Bifurcated Session (15-min Access Token + 7-day Refresh Token)
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || undefined;
    const { tokenPair } = await createSession(user.id, userAgent, ipAddress);

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user,
          token: tokenPair.accessToken, // Backward-compatible alias
          accessToken: tokenPair.accessToken,
          refreshToken: tokenPair.refreshToken,
          expiresIn: tokenPair.expiresIn,
        },
      },
      { status: 201 }
    );

    setSessionCookies(response, tokenPair);
    return applyRateLimitHeaders(response, activeResult);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
