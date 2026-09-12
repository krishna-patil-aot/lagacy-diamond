import { NextRequest, NextResponse } from "next/server";
import { executeConciergeInquiry } from "@/lib/concierge-service";
import { IAIChatRequest, IAIChatResponse } from "@/types/ai.types";

export async function POST(request: NextRequest): Promise<NextResponse<IAIChatResponse>> {
  try {
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

    const response = await executeConciergeInquiry(lastMessage.content);
    return NextResponse.json(response, { status: 200 });
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
