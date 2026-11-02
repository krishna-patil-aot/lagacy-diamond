import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { markConversationAsRead } from "@/lib/chat-repository";
import { CHAT_EVENTS } from "@/lib/chat-events";
import { publishServerChatEvent } from "@/lib/sse-broker";
import { ChatSenderRole } from "@/types/chat.types";

interface IRouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: IRouteContext) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Conversation ID required" },
        { status: 400 }
      );
    }

    const authUser = getAuthenticatedUserFromRequest(request);
    const body = (await request.json().catch(() => ({}))) as { role?: string };
    let readerRole: ChatSenderRole = "USER";

    if (authUser?.role === "ADMIN" || body.role === "ADMIN") {
      if (authUser && authUser.role !== "ADMIN") {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
      }
      readerRole = "ADMIN";
    }

    const updated = await markConversationAsRead(id, readerRole);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    publishServerChatEvent({
      type: CHAT_EVENTS.MESSAGES_READ,
      conversationId: id,
      sender: readerRole,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      conversation: updated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to mark read";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

