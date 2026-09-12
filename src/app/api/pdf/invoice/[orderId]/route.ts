import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/order-repository";
import { generateInvoicePdfBuffer } from "@/lib/pdf-generator";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
): Promise<Response> {
  try {
    const { orderId } = await context.params;
    const order = await getOrderById(orderId, undefined, true);

    if (!order) {
      return NextResponse.json({ error: "Order record not found" }, { status: 404 });
    }

    if (order.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Invoice is not available. This order has been cancelled by the administrator." },
        { status: 400 }
      );
    }

    const pdfBuffer = await generateInvoicePdfBuffer(order);

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Diamond_Vault_Invoice_${order.orderNumber || order.id}.pdf"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to render invoice PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
