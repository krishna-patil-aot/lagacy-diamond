import { NextRequest, NextResponse } from "next/server";
import { getInquiryByNumber } from "@/lib/inquiry-repository";
import { ITrackInquiryResponse } from "@/types/inquiry.types";

export async function GET(request: NextRequest): Promise<NextResponse<ITrackInquiryResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const inquiryNumber = searchParams.get("inquiryNumber");

    if (!inquiryNumber || !inquiryNumber.trim()) {
      return NextResponse.json<ITrackInquiryResponse>(
        { success: false, error: "Inquiry reference number is required." },
        { status: 400 }
      );
    }

    const inquiry = await getInquiryByNumber(inquiryNumber.trim());
    if (!inquiry) {
      return NextResponse.json<ITrackInquiryResponse>(
        { success: false, error: "No inquiry found matching reference number." },
        { status: 404 }
      );
    }

    // Return sanitized inquiry details (avoid leaking private admin internal notes to public)
    const publicInquiry = {
      ...inquiry,
      adminNotes: undefined, // internal admin notes are kept private
    };

    return NextResponse.json<ITrackInquiryResponse>({
      success: true,
      data: publicInquiry,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to track inquiry";
    return NextResponse.json<ITrackInquiryResponse>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
