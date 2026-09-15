import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatusAdmin } from "@/lib/order-repository";
import { verifyToken } from "@/lib/auth";
import { OrderStatus } from "@/types/order.types";
import {
  sendOrderApprovedEmail,
  sendOrderDocumentsEmail,
  sendOrderCancelledEmail,
} from "@/lib/mailer";
import { siteConfig } from "@/config/site.config";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token =
      request.cookies.get("diamond_auth_token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    const verified = token ? verifyToken(token) : null;

    if (!verified || verified.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Curator Admin clearance required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, carrier, trackingNumber, note } = body as {
      status: OrderStatus;
      carrier?: string;
      trackingNumber?: string;
      note?: string;
    };

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Target status parameter is required." },
        { status: 400 }
      );
    }

    const updated = await updateOrderStatusAdmin(id, status, {
      carrier,
      trackingNumber,
      note,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Order not found in vault registry." },
        { status: 404 }
      );
    }

    // Email dispatch pipeline based on luxury brand business rules:
    // 1. When admin approves the order: send curator review & vault preparation notice WITHOUT invoice or certificates
    if (status === "APPROVED" && updated.shippingAddress?.email) {
      try {
        await sendOrderApprovedEmail({
          to: updated.shippingAddress.email,
          clientName: updated.shippingAddress.fullName || "Valued Client",
          orderNumber: updated.orderNumber || updated.id,
          totalAmount: updated.totalAmount || 0,
          itemCount: (updated.items || []).length,
        });
      } catch (mailError) {
        console.error("[Admin Approval Mailer Error]:", mailError);
      }
    } else if (status === "DELIVERED" && updated.shippingAddress?.email) {
      // 2. Final fulfillment: ONLY when status is hand-delivered and signed (DELIVERED) do we generate & attach invoice + lab certificates
      try {
        await sendOrderDocumentsEmail(updated, {
          subject: `Order #${updated.orderNumber || updated.id} Delivered & Signed - Official Invoice & Lab Certificates - ${siteConfig.brandName}`,
          badgeText: "ORDER HAND-DELIVERED & FULFILLED",
          statusTitle: `Order #${updated.orderNumber || updated.id} Delivered & Signed`,
          customMessage: `Your order <strong>#${updated.orderNumber || updated.id}</strong> has been successfully hand-delivered and verified under armed courier protocol. Your gemstone acquisition is now complete and fulfilled. Attached to this email is your final Purchase Invoice and Lab Authorized Certificates.`,
          fulfillmentStatus: "Hand-Delivered & Signed",
        });
      } catch (mailError) {
        console.error("[Admin Delivery Mailer Error]:", mailError);
      }
    } else if (status === "CANCELLED" && updated.shippingAddress?.email) {
      try {
        await sendOrderCancelledEmail({
          to: updated.shippingAddress.email,
          clientName: updated.shippingAddress.fullName,
          orderNumber: updated.orderNumber || updated.id,
          reason: note || "Order cancelled by vault curator administrator",
        });
      } catch (mailError) {
        console.error("[Admin Cancellation Mailer Error]:", mailError);
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update order status";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
