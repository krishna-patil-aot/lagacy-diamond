import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { purgeJob, purgeCompletedJobs } from "@/lib/queue-service";
import { IPurgeJobResponse } from "@/types/queue.types";

/**
 * Enterprise Admin Queue Purge Controller
 * Enables pruning completed tasks or removing corrupt DLQ entries
 */
export async function POST(request: NextRequest): Promise<NextResponse<IPurgeJobResponse | { success: false; error: string }>> {
  try {
    const user = getAuthenticatedUserFromRequest(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Administrative clearance required for queue pruning." },
        { status: 403 }
      );
    }

    const body = (await request.json()) as {
      jobId?: string;
      purgeCompleted?: boolean;
      olderThanHours?: number;
    };

    if (body.purgeCompleted) {
      const hours = typeof body.olderThanHours === "number" && body.olderThanHours >= 0 ? body.olderThanHours : 24;
      const result = await purgeCompletedJobs(hours);
      return NextResponse.json(result);
    }

    if (!body.jobId || typeof body.jobId !== "string") {
      return NextResponse.json(
        { success: false, error: "Target jobId parameter is required for single job purge." },
        { status: 400 }
      );
    }

    const result = await purgeJob(body.jobId);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to purge queue entry";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
