import { NextRequest, NextResponse } from "next/server";
import { getDiamondById } from "@/lib/diamond-repository";
import { generateDiamondSpecPdfBuffer } from "@/lib/pdf-generator";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await context.params;
    const diamond = await getDiamondById(id);

    if (!diamond) {
      return NextResponse.json({ error: "Gemstone record not found" }, { status: 404 });
    }

    const pdfBuffer = await generateDiamondSpecPdfBuffer(diamond);

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Diamond_Spec_${diamond.sku}.pdf"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to render diamond spec PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
