"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ISecurityTelemetry, SecuritySeverity } from "@/types/security.types";
import { IAdminSecurityResponse } from "@/app/api/admin/security/route";

export interface IUseSecurityAuditReturn {
  telemetry: ISecurityTelemetry | null;
  isLoading: boolean;
  isProbing: boolean;
  error: string | null;
  filterSeverity: "ALL" | SecuritySeverity;
  setFilterSeverity: (val: "ALL" | SecuritySeverity) => void;
  refreshTelemetry: () => Promise<void>;
  triggerSecurityProbe: () => Promise<boolean>;
}

/**
 * Enterprise Custom Hook: useSecurityAudit
 * Powers real-time security posture diagnostics, CSP/HSTS header checks, and forensic threat logs.
 */
export function useSecurityAudit(
  autoRefresh: boolean = false,
  pollIntervalMs: number = 10000
): IUseSecurityAuditReturn {
  const [telemetry, setTelemetry] = useState<ISecurityTelemetry | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProbing, setIsProbing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<"ALL" | SecuritySeverity>("ALL");

  const isMountedRef = useRef<boolean>(true);

  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/security", {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        if (res.status === 403) {
          if (isMountedRef.current) {
            setError("Admin authorization required for security posture diagnostics.");
          }
          return;
        }
        throw new Error(`Security endpoint responded with status ${res.status}`);
      }

      const json = (await res.json()) as IAdminSecurityResponse;
      if (isMountedRef.current) {
        if (json.success && json.data) {
          setTelemetry(json.data);
          setError(null);
        } else {
          setError(json.error || "Failed to load security telemetry");
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load security telemetry";
      if (isMountedRef.current) {
        setError(msg);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const triggerSecurityProbe = useCallback(async (): Promise<boolean> => {
    setIsProbing(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "probe" }),
      });

      if (!res.ok) {
        throw new Error(`Security probe returned HTTP ${res.status}`);
      }

      const json = (await res.json()) as { success: boolean; message?: string; error?: string };
      if (json.success) {
        await fetchTelemetry();
        return true;
      } else {
        setError(json.error || "Security probe execution failed");
        return false;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to execute security probe";
      setError(msg);
      return false;
    } finally {
      if (isMountedRef.current) {
        setIsProbing(false);
      }
    }
  }, [fetchTelemetry]);

  useEffect(() => {
    let isCancelled = false;

    const runFetch = async () => {
      try {
        const res = await fetch("/api/admin/security", {
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          if (!isCancelled) {
            setError(
              res.status === 403
                ? "Admin authorization required for security posture diagnostics."
                : `Security endpoint returned HTTP ${res.status}`
            );
            setIsLoading(false);
          }
          return;
        }

        const json = (await res.json()) as IAdminSecurityResponse;
        if (!isCancelled) {
          if (json.success && json.data) {
            setTelemetry(json.data);
            setError(null);
          } else {
            setError(json.error || "Failed to load security telemetry");
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          const msg = err instanceof Error ? err.message : "Failed to load security telemetry";
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
    isProbing,
    error,
    filterSeverity,
    setFilterSeverity,
    refreshTelemetry: fetchTelemetry,
    triggerSecurityProbe,
  };
}
