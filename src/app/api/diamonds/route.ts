import { NextRequest, NextResponse } from "next/server";
import { getDiamonds, createDiamond } from "@/lib/diamond-repository";
import {
  DiamondClarity,
  DiamondColor,
  DiamondCut,
  DiamondShape,
} from "@/types/diamond.types";
import { DiamondSortOption } from "@/types/filter.types";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const shapes = searchParams.getAll("shape") as DiamondShape[];
    const colors = searchParams.getAll("color") as DiamondColor[];
    const cuts = searchParams.getAll("cut") as DiamondCut[];
    const clarities = searchParams.getAll("clarity") as DiamondClarity[];

    const minPrice = searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined;
    const minCarat = searchParams.get("minCarat")
      ? Number(searchParams.get("minCarat"))
      : undefined;
    const maxCarat = searchParams.get("maxCarat")
      ? Number(searchParams.get("maxCarat"))
      : undefined;
    const minDiscount = searchParams.get("minDiscount")
      ? Number(searchParams.get("minDiscount"))
      : undefined;
    const inStockOnly = searchParams.get("inStockOnly") === "true";
    const searchQuery = searchParams.get("search") || "";
    const sortBy = (searchParams.get("sortBy") as DiamondSortOption) || "featured";
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 4;

    const result = await getDiamonds({
      shapes,
      colors,
      cuts,
      clarities,
      minPrice,
      maxPrice,
      minCarat,
      maxCarat,
      minDiscount,
      inStockOnly,
      searchQuery,
      sortBy,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result.diamonds,
      meta: result.meta,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to retrieve diamonds";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Missing authentication token" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin privileges required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    if (!body.name || !body.sku || !body.price || !body.carat) {
      return NextResponse.json(
        { success: false, error: "Missing required diamond parameters" },
        { status: 400 }
      );
    }

    const created = await createDiamond(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create diamond";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
