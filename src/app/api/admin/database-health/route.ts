import { NextRequest, NextResponse } from "next/server";
import { getDatabaseHealth } from "@/lib/db";
import { getAuthenticatedUserFromRequest, isMasterAdminEmail } from "@/lib/auth";
import { DiamondModel } from "@/models/Diamond";
import { OrderModel } from "@/models/Order";
import { SessionModel } from "@/models/Session";
import { InquiryModel } from "@/models/Inquiry";
import { UserModel } from "@/models/User";

/**
 * Enterprise Database Diagnostic & Health Check Endpoint
 * Monitors connection pooling, latency, and verified compound indexes.
 * Restricted to master administrator.
 */
export async function GET(request: NextRequest) {
  try {
    const verified = getAuthenticatedUserFromRequest(request);
    const isAdmin = verified?.role === "ADMIN";
    const isMasterAdmin = isAdmin && isMasterAdminEmail(verified?.email);

    if (!isMasterAdmin) {
      return NextResponse.json(
        { success: false, error: "Clearance restricted to Master Database Administrator." },
        { status: 403 }
      );
    }

    const health = await getDatabaseHealth();

    // Collect verified indexes across collections
    const indexSummary: Record<string, string[]> = {
      diamonds: Object.keys(DiamondModel.schema.indexes().map((idx) => Object.keys(idx[0]).join("_"))),
      orders: Object.keys(OrderModel.schema.indexes().map((idx) => Object.keys(idx[0]).join("_"))),
      sessions: Object.keys(SessionModel.schema.indexes().map((idx) => Object.keys(idx[0]).join("_"))),
      inquiries: Object.keys(InquiryModel.schema.indexes().map((idx) => Object.keys(idx[0]).join("_"))),
      users: Object.keys(UserModel.schema.indexes().map((idx) => Object.keys(idx[0]).join("_"))),
    };

    return NextResponse.json({
      success: true,
      data: {
        ...health,
        indexes: indexSummary,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database diagnostic check failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
