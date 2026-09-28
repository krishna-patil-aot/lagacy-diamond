"use client";

import React, { useState } from "react";
import { IOrder } from "@/types/order.types";
import { useOrderTracking } from "@/hooks/useOrderTracking";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { VaultLogFaqModal } from "./VaultLogFaqModal";
import {
  Clock,
  CheckCircle2,
  Truck,
  Navigation,
  ShieldCheck,
  Award,
  Copy,
  Check,
  Calendar,
  ShieldAlert,
  Shield,
  HelpCircle,
  Lock,
  QrCode,
} from "lucide-react";
import { DoorstepPaymentModal } from "./DoorstepPaymentModal";

interface OrderTrackingTimelineProps {
  order: IOrder;
}

export function OrderTrackingTimeline({ order }: OrderTrackingTimelineProps) {
  const [isFaqModalOpen, setIsFaqModalOpen] = useState<boolean>(false);
  const [isDoorstepPaymentOpen, setIsDoorstepPaymentOpen] = useState<boolean>(false);
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
    <div className="space-y-4 sm:space-y-6 rounded-2xl border border-stone-200 bg-stone-50/60 p-3 sm:p-5 md:p-6">
      {/* Carrier Tracking Header Bar */}
      <div className="flex flex-col gap-2.5 border-b border-stone-200/80 pb-3 sm:pb-4 text-xs">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1.5 min-w-0">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-semibold block">
              Insured Armored Transit Protocol
            </span>
            <span className="font-semibold text-stone-900 font-serif text-sm sm:text-base block truncate">
              {order.trackingInfo?.carrier || "Brink's Global Armored Services"}
            </span>
          </div>
          <Badge variant="gold" className="text-[10px] font-mono whitespace-nowrap self-start xs:self-center shrink-0">
            ESCORT ACTIVE
          </Badge>
        </div>

        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-2.5 py-1.5 font-mono shadow-xs max-w-full">
            <span className="text-stone-500 text-[11px] whitespace-nowrap shrink-0">Waybill:</span>
            <span className="text-stone-900 font-bold text-xs font-mono truncate max-w-[140px] xs:max-w-[200px]">
              {order.trackingInfo?.trackingNumber || `BRK-${order.orderNumber || order.id}`}
            </span>
            <button
              type="button"
              onClick={copyTrackingNumber}
              className="ml-auto p-0.5 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer shrink-0"
              title="Copy Waybill Number"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {order.trackingInfo?.estimatedDeliveryDate && (
            <div className="flex items-center gap-1.5 text-stone-600 font-medium text-xs whitespace-nowrap self-start xs:self-center shrink-0">
              <Calendar className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span className="text-[11px]">Est: {order.trackingInfo.estimatedDeliveryDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* 1. Mobile Stepper (< 640px): Vertical Connected Timeline with Highlighted Completed & Dark Pending */}
      <div className="block sm:hidden space-y-3">
        {/* Mobile Progress Bar Overview */}
        <div className="rounded-xl border border-stone-200/80 bg-white p-2.5 sm:p-3 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-semibold">
              Custody Progress
            </span>
            <span className="font-mono text-emerald-700 font-bold text-xs">
              {progressPercentage}% Complete
            </span>
          </div>
          <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200/60">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-600 transition-all duration-700 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] flex-wrap gap-1">
            <span className="font-semibold text-stone-900 truncate">
              Stage {Math.min(stages.length, currentStageIndex + 1)} of {stages.length}: {stages[currentStageIndex]?.label || "Processing"}
            </span>
            <span className="text-emerald-700 font-medium text-[10px] font-mono shrink-0">
              {order.status === "DELIVERED" ? "Handed Over" : "In Escort"}
            </span>
          </div>
        </div>

        {/* Mobile Vertical Connected Milestones */}
        <div className="relative pl-6 space-y-2.5">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex || order.status === "DELIVERED";
            const isCurrent = idx === currentStageIndex && order.status !== "DELIVERED";
            const isLast = idx === stages.length - 1;

            return (
              <div key={stage.status} className="relative flex items-start gap-2.5">
                {/* Vertical connecting line */}
                {!isLast && (
                  <div
                    className={`absolute -left-[13px] top-6 bottom-0 w-0.5 ${
                      isCompleted ? "bg-emerald-500" : "bg-stone-200"
                    }`}
                  />
                )}

                {/* Node icon aligned on the vertical track */}
                <div
                  className={`absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all shrink-0 z-10 ${
                    isCompleted
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                      : isCurrent
                      ? "border-amber-600 bg-white text-amber-800 ring-4 ring-amber-500/20 shadow-xs animate-pulse"
                      : "border-stone-300 bg-stone-100 text-stone-300"
                  }`}
                >
                  {renderIcon(stage.iconName, isCompleted, isCurrent)}
                </div>

                {/* Content on right */}
                <div
                  className={`flex-1 min-w-0 p-2 sm:p-2.5 rounded-xl border transition-all ${
                    isCompleted
                      ? "bg-emerald-50/90 border-emerald-300 shadow-2xs"
                      : isCurrent
                      ? "bg-amber-50/90 border-amber-300 shadow-xs"
                      : "bg-stone-50/30 border-stone-200/50 opacity-40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span
                      className={`text-xs font-bold leading-tight ${
                        isCompleted
                          ? "text-emerald-950 font-bold bg-emerald-100/90 px-1.5 py-0.5 rounded shadow-2xs"
                          : isCurrent
                          ? "text-amber-950 font-bold bg-amber-100 px-1.5 py-0.5 rounded shadow-2xs"
                          : "text-stone-400 font-normal"
                      }`}
                    >
                      {stage.label}
                    </span>
                    {isCompleted ? (
                      <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded-full border border-emerald-300/80 inline-flex items-center gap-1 shrink-0">
                        <Check className="h-2.5 w-2.5 shrink-0" /> Done
                      </span>
                    ) : isCurrent ? (
                      <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-200/80 px-1.5 py-0.5 rounded-full border border-amber-300 animate-pulse inline-flex items-center gap-1 shrink-0">
                        <Clock className="h-2.5 w-2.5 shrink-0" /> Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200/60 shrink-0">
                        Pending
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-[11px] mt-0.5 leading-snug break-words ${
                      isCompleted
                        ? "text-emerald-900 font-medium"
                        : isCurrent
                        ? "text-amber-900 font-medium"
                        : "text-stone-400/60 font-normal"
                    }`}
                  >
                    {stage.sublabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Tablet & Desktop Stepper (>= 640px): Sleek Horizontal Stepper */}
      <div className="hidden sm:block space-y-3 pt-1">
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
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                      : isCurrent
                      ? "border-amber-600 bg-white text-amber-800 ring-4 ring-amber-500/20 shadow-xs animate-pulse"
                      : "border-stone-300 bg-stone-100 text-stone-400 opacity-60"
                  }`}
                >
                  {renderIcon(stage.iconName, isCompleted, isCurrent)}
                </div>
              </div>
            );
          })}
        </div>

        {/* 6 Column Labels directly aligned below the 6 Stepper Dots */}
        <div className="grid grid-cols-6 gap-1 text-center pt-2">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex || order.status === "DELIVERED";
            const isCurrent = idx === currentStageIndex && order.status !== "DELIVERED";

            return (
              <div key={stage.status} className="space-y-0.5 px-0.5">
                <span
                  className={`block text-[11px] md:text-xs leading-tight transition-colors ${
                    isCurrent
                      ? "text-amber-950 font-bold bg-amber-50 rounded px-1"
                      : isCompleted
                      ? "text-emerald-950 font-bold"
                      : "text-stone-400 font-normal opacity-50"
                  }`}
                >
                  {stage.label}
                </span>
                <span
                  className={`hidden md:block text-[10px] leading-tight ${
                    isCompleted
                      ? "text-stone-600 font-medium"
                      : "text-stone-400/50 font-normal"
                  }`}
                >
                  {stage.sublabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Doorstep Payment Stage Trigger (Step right before Delivered & Signed) */}
      {order.paymentInfo?.method === "DIGITAL_COD_UPI" && order.status === "OUT_FOR_DELIVERY" && (
        <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/90 p-4 sm:p-5 space-y-2.5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 font-mono uppercase tracking-wide">
              <QrCode className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>Doorstep Payment Active • Ready for Handover</span>
            </span>
            <Badge variant="success" className="text-[10px] font-mono self-start sm:self-center">
              COURIER AT ADDRESS
            </Badge>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            The armored courier van is at your delivery address. Scan the dynamic QR code to settle the consignment amount and reveal your 4-digit Handover OTP.
          </p>
          <div className="pt-1">
            <Button
              type="button"
              variant="luxury"
              onClick={() => setIsDoorstepPaymentOpen(true)}
              className="h-8 text-xs font-medium bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5 shadow-xs"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>
                {order.paymentInfo.paymentStatus === "PAID"
                  ? `View Handover OTP (${order.paymentInfo.deliveryHandoverOtp || "Ready"})`
                  : "Pay via Doorstep QR"}
              </span>
            </Button>
          </div>
        </div>
      )}

      {order.paymentInfo?.method === "DIGITAL_COD_UPI" &&
        order.status !== "OUT_FOR_DELIVERY" &&
        order.status !== "DELIVERED" &&
        order.status !== "CANCELLED" && (
          <div className="rounded-xl border border-stone-200 bg-white p-3 text-xs text-stone-600 flex flex-col xs:flex-row xs:items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-stone-400 shrink-0" />
              <span className="text-[11px]">
                Payment unlocks right before final handover at <strong>Stage 5: Out for Handover</strong>.
              </span>
            </div>
            <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 uppercase self-start xs:self-auto shrink-0">
              Locked in Transit
            </span>
          </div>
        )}

      {/* 3. Vault Log & Transit Milestones FAQ & Modal Trigger Card */}
      <div className="border-t border-stone-200/80 pt-3.5 space-y-2.5">
        <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-stone-50 to-amber-50/40 p-3 sm:p-4 shadow-2xs space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-amber-900 font-semibold flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span>Vault Log &amp; Transit Milestones</span>
              </span>
              <p className="text-xs text-stone-600">
                Official chain of custody records, biometric delivery logs, and transit security FAQs.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFaqModalOpen(true)}
              className="w-full sm:w-auto h-8 text-xs font-semibold bg-white hover:bg-stone-100 border-amber-300 text-stone-900 shadow-2xs inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <HelpCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span>Open Custody Log &amp; FAQ Modal</span>
            </Button>
          </div>

          {/* Latest Verified Checkpoint Preview */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="flex items-center justify-between gap-2 rounded-xl bg-white/90 p-2 sm:p-2.5 border border-amber-200/60 text-xs shadow-2xs flex-wrap">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-semibold text-stone-900 text-xs truncate">
                  Latest Checkpoint: {order.timeline[order.timeline.length - 1].title}
                </span>
                {order.timeline[order.timeline.length - 1].location && (
                  <span className="text-[10px] text-stone-500 font-mono hidden sm:inline shrink-0">
                    • {order.timeline[order.timeline.length - 1].location}
                  </span>
                )}
              </div>
              <span
                className="text-[10px] text-stone-400 font-mono shrink-0"
                suppressHydrationWarning
              >
                {new Date(order.timeline[order.timeline.length - 1].timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Dedicated FAQ & Milestones Modal */}
      <VaultLogFaqModal
        isOpen={isFaqModalOpen}
        onClose={() => setIsFaqModalOpen(false)}
        order={order}
      />

      {/* Doorstep Payment Modal triggered from Timeline */}
      <DoorstepPaymentModal
        order={order}
        isOpen={isDoorstepPaymentOpen}
        onClose={() => setIsDoorstepPaymentOpen(false)}
      />
    </div>
  );
}
