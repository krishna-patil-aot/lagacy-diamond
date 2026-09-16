import { NextRequest, NextResponse } from "next/server";
import { subscribeToStockNotification } from "@/lib/stock-notification-repository";
import { getDiamondById } from "@/lib/diamond-repository";
import { getAuthenticatedUserFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { diamondId, email: rawEmail, clientName: rawClientName } = body;

    if (!diamondId) {
      return NextResponse.json(
        { success: false, error: "Diamond specimen identifier is required." },
        { status: 400 }
      );
    }

    // Attempt to resolve email from authenticated session if not explicitly provided
    const authUser = getAuthenticatedUserFromRequest(request);
    const resolvedEmail = String(rawEmail || authUser?.email || "").toLowerCase().trim();
    const resolvedName = String(rawClientName || authUser?.name || "Valued Client").trim();

    if (!resolvedEmail || !resolvedEmail.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required to receive stock notifications." },
        { status: 400 }
      );
    }

    const diamond = await getDiamondById(diamondId);
    if (!diamond) {
      return NextResponse.json(
        { success: false, error: "Specimen lot not found in vault registry." },
        { status: 404 }
      );
    }

    const subscription = await subscribeToStockNotification({
      diamondId: diamond._id,
      diamondSku: diamond.sku,
      diamondName: diamond.name,
      email: resolvedEmail,
      clientName: resolvedName,
    });

    // If specimen is currently available in stock, dispatch alert immediately
    if (diamond.stockQuantity > 0) {
      try {
        const { dispatchStockAlertsForDiamond } = await import(
          "@/lib/stock-notification-repository"
        );
        await dispatchStockAlertsForDiamond(diamond._id, diamond);
      } catch (dispatchErr) {
        console.error("[Immediate Stock Alert Dispatch Error]:", dispatchErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Stock notification confirmed. We will email ${resolvedEmail} the moment ${diamond.sku} returns to vault stock.`,
      data: subscription,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to establish stock notification";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
