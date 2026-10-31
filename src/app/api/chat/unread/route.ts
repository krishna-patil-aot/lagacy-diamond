import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { getTotalUnreadChatCount } from "@/lib/chat-repository";

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthenticatedUserFromRequest(request);
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email") || authUser?.email || undefined;

    if (authUser?.role === "ADMIN") {
      const count = await getTotalUnreadChatCount({ role: "ADMIN" });
      return NextResponse.json({ success: true, unreadCount: count });
    }

    const count = await getTotalUnreadChatCount({
      role: "USER",
      userId: authUser?.userId,
      email,
    });

    return NextResponse.json({ success: true, unreadCount: count });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load unread count";
    return NextResponse.json({ success: false, unreadCount: 0, error: message });
  }
}

