import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderStatusAdmin } from "@/lib/order-repository";
import { verifyToken } from "@/lib/auth";
import { sendOrderCancelledEmail } from "@/lib/mailer";

export async function GET(
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
      return NextResponse.json(
        { success: false, error: "Order not found or clearance restricted." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch order details";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

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

    if (!verified) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const isAdmin = verified.role === "ADMIN";
    const existingOrder = await getOrderById(id, verified.userId, isAdmin);

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found or access restricted." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const action = body.action || (body.status === "CANCELLED" ? "CANCEL" : null);

    if (action === "CANCEL") {
      if (existingOrder.status !== "PENDING_APPROVAL" && !isAdmin) {
        return NextResponse.json(
          {
            success: false,
            error: "Only orders awaiting review can be cancelled by the client. For vault-sealed orders, contact concierge.",
          },
          { status: 400 }
        );
      }

      const note = body.reason || "Order cancelled by client before vault dispatch";
      const updated = await updateOrderStatusAdmin(existingOrder.id, "CANCELLED", { note });

      if (updated && updated.shippingAddress?.email) {
        try {
          await sendOrderCancelledEmail({
            to: updated.shippingAddress.email,
            clientName: updated.shippingAddress.fullName,
            orderNumber: updated.orderNumber || updated.id,
            reason: note,
          });
        } catch (emailErr) {
          console.error("[Cancellation Mailer Error]:", emailErr);
        }
      }

      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action requested." },
      { status: 400 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update order";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

