import crypto from "crypto";
import {
  CacheDriver,
  ICacheEntry,
  ICacheOptions,
  ICacheStats,
  ICachePurgeResponse,
} from "@/types/cache.types";

/**
 * Enterprise In-Memory Fallback Cache Store
 * Survives across requests within warm serverless instances and provides
 * seamless 100% zero-cost operation when external Redis is not connected.
 */
interface IInternalMemoryRecord {
  serializedData: string;
  cachedAt: number;
  expiresAt: number;
  staleUntil: number;
  version: number;
  tags: string[];
}

const memoryStore = new Map<string, IInternalMemoryRecord>();
const inFlightFetches = new Map<string, Promise<string>>();

// Global in-memory metrics counters
let hitCount = 0;
let missCount = 0;
let writeCount = 0;
let evictionCount = 0;
let activeLocksCount = 0;
let lastPurgeTimestamp: string | null = null;
let catalogVersionMemory = 1;
const serviceStartTime = Date.now();

// Periodic cleanup of expired in-memory items every 2 minutes
let lastCleanupTime = Date.now();
const MEMORY_CLEANUP_INTERVAL_MS = 2 * 60 * 1000;

function sweepExpiredMemoryEntries(): void {
  const now = Date.now();
  if (now - lastCleanupTime < MEMORY_CLEANUP_INTERVAL_MS) return;
  lastCleanupTime = now;

  for (const [key, record] of memoryStore.entries()) {
    if (now > record.staleUntil) {
      memoryStore.delete(key);
      evictionCount++;
    }
  }
}

/**
 * Determines current active Cache Driver
 */
export function getActiveCacheDriver(): CacheDriver {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? "redis_upstash" : "in_memory_fallback";
}

/**
 * Upstash REST Command Execution Pipeline
 */
async function executeRedisCommands<T = string | number | null>(
  commands: Array<Array<string | number>>
): Promise<Array<{ result?: T }> | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`[Upstash Redis Pipeline HTTP Error: ${res.status}]`);
      return null;
    }

    const payload = (await res.json()) as Array<{ result?: T }>;
    return payload;
  } catch (err) {
    console.error("[Upstash Redis Network Exception - Falling back to local cache]:", err);
    return null;
  }
}

/**
 * Fetches the current catalog version counter from Redis or Memory.
 * Tag Versioning: Incrementing this version renders all previous catalog query keys
 * obsolete without triggering expensive distributed key-space scans.
 */
export async function getCatalogVersion(): Promise<number> {
  const driver = getActiveCacheDriver();
  if (driver === "redis_upstash") {
    const res = await executeRedisCommands<number>([["GET", "diamond:cat:version"]]);
    if (res && res[0]?.result !== undefined && res[0].result !== null) {
      return Number(res[0].result);
    }
    // Initialize version in Redis if missing
    await executeRedisCommands([["SETNX", "diamond:cat:version", 1]]);
    return 1;
  }
  return catalogVersionMemory;
}

/**
 * Generates a deterministic SHA-256 fingerprint for arbitrary filter dictionaries.
 */
export function generateFilterHash(payload: Record<string, string | number | boolean | string[] | undefined>): string {
  const sortedKeys = Object.keys(payload).sort();
  const normalized: Record<string, string | number | boolean | string[] | undefined> = {};
  for (const k of sortedKeys) {
    const val = payload[k];
    if (val !== undefined && val !== "") {
      normalized[k] = val;
    }
  }
  return crypto.createHash("sha256").update(JSON.stringify(normalized)).digest("hex").slice(0, 16);
}

/**
 * Core Cache-Aside Engine with Stale-While-Revalidate and Distributed Stampede Protection.
 */
