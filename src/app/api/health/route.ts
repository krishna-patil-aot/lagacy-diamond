import { NextResponse } from "next/server";
import { performSystemHealthCheck } from "@/lib/health-service";
import { logger } from "@/lib/logger";
import { IHealthProbeResponse } from "@/types/observability.types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/health
 * Tier-1 Deep Diagnostic & Readiness Synthetic Health Probe.
 * Evaluates MongoDB, Upstash Redis, Queue Engine, V8 Heap, and External Services.
 */
export async function GET(): Promise<NextResponse<IHealthProbeResponse>> {
  const stopTimer = logger.time("health:synthetic_probe");

  try {
    const report = await performSystemHealthCheck();
    stopTimer({
      status: report.status,
      dbLatencyMs: report.subsystems.database.latencyMs,
      redisLatencyMs: report.subsystems.redisCache.latencyMs,
      heapUsagePercent: report.system.memory.heapUsagePercent,
    });

    const isHealthy = report.status !== "unhealthy";
    const httpStatus = isHealthy ? 200 : 503;

    return NextResponse.json(
      {
        success: isHealthy,
        status: report.status,
        data: report,
      },
      {
        status: httpStatus,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "X-System-Status": report.status,
          "X-Uptime-Seconds": String(report.uptimeSeconds),
        },
      }
    );
  } catch (err) {
    logger.error("Synthetic health check probe fatal error", err);

    return NextResponse.json(
      {
        success: false,
        status: "unhealthy",
        data: {
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          uptimeSeconds: 0,
          environment: process.env.NODE_ENV || "development",
          version: "2.4.0",
          subsystems: {
            database: {
              name: "MongoDB Atlas",
              status: "unhealthy",
              latencyMs: 0,
              message: "Probe failed with internal exception",
              lastChecked: new Date().toISOString(),
            },
            redisCache: {
              name: "Redis Cache",
              status: "unhealthy",
              latencyMs: 0,
              message: "Probe unexecuted",
              lastChecked: new Date().toISOString(),
            },
            queueEngine: {
              name: "Queue Engine",
              status: "unhealthy",
              latencyMs: 0,
              message: "Probe unexecuted",
              lastChecked: new Date().toISOString(),
            },
            memory: {
              name: "V8 Memory",
              status: "unhealthy",
              latencyMs: 0,
              message: "Probe unexecuted",
              lastChecked: new Date().toISOString(),
            },
            cloudinaryStorage: {
              name: "Cloudinary",
              status: "degraded",
              latencyMs: 0,
              message: "Probe unexecuted",
              lastChecked: new Date().toISOString(),
            },
            emailService: {
              name: "Nodemailer",
              status: "degraded",
              latencyMs: 0,
              message: "Probe unexecuted",
              lastChecked: new Date().toISOString(),
            },
            aiConcierge: {
              name: "Gemini AI",
              status: "degraded",
              latencyMs: 0,
              message: "Probe unexecuted",
              lastChecked: new Date().toISOString(),
            },
          },
          system: {
            nodeVersion: process.version,
            platform: process.platform,
            memory: {
              heapUsedMB: 0,
              heapTotalMB: 0,
              rssMB: 0,
              externalMB: 0,
              heapUsagePercent: 0,
            },
          },
        },
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "X-System-Status": "unhealthy",
        },
      }
    );
  }
}
