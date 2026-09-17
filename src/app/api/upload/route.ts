import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import {
  uploadBufferToCloudinary,
  isCloudinaryConfigured,
} from "@/lib/cloudinary";
import { IUploadResponse } from "@/types/upload.types";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

export async function POST(
  request: NextRequest
): Promise<NextResponse<IUploadResponse>> {
  try {
    // 1. Authenticate Gemologist Admin Clearance
    const decoded = getAuthenticatedUserFromRequest(request);
    if (!decoded) {
      return NextResponse.json<IUploadResponse>(
        {
          success: false,
          error: "Unauthorized: Missing authentication token",
        },
        { status: 401 }
      );
    }

    if (decoded.role !== "ADMIN") {
      return NextResponse.json<IUploadResponse>(
        {
          success: false,
          error: "Forbidden: Curator Admin privileges required for media upload",
        },
        { status: 403 }
      );
    }

    // 2. Validate Multipart Form Data
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json<IUploadResponse>(
        {
          success: false,
          error: "No valid image file was provided in the request payload.",
        },
        { status: 400 }
      );
    }

    // 3. Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json<IUploadResponse>(
        {
          success: false,
          error: `Unsupported image format: ${file.type}. Allowed formats are JPEG, PNG, WebP, AVIF, and GIF.`,
        },
        { status: 400 }
      );
    }

    // 4. Validate File Size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json<IUploadResponse>(
        {
          success: false,
          error: "Image exceeds the maximum allowed file size of 10MB.",
        },
        { status: 400 }
      );
    }

    // 5. Check Cloudinary Configuration
    if (!isCloudinaryConfigured()) {
      return NextResponse.json<IUploadResponse>(
        {
          success: false,
          error:
            "Cloudinary credentials are not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your environment variables.",
        },
        { status: 503 }
      );
    }

    // 6. Convert to Buffer and Stream to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadBufferToCloudinary(buffer, "darkgems/diamonds");

    return NextResponse.json<IUploadResponse>(
      {
        success: true,
        url: result.secureUrl,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Media upload to Cloudinary failed";
    console.error("[Upload API Error]:", error);

    return NextResponse.json<IUploadResponse>(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
