import { NextRequest, NextResponse } from "next/server";
import { updateInquiryStatus, getInquiryById } from "@/lib/inquiry-repository";
import { verifyToken } from "@/lib/auth";
import { InquiryStatus, IUpdateInquiryStatusResponse } from "@/types/inquiry.types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<IUpdateInquiryStatusResponse>> {
  try {
    const { id } = await params;
    const token =
      request.cookies.get("diamond_auth_token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    const verified = token ? verifyToken(token) : null;

    if (!verified || verified.role !== "ADMIN") {
      return NextResponse.json<IUpdateInquiryStatusResponse>(
        { success: false, error: "Curator Admin clearance required." },
        { status: 403 }
      );
    }

    const body = (await request.json()) as {
      status?: InquiryStatus;
      adminNotes?: string;
      adminReply?: string;
    };

    const existing = await getInquiryById(id);
    if (!existing) {
      return NextResponse.json<IUpdateInquiryStatusResponse>(
        { success: false, error: "Inquiry not found." },
        { status: 404 }
      );
    }

    const newStatus = body.status || (body.adminReply ? "IN_PROGRESS" : existing.status);

    const updated = await updateInquiryStatus(
      id,
      newStatus,
      body.adminNotes,
      body.adminReply
    );
    if (!updated) {
      return NextResponse.json<IUpdateInquiryStatusResponse>(
        { success: false, error: "Failed to update inquiry." },
        { status: 500 }
      );
    }

    return NextResponse.json<IUpdateInquiryStatusResponse>({
      success: true,
      data: updated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update inquiry";
    return NextResponse.json<IUpdateInquiryStatusResponse>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
