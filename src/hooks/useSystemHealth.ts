"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ISystemHealthReport,
  IHealthProbeResponse,
  ILatencyHistoryPoint,
} from "@/types/observability.types";

export interface IUseSystemHealthReturn {
  report: ISystemHealthReport | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  autoRefresh: boolean;
  latencyHistory: ILatencyHistoryPoint[];
  lastCheckTimestamp: string | null;
  refreshHealth: () => Promise<void>;
  toggleAutoRefresh: () => void;
}

const MAX_HISTORY_POINTS = 20;
const AUTO_REFRESH_INTERVAL_MS = 15000;

export function useSystemHealth(initialAutoRefresh: boolean = true): IUseSystemHealthReturn {
  const [report, setReport] = useState<ISystemHealthReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(initialAutoRefresh);
  const [latencyHistory, setLatencyHistory] = useState<ILatencyHistoryPoint[]>([]);
  const [lastCheckTimestamp, setLastCheckTimestamp] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);

  const fetchProbe = useCallback(async (isBackground: boolean = false) => {
    if (isBackground) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const res = await fetch("/api/health", {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      const json = (await res.json()) as IHealthProbeResponse;

      if (isMountedRef.current) {
        if (json.data) {
          setReport(json.data);
          const now = new Date();
          const timeLabel = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

          const newPoint: ILatencyHistoryPoint = {
            timestamp: now.toISOString(),
            timeLabel,
            dbLatencyMs: json.data.subsystems.database.latencyMs,
            redisLatencyMs: json.data.subsystems.redisCache.latencyMs,
          };

          setLatencyHistory((prev) => {
            const next = [...prev, newPoint];
            return next.length > MAX_HISTORY_POINTS ? next.slice(-MAX_HISTORY_POINTS) : next;
          });

          setLastCheckTimestamp(now.toISOString());
        } else {
          setError("Malformed diagnostic probe response");
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        const msg = err instanceof Error ? err.message : "Synthetic health probe failed";
        setError(msg);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  const refreshHealth = useCallback(async () => {
    await fetchProbe(true);
  }, [fetchProbe]);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh((prev) => !prev);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    let isCancelled = false;

    const initialRun = async () => {
      try {
        const res = await fetch("/api/health", {
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        const json = (await res.json()) as IHealthProbeResponse;

        if (!isCancelled && json.data) {
          setReport(json.data);
          const now = new Date();
          const timeLabel = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

          const newPoint: ILatencyHistoryPoint = {
            timestamp: now.toISOString(),
            timeLabel,
            dbLatencyMs: json.data.subsystems.database.latencyMs,
            redisLatencyMs: json.data.subsystems.redisCache.latencyMs,
          };

          setLatencyHistory([newPoint]);
          setLastCheckTimestamp(now.toISOString());
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "Health check failed");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    initialRun();

    return () => {
      isCancelled = true;
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchProbe(true);
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchProbe]);

  return {
    report,
    isLoading,
    isRefreshing,
    error,
    autoRefresh,
    latencyHistory,
    lastCheckTimestamp,
    refreshHealth,
    toggleAutoRefresh,
  };
}
