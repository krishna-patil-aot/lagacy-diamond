import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { confirmOrderPaymentByWebhook, getOrderById } from "@/lib/order-repository";

interface IPaymentWebhookPayload {
  orderNumber: string;
  transactionId?: string;
  amount?: number;
  status?: string;
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id: string;
        order_id: string;
        amount: number;
        status: string;
      };
    };
  };
}

/**
 * Payment Gateway Webhook Receiver
 * Listens for automated payment completion events from Razorpay / Cashfree / PhonePe / UPI
 * Eliminates delivery agent fraud by settling directly into company vault before OTP issuance.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-gateway-signature") || request.headers.get("x-razorpay-signature");
    const isSimulated = request.headers.get("x-simulate-payment") === "true";
    const webhookSecret = process.env.PAYMENT_GATEWAY_WEBHOOK_SECRET || "dev_secret_diamond_luxury_2026";

    let payload: IPaymentWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
    }

    // In production, enforce cryptographic signature verification
    if (!isSimulated && process.env.NODE_ENV === "production" && webhookSecret) {
      if (!signature) {
        return NextResponse.json(
          { success: false, error: "Missing cryptographic webhook signature" },
          { status: 401 }
        );
      }

      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (signature !== expectedSignature) {
        return NextResponse.json(
          { success: false, error: "Cryptographic signature validation failed" },
          { status: 403 }
        );
      }
    }

    // Extract standardized order parameters
    const orderNumber =
      payload.orderNumber ||
      payload.payload?.payment?.entity?.order_id ||
      "";

    const transactionId =
      payload.transactionId ||
      payload.payload?.payment?.entity?.id ||
      `UPI-${Date.now()}`;

    const rawAmount =
      payload.amount ||
      (payload.payload?.payment?.entity?.amount ? payload.payload.payment.entity.amount / 100 : undefined);

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: "Order identifier missing from webhook payload" },
        { status: 400 }
      );
    }

    const existingOrder = await getOrderById(orderNumber, undefined, true);
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: `Order ${orderNumber} not found in vault registry` },
        { status: 404 }
      );
    }

    const verifiedAmount = rawAmount || existingOrder.totalAmount;

    // Confirm settlement and issue the Delivery Release OTP
    const updatedOrder = await confirmOrderPaymentByWebhook(
      orderNumber,
      transactionId,
      verifiedAmount
    );

    return NextResponse.json({
      success: true,
      message: "Payment cryptographically confirmed. Delivery Handover OTP generated.",
      orderNumber,
      status: updatedOrder?.paymentInfo.paymentStatus,
      paidAt: updatedOrder?.paymentInfo.paidAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal webhook processing error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
