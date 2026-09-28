"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { IOrder } from "@/types/order.types";
import { useDeliveryCourierVerification } from "@/hooks/useDeliveryCourierVerification";
import { Truck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface CourierHandoverOtpModalProps {
  order: IOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedOrder: IOrder) => void;
}

export function CourierHandoverOtpModal({
  order,
  isOpen,
  onClose,
  onSuccess,
}: CourierHandoverOtpModalProps) {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-[94vw] sm:w-full p-0 overflow-hidden bg-white border border-stone-200 shadow-2xl rounded-2xl">
        <CourierHandoverContent
          order={order}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

interface ICourierContentProps {
  order: IOrder;
  onClose: () => void;
  onSuccess?: (updatedOrder: IOrder) => void;
}

function CourierHandoverContent({
  order,
  onClose,
  onSuccess,
}: ICourierContentProps) {
  const {
    otpInput,
    setOtpInput,
    isSubmitting,
    errorMessage,
    submitOtpVerification,
  } = useDeliveryCourierVerification({
    order,
    onSuccess: (updated) => {
      if (onSuccess) onSuccess(updated);
      onClose();
    },
  });

  const isPaid = order.paymentInfo?.paymentStatus === "PAID";
  const orderNumber = order.orderNumber || order.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitOtpVerification();
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <DialogHeader className="p-5 pb-4 border-b border-stone-100 bg-stone-50/60">
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className="border-stone-300 bg-stone-100 text-stone-800 font-mono text-[11px] gap-1 px-2.5 py-0.5"
          >
            <Truck className="w-3 h-3 text-stone-600" />
            Courier Delivery Clearance
          </Badge>
          <span className="text-xs font-mono text-stone-500">Order #{orderNumber}</span>
        </div>
        <DialogTitle className="text-lg font-serif tracking-tight text-stone-900 mt-2">
          Verify Client Handover OTP
        </DialogTitle>
        <DialogDescription className="text-xs text-stone-500">
          Two-way cryptographic handover protocol. Enter the 4-digit code provided by the client.
        </DialogDescription>
      </DialogHeader>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Payment Confirmation State Indicator */}
        <div
          className={`flex flex-col xs:flex-row xs:items-center justify-between gap-2 p-3 rounded-xl border text-xs ${
            isPaid
              ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
              : "bg-amber-50/70 border-amber-200 text-amber-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {isPaid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span className="font-medium">
              {isPaid
                ? "Bank Payment Received & Verified"
                : "Payment UNPAID: Client must scan QR first"}
            </span>
          </div>
          <span className="font-mono font-bold self-end xs:self-auto shrink-0">{formatPrice(order.totalAmount)}</span>
        </div>

        {isPaid ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-center">
              <label
                htmlFor="otp-input"
                className="text-xs font-semibold text-stone-700 block text-left"
              >
                Client 4-Digit Handover OTP
              </label>
              <Input
                id="otp-input"
                type="text"
                maxLength={4}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="h-14 text-center font-mono text-3xl tracking-widest border-2 border-stone-300 focus:border-stone-900 rounded-xl"
                autoFocus
              />
              <span className="text-[11px] text-stone-500 block text-left pt-1">
                Ask the client to view their Order Screen or SMS for this code after they inspect the parcel.
              </span>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs">
                {errorMessage}
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-1/2 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="luxury"
                disabled={isSubmitting || otpInput.trim().length !== 4}
                className="w-1/2 text-xs"
              >
                {isSubmitting ? "Verifying..." : "Verify & Complete"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 py-2 text-center">
            <p className="text-xs text-stone-600 leading-relaxed">
              Consignment handover is physically prohibited until payment reflects in the treasury.
              Ask the client to scan their Doorstep Dynamic QR code.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full text-xs"
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
