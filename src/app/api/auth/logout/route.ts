import { NextRequest, NextResponse } from "next/server";
import {
  revokeSession,
  revokeAllUserSessions,
  clearSessionCookies,
  REFRESH_COOKIE_NAME,
} from "@/lib/session-service";
import { getAuthenticatedUserFromRequest } from "@/lib/auth";

/**
 * Enterprise Session Revocation & Logout Endpoint
 * Invalidates refresh tokens and purges HttpOnly session cookies.
 */
export async function POST(request: NextRequest) {
  try {
    const rawRefreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
    let allDevices = false;

    try {
      const body = (await request.json()) as { allDevices?: boolean; refreshToken?: string };
      allDevices = Boolean(body?.allDevices);
    } catch {
      // Body not provided, standard logout
    }

    const authenticatedUser = getAuthenticatedUserFromRequest(request);

    // 1. If "Logout All Devices" requested, revoke all sessions for the user
    if (allDevices && authenticatedUser?.userId) {
      await revokeAllUserSessions(authenticatedUser.userId);
    } else if (rawRefreshToken) {
      // 2. Otherwise revoke this specific session
      await revokeSession(rawRefreshToken);
    }

    // 3. Purge cookies on client
    const response = NextResponse.json({
      success: true,
      message: allDevices
        ? "Successfully signed out from all active devices."
        : "Successfully signed out.",
    });

    return clearSessionCookies(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Logout encountered an error";
    const response = NextResponse.json({ success: false, error: message }, { status: 500 });
    return clearSessionCookies(response);
  }
}
