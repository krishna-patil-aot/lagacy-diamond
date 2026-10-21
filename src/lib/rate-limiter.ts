import { NextRequest, NextResponse } from "next/server";
import { IRateLimitOptions, IRateLimitResult } from "@/types/auth.types";

/**
 * In-Memory Sliding Window Record
 * Maps a hashed/structured key to an array of millisecond timestamps.
 */
interface ISlidingWindowRecord {
  timestamps: number[];
}

// Global in-memory storage for sliding window counters (survives requests within Node / serverless warm instances)
const globalSlidingWindowStore = new Map<string, ISlidingWindowRecord>();

// Clean up expired entries every 5 minutes to prevent memory leaks
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

function cleanupExpiredStore(now: number, maxWindowMs: number): void {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, record] of globalSlidingWindowStore.entries()) {
    const validTimestamps = record.timestamps.filter((ts) => now - ts <= maxWindowMs);
    if (validTimestamps.length === 0) {
      globalSlidingWindowStore.delete(key);
    } else {
      globalSlidingWindowStore.set(key, { timestamps: validTimestamps });
    }
  }
}

/**
 * Extracts Client IP securely from Cloudflare, Vercel, AWS, or reverse proxy headers.
 */
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }

  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp && cfConnectingIp.trim()) {
    return cfConnectingIp.trim();
  }

  return "127.0.0.1";
}

/**
 * Upstash / Distributed Redis Sliding Window Executor via HTTP REST.
 * Falls back transparently to in-memory sliding window when Redis environment variables are absent.
 */
async function checkDistributedRedisLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<IRateLimitResult | null> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    return null;
  }

  try {
    const now = Date.now();
    const clearBefore = now - windowMs;
    const redisKey = `ratelimit:${key}`;

    // Redis Pipeline: 1. ZREMRANGEBYSCORE, 2. ZADD, 3. ZCARD, 4. PEXPIRE
    const pipelineCommands = [
      ["ZREMRANGEBYSCORE", redisKey, 0, clearBefore],
      ["ZADD", redisKey, now, `${now}-${Math.random().toString(36).substring(2, 7)}`],
      ["ZCARD", redisKey],
      ["PEXPIRE", redisKey, windowMs],
    ];

    const response = await fetch(`${redisUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pipelineCommands),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as Array<{ result?: number }>;
    const currentCount = Number(json[2]?.result ?? 1);
    const allowed = currentCount <= limit;
    const remaining = Math.max(0, limit - currentCount);
    const resetTimeMs = now + windowMs;
    const retryAfterSec = Math.ceil(windowMs / 1000);

    return {
      allowed,
      limit,
      remaining,
      resetTimeMs,
      retryAfterSec,
    };
  } catch (err) {
    console.error("[Distributed Rate Limit Error - Fallback to Local]:", err);
    return null;
  }
}

/**
 * Sliding Window Counter Rate Limiter
 * Provides O(1) sliding window accuracy, preventing burst spikes across boundary windows.
 */
export async function checkRateLimit(
  request: NextRequest,
  options: IRateLimitOptions
): Promise<IRateLimitResult> {
  const { keyPrefix, limit, windowMs, identifier } = options;
  const clientIp = getClientIp(request);
  const targetKey = identifier
    ? `${keyPrefix}:id:${identifier.toLowerCase().trim()}`
    : `${keyPrefix}:ip:${clientIp}`;

  // 1. Try Distributed Redis if configured (MNC Multi-region serverless)
  const distributedResult = await checkDistributedRedisLimit(targetKey, limit, windowMs);
  if (distributedResult !== null) {
    return distributedResult;
  }

  // 2. High-performance In-Memory Sliding Window Fallback
  const now = Date.now();
  cleanupExpiredStore(now, windowMs);

  const record = globalSlidingWindowStore.get(targetKey) || { timestamps: [] };
  const validTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  const currentCount = validTimestamps.length;
  const allowed = currentCount < limit;

  if (allowed) {
    validTimestamps.push(now);
    globalSlidingWindowStore.set(targetKey, { timestamps: validTimestamps });
  }

  const remaining = Math.max(0, limit - (currentCount + (allowed ? 1 : 0)));
  const oldestTimestamp = validTimestamps[0] || now;
  const resetTimeMs = oldestTimestamp + windowMs;
  const retryAfterSec = Math.max(1, Math.ceil((resetTimeMs - now) / 1000));

  return {
    allowed,
    limit,
    remaining,
    resetTimeMs,
    retryAfterSec,
  };
}

/**
 * Enterprise Dual-Key Rate Limiter for Authentication Flows.
 * Evaluates both:
 * 1. IP-level rate limit (protects against single-source volumetric attacks)
 * 2. Identifier-level rate limit (protects user account from distributed botnets rotating IPs)
 */
export async function checkAuthRateLimit(
  request: NextRequest,
  endpoint: "login" | "register",
  identifier?: string
): Promise<{
  blocked: boolean;
  activeResult: IRateLimitResult;
}> {
  if (endpoint === "login") {
    // IP rule: 10 attempts per 15 minutes
    const ipResult = await checkRateLimit(request, {
      keyPrefix: "auth:login:ip",
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });

    if (!ipResult.allowed) {
      return { blocked: true, activeResult: ipResult };
    }

    // Account rule: 5 attempts per 15 minutes per specific email
    if (identifier) {
      const idResult = await checkRateLimit(request, {
        keyPrefix: "auth:login:account",
        limit: 5,
        windowMs: 15 * 60 * 1000,
        identifier,
      });

      if (!idResult.allowed) {
        return { blocked: true, activeResult: idResult };
      }
      return { blocked: false, activeResult: idResult };
    }

    return { blocked: false, activeResult: ipResult };
  }

  // endpoint === "register"
  // IP rule: 5 account creations per 60 minutes
  const regIpResult = await checkRateLimit(request, {
    keyPrefix: "auth:register:ip",
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });

  return {
    blocked: !regIpResult.allowed,
    activeResult: regIpResult,
  };
}

/**
 * Attaches standard IETF / RFC 6585 Rate Limit Headers to NextResponse.
 */
export function applyRateLimitHeaders(
  response: NextResponse,
  result: IRateLimitResult
): NextResponse {
  response.headers.set("X-RateLimit-Limit", String(result.limit));
  response.headers.set("X-RateLimit-Remaining", String(Math.max(0, result.remaining)));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetTimeMs / 1000)));
  if (!result.allowed) {
    response.headers.set("Retry-After", String(result.retryAfterSec));
  }
  return response;
}

/**
 * Generates standardized HTTP 429 Too Many Requests response with security headers.
 */
export function createRateLimitResponse(
  result: IRateLimitResult,
  customMessage?: string
): NextResponse {
  const minutes = Math.ceil(result.retryAfterSec / 60);
  const timeMessage = minutes > 1 ? `${minutes} minutes` : `${result.retryAfterSec} seconds`;

  const response = NextResponse.json(
    {
      success: false,
      error:
        customMessage ||
        `Rate limit exceeded. Security cooldown active. Please try again in ${timeMessage}.`,
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter: result.retryAfterSec,
    },
    { status: 429 }
  );

  return applyRateLimitHeaders(response, result);
}
