import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { retryDeadLetterJob, retryAllDeadLetterJobs } from "@/lib/queue-service";
import { IRetryJobResponse } from "@/types/queue.types";

/**
 * Enterprise Admin Dead-Letter Queue (DLQ) Retry Controller
 * Replays failed dead-letter jobs back to the active execution queue
 */
export async function POST(request: NextRequest): Promise<NextResponse<IRetryJobResponse | { success: false; error: string }>> {
  try {
    const user = getAuthenticatedUserFromRequest(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Administrative clearance required for DLQ replay." },
        { status: 403 }
      );
    }

    const body = (await request.json()) as { jobId?: string; retryAll?: boolean };

    if (body.retryAll) {
      const result = await retryAllDeadLetterJobs();
      return NextResponse.json(result);
    }

    if (!body.jobId || typeof body.jobId !== "string") {
      return NextResponse.json(
        { success: false, error: "Target jobId parameter is required for single job retry." },
        { status: 400 }
      );
    }

    const result = await retryDeadLetterJob(body.jobId);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to retry dead-letter job";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
