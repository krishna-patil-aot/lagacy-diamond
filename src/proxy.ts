import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, isMasterAdminEmail } from "@/lib/auth";

function isAllowedOrigin(origin: string | null, requestUrl: string): boolean {
  if (!origin) return true; // Same-origin direct browser navigation
  try {
    const originHost = new URL(origin).host;
    const currentHost = new URL(requestUrl).host;
    if (originHost === currentHost) return true;
    if (originHost.includes("localhost") || originHost.includes("127.0.0.1")) return true;
    if (originHost.endsWith(".vercel.app")) return true;

    const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (configuredAppUrl && new URL(configuredAppUrl).host === originHost) return true;

    return false;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const origin = request.headers.get("origin");

  // 1. Zero-Trust WAF: Intercept suspicious query parameters (NoSQL operators & script injection)
  if (
    search &&
    (search.includes("[$") ||
      search.includes("%5B%24") ||
      search.toLowerCase().includes("<script") ||
      search.includes("../") ||
      search.includes("..%2F"))
  ) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "Potential attack pattern intercepted by Zero-Trust WAF.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // 2. Dynamic CORS Preflight Handling for API routes
  if (pathname.startsWith("/api")) {
    if (request.method === "OPTIONS") {
      const allowed = isAllowedOrigin(origin, request.url);
      const preflightHeaders = new Headers();
      if (allowed && origin) {
        preflightHeaders.set("Access-Control-Allow-Origin", origin);
        preflightHeaders.set("Access-Control-Allow-Credentials", "true");
      }
      preflightHeaders.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
      );
      preflightHeaders.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With, X-CSRF-Token, x-cron-secret"
      );
      preflightHeaders.set("Access-Control-Max-Age", "86400");
      return new NextResponse(null, { status: 204, headers: preflightHeaders });
    }
  }

  // 3. Session Extraction & Token Verification
  const sessionToken =
    request.cookies.get("diamond_access_token")?.value ||
    request.cookies.get("diamond_session")?.value ||
    request.cookies.get("diamond_auth_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  const payload = sessionToken ? verifyToken(sessionToken) : null;
  const isAuthenticated = Boolean(payload);
  const isAdmin = payload?.role === "ADMIN";
  const isMasterAdmin = isAdmin && isMasterAdminEmail(payload?.email);

  // 4. Protect Admin Vault routes: requires valid token, ADMIN role, and master admin email
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

  // 5. Protect Customer Orders routes: requires valid authenticated session
  if (pathname.startsWith("/orders")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 6. Prevent authenticated users from accessing login/register repeatedly
  if (pathname === "/login" || pathname === "/register") {
    if (isAuthenticated) {
      const destination = isMasterAdmin ? "/admin" : "/diamonds";
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  // 7. Request Enrichment & Context Propagation
  const requestHeaders = new Headers(request.headers);
  const requestId = `req_${crypto.randomUUID()}`;
  requestHeaders.set("x-request-id", requestId);

  if (payload) {
    requestHeaders.set("x-auth-user-id", payload.userId);
    requestHeaders.set("x-auth-user-role", payload.role);
    requestHeaders.set("x-auth-user-email", payload.email);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Inject correlation ID & CORS headers into outbound response
  response.headers.set("x-request-id", requestId);
  if (pathname.startsWith("/api") && origin && isAllowedOrigin(origin, request.url)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/orders/:path*",
    "/login",
    "/register",
    "/api/:path*",
  ],
};
