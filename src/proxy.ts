import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken =
    request.cookies.get("diamond_session")?.value ||
    request.cookies.get("diamond_auth_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  const payload = sessionToken ? verifyToken(sessionToken) : null;
  const isAuthenticated = Boolean(payload);
  const isAdmin = payload?.role === "ADMIN";
  const MASTER_ADMIN_EMAIL = "engrkrishnapatil@gmail.com";
  const isMasterAdmin = isAdmin && payload?.email === MASTER_ADMIN_EMAIL;

  // 1. Protect Admin Vault routes: requires valid token, ADMIN role, and master admin email
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!isMasterAdmin) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("error", "restricted");
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Protect Customer Orders routes: requires valid authenticated session
  if (pathname.startsWith("/orders")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Prevent authenticated users from accessing login/register repeatedly
  if (pathname === "/login" || pathname === "/register") {
    if (isAuthenticated) {
      const destination = isMasterAdmin ? "/admin" : "/diamonds";
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  return NextResponse.next();

}

export const config = {
  matcher: ["/admin/:path*", "/orders/:path*", "/login", "/register"],
};
