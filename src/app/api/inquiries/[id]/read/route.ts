import { NextRequest, NextResponse } from "next/server";
import { markInquiryAsReadByClient, markInquiryAsReadByAdmin } from "@/lib/inquiry-repository";
import { verifyToken } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ success: boolean; error?: string }>> {
  try {
    const { id } = await params;
    const token =
      request.cookies.get("diamond_auth_token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    const verified = token ? verifyToken(token) : null;

    if (verified?.role === "ADMIN") {
      const updated = await markInquiryAsReadByAdmin(id);
      if (!updated) {
        return NextResponse.json({ success: false, error: "Inquiry not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    const clientEmail = verified?.email;
    const updated = await markInquiryAsReadByClient(id, clientEmail);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Inquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to mark inquiry as read";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
