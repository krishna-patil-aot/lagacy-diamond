"use client";

import { useState, useEffect, useCallback } from "react";
import { IDatabaseHealthResponse } from "@/types/admin.types";

export interface IUseDatabaseHealthReturn {
  healthData: IDatabaseHealthResponse["data"] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom Hook: useDatabaseHealth
 * Monitors MongoDB Atlas connection pool state, query latency (ping), and index readiness.
 */
export function useDatabaseHealth(autoPoll: boolean = false): IUseDatabaseHealthReturn {
  const [healthData, setHealthData] = useState<IDatabaseHealthResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/database-health", {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        if (res.status === 403) {
          setError("Admin authorization required to inspect database pool diagnostics.");
          return;
        }
        throw new Error(`Health probe returned HTTP ${res.status}`);
      }

      const json = (await res.json()) as IDatabaseHealthResponse;
      if (json.success && json.data) {
        setHealthData(json.data);
      } else {
        setError(json.error || "Failed to retrieve database diagnostics");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Database probe failed";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const runProbe = async () => {
      try {
        const res = await fetch("/api/admin/database-health", {
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          if (!isCancelled) {
            setError(
              res.status === 403
                ? "Admin authorization required to inspect database pool diagnostics."
                : `Health probe returned HTTP ${res.status}`
            );
            setIsLoading(false);
          }
          return;
        }

        const json = (await res.json()) as IDatabaseHealthResponse;
        if (!isCancelled) {
          if (json.success && json.data) {
            setHealthData(json.data);
          } else {
            setError(json.error || "Failed to retrieve database diagnostics");
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          const msg = err instanceof Error ? err.message : "Database probe failed";
          setError(msg);
          setIsLoading(false);
        }
      }
    };

    void runProbe();

    if (!autoPoll) {
      return () => {
        isCancelled = true;
      };
    }

    const interval = setInterval(() => {
      void runProbe();
    }, 15000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [autoPoll]);

  return {
    healthData,
    isLoading,
    error,
    refetch: fetchHealth,
  };
}
