import { NextRequest, NextResponse } from "next/server";
import { getAllInquiriesAdmin, getInquiryStats } from "@/lib/inquiry-repository";
import { verifyToken } from "@/lib/auth";
import { InquiryStatus, IAdminInquiriesResponse } from "@/types/inquiry.types";

export async function GET(
  request: NextRequest
): Promise<NextResponse<IAdminInquiriesResponse>> {
  try {
    const token =
      request.cookies.get("diamond_auth_token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    const verified = token ? verifyToken(token) : null;

    if (!verified || verified.role !== "ADMIN") {
      return NextResponse.json<IAdminInquiriesResponse>(
        { success: false, error: "Curator Admin clearance required to view customer inquiries." },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get("status") as InquiryStatus | "ALL" | null;
    const searchParam = searchParams.get("q") || undefined;

    const [inquiries, stats] = await Promise.all([
      getAllInquiriesAdmin(statusParam || "ALL", searchParam),
      getInquiryStats(),
    ]);

    return NextResponse.json<IAdminInquiriesResponse>({
      success: true,
      data: inquiries,
      stats,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch customer inquiries";
    return NextResponse.json<IAdminInquiriesResponse>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
