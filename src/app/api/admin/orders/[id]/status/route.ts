import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatusAdmin } from "@/lib/order-repository";
import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { OrderStatus } from "@/types/order.types";
import { enqueueJob } from "@/lib/queue-service";
import { QUEUE_JOB_TYPES } from "@/types/queue.types";
import { siteConfig } from "@/config/site.config";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const verified = getAuthenticatedUserFromRequest(request);

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

    // Offload email pipeline to asynchronous background queue with idempotency:
    // 1. When admin approves the order: queue curator review notice
    if (status === "APPROVED" && updated.shippingAddress?.email) {
      await enqueueJob(
        QUEUE_JOB_TYPES.EMAIL_ORDER_APPROVED,
        {
          to: updated.shippingAddress.email,
          clientName: updated.shippingAddress.fullName || "Valued Client",
          orderNumber: updated.orderNumber || updated.id,
          totalAmount: updated.totalAmount || 0,
          itemCount: (updated.items || []).length,
          orderId: updated.id,
        },
        {
          idempotencyKey: `order-approved-${updated.id}`,
          priority: "high",
          maxRetries: 3,
        }
      );
    } else if (status === "DELIVERED" && updated.shippingAddress?.email) {
      // 2. Final fulfillment: offload heavy PDF invoice + certificates generation and dispatch
      await enqueueJob(
        QUEUE_JOB_TYPES.EMAIL_ORDER_DOCUMENTS,
        {
          orderId: updated.id,
          recipientEmail: updated.shippingAddress.email,
          subject: `Order #${updated.orderNumber || updated.id} Delivered & Signed - Official Invoice & Lab Certificates - ${siteConfig.brandName}`,
          statusTitle: `Order #${updated.orderNumber || updated.id} Delivered & Signed`,
          fulfillmentStatus: "Hand-Delivered & Signed",
        },
        {
          idempotencyKey: `order-delivered-${updated.id}`,
          priority: "critical",
          maxRetries: 3,
        }
      );
    } else if (status === "CANCELLED" && updated.shippingAddress?.email) {
      // 3. Order cancellation notice
      await enqueueJob(
        QUEUE_JOB_TYPES.EMAIL_ORDER_CANCELLED,
        {
          to: updated.shippingAddress.email,
          clientName: updated.shippingAddress.fullName || "Valued Client",
          orderNumber: updated.orderNumber || updated.id,
          reason: note || "Order cancelled by vault curator administrator",
          orderId: updated.id,
        },
        {
          idempotencyKey: `order-cancelled-${updated.id}`,
          priority: "high",
          maxRetries: 3,
        }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update order status";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
