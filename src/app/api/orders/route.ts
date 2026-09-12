import { NextRequest, NextResponse } from "next/server";
import { createOrder, getUserOrders } from "@/lib/order-repository";
import { verifyToken } from "@/lib/auth";
import { sendOrderReceiptPendingEmail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  try {
    const token =
      request.cookies.get("diamond_auth_token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    const verified = token ? verifyToken(token) : null;
    const body = await request.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order must contain at least one gemstone lot." },
        { status: 400 }
      );
    }

    if (!body.shippingAddress || !body.shippingAddress.fullName) {
      return NextResponse.json(
        { success: false, error: "Valid delivery shipping address is required." },
        { status: 400 }
      );
    }

    const newOrder = await createOrder(
      {
        items: body.items,
        shippingAddress: body.shippingAddress,
        paymentInfo: body.paymentInfo,
        subtotal: body.subtotal,
        couponDiscount: body.couponDiscount || 0,
        totalAmount: body.totalAmount,
        status: "PENDING_APPROVAL",
        createdAt: new Date().toISOString(),
      },
      verified?.userId
    );

    // Send order receipt email (under review - no invoice issued until approved by curator)
    try {
      if (newOrder.shippingAddress?.email) {
        await sendOrderReceiptPendingEmail({
          to: newOrder.shippingAddress.email,
          clientName: newOrder.shippingAddress.fullName,
          orderNumber: newOrder.orderNumber || newOrder.id,
          totalAmount: newOrder.totalAmount,
          itemCount: newOrder.items.length,
        });
      }
    } catch (emailError) {
      // Log dispatch error but do not fail order creation
      console.error("[Order Mailer Pipeline Error]:", emailError);
    }

    return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to process order";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get("diamond_auth_token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    const verified = token ? verifyToken(token) : null;

    if (!verified) {
      return NextResponse.json(
        { success: false, error: "Authentication required to access order history." },
        { status: 401 }
      );
    }

    const orders = await getUserOrders(verified.userId, verified.email);
    return NextResponse.json({ success: true, data: orders });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch orders";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
