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
import { Badge } from "@/components/ui/Badge";
import { OrderTrackingTimeline } from "@/components/orders/OrderTrackingTimeline";
import { formatPrice } from "@/lib/utils";
import { IOrder, OrderStatus } from "@/types/order.types";
import {
  Clock,
  ShieldCheck,
  Truck,
  MapPin,
  Tag,
  Copy,
  Check,
  Shield,
} from "lucide-react";

interface UserOrderDetailsModalProps {
  order: IOrder | null;
  onClose: () => void;
}

export function UserOrderDetailsModal({
  order,
  onClose,
}: UserOrderDetailsModalProps) {
  const [copiedTracking, setCopiedTracking] = useState(false);

  if (!order) return null;

  const trackingNumber =
    order.trackingInfo?.trackingNumber ||
    `BRK-${order.orderNumber || order.id}`;

  const copyTracking = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(trackingNumber);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return (
          <Badge variant="gold" className="text-xs font-mono inline-flex items-center gap-1.5 px-2.5 py-0.5 whitespace-nowrap">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>Awaiting Review</span>
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge variant="success" className="text-xs font-mono inline-flex items-center gap-1.5 px-2.5 py-0.5 whitespace-nowrap">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span>Approved & Vault Sealed</span>
          </Badge>
        );
      case "DISPATCHED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-0.5 text-xs font-mono font-medium whitespace-nowrap">
            <Truck className="h-3.5 w-3.5 shrink-0" />
            <span>Armored Dispatched</span>
          </span>
        );
      case "IN_TRANSIT":
      case "OUT_FOR_DELIVERY":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 text-xs font-mono font-medium animate-pulse whitespace-nowrap">
            <Truck className="h-3.5 w-3.5 shrink-0" />
            <span>In Armed Transit</span>
          </span>
        );
      case "DELIVERED":
        return (
          <Badge variant="success" className="text-xs font-mono inline-flex items-center gap-1.5 px-2.5 py-0.5 whitespace-nowrap">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span>Hand-Delivered & Signed</span>
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="destructive" className="text-xs font-mono inline-flex items-center gap-1.5 px-2.5 py-0.5 whitespace-nowrap">
            <span>Cancelled</span>
          </Badge>
        );
      default:
        return <Badge variant="outline" className="text-xs font-mono">{status}</Badge>;
    }
  };

  return (
    <Dialog open={Boolean(order)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-[calc(100%-2rem)] max-h-[88vh] overflow-y-auto p-4 sm:p-6 md:p-7 space-y-5">
        {/* 1. Modal Header with Order Reference & Live Status */}
        <DialogHeader className="border-b border-stone-200 pb-4 pr-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <DialogTitle className="font-mono text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
                Order #{order.orderNumber || order.id}
              </DialogTitle>
              {getStatusBadge(order.status)}
            </div>
            <DialogDescription
              className="text-xs text-stone-500 font-mono"
              suppressHydrationWarning
            >
              Placed on{" "}
              {new Date(order.createdAt).toLocaleString([], {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* 2. Real-World Armored Transit Timeline */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-semibold block">
            Armored Transit Custody Progress
          </span>
          <OrderTrackingTimeline order={order} />
        </div>

        {/* 3. Armored Courier & Custody Manifest */}
        <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 sm:p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-800 font-semibold flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-amber-600" />
              <span>Armored Courier & Custody Manifest</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-700 font-medium flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> 100% Insured Escrow
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs pt-1">
            <div className="bg-white rounded-xl p-3 border border-stone-200/80 space-y-1">
              <span className="text-[10px] uppercase font-mono text-stone-400 block">
                Carrier & Security
              </span>
              <span className="font-semibold text-stone-900 block truncate">
                {order.trackingInfo?.carrier || "Brink's Global Armored Services"}
              </span>
            </div>

            <div className="bg-white rounded-xl p-3 border border-stone-200/80 space-y-1">
              <span className="text-[10px] uppercase font-mono text-stone-400 block">
                Tracking Reference
              </span>
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono font-bold text-stone-900 text-xs truncate">
                  {trackingNumber}
                </span>
                <button
                  type="button"
                  onClick={copyTracking}
                  className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
                  title="Copy Tracking Reference"
                >
                  {copiedTracking ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 border border-stone-200/80 space-y-1">
              <span className="text-[10px] uppercase font-mono text-stone-400 block">
                Estimated Handover
              </span>
              <span className="font-semibold text-amber-800 font-mono block truncate">
                {order.trackingInfo?.estimatedDeliveryDate || "Within 3 business days"}
              </span>
            </div>

            <div className="bg-white rounded-xl p-3 border border-stone-200/80 space-y-1">
              <span className="text-[10px] uppercase font-mono text-stone-400 block">
                Vault Origin
              </span>
              <span className="font-semibold text-stone-700 block truncate">
                {order.trackingInfo?.vaultOrigin || "Geneva Central Vault 1"}
              </span>
            </div>

            <div className="bg-white rounded-xl p-3 border border-stone-200/80 space-y-1">
              <span className="text-[10px] uppercase font-mono text-stone-400 block">
                Transit Protocol
              </span>
              <span className="font-semibold text-stone-700 font-mono block truncate">
                {order.trackingInfo?.transitType?.replace("_", " ") || "ARMORED GROUND"}
              </span>
            </div>

            <div className="bg-white rounded-xl p-3 border border-stone-200/80 space-y-1">
              <span className="text-[10px] uppercase font-mono text-stone-400 block">
                Handover Verification
              </span>
              <span className="font-semibold text-stone-900 block truncate">
                Biometric Signature Required
              </span>
            </div>
          </div>
        </div>

        {/* 4. Gemstone Lots Acquired */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-semibold block">
              Certified Gemstones Acquired ({order.items.length})
            </span>
            <span className="text-[11px] font-mono text-stone-500">
              Laser Inscription Sealed & Verified
            </span>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {order.items.map((diamond) => (
              <div
                key={diamond._id}
                className="flex items-center justify-between gap-3 sm:gap-4 rounded-xl border border-stone-200 bg-white p-3 sm:p-3.5 text-xs shadow-2xs hover:border-stone-300 transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                  <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-lg overflow-hidden border border-stone-200 bg-stone-50 shrink-0">
                    <Image
                      src={diamond.images[0] || ""}
                      alt={diamond.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-stone-900 text-xs sm:text-sm truncate">
                      {diamond.name}
                    </div>
                    <div className="text-[11px] font-mono text-amber-800 mt-0.5">
                      {diamond.carat} ct • {diamond.shape} • {diamond.color} / {diamond.clarity} • Cut: {diamond.cut}
                    </div>
                    <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                      Cert: {diamond.certificateNumber} ({diamond.lab || "GIA"}) • SKU: {diamond.sku}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-stone-900 text-sm sm:text-base">
                    {formatPrice(diamond.finalPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Destination & Settlement Dossier Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          {/* Shipping Destination */}
          <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4 sm:p-5 flex flex-col justify-between text-xs space-y-3 shadow-2xs">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-semibold flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-amber-600" />
                <span>Armored Handover Destination</span>
              </span>
              <div className="font-semibold text-stone-900 text-sm">
                {order.shippingAddress?.fullName}
              </div>
              <div className="text-stone-600 leading-relaxed">
                {order.shippingAddress?.street}
                <br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                {order.shippingAddress?.postalCode}
                <br />
                {order.shippingAddress?.country}
              </div>
            </div>

            <div className="text-stone-500 font-mono pt-2.5 border-t border-stone-200/80 text-[11px] space-y-1">
              <div className="flex justify-between items-center">
                <span>Phone:</span>
                <span className="text-stone-800 font-medium">{order.shippingAddress?.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Email:</span>
                <span className="text-stone-800 font-medium truncate max-w-[200px]">
                  {order.shippingAddress?.email}
                </span>
              </div>
            </div>
          </div>

          {/* Settlement Dossier */}
          <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4 sm:p-5 flex flex-col justify-between text-xs space-y-3 shadow-2xs">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-semibold flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-amber-600" />
                <span>Settlement Dossier</span>
              </span>
              <div className="flex justify-between items-center text-stone-600">
                <span>Lot Subtotal:</span>
                <span className="font-mono text-stone-900 font-medium">{formatPrice(order.subtotal)}</span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between items-center text-emerald-700 font-semibold">
                  <span>VIP Privilege Savings:</span>
                  <span className="font-mono">-{formatPrice(order.couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-stone-600">
                <span>Armored Escort Transit:</span>
                <span className="font-mono text-emerald-700 font-semibold text-[11px]">
                  FREE / COMPLIMENTARY
                </span>
              </div>
              <div className="flex justify-between items-center text-stone-600">
                <span>Payment Channel:</span>
                <span className="font-mono text-stone-800">
                  {order.paymentInfo?.method?.replace("_", " ") || "CREDIT CARD"}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-stone-900 font-bold border-t border-stone-200 pt-2.5 text-sm">
              <span>Settlement Total:</span>
              <span className="font-mono text-base text-emerald-700 font-bold">
                {formatPrice(order.totalAmount)} USD
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