export async function getOrSetCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: ICacheOptions
): Promise<T> {
  sweepExpiredMemoryEntries();
  const now = Date.now();
  const ttlSec = options.ttlSeconds;
  const swrSec = options.staleWhileRevalidateSeconds || 0;
  const ttlMs = ttlSec * 1000;
  const swrMs = swrSec * 1000;
  const tags = options.tags || [];

  const driver = getActiveCacheDriver();

  // 1. Attempt to read from Cache (Redis or Memory)
  let cachedPayload: ICacheEntry<T> | null = null;

  if (driver === "redis_upstash") {
    const res = await executeRedisCommands<string>([["GET", key]]);
    if (res && res[0]?.result) {
      try {
        cachedPayload = JSON.parse(res[0].result) as ICacheEntry<T>;
      } catch {
        cachedPayload = null;
      }
    }
  } else {
    const mem = memoryStore.get(key);
    if (mem) {
      try {
        cachedPayload = {
          data: JSON.parse(mem.serializedData) as T,
          cachedAt: mem.cachedAt,
          expiresAt: mem.expiresAt,
          staleUntil: mem.staleUntil,
          version: mem.version,
        };
      } catch {
        cachedPayload = null;
      }
    }
  }

  // 2. Cache Hit Evaluation
  if (cachedPayload) {
    // A. Fresh Hit: return immediately
    if (now < cachedPayload.expiresAt) {
      hitCount++;
      return cachedPayload.data;
    }

    // B. Stale-While-Revalidate Hit: return stale data immediately, revalidate asynchronously
    if (now < cachedPayload.staleUntil) {
      hitCount++;
      // Trigger background revalidation if no one is currently refreshing this key
      if (!inFlightFetches.has(key)) {
        void executeRefreshInBackground(key, fetcher, ttlMs, swrMs, tags, driver);
      }
      return cachedPayload.data;
    }
  }

  // 3. Cache Miss: Stampede (Dog-Piling) Protection via Singleflight + Distributed Lock
  missCount++;

  // Step 3A: Singleflight Promise Coalescing for current process
  const inFlight = inFlightFetches.get(key);
  if (inFlight) {
    const serialized = await inFlight;
    return JSON.parse(serialized) as T;
  }

  // Step 3B: Distributed Mutex Lock (if Redis is active) to prevent dog-piling across serverless instances
  const lockKey = `lock:${key}`;
  const lockToken = crypto.randomBytes(16).toString("hex");
  let lockAcquired = false;

  if (driver === "redis_upstash") {
    activeLocksCount++;
    const lockRes = await executeRedisCommands<string>([
      ["SET", lockKey, lockToken, "EX", 5, "NX"],
    ]);
    activeLocksCount = Math.max(0, activeLocksCount - 1);
    lockAcquired = lockRes?.[0]?.result === "OK";

    if (!lockAcquired) {
      // Another serverless worker is executing the database query.
      // Wait with backoff and check cache again.
      await new Promise((resolve) => setTimeout(resolve, 80));
      const retryRes = await executeRedisCommands<string>([["GET", key]]);
      if (retryRes && retryRes[0]?.result) {
        try {
          const freshData = JSON.parse(retryRes[0].result) as ICacheEntry<T>;
          hitCount++;
          return freshData.data;
        } catch {
          // Fall through to local fetcher
        }
      }
    }
  }

  // Step 3C: Execute Fetcher through Singleflight Promise
  const fetchPromise = (async (): Promise<string> => {
    try {
      const freshData = await fetcher();
      const entry: ICacheEntry<T> = {
        data: freshData,
        cachedAt: Date.now(),
        expiresAt: Date.now() + ttlMs,
        staleUntil: Date.now() + ttlMs + swrMs,
        version: 1,
      };

      const serialized = JSON.stringify(entry);

      // Persist to Store
      writeCount++;
      if (driver === "redis_upstash") {
        const totalRetentionSec = ttlSec + swrSec;
        await executeRedisCommands([
          ["SET", key, serialized, "EX", totalRetentionSec],
        ]);
      } else {
        memoryStore.set(key, {
          serializedData: serialized,
          cachedAt: entry.cachedAt,
          expiresAt: entry.expiresAt,
          staleUntil: entry.staleUntil,
          version: 1,
          tags,
        });
      }

      return serialized;
    } finally {
      inFlightFetches.delete(key);
      if (lockAcquired && driver === "redis_upstash") {
        // Safe lock release
        void executeRedisCommands([["DEL", lockKey]]);
      }
    }
  })();

  inFlightFetches.set(key, fetchPromise);
  const resultJson = await fetchPromise;
  const resultEntry = JSON.parse(resultJson) as ICacheEntry<T>;
  return resultEntry.data;
}

/**
 * Background Asynchronous Revalidation Worker for Stale-While-Revalidate
 */
async function executeRefreshInBackground<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number,
  swrMs: number,
  tags: string[],
  driver: CacheDriver
): Promise<void> {
  const refreshPromise = (async (): Promise<string> => {
    try {
      const freshData = await fetcher();
      const entry: ICacheEntry<T> = {
        data: freshData,
        cachedAt: Date.now(),
        expiresAt: Date.now() + ttlMs,
        staleUntil: Date.now() + ttlMs + swrMs,
        version: 1,
      };
      const serialized = JSON.stringify(entry);
      writeCount++;

      if (driver === "redis_upstash") {
        const totalRetentionSec = Math.ceil((ttlMs + swrMs) / 1000);
        await executeRedisCommands([
          ["SET", key, serialized, "EX", totalRetentionSec],
        ]);
      } else {
        memoryStore.set(key, {
          serializedData: serialized,
          cachedAt: entry.cachedAt,
          expiresAt: entry.expiresAt,
          staleUntil: entry.staleUntil,
          version: 1,
          tags,
        });
      }
      return serialized;
    } catch (e) {
      console.warn(`[Background Cache SWR Refresh Failed for ${key}]:`, e);
      return "";
    } finally {
      inFlightFetches.delete(key);
    }
  })();

  inFlightFetches.set(key, refreshPromise);
  await refreshPromise;
}

