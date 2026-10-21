"use client";

import React, { useState } from "react";
import { useCacheStats } from "@/hooks/useCacheStats";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import {
  Zap,
  Cpu,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Layers,
  Activity,
  ShieldCheck,
} from "lucide-react";

export function AdminCacheDiagnostics() {
  const { stats, isLoading, isPurging, error, refreshStats, purgeCache } = useCacheStats(true);
  const [isConfirmingFlush, setIsConfirmingFlush] = useState<boolean>(false);

  const handlePurgeCatalog = async () => {
    const res = await purgeCache("catalog");
    if (res?.success) {
      toast.success("Catalog Cache Invalidated", {
        description: `Advanced catalog to version ${res.catalogVersion}. Stale query results purged.`,
      });
    } else {
      toast.error("Failed to invalidate catalog cache");
    }
  };

  const handlePurgeAll = async () => {
    const res = await purgeCache("all");
    setIsConfirmingFlush(false);
    if (res?.success) {
      toast.success("Complete Cache Store Purged", {
        description: "All catalog versions and item stores successfully flushed.",
      });
    } else {
      toast.error("Failed to flush cache");
    }
  };

  const isRedis = stats?.driver === "redis_upstash";
  const hitRatio = stats?.hitRatioPercentage ?? 0;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-medium text-stone-900">
                Redis Look-Aside &amp; Cache-Aside Telemetry
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium ${
                  isRedis
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-blue-50 text-blue-800 border border-blue-200"
                }`}
              >
                {isRedis ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    Distributed Redis Active
                  </>
                ) : (
                  <>
                    <Cpu className="h-3 w-3 text-blue-600" />
                    In-Memory High-Resiliency Engine
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Dog-piling stampede defense with singleflight mutex locks, stale-while-revalidate, and O(1) tag versioning.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshStats}
            isLoading={isLoading}
            className="text-xs text-stone-600 border-stone-300 h-8"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePurgeCatalog}
            isLoading={isPurging}
            className="text-xs text-amber-800 border-amber-300 hover:bg-amber-50 h-8"
          >
            <Layers className="h-3.5 w-3.5 mr-1 text-amber-600" />
            Purge Catalog Cache
          </Button>

          {!isConfirmingFlush ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmingFlush(true)}
              className="text-xs text-rose-700 border-rose-200 hover:bg-rose-50 h-8"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1 text-rose-500" />
              Flush All
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 animate-in fade-in">
              <Button
                variant="luxury"
                size="sm"
                onClick={handlePurgeAll}
                isLoading={isPurging}
                className="text-xs bg-rose-600 hover:bg-rose-700 text-white h-8"
              >
                Confirm Flush
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsConfirmingFlush(false)}
                className="text-xs h-8 text-stone-600"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Hit Ratio */}
        <div className="rounded-xl border border-stone-200/70 bg-stone-50/50 p-3 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 uppercase tracking-wider">
            <span>Hit Ratio</span>
            <Activity className="h-3.5 w-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-bold font-mono text-stone-900">
            {hitRatio}%
          </div>
          <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, hitRatio))}%` }}
            />
          </div>
        </div>

        {/* Hits */}
        <div className="rounded-xl border border-stone-200/70 bg-stone-50/50 p-3 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 uppercase tracking-wider">
            <span>Cache Hits</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700">
            {stats?.hits ?? 0}
          </div>
          <p className="text-[10px] text-stone-400">0ms Atlas reads avoided</p>
        </div>

        {/* Misses */}
        <div className="rounded-xl border border-stone-200/70 bg-stone-50/50 p-3 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 uppercase tracking-wider">
            <span>Cache Misses</span>
            <Cpu className="h-3.5 w-3.5 text-stone-400" />
          </div>
          <div className="text-xl font-bold font-mono text-stone-700">
            {stats?.misses ?? 0}
          </div>
          <p className="text-[10px] text-stone-400">Database queries populated</p>
        </div>

        {/* Catalog Version */}
        <div className="rounded-xl border border-stone-200/70 bg-stone-50/50 p-3 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 uppercase tracking-wider">
            <span>Tag Version</span>
            <Layers className="h-3.5 w-3.5 text-cyan-600" />
          </div>
          <div className="text-xl font-bold font-mono text-stone-900">
            v{stats?.catalogVersion ?? 1}
          </div>
          <p className="text-[10px] text-stone-400">O(1) version invalidator</p>
        </div>

        {/* Active Keys */}
        <div className="rounded-xl border border-stone-200/70 bg-stone-50/50 p-3 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 uppercase tracking-wider">
            <span>Hot Keys</span>
            <Zap className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-stone-900">
            {stats?.totalKeys ?? 0}
          </div>
          <p className="text-[10px] text-stone-400">Active cached entries</p>
        </div>

        {/* Dog-Piling Defense */}
        <div className="rounded-xl border border-stone-200/70 bg-stone-50/50 p-3 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 uppercase tracking-wider">
            <span>Stampede Locks</span>
            <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-700">
            {stats?.stampedeLocksActive ?? 0} active
          </div>
          <p className="text-[10px] text-stone-400">Singleflight barrier guard</p>
        </div>
      </div>
    </div>
  );
}
