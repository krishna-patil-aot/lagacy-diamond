import { NextRequest, NextResponse } from "next/server";
import { getDiamondById, updateDiamond, deleteDiamond } from "@/lib/diamond-repository";
import { getAuthenticatedUserFromRequest } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const diamond = await getDiamondById(id);
    if (!diamond) {
      return NextResponse.json(
        { success: false, error: "Diamond not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: diamond });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch diamond";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const decoded = getAuthenticatedUserFromRequest(request);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Missing authentication token" },
        { status: 401 }
      );
    }

    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin privileges required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updated = await updateDiamond(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Diamond not found or update failed" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update diamond";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const decoded = getAuthenticatedUserFromRequest(request);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Missing authentication token" },
        { status: 401 }
      );
    }

    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin privileges required" },
        { status: 403 }
      );
    }

    const deleted = await deleteDiamond(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Diamond not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Diamond deleted successfully",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete diamond";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
