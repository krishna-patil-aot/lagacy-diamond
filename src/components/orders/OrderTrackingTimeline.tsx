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
    if (isCompleted) return <CheckCircle2 className={`${iconClass} text-emerald-600`} />;
    if (isCurrent) return <Clock className={`${iconClass} text-amber-700 animate-spin`} />;

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
      <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-5 sm:p-6 text-center space-y-3 shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 border border-rose-200 shadow-xs">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-base sm:text-lg font-serif font-bold text-rose-950">
            Order Cancelled / Voided
          </h4>
          <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
            This order was cancelled by the Vault Curator or client request. Diamond lots have been safely returned to foundry custody.
          </p>
        </div>
        <div className="pt-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-rose-200 text-rose-700 text-xs font-mono font-medium shadow-xs">
            <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
            No purchase invoice issued • Lot released
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-stone-200 bg-stone-50/60 p-4 sm:p-6">
      {/* Carrier Tracking Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-4 text-xs">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-semibold block">
            Insured Armored Transit Protocol
          </span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-900 font-serif text-sm sm:text-base">
              {order.trackingInfo?.carrier || "Brink's Global Armored Services"}
            </span>
            <Badge variant="gold" className="text-[10px] font-mono">
              ESCORT ACTIVE
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 font-mono shadow-xs">
            <span className="text-stone-500 text-[11px]">Waybill:</span>
            <span className="text-stone-900 font-bold text-xs">
              {order.trackingInfo?.trackingNumber || `BRK-${order.orderNumber || order.id}`}
            </span>
            <button
              onClick={copyTrackingNumber}
              className="ml-1 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              title="Copy Waybill Number"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>

          {order.trackingInfo?.estimatedDeliveryDate && (
            <div className="flex items-center gap-1.5 text-stone-600 font-medium text-xs">
              <Calendar className="h-3.5 w-3.5 text-amber-600" />
              <span>Est: {order.trackingInfo.estimatedDeliveryDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar (Amazon / Flipkart Style Stepper) */}
      <div className="space-y-3 pt-2">
        <div className="relative flex items-center justify-between">
          {/* Background Track */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 w-full bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-600 transition-all duration-700 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Stepper Dots */}
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex || order.status === "DELIVERED";
            const isCurrent = idx === currentStageIndex && order.status !== "DELIVERED";

            return (
              <div key={stage.status} className="relative z-10 flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isCompleted
                      ? "border-emerald-600 bg-white text-emerald-700 shadow-xs"
                      : isCurrent
                      ? "border-amber-600 bg-white text-amber-800 ring-4 ring-amber-500/20 shadow-xs animate-pulse"
                      : "border-stone-300 bg-stone-100 text-stone-400"
                  }`}
                >
                  {renderIcon(stage.iconName, isCompleted, isCurrent)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Responsive Labels directly below Stepper */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center pt-2">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex || order.status === "DELIVERED";
            const isCurrent = idx === currentStageIndex && order.status !== "DELIVERED";

            return (
              <div key={stage.status} className="space-y-0.5">
                <span
                  className={`block text-[11px] sm:text-xs font-semibold transition-colors ${
                    isCurrent
                      ? "text-amber-900 font-bold"
                      : isCompleted
                      ? "text-stone-800"
                      : "text-stone-400"
                  }`}
                >
                  {stage.label}
                </span>
                <span className="hidden sm:block text-[10px] text-stone-500 leading-tight">
                  {stage.sublabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-World Timeline Checkpoints Log */}
      {order.timeline && order.timeline.length > 0 && (
        <div className="border-t border-stone-200/80 pt-4 space-y-2.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-semibold block">
            Vault Log & Transit Milestones
          </span>
          <div className="space-y-2 text-xs">
            {order.timeline.slice().reverse().map((event, i) => (
              <div
                key={`${event.timestamp}-${i}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-white p-3 border border-stone-200 shadow-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900 text-xs sm:text-sm">
                      {event.title}
                    </span>
                    {event.location && (
                      <span className="text-[10px] text-stone-500 flex items-center gap-0.5 font-mono">
                        <MapPin className="h-3 w-3 text-amber-600" />
                        {event.location}
                      </span>
                    )}
                  </div>
                  <p className="text-stone-600 text-xs leading-relaxed">{event.description}</p>
                </div>
                <span className="text-[11px] text-stone-400 font-mono shrink-0">
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
