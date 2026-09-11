"use client";

import React from "react";
import { IOrder } from "@/types/order.types";
import { useOrderTracking } from "@/hooks/useOrderTracking";
import { Badge } from "@/components/ui/Badge";
import {
  Clock,
  CheckCircle2,
  Truck,
  Navigation,
  ShieldCheck,
  Award,
  Copy,
  Check,
  MapPin,
  Calendar,
  ShieldAlert,
} from "lucide-react";

interface OrderTrackingTimelineProps {
  order: IOrder;
}

export function OrderTrackingTimeline({ order }: OrderTrackingTimelineProps) {
  const { currentStageIndex, progressPercentage, stages, copyTrackingNumber, copied } =
    useOrderTracking(order);

  const isCancelled = order.status === "CANCELLED";

  const renderIcon = (iconName: string, isCompleted: boolean, isCurrent: boolean) => {
    const iconClass = "h-4 w-4";
    if (isCompleted) return <CheckCircle2 className={`${iconClass} text-emerald-400`} />;
    if (isCurrent) return <Clock className={`${iconClass} text-amber-300 animate-spin`} />;

    switch (iconName) {
      case "Award":
        return <Award className={iconClass} />;
      case "Truck":
        return <Truck className={iconClass} />;
      case "Navigation":
        return <Navigation className={iconClass} />;
      case "ShieldCheck":
        return <ShieldCheck className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  };

  if (isCancelled) {
    return (
      <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-4 text-center space-y-2">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-rose-900/40 text-rose-300">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <h4 className="text-sm font-semibold text-rose-300">Order Voided / Cancelled</h4>
        <p className="text-xs text-zinc-400">
          This order was cancelled by the Vault Curator or client request. Diamond lots have been safely returned to foundry custody.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4 sm:p-6">
      {/* Carrier Tracking Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/60 pb-4 text-xs">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block">
            Armored Courier Dispatch Protocol
          </span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white font-serif text-sm">
              {order.trackingInfo?.carrier || "Brink's Global Armored Services"}
            </span>
            <Badge variant="gold" className="text-[10px] font-mono">
              SATELLITE ESCORT ACTIVE
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1.5 font-mono">
            <span className="text-zinc-400 text-[11px]">Waybill:</span>
            <span className="text-amber-300 font-semibold text-xs">
              {order.trackingInfo?.trackingNumber || `BRK-${order.orderNumber || order.id}`}
            </span>
            <button
              onClick={copyTrackingNumber}
              className="ml-1 text-zinc-400 hover:text-white transition-colors"
              title="Copy Waybill Number"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>

          {order.trackingInfo?.estimatedDeliveryDate && (
            <div className="hidden md:flex items-center gap-1.5 text-zinc-300">
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              <span>Est: {order.trackingInfo.estimatedDeliveryDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar (Amazon / Flipkart Style) */}
      <div className="space-y-3 pt-2">
        <div className="relative flex items-center justify-between">
          {/* Background Track */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-300 to-emerald-400 transition-all duration-700 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Stepper Dots */}
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex || order.status === "DELIVERED";
            const isCurrent = idx === currentStageIndex && order.status !== "DELIVERED";

            return (
              <div key={stage.status} className="relative z-10 flex flex-col items-center group">
                <div
                  className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isCompleted
                      ? "border-emerald-400 bg-zinc-950 text-emerald-400 shadow-sm shadow-emerald-500/20"
                      : isCurrent
                      ? "border-amber-400 bg-zinc-900 text-amber-300 ring-4 ring-amber-400/20 animate-pulse"
                      : "border-zinc-700 bg-zinc-950 text-zinc-500"
                  }`}
                >
                  {renderIcon(stage.iconName, isCompleted, isCurrent)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Labels below Stepper (Responsive Grid) */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center pt-2">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex || order.status === "DELIVERED";
            const isCurrent = idx === currentStageIndex && order.status !== "DELIVERED";

            return (
              <div key={stage.status} className="space-y-0.5">
                <span
                  className={`block text-[11px] font-semibold transition-colors ${
                    isCurrent
                      ? "text-amber-300"
                      : isCompleted
                      ? "text-zinc-200"
                      : "text-zinc-500"
                  }`}
                >
                  {stage.label}
                </span>
                <span className="hidden sm:block text-[9px] text-zinc-400 leading-tight">
                  {stage.sublabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-World Timeline Checkpoints Log */}
      {order.timeline && order.timeline.length > 0 && (
        <div className="border-t border-zinc-800/60 pt-4 space-y-2.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block">
            Vault Log & Transit Milestones
          </span>
          <div className="space-y-2 text-xs">
            {order.timeline.slice().reverse().map((event, i) => (
              <div
                key={`${event.timestamp}-${i}`}
                className="flex items-start justify-between gap-4 rounded-lg bg-zinc-900/40 p-2.5 border border-zinc-800/40"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{event.title}</span>
                    {event.location && (
                      <span className="text-[10px] text-zinc-400 flex items-center gap-0.5 font-mono">
                        <MapPin className="h-3 w-3 text-amber-400" />
                        {event.location}
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-400 text-[11px]">{event.description}</p>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono flex-shrink-0">
                  {new Date(event.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
