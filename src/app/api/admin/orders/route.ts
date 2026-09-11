import { NextRequest, NextResponse } from "next/server";
import { getAllOrdersAdmin } from "@/lib/order-repository";
import { verifyToken } from "@/lib/auth";
import { OrderStatus } from "@/types/order.types";

export async function GET(request: NextRequest) {
  try {
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

    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get("status") as OrderStatus | "ALL" | null;

    const orders = await getAllOrdersAdmin(statusParam || "ALL");
    return NextResponse.json({ success: true, data: orders });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch foundry orders";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
