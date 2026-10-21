import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import {
  getCacheStatistics,
  purgeAllCache,
  invalidateCatalogCache,
  invalidateDiamondCache,
} from "@/lib/cache-service";
import {
  ICachePurgeRequest,
  ICachePurgeResponse,
  ICacheHealthResponse,
} from "@/types/cache.types";

/**
 * Enterprise Cache Telemetry & Invalidation Endpoint
 * Provides real-time metrics (hit ratio, misses, active keys, driver)
 * and allows on-demand cache purging with administrative authorization.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ICacheHealthResponse>> {
  try {
    const user = getAuthenticatedUserFromRequest(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Administrative credentials required for cache telemetry." },
        { status: 403 }
      );
    }

    const stats = await getCacheStatistics();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cache diagnostic telemetry failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ICachePurgeResponse | { success: false; error: string }>> {
  try {
    const user = getAuthenticatedUserFromRequest(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Administrative credentials required for cache invalidation." },
        { status: 403 }
      );
    }

    const body = (await request.json()) as Partial<ICachePurgeRequest>;
    const target = body.target || "catalog";

    if (target === "all") {
      const purgeResult = await purgeAllCache();
      return NextResponse.json(purgeResult);
    }

    if (target === "item" && body.diamondId) {
      await invalidateDiamondCache(body.diamondId);
      return NextResponse.json({
        success: true,
        purgedTarget: `item:${body.diamondId}`,
        catalogVersion: 0,
        timestamp: new Date().toISOString(),
        message: `Item cache for diamond ${body.diamondId} invalidated successfully.`,
      });
    }

    // Default to catalog invalidation
    const newVersion = await invalidateCatalogCache();
    return NextResponse.json({
      success: true,
      purgedTarget: "catalog",
      catalogVersion: newVersion,
      timestamp: new Date().toISOString(),
      message: `Catalog query cache invalidated. Advanced to version ${newVersion}.`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cache purge execution failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
