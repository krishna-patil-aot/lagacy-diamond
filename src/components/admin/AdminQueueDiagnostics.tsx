"use client";

import React, { useState } from "react";
import { useQueueTelemetry } from "@/hooks/useQueueTelemetry";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import {
  Layers,
  Play,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Server,
  Activity,
  ShieldCheck,
  Zap,
  Info,
} from "lucide-react";
import { QueueJobType, QueueJobStatus } from "@/types/queue.types";

export function AdminQueueDiagnostics() {
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [selectedJobIdForPayload, setSelectedJobIdForPayload] = useState<string | null>(null);

  const {
    telemetry,
    isLoading,
    isProcessing,
    isRetrying,
    isPurging,
    error,
    activeTab,
    setActiveTab,
    refreshTelemetry,
    triggerWorker,
    retryJob,
    retryAllJobs,
    purgeJob,
    purgeCompleted,
  } = useQueueTelemetry(autoRefresh, 5000);

  const handleRunWorker = async () => {
    const summary = await triggerWorker(10);
    if (summary) {
      toast.success("Queue Worker Executed", {
        description: `Processed ${summary.processedCount} job(s) in ${summary.durationMs}ms. (${summary.succeededCount} succeeded, ${summary.failedCount} failed, ${summary.deadLetterCount} DLQ).`,
      });
    } else {
      toast.error("Failed to execute queue worker");
    }
  };

  const handleRetryJob = async (jobId: string) => {
    const success = await retryJob(jobId);
    if (success) {
      toast.success("Job Replayed", {
        description: `Job ${jobId} restored to active queue and worker triggered.`,
      });
    } else {
      toast.error("Failed to replay job");
    }
  };

  const handleRetryAll = async () => {
    const success = await retryAllJobs();
    if (success) {
      toast.success("DLQ Mass Replay Complete", {
        description: "All dead-letter jobs restored to pending status.",
      });
    } else {
      toast.error("Failed to replay all dead-letter jobs");
    }
  };

  const handlePurgeJob = async (jobId: string) => {
    const success = await purgeJob(jobId);
    if (success) {
      toast.success("Job Purged", {
        description: `Job ${jobId} permanently removed.`,
      });
      if (selectedJobIdForPayload === jobId) {
        setSelectedJobIdForPayload(null);
      }
    } else {
      toast.error("Failed to purge job");
    }
  };

  const handlePurgeCompleted = async () => {
    const success = await purgeCompleted(24);
    if (success) {
      toast.success("Completed Jobs Cleaned", {
        description: "Pruned completed jobs older than 24 hours.",
      });
    } else {
      toast.error("Failed to prune completed jobs");
    }
  };

  const getStatusBadge = (status: QueueJobStatus) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "processing":
        return <Badge variant="cyan">Processing</Badge>;
      case "pending":
        return <Badge variant="gold">Pending</Badge>;
      case "failed":
        return <Badge variant="orange">Retrying</Badge>;
      case "dead_letter":
        return <Badge variant="destructive">Dead Letter</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatJobType = (type: QueueJobType) => {
    switch (type) {
      case "EMAIL_ORDER_CONFIRMATION":
        return "Order Receipt Email";
      case "EMAIL_ORDER_APPROVED":
        return "Order Approved Email";
      case "EMAIL_ORDER_CANCELLED":
        return "Order Cancelled Email";
      case "EMAIL_ORDER_DOCUMENTS":
        return "Invoice & Certs PDF";
      case "EMAIL_INQUIRY_REPLY":
        return "Inquiry Notification";
      case "EMAIL_BACK_IN_STOCK":
        return "Back-in-Stock Alert";
      case "AI_CONCIERGE_QUERY":
        return "Gemini AI Concierge";
      default:
        return type;
    }
  };

  const dlqCount = telemetry?.deadLetterCount ?? 0;
  const pendingCount = telemetry?.pendingCount ?? 0;
  const processingCount = telemetry?.processingCount ?? 0;
  const completedCount = telemetry?.completedCount ?? 0;
  const throughput = telemetry?.throughputPerMinute ?? 0;
  const avgLatency = telemetry?.averageProcessingTimeMs ?? 0;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-medium text-stone-900">
                Asynchronous Queues &amp; Dead-Letter Dispatch
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Active Queue Engine
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Decoupled background processing with distributed idempotency, exponential backoff retries, and dead-letter fault isolation.
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
            onClick={handleRunWorker}
            isLoading={isProcessing}
            className="text-xs h-8"
          >
            <Play className="h-3 w-3 mr-1 fill-white" />
            Run Queue Now
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

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Pending</span>
            <Clock className="h-3.5 w-3.5 text-amber-600" />
          </div>
          <div className="font-mono text-2xl font-bold text-stone-900">{pendingCount}</div>
          <p className="text-[10px] text-stone-400">Awaiting worker poll</p>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Processing</span>
            <Activity className="h-3.5 w-3.5 text-sky-600" />
          </div>
          <div className="font-mono text-2xl font-bold text-stone-900">{processingCount}</div>
          <p className="text-[10px] text-stone-400">Currently executing</p>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="font-mono text-2xl font-bold text-emerald-700">{completedCount}</div>
          <button
            onClick={handlePurgeCompleted}
            disabled={isPurging || completedCount === 0}
            className="text-[10px] text-stone-500 hover:text-stone-800 underline text-left"
          >
            Prune older than 24h
          </button>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Throughput</span>
            <Zap className="h-3.5 w-3.5 text-amber-600" />
          </div>
          <div className="font-mono text-2xl font-bold text-stone-900">{throughput} <span className="text-xs font-normal text-stone-500">/min</span></div>
          <p className="text-[10px] text-stone-400">Avg latency: {avgLatency}ms</p>
        </div>

        <div className={`p-4 rounded-xl border space-y-1 ${dlqCount > 0 ? "border-rose-300 bg-rose-50/50" : "border-stone-200 bg-stone-50/50"}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-medium uppercase tracking-wider ${dlqCount > 0 ? "text-rose-700 font-bold" : "text-stone-500"}`}>
              Dead-Letter (DLQ)
            </span>
            <AlertTriangle className={`h-3.5 w-3.5 ${dlqCount > 0 ? "text-rose-600 animate-pulse" : "text-stone-400"}`} />
          </div>
          <div className={`font-mono text-2xl font-bold ${dlqCount > 0 ? "text-rose-700" : "text-stone-900"}`}>{dlqCount}</div>
          <p className="text-[10px] text-stone-400">{dlqCount > 0 ? "Exceeded 3 retries" : "All clean, 0 failures"}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-stone-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-stone-900 text-stone-900 font-semibold"
                : "border-transparent text-stone-500 hover:text-stone-700"
            }`}
          >
            Architecture &amp; Resilience
          </button>

          <button
            onClick={() => setActiveTab("dlq")}
            className={`pb-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "dlq"
                ? "border-rose-700 text-rose-700 font-semibold"
                : "border-transparent text-stone-500 hover:text-stone-700"
            }`}
          >
            <span>Dead-Letter Queue</span>
            {dlqCount > 0 && (
              <span className="bg-rose-100 text-rose-800 text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                {dlqCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("jobs")}
            className={`pb-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "jobs"
                ? "border-stone-900 text-stone-900 font-semibold"
                : "border-transparent text-stone-500 hover:text-stone-700"
            }`}
          >
            Recent Activity ({telemetry?.recentJobs.length ?? 0})
          </button>
        </div>
      </div>

      {/* Tab 1: Architecture & Resilience Overview */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-stone-100 bg-stone-50/30 space-y-2">
              <div className="flex items-center gap-2 text-stone-800 font-medium text-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Distributed Idempotency</span>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Prevents duplicate emails and AI queries across cluster nodes. Hash keys like <code className="bg-stone-200/60 px-1 rounded text-[11px]">order-confirm-[id]</code> guarantee exact-once execution within a 24-hour window.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-stone-100 bg-stone-50/30 space-y-2">
              <div className="flex items-center gap-2 text-stone-800 font-medium text-xs">
                <RotateCw className="h-4 w-4 text-amber-600" />
                <span>Exponential Jitter Retries</span>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Transient SMTP network timeouts and Gemini AI 429 rate limits are automatically retried with backoff delay: <code className="bg-stone-200/60 px-1 rounded text-[11px]">2^attempts * 1000ms + jitter</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-stone-100 bg-stone-50/30 space-y-2">
              <div className="flex items-center gap-2 text-stone-800 font-medium text-xs">
                <Server className="h-4 w-4 text-sky-600" />
                <span>Serverless Background Triggers</span>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Utilizes Next.js 16 <code className="bg-stone-200/60 px-1 rounded text-[11px]">after()</code> lifecycle hooks and scheduled worker endpoint <code className="bg-stone-200/60 px-1 rounded text-[11px]">/api/queue/process</code> protected by CRON_SECRET.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-amber-200/60 bg-amber-50/30 text-xs text-amber-900 flex items-start gap-3">
            <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Active Production Handlers</p>
              <p className="text-stone-600 mt-0.5">
                Nodemailer order receipts, approval notices, PDF invoices, lab certificate generation, concierge replies, back-in-stock alerts, and Gemini AI consultations are 100% offloaded from the client response path.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Dead-Letter Queue (DLQ) Inspector */}
      {activeTab === "dlq" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-500">
              Tasks that failed 3 consecutive retry attempts are isolated here for administrative audit, inspection, and manual replay.
            </p>
            {dlqCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryAll}
                isLoading={isRetrying}
                className="text-xs border-rose-300 text-rose-800 hover:bg-rose-50 h-7"
              >
                <RotateCw className="h-3 w-3 mr-1" />
                Retry All DLQ Jobs ({dlqCount})
              </Button>
            )}
          </div>

          {dlqCount === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-stone-200 text-stone-400 space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-medium text-stone-700">Dead-Letter Queue is Clean</p>
              <p className="text-[11px] text-stone-400">Zero poison pills or permanently failed background jobs.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-stone-200">
              <table className="min-w-full divide-y divide-stone-200 text-left text-xs">
                <thead className="bg-stone-50 text-stone-500">
                  <tr>
                    <th className="px-3 py-2.5 font-medium">Job ID</th>
                    <th className="px-3 py-2.5 font-medium">Type</th>
                    <th className="px-3 py-2.5 font-medium">Target / Context</th>
                    <th className="px-3 py-2.5 font-medium">Attempts</th>
                    <th className="px-3 py-2.5 font-medium">Error Details</th>
                    <th className="px-3 py-2.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  {telemetry?.deadLetterJobs.map((job) => (
                    <tr key={job.jobId} className="hover:bg-stone-50/50">
                      <td className="px-3 py-2 font-mono text-[11px] text-stone-700">{job.jobId.slice(0, 16)}...</td>
                      <td className="px-3 py-2 font-medium text-stone-900">{formatJobType(job.type)}</td>
                      <td className="px-3 py-2 text-stone-600 max-w-[180px] truncate">{job.recipientOrTarget || "-"}</td>
                      <td className="px-3 py-2 font-mono text-stone-700">{job.attempts} / {job.maxRetries}</td>
                      <td className="px-3 py-2 text-rose-700 font-mono text-[11px] max-w-[220px] truncate">
                        {job.error || "Execution timeout or unhandled exception"}
                      </td>
                      <td className="px-3 py-2 text-right space-x-1.5 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetryJob(job.jobId)}
                          disabled={isRetrying}
                          className="h-7 text-[11px] px-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                        >
                          <RotateCw className="h-3 w-3 mr-1" />
                          Replay
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePurgeJob(job.jobId)}
                          disabled={isPurging}
                          className="h-7 text-[11px] px-2 text-rose-700 border-rose-300 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Recent Activity Feed */}
      {activeTab === "jobs" && (
        <div className="space-y-3">
          <p className="text-xs text-stone-500">
            Real-time feed of recent background tasks across emails, document generation, and gemological AI inquiries.
          </p>

          {!telemetry?.recentJobs || telemetry.recentJobs.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-stone-200 text-stone-400">
              <p className="text-xs">No recent queue events recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-stone-200">
              <table className="min-w-full divide-y divide-stone-200 text-left text-xs">
                <thead className="bg-stone-50 text-stone-500">
                  <tr>
                    <th className="px-3 py-2.5 font-medium">Status</th>
                    <th className="px-3 py-2.5 font-medium">Job ID</th>
                    <th className="px-3 py-2.5 font-medium">Type</th>
                    <th className="px-3 py-2.5 font-medium">Target</th>
                    <th className="px-3 py-2.5 font-medium">Idempotency Key</th>
                    <th className="px-3 py-2.5 font-medium text-right">Attempts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  {telemetry.recentJobs.map((job) => (
                    <tr key={job.jobId} className="hover:bg-stone-50/50">
                      <td className="px-3 py-2">{getStatusBadge(job.status)}</td>
                      <td className="px-3 py-2 font-mono text-[11px] text-stone-600">{job.jobId.slice(0, 14)}...</td>
                      <td className="px-3 py-2 font-medium text-stone-900">{formatJobType(job.type)}</td>
                      <td className="px-3 py-2 text-stone-600 max-w-[180px] truncate">{job.recipientOrTarget || "-"}</td>
                      <td className="px-3 py-2 font-mono text-[11px] text-stone-500 max-w-[150px] truncate">
                        {job.idempotencyKey ? (
                          <span className="bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">{job.idempotencyKey}</span>
                        ) : (
                          <span className="text-stone-300">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono text-right text-stone-700">{job.attempts} / {job.maxRetries}</td>
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
