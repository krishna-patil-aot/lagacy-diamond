import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import {
  getConversationMessages,
  saveChatMessage,
  getConversationById,
} from "@/lib/chat-repository";
import { CHAT_EVENTS } from "@/lib/chat-events";
import { publishServerChatEvent } from "@/lib/sse-broker";
import { ChatSenderRole } from "@/types/chat.types";

interface IRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: IRouteContext) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Conversation ID required" },
        { status: 400 }
      );
    }

    const conversation = await getConversationById(id);
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "40", 10);
    const before = searchParams.get("before") || undefined;

    const result = await getConversationMessages(id, limit, before);

    return NextResponse.json({
      success: true,
      messages: result.messages,
      conversation,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
      totalCount: result.totalCount,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load messages";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
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
    const body = await request.json();
    const { content, sender, senderName, senderEmail, senderAvatar } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { success: false, error: "Message content cannot be empty" },
        { status: 400 }
      );
    }

    // Role verification
    let resolvedSender: ChatSenderRole = "USER";
    if (authUser?.role === "ADMIN" || sender === "ADMIN") {
      if (authUser && authUser.role !== "ADMIN") {
        return NextResponse.json(
          { success: false, error: "Unauthorized sender role" },
          { status: 403 }
        );
      }
      resolvedSender = "ADMIN";
    }

    const resolvedName =
      senderName ||
      (resolvedSender === "ADMIN"
        ? authUser?.name || "Atelier Curator Gemologist"
        : authUser?.name || "Private Client");

    const resolvedEmail =
      senderEmail ||
      (resolvedSender === "ADMIN"
        ? authUser?.email || "curator@darkgems.luxury"
        : authUser?.email || "guest@darkgems.luxury");

    const result = await saveChatMessage({
      conversationId: id,
      sender: resolvedSender,
      senderName: resolvedName,
      senderEmail: resolvedEmail,
      senderAvatar: senderAvatar,
      content: content.trim(),
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Failed to persist chat message" },
        { status: 500 }
      );
    }

    // Broadcast real-time message event across SSE (cross-device)
    publishServerChatEvent({
      type: CHAT_EVENTS.MESSAGE_SENT,
      conversationId: id,
      sender: resolvedSender,
      messageId: result.message.id,
      senderName: result.message.senderName,
      content: result.message.content,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      conversation: result.conversation,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send message";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

