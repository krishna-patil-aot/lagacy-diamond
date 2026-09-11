import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatusAdmin } from "@/lib/order-repository";
import { verifyToken } from "@/lib/auth";
import { OrderStatus } from "@/types/order.types";

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

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update order status";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
