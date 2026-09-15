import { NextRequest, NextResponse } from "next/server";
import { IContactInquiry, IContactResponse } from "@/types/contact.types";
import { createInquiry } from "@/lib/inquiry-repository";
import { siteConfig } from "@/config/site.config";

export async function POST(request: NextRequest): Promise<NextResponse<IContactResponse>> {
  try {
    const body = (await request.json()) as IContactInquiry;

    if (!body.fullName || !body.email || !body.message) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill out all required fields (Full Name, Email, and Message).",
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    const savedInquiry = await createInquiry({
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      inquiryType: body.inquiryType,
      preferredCaratRange: body.preferredCaratRange,
      budgetRange: body.budgetRange,
      message: body.message,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          `Thank you for contacting ${siteConfig.brandName}. Your inquiry has been received and our Curator Admin will connect with you promptly.`,
        inquiryId: savedInquiry.inquiryNumber,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Failed to process inquiry";
    return NextResponse.json(
      {
        success: false,
        message: `Failed to submit concierge inquiry. Please reach us directly at ${siteConfig.contact.conciergeEmail}.`,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
