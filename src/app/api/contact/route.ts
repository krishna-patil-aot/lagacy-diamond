import { NextRequest, NextResponse } from "next/server";
import { IContactInquiry, IContactResponse } from "@/types/contact.types";

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

    // In a production deployment, this would write to MongoDB Inquiries or dispatch email to support
    console.log(
      `\n[Legacy Diamond Concierge Inquiry Received]` +
        `\nName: ${body.fullName}` +
        `\nEmail: ${body.email}` +
        `\nPhone: ${body.phone || "Not provided"}` +
        `\nType: ${body.inquiryType}` +
        `\nCarat: ${body.preferredCaratRange || "N/A"}` +
        `\nBudget: ${body.budgetRange || "N/A"}` +
        `\nMessage: ${body.message}\n`
    );

    const inquiryId = `INQ-${Date.now().toString().slice(-6)}`;

    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you for contacting Legacy Diamond. Our Senior Gemological Concierge will review your request and connect with you within 4 business hours.",
        inquiryId,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Failed to process inquiry";
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit concierge inquiry. Please reach us directly at concierge@legacydiamond.luxury.",
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
