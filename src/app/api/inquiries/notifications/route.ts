import { NextRequest, NextResponse } from "next/server";
import {
  getClientInquiriesByEmail,
  getAllUnreadInquiriesAdmin,
  getInquiriesByTicketNumbers,
} from "@/lib/inquiry-repository";
import { verifyToken } from "@/lib/auth";
import { IClientNotificationsResponse } from "@/types/inquiry.types";

export async function GET(request: NextRequest): Promise<NextResponse<IClientNotificationsResponse>> {
  try {
    const token =
      request.cookies.get("diamond_auth_token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    const verified = token ? verifyToken(token) : null;
    const { searchParams } = new URL(request.url);
    const guestTicketsParam = searchParams.get("tickets");

    // 1. Role: ADMIN -> Receives notifications of new inquiries and unread client messages
    if (verified && verified.role === "ADMIN") {
      const { inquiries, unreadCount } = await getAllUnreadInquiriesAdmin();
      return NextResponse.json<IClientNotificationsResponse>({
        success: true,
        data: inquiries,
        unreadCount,
      });
    }

    // 2. Role: Authenticated CLIENT
    if (verified && verified.email) {
      const inquiries = await getClientInquiriesByEmail(verified.email);
      const repliedInquiries = inquiries.filter((inq) => {
        const hasUnread = (inq.unreadClientCount && inq.unreadClientCount > 0) || (!inq.isClientRead && Boolean(inq.adminReply?.trim()));
        return hasUnread || Boolean(inq.adminReply?.trim());
      });
      const unreadCount = repliedInquiries.filter((inq) => (inq.unreadClientCount && inq.unreadClientCount > 0) || !inq.isClientRead).length;

      return NextResponse.json<IClientNotificationsResponse>({
        success: true,
        data: repliedInquiries,
        unreadCount,
      });
    }

    // 3. Guest Client with stored local tickets (e.g. ?tickets=INQ-123456,INQ-789012)
    if (guestTicketsParam) {
      const tickets = guestTicketsParam.split(",").map((t) => t.trim()).filter(Boolean);
      const inquiries = await getInquiriesByTicketNumbers(tickets);
      const repliedInquiries = inquiries.filter((inq) => Boolean(inq.adminReply && inq.adminReply.trim()));
      const unreadCount = repliedInquiries.filter((inq) => !inq.isClientRead || (inq.unreadClientCount && inq.unreadClientCount > 0)).length;

      return NextResponse.json<IClientNotificationsResponse>({
        success: true,
        data: repliedInquiries,
        unreadCount,
      });
    }

    // No credentials or tickets provided
    return NextResponse.json<IClientNotificationsResponse>({
      success: true,
      data: [],
      unreadCount: 0,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load notifications";
    return NextResponse.json<IClientNotificationsResponse>(
      { success: false, data: [], unreadCount: 0, error: message },
      { status: 500 }
    );
  }
}
