import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/order-repository";
import { verifyToken } from "@/lib/auth";

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
