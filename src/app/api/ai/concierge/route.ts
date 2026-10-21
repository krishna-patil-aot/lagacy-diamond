import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { executeConciergeInquiry } from "@/lib/concierge-service";
import { cacheGet, cacheSet } from "@/lib/cache-service";
import { enqueueJob } from "@/lib/queue-service";
import { checkRateLimit } from "@/lib/rate-limiter";
import { QUEUE_JOB_TYPES } from "@/types/queue.types";
import { IAIChatRequest, IAIChatResponse } from "@/types/ai.types";

export async function POST(request: NextRequest): Promise<NextResponse<IAIChatResponse>> {
  try {
    // 1. Sliding-Window Rate Limiting (20 AI concierge requests per minute per IP)
    const rateCheck = await checkRateLimit(request, {
      keyPrefix: "ai_concierge",
      limit: 20,
      windowMs: 60 * 1000,
    });

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          reply: `Our Master Gemologist is currently consulting multiple clients. Please wait ${rateCheck.retryAfterSec} seconds before sending another inquiry.`,
          matchedDiamonds: [],
          error: "Rate limit exceeded for AI Concierge",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.retryAfterSec),
          },
        }
      );
    }

    const body = (await request.json()) as IAIChatRequest;

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          reply: "Please provide a valid query to consult our Diamond Concierge.",
          matchedDiamonds: [],
          error: "Empty messages array",
        },
        { status: 400 }
      );
    }

    const lastMessage = body.messages[body.messages.length - 1];
    if (!lastMessage || typeof lastMessage.content !== "string") {
      return NextResponse.json(
        {
          success: false,
          reply: "Invalid message format.",
          matchedDiamonds: [],
          error: "Invalid message payload",
        },
        { status: 400 }
      );
    }

    const trimmedQuery = lastMessage.content.trim();
    if (!trimmedQuery) {
      return NextResponse.json(
        {
          success: false,
          reply: "Please enter a question or diamond criteria.",
          matchedDiamonds: [],
          error: "Query is empty",
        },
        { status: 400 }
      );
    }

    // 2. Distributed Idempotency & Query Cache Check
    const queryHash = crypto
      .createHash("sha256")
      .update(trimmedQuery.toLowerCase())
      .digest("hex");
    const cacheKey = `ai:concierge:${queryHash}`;

    const cachedResponse = await cacheGet<IAIChatResponse>(cacheKey);
    if (cachedResponse) {
      return NextResponse.json(
        {
          ...cachedResponse,
          cached: true,
        },
        { status: 200 }
      );
    }

    // 3. Offload task to background queue with idempotency tracking
    const enqueueResult = await enqueueJob(
      QUEUE_JOB_TYPES.AI_CONCIERGE_QUERY,
      {
        userQuery: trimmedQuery,
        chatHistory: body.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      },
      {
        idempotencyKey: `ai-query-${queryHash}`,
        priority: "critical",
        maxRetries: 2,
      }
    );

    // Execute gemological consultation
    const response = await executeConciergeInquiry(trimmedQuery);

    // Cache the verified response for 1 hour
    await cacheSet(cacheKey, response, { ttlSeconds: 3600 });

    return NextResponse.json(
      {
        ...response,
        jobId: enqueueResult.jobId,
        cached: false,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal concierge error";
    return NextResponse.json(
      {
        success: false,
        reply: "Our diamond vault concierge encountered a momentary communication issue. Please try again.",
        matchedDiamonds: [],
        error: message,
      },
      { status: 500 }
    );
  }
}

