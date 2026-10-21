import { NextRequest, NextResponse } from "next/server";
import { rotateRefreshToken, setSessionCookies, REFRESH_COOKIE_NAME } from "@/lib/session-service";
import { checkRateLimit, createRateLimitResponse, getClientIp } from "@/lib/rate-limiter";

/**
 * Enterprise Refresh Token Endpoint
 * Executes automated Refresh Token Rotation (RTR).
 * Detects replay attacks and revokes compromised token lineages automatically.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting on Token Rotation (Prevents refresh flood)
    const rateLimit = await checkRateLimit(request, {
      keyPrefix: "auth:refresh:ip",
      limit: 60,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit, "Too many token refresh requests. Please wait.");
    }

    // 2. Extract Refresh Token from Secure HttpOnly Cookie (or optional fallback body)
    let rawRefreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
    if (!rawRefreshToken) {
      try {
        const body = (await request.json()) as { refreshToken?: string };
        rawRefreshToken = body.refreshToken;
      } catch {
        // Body was empty or invalid JSON, ignore
      }
    }

    if (!rawRefreshToken) {
      return NextResponse.json(
        { success: false, error: "No refresh token provided in session context." },
        { status: 401 }
      );
    }

    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || undefined;

    // 3. Rotate Refresh Token
    const rotated = await rotateRefreshToken(rawRefreshToken, ipAddress, userAgent);
    if (!rotated) {
      // Either token was expired, invalid, or an active replay attack was detected and family revoked
      const errorResponse = NextResponse.json(
        {
          success: false,
          error: "Session expired or invalidated for security. Please sign in again.",
          code: "SESSION_EXPIRED",
        },
        { status: 401 }
      );

      // Clear obsolete cookies
      errorResponse.cookies.set(REFRESH_COOKIE_NAME, "", { maxAge: 0, path: "/api/auth" });
      errorResponse.cookies.set("diamond_session", "", { maxAge: 0, path: "/" });
      return errorResponse;
    }

    // 4. Return new Short-Lived Access Token & Set Rotated Cookies
    const response = NextResponse.json({
      success: true,
      data: {
        accessToken: rotated.tokenPair.accessToken,
        expiresIn: rotated.tokenPair.expiresIn,
        user: rotated.user,
      },
    });

    return setSessionCookies(response, rotated.tokenPair);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Token rotation failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
