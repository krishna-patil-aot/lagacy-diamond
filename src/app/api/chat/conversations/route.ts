import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import {
  findOrCreateUserConversation,
  getAdminConversations,
} from "@/lib/chat-repository";
import { IChatParticipant } from "@/types/chat.types";

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthenticatedUserFromRequest(request);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const channelId = searchParams.get("channelId") || undefined;
    const email = searchParams.get("email") || undefined;

    // 1. Admin Request: returns all conversations
    if (authUser?.role === "ADMIN") {
      const data = await getAdminConversations(search);
      return NextResponse.json({
        success: true,
        conversations: data.conversations,
        totalUnread: data.totalUnread,
      });
    }

    // 2. User / Guest Request: get single user conversation
    const targetChannelId =
      channelId || (authUser ? `user_${authUser.userId}` : undefined);
    const targetEmail = email || authUser?.email;

    if (!targetChannelId && !targetEmail) {
      return NextResponse.json(
        { success: false, error: "Missing channel or user identification" },
        { status: 400 }
      );
    }

    const participant: IChatParticipant = {
      name: authUser?.name || "Private Client",
      email: (targetEmail || "guest@darkgems.luxury").toLowerCase(),
      role: authUser ? "CUSTOMER" : "GUEST",
    };

    const conv = await findOrCreateUserConversation({
      channelId: targetChannelId || `guest_${Date.now()}`,
      userId: authUser?.userId,
      participant,
    });

    return NextResponse.json({
      success: true,
      conversation: conv,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to retrieve conversations";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthenticatedUserFromRequest(request);
    const body = await request.json().catch(() => ({}));
    const { channelId, participant } = body;

    const resolvedName = participant?.name || authUser?.name || "Private Client";
    const resolvedEmail = (participant?.email || authUser?.email || "").toLowerCase().trim();
    const resolvedChannelId =
      channelId || (authUser ? `user_${authUser.userId}` : `guest_${resolvedEmail || Date.now()}`);

    if (!resolvedEmail && !channelId) {
      return NextResponse.json(
        { success: false, error: "Email or Channel ID is required to start conversation" },
        { status: 400 }
      );
    }

    const participantData: IChatParticipant = {
      name: resolvedName,
      email: resolvedEmail || "guest@darkgems.luxury",
      phone: participant?.phone,
      role: authUser ? "CUSTOMER" : "GUEST",
      avatarUrl: participant?.avatarUrl,
    };

    const conversation = await findOrCreateUserConversation({
      channelId: resolvedChannelId,
      userId: authUser?.userId,
      participant: participantData,
    });

    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create conversation";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

