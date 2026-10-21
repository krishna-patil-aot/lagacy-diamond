"use client";

import React, { useState } from "react";
import { useSystemHealth } from "@/hooks/useSystemHealth";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCw,
  Database,
  Zap,
  Layers,
  Cpu,
  Mail,
  Cloud,
  Sparkles,
  Radio,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { HealthStatus, ISubsystemHealth } from "@/types/observability.types";

export function AdminSystemHealth() {
  const {
    report,
    isLoading,
    isRefreshing,
    error,
    autoRefresh,
    latencyHistory,
    lastCheckTimestamp,
    refreshHealth,
    toggleAutoRefresh,
  } = useSystemHealth(true);

  const [showJsonInspector, setShowJsonInspector] = useState<boolean>(false);

  const handleManualProbe = async () => {
    await refreshHealth();
    toast.success("Synthetic Diagnostic Probe Completed", {
      description: "Live round-trip latencies evaluated across all Tier-1 subsystems.",
    });
  };

  const handleCopyJson = () => {
    if (!report) return;
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    toast.success("Copied System Telemetry", {
      description: "Complete JSON diagnostic snapshot copied to clipboard.",
    });
  };

  const getStatusBadge = (status: HealthStatus) => {
    switch (status) {
      case "healthy":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            OPERATIONAL
          </span>
        );
      case "degraded":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            DEGRADED
          </span>
        );
      case "unhealthy":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="h-3.5 w-3.5 text-rose-600" />
            CRITICAL
          </span>
        );
    }
  };

  const formatUptime = (seconds: number): string => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  const getSubsystemIcon = (key: string) => {
    switch (key) {
      case "database":
        return <Database className="h-5 w-5 text-emerald-600" />;
      case "redisCache":
        return <Zap className="h-5 w-5 text-amber-600" />;
      case "queueEngine":
        return <Layers className="h-5 w-5 text-sky-600" />;
      case "memory":
        return <Cpu className="h-5 w-5 text-purple-600" />;
      case "cloudinaryStorage":
        return <Cloud className="h-5 w-5 text-indigo-600" />;
      case "emailService":
        return <Mail className="h-5 w-5 text-blue-600" />;
      case "aiConcierge":
        return <Sparkles className="h-5 w-5 text-amber-500" />;
      default:
        return <Activity className="h-5 w-5 text-stone-600" />;
    }
  };

  // Compute APM Latency percentiles
  const dbLatencies = latencyHistory.map((p) => p.dbLatencyMs).filter((l) => l > 0);
  const redisLatencies = latencyHistory.map((p) => p.redisLatencyMs).filter((l) => l > 0);

  const avgDb = dbLatencies.length > 0 ? Math.round(dbLatencies.reduce((a, b) => a + b, 0) / dbLatencies.length) : 0;
  const avgRedis = redisLatencies.length > 0 ? Math.round(redisLatencies.reduce((a, b) => a + b, 0) / redisLatencies.length) : 0;

  const maxLatency = Math.max(
    ...latencyHistory.map((p) => Math.max(p.dbLatencyMs, p.redisLatencyMs)),
    100
  );

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-xs">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-semibold text-stone-900 tracking-tight">
                System Observability &amp; APM Telemetry
              </h2>
              {report && getStatusBadge(report.status)}
            </div>
            <p className="text-xs text-stone-500">
              Real-time synthetic heartbeat, connection pool monitors, and distributed micro-diagnostics
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={autoRefresh ? "secondary" : "outline"}
            size="sm"
            onClick={toggleAutoRefresh}
            className="text-xs h-8 gap-1.5"
          >
            <Radio className={`h-3.5 w-3.5 ${autoRefresh ? "text-emerald-600 animate-pulse" : "text-stone-400"}`} />
            {autoRefresh ? "Live 15s" : "Paused"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleManualProbe}
            disabled={isLoading || isRefreshing}
            className="text-xs h-8 gap-1.5"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-amber-600" : ""}`} />
            Synthetic Probe
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyJson}
            disabled={!report}
            className="text-xs h-8 gap-1.5"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy JSON
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <Button size="sm" variant="ghost" onClick={handleManualProbe} className="h-7 text-xs text-rose-800 underline">
            Retry Probe
          </Button>
        </div>
      )}

      {/* Key Metric KPI Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Platform Vitality */}
        <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-medium">Cluster Vitality</span>
            <span className="font-mono text-[11px] text-stone-600 uppercase">
              {report?.environment || "Development"}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-serif text-stone-900">
              {report ? report.status.toUpperCase() : "PROBING..."}
            </span>
            <span className="text-xs font-mono text-stone-600">v{report?.version || "2.4.0"}</span>
          </div>
          <p className="text-[11px] text-stone-500 truncate">
            Uptime: <span className="font-mono font-medium text-stone-700">{report ? formatUptime(report.uptimeSeconds) : "--"}</span>
          </p>
        </div>

        {/* Card 2: MongoDB Latency */}
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-medium flex items-center gap-1.5 text-emerald-800">
              <Database className="h-3.5 w-3.5" /> MongoDB Atlas
            </span>
            <Badge variant="outline" className="text-[10px] bg-white border-emerald-200 text-emerald-700">
              Pool Warm
            </Badge>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-950">
              {report ? `${report.subsystems.database.latencyMs}ms` : "--"}
            </span>
            <span className="text-xs text-emerald-700 font-mono">avg {avgDb}ms</span>
          </div>
          <p className="text-[11px] text-stone-500 truncate">
            Pool: <span className="font-mono text-stone-700">min 2, max 10 sockets</span>
          </p>
        </div>

        {/* Card 3: Upstash Redis Latency */}
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-medium flex items-center gap-1.5 text-amber-800">
              <Zap className="h-3.5 w-3.5" /> Redis Cache
            </span>
            <Badge variant="outline" className="text-[10px] bg-white border-amber-200 text-amber-700">
              {report?.subsystems.redisCache.details?.driver === "redis_upstash" ? "Upstash REST" : "Memory"}
            </Badge>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-950">
              {report ? `${report.subsystems.redisCache.latencyMs}ms` : "--"}
            </span>
            <span className="text-xs text-amber-700 font-mono">avg {avgRedis}ms</span>
          </div>
          <p className="text-[11px] text-stone-500 truncate">
            Stampede Defense: <span className="text-stone-700 font-medium">Singleflight Active</span>
          </p>
        </div>

        {/* Card 4: V8 Memory Utilization */}
        <div className="rounded-xl border border-purple-200/80 bg-purple-50/40 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-medium flex items-center gap-1.5 text-purple-800">
              <Cpu className="h-3.5 w-3.5" /> V8 Heap Memory
            </span>
            <span className="font-mono text-[11px] text-purple-700">
              {report?.system.memory.heapUsagePercent ?? 0}%
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-purple-950">
              {report ? `${report.system.memory.heapUsedMB}MB` : "--"}
            </span>
            <span className="text-xs text-stone-500 font-mono">/ {report?.system.memory.heapTotalMB ?? 0}MB</span>
          </div>
          <div className="w-full bg-purple-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                (report?.system.memory.heapUsagePercent ?? 0) > 85 ? "bg-rose-500" : "bg-purple-600"
              }`}
              style={{ width: `${Math.min(report?.system.memory.heapUsagePercent ?? 0, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* APM Latency Timeline / Sparkline */}
      <div className="rounded-xl border border-stone-200 bg-stone-50/40 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600" />
              Real-Time Round-Trip Latency APM Stream
            </h3>
            <p className="text-[11px] text-stone-500">
              Rolling 20-probe live synthetic latency comparison (MongoDB Atlas vs Upstash Redis)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-stone-600 text-[11px]">MongoDB (Atlas)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="text-stone-600 text-[11px]">Redis (Upstash)</span>
            </div>
          </div>
        </div>

        {/* Visual Chart Bars */}
        <div className="h-32 w-full flex items-end gap-1.5 pt-4 pb-1 border-b border-stone-200">
          {latencyHistory.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
              Recording synthetic latency telemetry...
            </div>
          ) : (
            latencyHistory.map((point, idx) => {
              const dbHeight = Math.min(Math.round((point.dbLatencyMs / maxLatency) * 100), 100);
              const redisHeight = Math.min(Math.round((point.redisLatencyMs / maxLatency) * 100), 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-12 bg-stone-900 text-white text-[10px] py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg">
                    <div>{point.timeLabel}</div>
                    <div className="text-emerald-300">DB: {point.dbLatencyMs}ms</div>
                    <div className="text-amber-300">Redis: {point.redisLatencyMs}ms</div>
                  </div>

                  <div className="w-full flex items-end justify-center gap-0.5 h-full">
                    {/* DB Bar */}
                    <div
                      className="w-1/2 max-w-[8px] bg-emerald-500 rounded-t-xs transition-all duration-300 hover:bg-emerald-400"
                      style={{ height: `${Math.max(dbHeight, 6)}%` }}
                    />
                    {/* Redis Bar */}
                    <div
                      className="w-1/2 max-w-[8px] bg-amber-500 rounded-t-xs transition-all duration-300 hover:bg-amber-400"
                      style={{ height: `${Math.max(redisHeight, 6)}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
          <span>T-{latencyHistory.length * 15}s</span>
          <span>Max Spike: {maxLatency}ms</span>
          <span>Latest: {lastCheckTimestamp ? new Date(lastCheckTimestamp).toLocaleTimeString() : "--"}</span>
        </div>
      </div>

      {/* Subsystem Health Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
          Tier-1 Subsystem Micro-Diagnostics &amp; Health Checks
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {report &&
            Object.entries(report.subsystems).map(([key, sub]: [string, ISubsystemHealth]) => (
              <div
                key={key}
                className="rounded-xl border border-stone-200 bg-white p-4 space-y-2 hover:border-stone-300 transition-colors shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSubsystemIcon(key)}
                    <span className="font-medium text-xs text-stone-800">{sub.name}</span>
                  </div>
                  {getStatusBadge(sub.status)}
                </div>

                <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                  {sub.message}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[10px] text-stone-400 font-mono">
                  <span>Latency: {sub.latencyMs}ms</span>
                  <span>{new Date(sub.lastChecked).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Collapsible JSON Diagnostics Inspector */}
      <div className="rounded-xl border border-stone-200 bg-stone-50/30 overflow-hidden">
        <button
          onClick={() => setShowJsonInspector((prev) => !prev)}
          className="w-full flex items-center justify-between p-4 text-xs font-medium text-stone-700 hover:bg-stone-100/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-stone-500">{"{ }"}</span>
            <span>Raw System Telemetry Payload Inspector</span>
          </div>
          {showJsonInspector ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showJsonInspector && (
          <div className="p-4 border-t border-stone-200 bg-stone-900 text-stone-100 font-mono text-[11px] overflow-x-auto max-h-96 rounded-b-xl">
            <div className="flex justify-between items-center pb-2 mb-2 border-b border-stone-800">
              <span className="text-stone-400">JSON Diagnostic Snapshot</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyJson}
                className="h-6 text-[10px] text-stone-300 hover:text-white hover:bg-stone-800"
              >
                <Copy className="h-3 w-3 mr-1" /> Copy Payload
              </Button>
            </div>
            <pre>{JSON.stringify(report, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
