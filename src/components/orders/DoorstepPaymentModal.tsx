"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { IOrder } from "@/types/order.types";
import { useDoorstepPayment } from "@/hooks/useDoorstepPayment";
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  Lock,
  RefreshCw,
} from "lucide-react";

interface DoorstepPaymentModalProps {
  order: IOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

export function DoorstepPaymentModal({
  order,
  isOpen,
  onClose,
  onPaymentSuccess,
}: DoorstepPaymentModalProps) {
  const [copiedOtp, setCopiedOtp] = useState<boolean>(false);

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-[94vw] sm:w-full p-0 overflow-hidden bg-white border border-stone-200 shadow-2xl rounded-2xl sm:max-w-lg">
        <DoorstepPaymentContent
          order={order}
          copiedOtp={copiedOtp}
          setCopiedOtp={setCopiedOtp}
          onClose={onClose}
          onPaymentSuccess={onPaymentSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

interface IDoorstepContentProps {
  order: IOrder;
  copiedOtp: boolean;
  setCopiedOtp: (val: boolean) => void;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

function DoorstepPaymentContent({
  order,
  copiedOtp,
  setCopiedOtp,
  onClose,
  onPaymentSuccess,
}: IDoorstepContentProps) {
  const {
    qrCodeDataUrl,
    paymentStatus,
    handoverOtp,
    isSimulating,
    timeRemainingSec,
    triggerSimulatedPayment,
  } = useDoorstepPayment({ order, onPaymentSuccess });

  const orderNumber = order.orderNumber || order.id;

  const handleCopyOtp = () => {
    if (handoverOtp && typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(handoverOtp);
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 2000);
    }
  };

  const minutes = Math.floor(timeRemainingSec / 60);
  const seconds = timeRemainingSec % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  return (
    <div className="flex flex-col max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <DialogHeader className="p-5 pb-4 border-b border-stone-100 bg-stone-50/60">
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 text-amber-900 font-mono text-[11px] gap-1 px-2.5 py-0.5"
          >
            <Lock className="w-3 h-3 text-amber-700" />
            Digital COD • Direct Bank Settlement
          </Badge>
          <span className="text-xs font-mono text-stone-500">Order #{orderNumber}</span>
        </div>
        <DialogTitle className="text-lg font-serif tracking-tight text-stone-900 mt-2">
          {paymentStatus === "PAID"
            ? "Payment Confirmed • Delivery Release Token"
            : "Doorstep Digital Payment"}
        </DialogTitle>
        <DialogDescription className="text-xs text-stone-500">
          {paymentStatus === "PAID"
            ? "Funds safely deposited directly into DarkGems bank account. Present token to delivery courier."
            : "Scan using any UPI app (GPay, PhonePe, Paytm). Payment is verified automatically via gateway webhook."}
        </DialogDescription>
      </DialogHeader>

      {/* Main Body */}
      <div className="p-5 space-y-5">
        {paymentStatus !== "PAID" ? (
          <>
            {/* Amount Banner */}
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 p-3.5 rounded-xl border border-stone-200 bg-stone-50">
              <div>
                <span className="text-xs text-stone-500 block">Total Due Amount</span>
                <span className="text-lg sm:text-xl font-serif font-bold text-stone-900">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
              <div className="text-left xs:text-right">
                <span className="text-[11px] text-stone-500 block">Official Merchant VPA</span>
                <span className="font-mono text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 break-all xs:break-normal">
                  darkgems.vault@icici
                </span>
              </div>
            </div>

            {order.status !== "OUT_FOR_DELIVERY" && (
              <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs">
                <p className="font-semibold text-blue-950">
                  Armored Transit En Route ({order.status.replace("_", " ")})
                </p>
                <p className="text-[11px] text-blue-800 leading-relaxed mt-0.5">
                  Payment is only due once the Brink&apos;s armored courier physically arrives at your home.
                </p>
              </div>
            )}

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-stone-900/10 bg-white shadow-xs">
              {qrCodeDataUrl ? (
                <div className="relative p-2 bg-white rounded-xl border border-stone-200 shadow-sm">
                  <Image
                    src={qrCodeDataUrl}
                    alt="UPI Payment QR Code"
                    width={220}
                    height={220}
                    className="rounded-lg"
                    priority
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="p-1.5 bg-white rounded-full shadow-md border border-stone-200">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-[220px] h-[220px] flex items-center justify-center bg-stone-50 rounded-xl">
                  <RefreshCw className="w-6 h-6 text-stone-400 animate-spin" />
                </div>
              )}

              {/* Polling pulse */}
              <div className="flex flex-wrap items-center justify-center text-center gap-1.5 sm:gap-2 mt-4 text-xs font-medium text-stone-600">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>Listening for gateway bank confirmation...</span>
                <span className="text-stone-400 font-mono">({formattedTime})</span>
              </div>
            </div>

            {/* Anti-Fraud Notice */}
            <div className="flex gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-amber-950">Zero-Scam Guarantee</p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Never pay into personal UPI accounts or phone numbers of delivery personnel.
                  This dynamic QR ensures money flows strictly into our registered bank vault.
                </p>
              </div>
            </div>

            {/* Test Simulation Button */}
            <div className="pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={triggerSimulatedPayment}
                disabled={isSimulating}
                className="w-full border-dashed border-stone-300 text-stone-600 hover:text-stone-900 hover:border-stone-900 text-xs gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin" : ""}`} />
                {isSimulating ? "Simulating Gateway Webhook..." : "Test Demo: Simulate Webhook Approval"}
              </Button>
            </div>
          </>
        ) : (
          /* Payment Completed -> Release OTP Unlocked */
          <div className="space-y-5 text-center py-2">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-emerald-500 shadow-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Payment Successfully Received
              </h3>
              <p className="text-xs text-stone-500">
                Settled to DarkGems Central Treasury • Verified by Bank Gateway
              </p>
            </div>

            {/* Secure Handover OTP Container */}
            <div className="p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/50 space-y-3">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-900 uppercase tracking-wider font-mono">
                <Lock className="w-3.5 h-3.5 text-emerald-700" />
                Delivery Handover OTP
              </div>

              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <span className="font-mono text-3xl xs:text-4xl sm:text-5xl font-black tracking-widest text-emerald-950 bg-white px-3 sm:px-6 py-2 rounded-xl border border-emerald-300 shadow-inner">
                  {handoverOtp || "----"}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyOtp}
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl border-emerald-300 bg-white hover:bg-emerald-100 text-emerald-800 shrink-0"
                >
                  {copiedOtp ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                </Button>
              </div>

              <p className="text-[11px] text-emerald-800 leading-normal max-w-sm mx-auto">
                <span className="font-semibold">Crucial Security Protocol:</span> Show or read this
                4-digit code to the Brink’s delivery courier <strong>ONLY after</strong> you have
                personally inspected the security seal on your diamond case.
              </p>
            </div>

            <Button
              type="button"
              variant="luxury"
              onClick={onClose}
              className="w-full text-xs font-medium py-2.5"
            >
              Done & Ready for Inspection
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
