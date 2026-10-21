/**
 * Enterprise Caching System Types
 * Strictly typed contracts for Redis Cache-Aside, Invalidation, and Dog-Piling Prevention.
 */

export type CacheDriver = "redis_upstash" | "in_memory_fallback";

export interface ICacheOptions {
  /** Time-to-live in seconds before cache entry expires */
  ttlSeconds: number;
  /** Grace period in seconds to serve stale data while revalidating in background */
  staleWhileRevalidateSeconds?: number;
  /** Semantic grouping tags for selective invalidation */
  tags?: string[];
}

export interface ICacheEntry<T> {
  data: T;
  cachedAt: number;
  expiresAt: number;
  staleUntil: number;
  version: number;
}

export interface ICacheStats {
  driver: CacheDriver;
  status: "healthy" | "degraded";
  hits: number;
  misses: number;
  hitRatioPercentage: number;
  totalKeys: number;
  totalWrites: number;
  totalEvictions: number;
  lastPurgedAt: string | null;
  stampedeLocksActive: number;
  catalogVersion: number;
  uptimeSeconds: number;
}

export type CachePurgeTarget = "all" | "catalog" | "item";

export interface ICachePurgeRequest {
  target: CachePurgeTarget;
  diamondId?: string;
}

export interface ICachePurgeResponse {
  success: boolean;
  purgedTarget: string;
  catalogVersion: number;
  timestamp: string;
  message: string;
}

export interface ICacheHealthResponse {
  success: boolean;
  data?: ICacheStats;
  error?: string;
}
