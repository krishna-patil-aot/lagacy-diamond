import { NextRequest, NextResponse } from "next/server";
import { verifyDeliveryHandoverOtp, getOrderById } from "@/lib/order-repository";

interface IVerifyOtpBody {
  otp: string;
}

/**
 * Delivery Handover OTP Verification Endpoint
 * Invoked by delivery courier or admin at customer's doorstep upon physical parcel inspection.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as IVerifyOtpBody;

    if (!body || !body.otp || body.otp.trim().length !== 4) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 4-digit handover OTP." },
        { status: 400 }
      );
    }

    const order = await getOrderById(id, undefined, true);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found in vault system." },
        { status: 404 }
      );
    }

    if (order.paymentInfo.paymentStatus !== "PAID") {
      return NextResponse.json(
        {
          success: false,
          error: "Fraud Alert: Payment has not yet been confirmed by central bank gateway. Handover prohibited.",
        },
        { status: 400 }
      );
    }

    const result = await verifyDeliveryHandoverOtp(order.orderNumber || id, body.otp.trim());

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Delivery handover OTP verified successfully. Parcel registered as DELIVERED.",
      data: result.order,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Handover verification failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
