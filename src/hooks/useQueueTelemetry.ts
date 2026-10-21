"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  IQueueTelemetry,
  IProcessQueueSummary,
  IRetryJobResponse,
  IPurgeJobResponse,
} from "@/types/queue.types";
import { IAdminQueueTelemetryResponse, IAdminQueueProcessResponse } from "@/app/api/admin/queue/route";

export interface IUseQueueTelemetryReturn {
  telemetry: IQueueTelemetry | null;
  isLoading: boolean;
  isProcessing: boolean;
  isRetrying: boolean;
  isPurging: boolean;
  error: string | null;
  activeTab: "overview" | "dlq" | "jobs";
  setActiveTab: (tab: "overview" | "dlq" | "jobs") => void;
  refreshTelemetry: () => Promise<void>;
  triggerWorker: (maxJobs?: number) => Promise<IProcessQueueSummary | null>;
  retryJob: (jobId: string) => Promise<boolean>;
  retryAllJobs: () => Promise<boolean>;
  purgeJob: (jobId: string) => Promise<boolean>;
  purgeCompleted: (olderThanHours?: number) => Promise<boolean>;
}

/**
 * Enterprise Custom Hook: useQueueTelemetry
 * Manages background queue observability, real-time polling, and DLQ remediation actions.
 */
export function useQueueTelemetry(
  autoRefresh: boolean = false,
  pollIntervalMs: number = 5000
): IUseQueueTelemetryReturn {
  const [telemetry, setTelemetry] = useState<IQueueTelemetry | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [isPurging, setIsPurging] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "dlq" | "jobs">("overview");

  const isMountedRef = useRef<boolean>(true);

  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/queue", {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        if (res.status === 403) {
          if (isMountedRef.current) {
            setError("Admin authorization required for queue telemetry.");
          }
          return;
        }
        throw new Error(`Queue telemetry responded with status ${res.status}`);
      }

      const json = (await res.json()) as IAdminQueueTelemetryResponse;
      if (isMountedRef.current) {
        if (json.success && json.data) {
          setTelemetry(json.data);
          setError(null);
        } else {
          setError(json.error || "Failed to load queue telemetry data");
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load queue telemetry";
      if (isMountedRef.current) {
        setError(msg);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const triggerWorker = useCallback(
    async (maxJobs: number = 10): Promise<IProcessQueueSummary | null> => {
      setIsProcessing(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/queue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ maxJobs }),
        });

        if (!res.ok) {
          throw new Error(`Worker trigger returned HTTP ${res.status}`);
        }

        const json = (await res.json()) as IAdminQueueProcessResponse;
        if (json.success && json.summary) {
          await fetchTelemetry();
          return json.summary;
        } else {
          setError(json.error || "Worker execution failed");
          return null;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to trigger queue worker";
        setError(msg);
        return null;
      } finally {
        if (isMountedRef.current) {
          setIsProcessing(false);
        }
      }
    },
    [fetchTelemetry]
  );

  const retryJob = useCallback(
    async (jobId: string): Promise<boolean> => {
      setIsRetrying(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/queue/retry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId }),
        });

        if (!res.ok) {
          throw new Error(`Retry returned HTTP ${res.status}`);
        }

        const json = (await res.json()) as IRetryJobResponse;
        if (json.success) {
          await fetchTelemetry();
          return true;
        } else {
          setError(json.message || "Failed to replay job");
          return false;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to retry job";
        setError(msg);
        return false;
      } finally {
        if (isMountedRef.current) {
          setIsRetrying(false);
        }
      }
    },
    [fetchTelemetry]
  );

  const retryAllJobs = useCallback(async (): Promise<boolean> => {
    setIsRetrying(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/queue/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retryAll: true }),
      });

      if (!res.ok) {
        throw new Error(`Retry all returned HTTP ${res.status}`);
      }

      const json = (await res.json()) as IRetryJobResponse;
      if (json.success) {
        await fetchTelemetry();
        return true;
      } else {
        setError(json.message || "Failed to replay all dead-letter jobs");
        return false;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to replay all jobs";
      setError(msg);
      return false;
    } finally {
      if (isMountedRef.current) {
        setIsRetrying(false);
      }
    }
  }, [fetchTelemetry]);

  const purgeJob = useCallback(
    async (jobId: string): Promise<boolean> => {
      setIsPurging(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/queue/purge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId }),
        });

        if (!res.ok) {
          throw new Error(`Purge returned HTTP ${res.status}`);
        }

        const json = (await res.json()) as IPurgeJobResponse;
        if (json.success) {
          await fetchTelemetry();
          return true;
        } else {
          setError(json.message || "Failed to purge job");
          return false;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to purge job";
        setError(msg);
        return false;
      } finally {
        if (isMountedRef.current) {
          setIsPurging(false);
        }
      }
    },
    [fetchTelemetry]
  );

  const purgeCompleted = useCallback(
    async (olderThanHours: number = 24): Promise<boolean> => {
      setIsPurging(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/queue/purge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ purgeCompleted: true, olderThanHours }),
        });

        if (!res.ok) {
          throw new Error(`Purge completed returned HTTP ${res.status}`);
        }

        const json = (await res.json()) as IPurgeJobResponse;
        if (json.success) {
          await fetchTelemetry();
          return true;
        } else {
          setError(json.message || "Failed to purge completed jobs");
          return false;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to purge completed jobs";
        setError(msg);
        return false;
      } finally {
        if (isMountedRef.current) {
          setIsPurging(false);
        }
      }
    },
    [fetchTelemetry]
  );

  useEffect(() => {
    let isCancelled = false;

    const runFetch = async () => {
      try {
        const res = await fetch("/api/admin/queue", {
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          if (!isCancelled) {
            setError(
              res.status === 403
                ? "Admin authorization required for queue telemetry."
                : `Queue telemetry responded with status ${res.status}`
            );
            setIsLoading(false);
          }
          return;
        }

        const json = (await res.json()) as IAdminQueueTelemetryResponse;
        if (!isCancelled) {
          if (json.success && json.data) {
            setTelemetry(json.data);
            setError(null);
          } else {
            setError(json.error || "Failed to load queue telemetry data");
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          const msg = err instanceof Error ? err.message : "Failed to load queue telemetry";
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
    }, pollIntervalMs);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [autoRefresh, pollIntervalMs]);

  return {
    telemetry,
    isLoading,
    isProcessing,
    isRetrying,
    isPurging,
    error,
    activeTab,
    setActiveTab,
    refreshTelemetry: fetchTelemetry,
    triggerWorker,
    retryJob,
    retryAllJobs,
    purgeJob,
    purgeCompleted,
  };
}
