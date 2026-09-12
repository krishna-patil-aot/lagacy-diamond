import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatusAdmin } from "@/lib/order-repository";
import { verifyToken } from "@/lib/auth";
import { OrderStatus } from "@/types/order.types";
import { sendOrderDocumentsEmail, sendOrderCancelledEmail } from "@/lib/mailer";

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

    // Email dispatch pipeline based on admin decision
    // 1. When admin accepts & approves the order: dispatch official invoice & lab certificates
    if (status === "APPROVED" && updated.shippingAddress?.email) {
      try {
        await sendOrderDocumentsEmail(updated, {
          subject: `Order #${updated.orderNumber || updated.id} Accepted & Approved - Official Invoice & Lab Certificates - Legacy Diamond`,
          badgeText: "ORDER ACCEPTED & APPROVED • OFFICIAL INVOICE ISSUED",
          statusTitle: `Order #${updated.orderNumber || updated.id} Approved by Curator`,
          customMessage: `Your gemstone order <strong>#${updated.orderNumber || updated.id}</strong> has been reviewed and accepted by the vault curator. Attached to this email are your official <strong>Purchase & Tax Invoice</strong> and official <strong>Lab Authorized Certificate(s) of Authenticity & Grading</strong>.`,
          fulfillmentStatus: "Curator Approved & Invoiced",
        });
      } catch (mailError) {
        console.error("[Admin Approval Mailer Error]:", mailError);
      }
    } else if (status === "DELIVERED" && updated.shippingAddress?.email) {
      // 2. Final fulfillment: delivery receipt with documents
      try {
        await sendOrderDocumentsEmail(updated, {
          subject: `Order #${updated.orderNumber || updated.id} Delivered & Signed - Official Invoice & Lab Certificates - Legacy Diamond`,
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
