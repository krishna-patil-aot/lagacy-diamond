import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limiter";
import { processQueue } from "@/lib/queue-service";
import { IProcessQueueSummary } from "@/types/queue.types";

export interface IQueueProcessEndpointResponse {
  success: boolean;
  summary?: IProcessQueueSummary;
  error?: string;
}

/**
 * Enterprise Asynchronous Background Queue Worker Endpoint
 * Triggerable by Vercel Cron (cron expression), external monitoring/webhooks,
 * or immediate administrative dispatch.
 */
async function handleProcessWorker(request: NextRequest): Promise<NextResponse<IQueueProcessEndpointResponse>> {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");
    const customHeader = request.headers.get("x-cron-secret");

    let isAuthorized = false;

    // 1. Check Cron Secret if configured
    if (cronSecret) {
      if (
        authHeader === `Bearer ${cronSecret}` ||
        customHeader === cronSecret
      ) {
        isAuthorized = true;
      }
    }

    // 2. Check Admin Session Clearance
    if (!isAuthorized) {
      const user = getAuthenticatedUserFromRequest(request);
      if (user && user.role === "ADMIN") {
        isAuthorized = true;
      }
    }

    // 3. Fallback: If no CRON_SECRET is configured (dev/demo mode), apply strict sliding-window rate limit
    if (!isAuthorized) {
      if (!cronSecret) {
        // Dev/demo rate limit: 12 executions per minute per IP
        const rateCheck = await checkRateLimit(request, {
          keyPrefix: "worker_trigger",
          limit: 12,
          windowMs: 60 * 1000,
        });

        if (!rateCheck.allowed) {
          return NextResponse.json(
            { success: false, error: "Too many worker trigger requests. Please wait." },
            { status: 429 }
          );
        }
        isAuthorized = true;
      } else {
        return NextResponse.json(
          { success: false, error: "Unauthorized worker invocation clearance." },
          { status: 401 }
        );
      }
    }

    // Parse maxJobs parameter if present
    let maxJobs = 10;
    try {
      const url = new URL(request.url);
      const queryLimit = url.searchParams.get("limit");
      if (queryLimit) {
        const parsed = parseInt(queryLimit, 10);
        if (!isNaN(parsed) && parsed > 0) {
          maxJobs = Math.min(50, parsed);
        }
      }
    } catch {
      // Ignore URL parse error
    }

    const summary = await processQueue({ maxJobs });
    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Queue worker execution failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<IQueueProcessEndpointResponse>> {
  return handleProcessWorker(request);
}

export async function GET(request: NextRequest): Promise<NextResponse<IQueueProcessEndpointResponse>> {
  return handleProcessWorker(request);
}
