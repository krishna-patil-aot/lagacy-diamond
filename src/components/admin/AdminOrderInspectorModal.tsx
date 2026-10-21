"use client";

import React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { IDiamond } from "@/types/diamond.types";
import { IAdminOrderInspectorModalProps } from "@/types/admin.types";
import {
  MapPin,
  Mail,
  Loader2,
  Check,
  X,
  Truck,
  Navigation,
  ShieldCheck,
  Clock,
  QrCode,
} from "lucide-react";

export function AdminOrderInspectorModal({
  order,
  isOpen,
  onClose,
  sendOrderDocuments,
  isSending,
  getStatusBadge,
  onApprove,
  onDispatch,
  onAdvanceStatus,
  onVerifyOtp,
  onDoorstepPayment,
  onReject,
  isUpdating = false,
}: IAdminOrderInspectorModalProps) {
  if (!order) return null;

  const orderRef = order.orderNumber || order.id;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Order Reference #{orderRef}</DialogTitle>
            <div>{getStatusBadge(order.status)}</div>
          </div>
          <DialogDescription>
            Placed on{" "}
            {new Date(order.createdAt).toLocaleString([], {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-xs pt-2">
          {/* Shipping Destination */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-semibold flex items-center gap-1">
              <MapPin className="h-3 w-3 text-amber-600" />
              <span>Insured Delivery Address</span>
            </span>
            <div className="font-semibold text-stone-900 text-sm">
              {order.shippingAddress?.fullName}
            </div>
            <div className="text-stone-600">{order.shippingAddress?.street}</div>
            <div className="text-stone-600">
              {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
              {order.shippingAddress?.postalCode},{" "}
              {order.shippingAddress?.country}
            </div>
            <div className="text-stone-600 font-mono pt-0.5">
              Phone: {order.shippingAddress?.phone} • Email:{" "}
              {order.shippingAddress?.email}
            </div>
          </div>

          {/* Items in Order */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-semibold block">
              Gemstone Lots ({order.items.length})
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {order.items.map((item: IDiamond) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between rounded-lg border border-stone-200 bg-white p-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative h-10 w-10 rounded overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                      <Image
                        src={item.images[0] || ""}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-stone-900">
                        {item.name}
                      </div>
                      <div className="text-[11px] font-mono text-stone-500">
                        {item.carat} ct • {item.shape} • {item.color}/
                        {item.clarity} • Cut: {item.cut}
                      </div>
                      <div className="text-[10px] font-mono text-amber-800">
                        Cert: {item.lab} #{item.certificateNumber}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-stone-900 text-sm">
                    {formatPrice(item.finalPrice)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 space-y-1.5">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal:</span>
              <span className="font-mono text-stone-900 font-medium">
                {formatPrice(order.subtotal)}
              </span>
            </div>
            {order.couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Coupon Discount:</span>
                <span className="font-mono">
                  -{formatPrice(order.couponDiscount)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <span>Insured Armored Courier Transit:</span>
              <span className="font-mono text-emerald-700 font-semibold">
                FREE / COMPLIMENTARY
              </span>
            </div>
            <div className="flex justify-between text-stone-900 font-bold border-t border-stone-200 pt-1.5 text-sm">
              <span>Settlement Total:</span>
              <span className="font-mono text-base text-emerald-700">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>

          {/* Order Lifecycle Progression Actions (Admin Control) */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/90 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-semibold block">
                Workflow Actions &amp; Lifecycle Progression
              </span>
              <span className="text-[10px] font-mono text-stone-500">
                Current: <strong>{order.status.replace("_", " ")}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {order.status === "PENDING_APPROVAL" && (
                <>
                  {onApprove && (
                    <Button
                      variant="luxury"
                      size="sm"
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 gap-1.5"
                      disabled={isUpdating}
                      onClick={() => onApprove(order.id)}
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Accept &amp; Approve Order</span>
                    </Button>
                  )}
                  {onReject && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs text-rose-700 border-rose-300 bg-rose-50 hover:bg-rose-100 gap-1"
                      disabled={isUpdating}
                      onClick={() => onReject(order.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Reject Order</span>
                    </Button>
                  )}
                </>
              )}

              {order.status === "APPROVED" && onDispatch && (
                <Button
                  variant="luxury"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  disabled={isUpdating}
                  onClick={() => onDispatch(order.id)}
                >
                  <Truck className="h-3.5 w-3.5" />
                  <span>Dispatch via Brink&apos;s Armored</span>
                </Button>
              )}

              {order.status === "DISPATCHED" && onAdvanceStatus && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs text-amber-900 border-amber-300 bg-amber-50 hover:bg-amber-100 gap-1.5"
                  disabled={isUpdating}
                  onClick={() =>
                    onAdvanceStatus(
                      order.id,
                      "IN_TRANSIT",
                      "Armored convoy en route across regional logistics hubs"
                    )
                  }
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>Mark In Transit</span>
                </Button>
              )}

              {order.status === "IN_TRANSIT" && onAdvanceStatus && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs text-amber-900 border-amber-300 bg-amber-50 hover:bg-amber-100 gap-1.5"
                  disabled={isUpdating}
                  onClick={() =>
                    onAdvanceStatus(
                      order.id,
                      "OUT_FOR_DELIVERY",
                      "Armored courier van dispatched for scheduled handover"
                    )
                  }
                >
                  <Truck className="h-3.5 w-3.5" />
                  <span>Mark Out for Delivery</span>
                </Button>
              )}

              {order.status === "OUT_FOR_DELIVERY" && (
                <>
                  {order.paymentInfo?.paymentStatus !== "PAID" ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="h-8 px-2.5 text-[11px] font-mono inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 text-amber-900">
                        <Clock className="h-3.5 w-3.5 text-amber-600 animate-spin" />
                        <span>Awaiting Payment</span>
                      </span>
                      {onDoorstepPayment && (
                        <Button
                          variant="luxury"
                          size="sm"
                          className="h-8 text-xs bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5"
                          onClick={() => onDoorstepPayment(order)}
                        >
                          <QrCode className="h-3.5 w-3.5" />
                          <span>Collect Doorstep Payment</span>
                        </Button>
                      )}
                    </div>
                  ) : (
                    onVerifyOtp && (
                      <Button
                        variant="luxury"
                        size="sm"
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 gap-1.5"
                        disabled={isUpdating}
                        onClick={() => onVerifyOtp(order)}
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Verify Handover (OTP)</span>
                      </Button>
                    )
                  )}
                </>
              )}

              {order.status === "DELIVERED" && (
                <span className="text-xs font-mono text-emerald-700 font-semibold inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Consignment Fulfilled &amp; Signed</span>
                </span>
              )}

              {order.status === "CANCELLED" && (
                <span className="text-xs font-mono text-rose-700 font-medium inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-3 py-1 rounded-lg">
                  <X className="h-4 w-4 text-rose-600" />
                  <span>Order Voided &amp; Lots Released</span>
                </span>
              )}
            </div>
          </div>

          {/* Client Documentation Email Dispatch (Admin Action) */}
          <div className="rounded-xl border border-stone-200 bg-stone-900 p-3.5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-stone-100 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-amber-400" />
                <span>Client Documentation Dispatch</span>
              </div>
              <div className="text-[11px] text-stone-400">
                Recipient:{" "}
                <strong className="text-amber-300">
                  {order.shippingAddress?.email}
                </strong>
              </div>
            </div>

            {order.status === "DELIVERED" ? (
              <Button
                type="button"
                size="sm"
                variant="luxury"
                onClick={() => sendOrderDocuments(order)}
                disabled={isSending(order.id)}
                className="h-7 text-xs font-mono gap-1.5 shrink-0 shadow-xs"
              >
                {isSending(order.id) ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Sending Email...</span>
                  </>
                ) : (
                  <>
                    <Mail className="h-3.5 w-3.5" />
                    <span>Send Invoice & Cert Email</span>
                  </>
                )}
              </Button>
            ) : (
              <span className="text-[10px] font-mono text-amber-300/80 italic">
                {order.status === "CANCELLED"
                  ? "Order voided"
                  : "Email available once order is fulfilled"}
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
