import { NextRequest, NextResponse } from "next/server";
import { addInquiryMessage, getInquiryById, getInquiryByNumber } from "@/lib/inquiry-repository";
import { verifyToken } from "@/lib/auth";
import { broadcastInquiryEvent, INQUIRY_EVENTS } from "@/lib/inquiry-events";
import { sendInquiryReplyNotificationEmail } from "@/lib/mailer";
import {
  ISendInquiryMessageInput,
  ISendInquiryMessageResponse,
  MessageSenderType,
} from "@/types/inquiry.types";
import { siteConfig } from "@/config/site.config";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ISendInquiryMessageResponse>> {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json<ISendInquiryMessageResponse>(
        { success: false, error: "Inquiry identifier is required." },
        { status: 400 }
      );
    }

    const body = (await request.json()) as ISendInquiryMessageInput;
    if (!body.message || !body.message.trim()) {
      return NextResponse.json<ISendInquiryMessageResponse>(
        { success: false, error: "Message text cannot be empty." },
        { status: 400 }
      );
    }

    // Verify existing inquiry
    const existing = id.toUpperCase().startsWith("INQ-")
      ? await getInquiryByNumber(id)
      : await getInquiryById(id);

    if (!existing) {
      return NextResponse.json<ISendInquiryMessageResponse>(
        { success: false, error: "Inquiry conversation not found." },
        { status: 404 }
      );
    }

    // Determine sender identity & clearance
    const token =
      request.cookies.get("diamond_auth_token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");
    const verified = token ? verifyToken(token) : null;
    const isAdmin = verified?.role === "ADMIN";

    let sender: MessageSenderType = "CLIENT";
    let senderName = body.senderName || existing.fullName || "Valued Client";
    let senderEmail = body.senderEmail || existing.email;

    if (isAdmin) {
      sender = "ADMIN";
      senderName = verified?.name || "Curator Gemologist";
      senderEmail = verified?.email || siteConfig.contact.conciergeEmail;
    }

    const updated = await addInquiryMessage(existing.inquiryNumber, {
      sender,
      senderName,
      senderEmail,
      message: body.message.trim(),
    });

    if (!updated) {
      return NextResponse.json<ISendInquiryMessageResponse>(
        { success: false, error: "Failed to append message to conversation." },
        { status: 500 }
      );
    }

    // Broadcast live event across browser sessions
    try {
      broadcastInquiryEvent(
        INQUIRY_EVENTS.INQUIRY_REPLIED,
        updated.inquiryNumber,
        updated.inquiryNumber
      );
    } catch (eventError) {
      console.warn("[Inquiry Broadcast Warning]:", eventError);
    }

    // If Admin replied, dispatch notification email to the client
    if (isAdmin && existing.email) {
      void sendInquiryReplyNotificationEmail({
        to: existing.email,
        clientName: existing.fullName,
        inquiryNumber: existing.inquiryNumber,
        inquiryType: existing.inquiryType,
        adminReply: body.message.trim(),
      });
    }

    return NextResponse.json<ISendInquiryMessageResponse>({
      success: true,
      data: updated,
      message: "Message sent successfully.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send message";
    return NextResponse.json<ISendInquiryMessageResponse>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
