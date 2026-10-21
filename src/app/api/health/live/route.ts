import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/health/live
 * Ultra-lightweight Sub-1ms Liveness Probe.
 * Validates process vitality without hitting external database or cache services.
 */
export async function GET(): Promise<NextResponse<{ status: string; uptimeSeconds: number; timestamp: string }>> {
  return NextResponse.json(
    {
      status: "alive",
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Process-Liveness": "true",
      },
    }
  );
}
