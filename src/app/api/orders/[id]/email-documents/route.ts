import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/order-repository";
import { verifyToken } from "@/lib/auth";
import { sendOrderDocumentsEmail } from "@/lib/mailer";
import { ISendOrderDocumentsResponse } from "@/types/order.types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token =
      request.cookies.get("diamond_auth_token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    const verified = token ? verifyToken(token) : null;
    const isAdmin = verified?.role === "ADMIN";

    const order = await getOrderById(id, verified?.userId, isAdmin);

    if (!order) {
      return NextResponse.json<ISendOrderDocumentsResponse>(
        { success: false, error: "Order not found or clearance restricted." },
        { status: 404 }
      );
    }

    if (order.status !== "DELIVERED") {
      return NextResponse.json<ISendOrderDocumentsResponse>(
        {
          success: false,
          error: "Official invoice and certificates are issued only after the order is fulfilled and delivered.",
        },
        { status: 400 }
      );
    }

    const recipientEmail = order.shippingAddress?.email;
    if (!recipientEmail) {
      return NextResponse.json<ISendOrderDocumentsResponse>(
        {
          success: false,
          error: "No client recipient email address registered for this order.",
        },
        { status: 400 }
      );
    }

    const emailResult = await sendOrderDocumentsEmail(order, {
      subject: `Official Order Documents (Invoice & Lab Certificates) - Order #${order.orderNumber || order.id}`,
      badgeText: "SECURITY DISPATCH • OFFICIAL INVOICE & LAB CERTIFICATES",
      statusTitle: `Order #${order.orderNumber || order.id} Official Documentation`,
      customMessage: `Here are your requested official <strong>Purchase & Tax Invoice</strong> and <strong>Lab Authorized Authenticity & Grading Certificate(s)</strong> for order <strong>#${order.orderNumber || order.id}</strong>. Please retain these documents for your private custody records.`,
      fulfillmentStatus: "Official Documents Dispatched via Verified Email",
    });

    if (!emailResult.success) {
      return NextResponse.json<ISendOrderDocumentsResponse>(
        {
          success: false,
          error: emailResult.error || "Failed to dispatch documents email.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ISendOrderDocumentsResponse>({
      success: true,
      message: `Official invoice and certificates dispatched to ${recipientEmail}`,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal error dispatching order documents";
    return NextResponse.json<ISendOrderDocumentsResponse>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
