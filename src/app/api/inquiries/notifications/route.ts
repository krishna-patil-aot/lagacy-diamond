import { NextRequest, NextResponse } from "next/server";
import {
  getClientInquiriesByEmail,
  getAllUnreadInquiriesAdmin,
  getInquiriesByTicketNumbers,
} from "@/lib/inquiry-repository";
import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { IClientNotificationsResponse, IInquiry } from "@/types/inquiry.types";

export async function GET(request: NextRequest): Promise<NextResponse<IClientNotificationsResponse>> {
  try {
    const verified = getAuthenticatedUserFromRequest(request);
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

    // 2. Client inquiries (Authenticated and/or Guest tickets in storage)
    const inquiriesMap = new Map<string, IInquiry>();

    if (verified && verified.email) {
      const emailInquiries = await getClientInquiriesByEmail(verified.email);
      for (const inq of emailInquiries) {
        inquiriesMap.set(inq.inquiryNumber.toUpperCase(), inq);
      }
    }

    if (guestTicketsParam) {
      const tickets = guestTicketsParam
        .split(",")
        .map((t) => t.trim().toUpperCase())
        .filter(Boolean);
      if (tickets.length > 0) {
        const ticketInquiries = await getInquiriesByTicketNumbers(tickets);
        for (const inq of ticketInquiries) {
          if (!inquiriesMap.has(inq.inquiryNumber.toUpperCase())) {
            inquiriesMap.set(inq.inquiryNumber.toUpperCase(), inq);
          }
        }
      }
    }

    const allInquiries = Array.from(inquiriesMap.values());

    // Filter to inquiries with curator activity or unread messages
    const repliedInquiries = allInquiries.filter((inq) => {
      const hasAdminReply =
        Boolean(inq.adminReply && inq.adminReply.trim()) ||
        (Array.isArray(inq.messages) && inq.messages.some((m) => m.sender === "ADMIN"));
      const hasUnread =
        (typeof inq.unreadClientCount === "number" && inq.unreadClientCount > 0) ||
        inq.isClientRead === false;
      return hasAdminReply || hasUnread;
    });

    // Sort with latest message/update on top
    repliedInquiries.sort((a, b) => {
      const getLatestTime = (inq: typeof a): number => {
        const lastMsg =
          inq.messages && inq.messages.length > 0
            ? inq.messages[inq.messages.length - 1]
            : null;
        const msgTime = lastMsg?.createdAt ? new Date(lastMsg.createdAt).getTime() : 0;
        const updateTime = inq.updatedAt ? new Date(inq.updatedAt).getTime() : 0;
        const createTime = inq.createdAt ? new Date(inq.createdAt).getTime() : 0;
        return Math.max(msgTime, updateTime, createTime);
      };
      return getLatestTime(b) - getLatestTime(a);
    });

    const unreadCount = repliedInquiries.filter(
      (inq) =>
        (typeof inq.unreadClientCount === "number" && inq.unreadClientCount > 0) ||
        inq.isClientRead === false
    ).length;

    return NextResponse.json<IClientNotificationsResponse>({
      success: true,
      data: repliedInquiries,
      unreadCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load notifications";
    return NextResponse.json<IClientNotificationsResponse>(
      { success: false, data: [], unreadCount: 0, error: message },
      { status: 500 }
    );
  }
}
