import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { createOrder } from "@/lib/order-repository";
import { getDiamondById } from "@/lib/diamond-repository";
import { addInquiryMessage } from "@/lib/inquiry-repository";
import { sendOrderReceiptPendingEmail } from "@/lib/mailer";
import { IDiamond } from "@/types/diamond.types";

export async function POST(request: NextRequest) {
  try {
    const verified = getAuthenticatedUserFromRequest(request);

    if (!verified || verified.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Access denied. Only authorized Curators can create client orders." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      clientName,
      clientEmail,
      clientPhone = "",
      street = "Curator Vault Custody",
      city = "Geneva",
      state = "",
      postalCode = "",
      country = "India",
      items,
      paymentMethod = "VAULT_ESCROW",
      discountPercentage = 0,
      adminNotes = "",
      inquiryId,
    } = body;

    if (!clientName || !clientEmail) {
      return NextResponse.json(
        { success: false, error: "Client full name and email are required to create an order." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one diamond specimen must be selected." },
        { status: 400 }
      );
    }

    // Resolve and validate diamonds from catalog
    const resolvedDiamonds: IDiamond[] = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const diamondId = typeof item === "string" ? item : item.diamondId;
      const quantity = typeof item === "object" && item.quantity ? Number(item.quantity) : 1;

      const diamond = await getDiamondById(diamondId);
      if (!diamond) {
        return NextResponse.json(
          { success: false, error: `Diamond lot ${diamondId} was not found in vault registry.` },
          { status: 400 }
        );
      }

      for (let i = 0; i < quantity; i++) {
        resolvedDiamonds.push({
          ...diamond,
          cartQuantity: 1,
        });
        calculatedSubtotal += diamond.finalPrice;
      }
    }

    const safeDiscountPct = Math.min(Math.max(0, Number(discountPercentage) || 0), 90);
    const calculatedDiscount = Math.round(calculatedSubtotal * (safeDiscountPct / 100));
    const calculatedTotal = Math.max(0, calculatedSubtotal - calculatedDiscount);

    // Create order pre-approved by the curator
    const newOrder = await createOrder(
      {
        items: resolvedDiamonds,
        shippingAddress: {
          fullName: clientName.trim(),
          email: clientEmail.trim().toLowerCase(),
          phone: clientPhone.trim(),
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
        },
        paymentInfo: {
          method: paymentMethod,
          couponCode: safeDiscountPct > 0 ? `CURATOR-CONCESSION-${safeDiscountPct}%` : undefined,
          couponDiscountPercentage: safeDiscountPct,
        },
        subtotal: calculatedSubtotal,
        couponDiscount: calculatedDiscount,
        totalAmount: calculatedTotal,
        status: "APPROVED", // Curator commissions are approved upon generation
        createdAt: new Date().toISOString(),
        createdByAdmin: true,
        adminNotes: adminNotes || "Curator-generated VIP Commission Order",
      },
      undefined,
      clientEmail.trim().toLowerCase()
    );

    // If an inquiryId was linked, post an official confirmation in the consultation thread
    if (inquiryId) {
      try {
        const diamondSummaries = resolvedDiamonds
          .map((d) => `${d.carat}ct ${d.shape} (${d.sku})`)
          .join(", ");

        await addInquiryMessage(inquiryId, {
          sender: "ADMIN",
          senderName: verified.name || "Curator Gemologist",
          senderEmail: verified.email || "curator@darkgems.luxury",
          message: `[OFFICIAL COMMISSION ORDER CREATED]\n\nDear ${clientName},\n\nWe have created official VIP Order #${newOrder.orderNumber || newOrder.id} for your selected gemstone(s): ${diamondSummaries}.\n\nTotal Settlement: $${calculatedTotal.toLocaleString()} via ${paymentMethod.replace(/_/g, " ")}.\n\nAll verified lab dossiers and satellite logistics tracking are now available in your client portal.`,
        });
      } catch (inquiryErr) {
        console.error("[Inquiry Message Thread Error]:", inquiryErr);
      }
    }

    // Dispatch acknowledgement email to client
    if (clientEmail) {
      sendOrderReceiptPendingEmail({
        to: clientEmail.trim().toLowerCase(),
        clientName: clientName.trim(),
        orderNumber: newOrder.orderNumber || newOrder.id,
        totalAmount: calculatedTotal,
        itemCount: resolvedDiamonds.length,
      }).catch((emailErr) => {
        console.error("[Curator Order Mailer Error]:", emailErr);
      });
    }

    return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create client order";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
