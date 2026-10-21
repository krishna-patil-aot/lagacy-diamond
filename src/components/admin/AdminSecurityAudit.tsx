"use client";

import React, { useState } from "react";
import { useSecurityAudit } from "@/hooks/useSecurityAudit";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCw,
  Lock,
  Eye,
  Zap,
  CheckCircle2,
  FileCode,
  Radio,
} from "lucide-react";
import { SecuritySeverity } from "@/types/security.types";

export function AdminSecurityAudit() {
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"headers" | "audit">("headers");

  const {
    telemetry,
    isLoading,
    isProbing,
    error,
    filterSeverity,
    setFilterSeverity,
    refreshTelemetry,
    triggerSecurityProbe,
  } = useSecurityAudit(autoRefresh, 8000);

  const handleRunProbe = async () => {
    const success = await triggerSecurityProbe();
    if (success) {
      toast.success("Security Diagnostic Probe Executed", {
        description: "Zero-Trust policy and header directives re-evaluated and logged.",
      });
    } else {
      toast.error("Failed to execute security probe");
    }
  };

  const getSeverityBadge = (severity: SecuritySeverity) => {
    switch (severity) {
      case "CRITICAL":
        return <Badge variant="destructive">CRITICAL</Badge>;
      case "WARN":
        return <Badge variant="orange">WARN</Badge>;
      case "INFO":
        return <Badge variant="cyan">INFO</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const filteredEvents =
    telemetry?.recentEvents.filter((event) => {
      if (filterSeverity === "ALL") return true;
      return event.severity === filterSeverity;
    }) || [];

  const securityScore = telemetry?.securityScore ?? 98;
  const grade = telemetry?.grade ?? "A+";
  const blockedNoSql = telemetry?.threatStats.blockedNoSqlInjections ?? 0;
  const authFailures = telemetry?.threatStats.authFailures24h ?? 0;
  const rateLimitTriggers = telemetry?.threatStats.rateLimitTriggers24h ?? 0;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-medium text-stone-900">
                Security Hardening &amp; Zero-Trust Telemetry
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Grade {grade} &bull; Tier-1 MNC Hardened
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Enforces Content Security Policy (CSP), HSTS, dynamic CORS, anti-clickjacking, and NoSQL injection parameter sanitization.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`text-xs h-8 ${autoRefresh ? "border-amber-300 bg-amber-50/50 text-amber-900" : "text-stone-600"}`}
          >
            <RotateCw className={`h-3 w-3 mr-1 ${autoRefresh ? "animate-spin text-amber-700" : ""}`} />
            {autoRefresh ? "Auto-refresh: On" : "Auto-refresh: Off"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={refreshTelemetry}
            isLoading={isLoading}
            className="text-xs text-stone-600 border-stone-300 h-8"
          >
            Refresh
          </Button>

          <Button
            variant="luxury"
            size="sm"
            onClick={handleRunProbe}
            isLoading={isProbing}
            className="text-xs h-8"
          >
            <Radio className="h-3 w-3 mr-1" />
            Run Security Probe
          </Button>
        </div>
      </div>

      {/* Error alert banner */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={refreshTelemetry} className="h-6 text-[10px] px-2">
            Dismiss
          </Button>
        </div>
      )}

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Security Score</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-stone-900">{securityScore}</span>
            <span className="text-xs font-semibold text-emerald-700">/ 100 ({grade})</span>
          </div>
          <p className="text-[10px] text-stone-400">Zero-Trust WAF Enforced</p>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">NoSQL Injection Defenses</span>
            <Lock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="font-mono text-2xl font-bold text-stone-900">{blockedNoSql}</div>
          <p className="text-[10px] text-stone-400">Malicious $ operators disarmed</p>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Auth Failures (24h)</span>
            <ShieldAlert className="h-4 w-4 text-rose-600" />
          </div>
          <div className="font-mono text-2xl font-bold text-stone-900">{authFailures}</div>
          <p className="text-[10px] text-stone-400">Protected against credential stuffing</p>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Rate Limit Triggers</span>
            <Zap className="h-4 w-4 text-sky-600" />
          </div>
          <div className="font-mono text-2xl font-bold text-stone-900">{rateLimitTriggers}</div>
          <p className="text-[10px] text-stone-400">DDoS &amp; brute-force throttled</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-stone-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("headers")}
            className={`pb-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "headers"
                ? "border-stone-900 text-stone-900 font-semibold"
                : "border-transparent text-stone-500 hover:text-stone-700"
            }`}
          >
            <FileCode className="h-3.5 w-3.5" />
            <span>Active Security Headers ({telemetry?.headers.length ?? 8})</span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`pb-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "audit"
                ? "border-stone-900 text-stone-900 font-semibold"
                : "border-transparent text-stone-500 hover:text-stone-700"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Forensic Threat Audit Logs</span>
            {filteredEvents.length > 0 && (
              <span className="bg-stone-100 text-stone-800 text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                {filteredEvents.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: Active Security Headers */}
      {activeTab === "headers" && (
        <div className="space-y-4">
          <p className="text-xs text-stone-500">
            HTTP security response headers injected automatically on every request via Next.js and Edge Gateway.
          </p>

          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="min-w-full divide-y divide-stone-200 text-left text-xs">
              <thead className="bg-stone-50 text-stone-500">
                <tr>
                  <th className="px-3.5 py-2.5 font-medium">Header Name</th>
                  <th className="px-3.5 py-2.5 font-medium">Compliance</th>
                  <th className="px-3.5 py-2.5 font-medium">Directives / Values</th>
                  <th className="px-3.5 py-2.5 font-medium">Security Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {telemetry?.headers.map((h) => (
                  <tr key={h.name} className="hover:bg-stone-50/50">
                    <td className="px-3.5 py-2.5 font-mono text-[11px] font-medium text-stone-900 whitespace-nowrap">
                      {h.name}
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                        {h.status}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 font-mono text-[11px] text-stone-600 max-w-sm truncate">
                      {h.directive}
                    </td>
                    <td className="px-3.5 py-2.5 text-stone-500 text-[11px]">{h.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Forensic Threat Audit Logs */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-500">Filter Severity:</span>
              {(["ALL", "CRITICAL", "WARN", "INFO"] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-colors ${
                    filterSeverity === sev
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            <p className="text-xs text-stone-400">
              Retained with native 30-day MongoDB compliance TTL
            </p>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-stone-200 text-stone-400 space-y-2">
              <ShieldCheck className="h-8 w-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-medium text-stone-700">Zero Threat Incidents in Selected Window</p>
              <p className="text-[11px] text-stone-400">All authentication requests and API queries conform to security standards.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-stone-200">
              <table className="min-w-full divide-y divide-stone-200 text-left text-xs">
                <thead className="bg-stone-50 text-stone-500">
                  <tr>
                    <th className="px-3 py-2.5 font-medium">Severity</th>
                    <th className="px-3 py-2.5 font-medium">Event Type</th>
                    <th className="px-3 py-2.5 font-medium">Client IP</th>
                    <th className="px-3 py-2.5 font-medium">Endpoint</th>
                    <th className="px-3 py-2.5 font-medium">User Target</th>
                    <th className="px-3 py-2.5 font-medium">Forensic Details</th>
                    <th className="px-3 py-2.5 font-medium text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  {filteredEvents.map((event) => (
                    <tr key={event.auditId} className="hover:bg-stone-50/50">
                      <td className="px-3 py-2">{getSeverityBadge(event.severity)}</td>
                      <td className="px-3 py-2 font-mono text-[11px] font-medium text-stone-900">{event.eventType}</td>
                      <td className="px-3 py-2 font-mono text-[11px] text-stone-600">{event.ipAddress}</td>
                      <td className="px-3 py-2 font-mono text-[11px] text-stone-600">{event.endpoint || "-"}</td>
                      <td className="px-3 py-2 text-stone-700 max-w-[150px] truncate">{event.userEmail || "-"}</td>
                      <td className="px-3 py-2 text-stone-500 font-mono text-[10px] max-w-[200px] truncate">
                        {event.detailsSnippet || "-"}
                      </td>
                      <td className="px-3 py-2 font-mono text-right text-[11px] text-stone-400 whitespace-nowrap">
                        {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