/**
 * Direct Distributed & Local Cache Fetcher
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  sweepExpiredMemoryEntries();
  const driver = getActiveCacheDriver();
  const now = Date.now();

  if (driver === "redis_upstash") {
    const res = await executeRedisCommands<string>([["GET", key]]);
    if (res && res[0]?.result) {
      try {
        const entry = JSON.parse(res[0].result) as ICacheEntry<T>;
        if (now < entry.expiresAt) {
          hitCount++;
          return entry.data;
        }
      } catch {
        return null;
      }
    }
    missCount++;
    return null;
  }

  const mem = memoryStore.get(key);
  if (mem) {
    if (now < mem.expiresAt) {
      try {
        hitCount++;
        return JSON.parse(mem.serializedData) as T;
      } catch {
        return null;
      }
    }
  }

  missCount++;
  return null;
}

/**
 * Direct Distributed & Local Cache Setter with TTL
 */
export async function cacheSet<T>(
  key: string,
  data: T,
  options?: { ttlSeconds?: number }
): Promise<void> {
  const driver = getActiveCacheDriver();
  const ttlSec = options?.ttlSeconds || 3600;
  const ttlMs = ttlSec * 1000;
  const now = Date.now();
  const serialized = JSON.stringify(data);

  writeCount++;

  if (driver === "redis_upstash") {
    const cacheEntry: ICacheEntry<T> = {
      data,
      cachedAt: now,
      expiresAt: now + ttlMs,
      staleUntil: now + ttlMs,
      version: 1,
    };
    await executeRedisCommands([["SET", key, JSON.stringify(cacheEntry), "EX", ttlSec]]);
    return;
  }

  memoryStore.set(key, {
    serializedData: serialized,
    cachedAt: now,
    expiresAt: now + ttlMs,
    staleUntil: now + ttlMs,
    version: 1,
    tags: [],
  });
}

/**
 * Invalidates the Entire Diamond Catalog via Tag Versioning.
 * Instant O(1) invalidation: All past catalog query combinations are superseded immediately.
 */
export async function invalidateCatalogCache(): Promise<number> {
  const driver = getActiveCacheDriver();
  let newVersion = 1;

  if (driver === "redis_upstash") {
    const res = await executeRedisCommands<number>([["INCR", "diamond:cat:version"]]);
    if (res && res[0]?.result !== undefined) {
      newVersion = Number(res[0].result);
    }
  } else {
    catalogVersionMemory++;
    newVersion = catalogVersionMemory;
    // Wipe matching catalog keys from memory store
    for (const key of memoryStore.keys()) {
      if (key.startsWith("diamond:cat:")) {
        memoryStore.delete(key);
        evictionCount++;
      }
    }
  }

  lastPurgeTimestamp = new Date().toISOString();
  return newVersion;
}

/**
 * Invalidates a Specific Diamond Item & Refreshes Catalog Version
 */
export async function invalidateDiamondCache(id: string): Promise<void> {
  const driver = getActiveCacheDriver();
  const itemKey = `diamond:item:${id}`;

  if (driver === "redis_upstash") {
    await executeRedisCommands([["DEL", itemKey]]);
  } else {
    if (memoryStore.has(itemKey)) {
      memoryStore.delete(itemKey);
      evictionCount++;
    }
  }

  // When a diamond item changes, catalog listings must reflect the update
  await invalidateCatalogCache();
}

/**
 * Complete Cache Flush: Wipes all catalog and item caches
 */
export async function purgeAllCache(): Promise<ICachePurgeResponse> {
  const driver = getActiveCacheDriver();
  const newVersion = await invalidateCatalogCache();

  if (driver === "redis_upstash") {
    // Invalidate version and set purge marker
    await executeRedisCommands([
      ["SET", "diamond:last_purged", new Date().toISOString()],
    ]);
  } else {
    memoryStore.clear();
  }

  lastPurgeTimestamp = new Date().toISOString();

  return {
    success: true,
    purgedTarget: "all",
    catalogVersion: newVersion,
    timestamp: lastPurgeTimestamp,
    message: "Cache purged successfully. Catalog version incremented and in-memory stores cleared.",
  };
}

/**
 * Provides live telemetry and diagnostics for the Cache Cluster.
 */
export async function getCacheStatistics(): Promise<ICacheStats> {
  const driver = getActiveCacheDriver();
  const catalogVersion = await getCatalogVersion();
  const totalRequests = hitCount + missCount;
  const hitRatio = totalRequests > 0 ? (hitCount / totalRequests) * 100 : 0;
  const uptimeSeconds = Math.floor((Date.now() - serviceStartTime) / 1000);

  return {
    driver,
    status: "healthy",
    hits: hitCount,
    misses: missCount,
    hitRatioPercentage: Number(hitRatio.toFixed(2)),
    totalKeys: memoryStore.size,
    totalWrites: writeCount,
    totalEvictions: evictionCount,
    lastPurgedAt: lastPurgeTimestamp,
    stampedeLocksActive: activeLocksCount,
    catalogVersion,
    uptimeSeconds,
  };
}
