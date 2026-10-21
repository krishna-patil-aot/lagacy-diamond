"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ICacheStats,
  ICachePurgeRequest,
  ICachePurgeResponse,
  ICacheHealthResponse,
} from "@/types/cache.types";

export interface IUseCacheStatsReturn {
  stats: ICacheStats | null;
  isLoading: boolean;
  isPurging: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
  purgeCache: (
    target?: ICachePurgeRequest["target"],
    diamondId?: string
  ) => Promise<ICachePurgeResponse | null>;
}

/**
 * Enterprise Custom Hook: useCacheStats
 * Provides real-time cache metrics, driver status (Redis vs Memory fallback),
 * and administrative cache eviction controls.
 */
export function useCacheStats(autoRefresh: boolean = false): IUseCacheStatsReturn {
  const [stats, setStats] = useState<ICacheStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPurging, setIsPurging] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/cache", {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        if (res.status === 403) {
          setError("Admin authorization required for cache telemetry.");
          return;
        }
        throw new Error(`Telemetry probe returned HTTP ${res.status}`);
      }

      const json = (await res.json()) as ICacheHealthResponse;
      if (json.success && json.data) {
        setStats(json.data);
      } else {
        setError(json.error || "Failed to load cache telemetry");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Cache telemetry failed";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const purgeCache = useCallback(
    async (
      target: ICachePurgeRequest["target"] = "catalog",
      diamondId?: string
    ): Promise<ICachePurgeResponse | null> => {
      setIsPurging(true);
      setError(null);
      try {
        const payload: ICachePurgeRequest = { target, diamondId };
        const res = await fetch("/api/admin/cache", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(`Cache purge returned HTTP ${res.status}`);
        }

        const json = (await res.json()) as ICachePurgeResponse;
        if (json.success) {
          // Immediately refresh stats to reflect new version and cleared entries
          await fetchStats();
          return json;
        }
        throw new Error(json.message || "Cache purge failed");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to purge cache";
        setError(msg);
        return null;
      } finally {
        setIsPurging(false);
      }
    },
    [fetchStats]
  );

  useEffect(() => {
    let isCancelled = false;

    const runFetch = async () => {
      try {
        const res = await fetch("/api/admin/cache", {
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          if (!isCancelled) {
            setError(
              res.status === 403
                ? "Admin authorization required for cache telemetry."
                : `Telemetry probe returned HTTP ${res.status}`
            );
            setIsLoading(false);
          }
          return;
        }

        const json = (await res.json()) as ICacheHealthResponse;
        if (!isCancelled) {
          if (json.success && json.data) {
            setStats(json.data);
          } else {
            setError(json.error || "Failed to load cache telemetry");
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          const msg = err instanceof Error ? err.message : "Cache telemetry failed";
          setError(msg);
          setIsLoading(false);
        }
      }
    };

    void runFetch();

    if (!autoRefresh) {
      return () => {
        isCancelled = true;
      };
    }

    const interval = setInterval(() => {
      void runFetch();
    }, 15000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [autoRefresh]);

  return {
    stats,
    isLoading,
    isPurging,
    error,
    refreshStats: fetchStats,
    purgeCache,
  };
}
