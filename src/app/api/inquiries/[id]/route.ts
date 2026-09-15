import { NextRequest, NextResponse } from "next/server";
import { getInquiryById, getInquiryByNumber } from "@/lib/inquiry-repository";
import { IGetInquiryDetailsResponse } from "@/types/inquiry.types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<IGetInquiryDetailsResponse>> {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json<IGetInquiryDetailsResponse>(
        { success: false, error: "Inquiry identifier is required." },
        { status: 400 }
      );
    }

    const inquiry = id.toUpperCase().startsWith("INQ-")
      ? await getInquiryByNumber(id)
      : await getInquiryById(id);

    if (!inquiry) {
      return NextResponse.json<IGetInquiryDetailsResponse>(
        { success: false, error: "Inquiry conversation not found." },
        { status: 404 }
      );
    }

    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("diamond_auth_token")?.value;
    const isPotentiallyAdmin = Boolean(authHeader || cookieToken);

    const safeInquiry = isPotentiallyAdmin
      ? inquiry
      : {
          ...inquiry,
          adminNotes: undefined,
        };

    return NextResponse.json<IGetInquiryDetailsResponse>({
      success: true,
      data: safeInquiry,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load inquiry conversation";
    return NextResponse.json<IGetInquiryDetailsResponse>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
