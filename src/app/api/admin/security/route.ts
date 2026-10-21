import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { getSecurityTelemetry, logSecurityEvent } from "@/lib/security-logger";
import { ISecurityTelemetry } from "@/types/security.types";

export interface IAdminSecurityResponse {
  success: boolean;
  data?: ISecurityTelemetry;
  error?: string;
}

/**
 * Enterprise Admin Security & Zero-Trust Telemetry Endpoint
 * Verifies CSP/HSTS compliance, active WAF threat deflections, and audit logs
 */
export async function GET(request: NextRequest): Promise<NextResponse<IAdminSecurityResponse>> {
  try {
    const user = getAuthenticatedUserFromRequest(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Administrative clearance required for security telemetry." },
        { status: 403 }
      );
    }

    const telemetry = await getSecurityTelemetry();
    return NextResponse.json({
      success: true,
      data: telemetry,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Security telemetry failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<{ success: boolean; message?: string; error?: string }>> {
  try {
    const user = getAuthenticatedUserFromRequest(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Administrative clearance required." },
        { status: 403 }
      );
    }

    const body = (await request.json()) as { action?: "probe" | "clear" };

    if (body.action === "probe") {
      await logSecurityEvent({
        eventType: "ADMIN_MUTATION",
        severity: "INFO",
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1",
        endpoint: "/api/admin/security",
        method: "POST",
        userEmail: user.email,
        userId: user.userId,
        details: { probeAction: "Diagnostic security verification probe executed" },
      });

      return NextResponse.json({
        success: true,
        message: "Security diagnostic probe recorded in audit log.",
      });
    }

    return NextResponse.json({ success: true, message: "Security center ready." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Security action failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
