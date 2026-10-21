import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { getQueueTelemetry, processQueue } from "@/lib/queue-service";
import { IQueueTelemetry, IProcessQueueSummary } from "@/types/queue.types";

export interface IAdminQueueTelemetryResponse {
  success: boolean;
  data?: IQueueTelemetry;
  error?: string;
}

export interface IAdminQueueProcessResponse {
  success: boolean;
  summary?: IProcessQueueSummary;
  error?: string;
}

/**
 * Enterprise Admin Queue Telemetry & Immediate Worker Trigger
 */
export async function GET(request: NextRequest): Promise<NextResponse<IAdminQueueTelemetryResponse>> {
  try {
    const user = getAuthenticatedUserFromRequest(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Administrative clearance required for queue telemetry." },
        { status: 403 }
      );
    }

    const telemetry = await getQueueTelemetry();
    return NextResponse.json({
      success: true,
      data: telemetry,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load queue telemetry";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<IAdminQueueProcessResponse>> {
  try {
    const user = getAuthenticatedUserFromRequest(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Administrative clearance required to invoke queue worker." },
        { status: 403 }
      );
    }

    let maxJobs = 10;
    try {
      const body = (await request.json()) as { maxJobs?: number };
      if (body.maxJobs && typeof body.maxJobs === "number" && body.maxJobs > 0) {
        maxJobs = Math.min(50, body.maxJobs);
      }
    } catch {
      // Body optional
    }

    const summary = await processQueue({ maxJobs });
    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to execute queue worker";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
