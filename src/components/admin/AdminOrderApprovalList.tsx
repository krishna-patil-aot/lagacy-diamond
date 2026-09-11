"use client";

import React from "react";
import Image from "next/image";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { Check, X, Clock, ShieldCheck, MapPin, Tag, ShoppingBag, Truck, Navigation } from "lucide-react";

export function AdminOrderApprovalList() {
  const {
    filteredOrders,
    statusFilter,
    setStatusFilter,
    pendingCount,
    approvedCount,
    handleApproveOrder,
    handleDispatchOrder,
    handleAdvanceStatus,
    handleRejectOrder,
    isUpdating,
  } = useAdminOrders();

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 sm:p-6 backdrop-blur-md">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Client Order Approvals & Vault Dispatch</span>
            {pendingCount > 0 && (
              <Badge variant="gold" className="text-[11px] animate-pulse">
                {pendingCount} Pending
              </Badge>
            )}
          </h3>
          <p className="text-xs text-zinc-400">
            Verify client identity and approve physical release of certified gemstones for armored carrier delivery.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-1 text-xs">
            {(["ALL", "PENDING_APPROVAL", "APPROVED", "CANCELLED"] as const).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    statusFilter === status
                      ? "bg-amber-400/20 text-amber-200 border border-amber-400/30"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {status === "ALL" && "All Orders"}
                  {status === "PENDING_APPROVAL" && `Pending (${pendingCount})`}
                  {status === "APPROVED" && `Approved (${approvedCount})`}
                  {status === "CANCELLED" && "Cancelled"}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <ShoppingBag className="mx-auto h-10 w-10 text-zinc-600" />
          <p className="text-xs text-zinc-400">
            No orders found matching the selected status.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 space-y-4 transition-all hover:border-zinc-700"
            >
              {/* Order Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/60 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-white">
                    #{order.id}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono" suppressHydrationWarning>
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {order.status === "PENDING_APPROVAL" && (
                    <Badge variant="gold" className="gap-1 text-xs">
                      <Clock className="h-3 w-3" /> Awaiting Curator Action
                    </Badge>
                  )}
                  {order.status === "APPROVED" && (
                    <Badge variant="success" className="gap-1 text-xs">
                      <ShieldCheck className="h-3 w-3" /> Approved & Dispatched
                    </Badge>
                  )}
                  {order.status === "CANCELLED" && (
                    <Badge variant="destructive" className="text-xs">
                      Cancelled
                    </Badge>
                  )}
                </div>
              </div>

              {/* Order Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
                {/* Ordered Diamonds (5 Cols) */}
                <div className="lg:col-span-5 space-y-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block">
                    Reserved Diamonds ({order.items.length})
                  </span>
                  <div className="space-y-2">
                    {order.items.map((diamond) => (
                      <div
                        key={diamond._id}
                        className="flex items-center gap-3 rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-2"
                      >
                        <div className="relative h-10 w-10 flex-shrink-0 rounded overflow-hidden bg-zinc-900 border border-zinc-800">
                          <Image
                            src={diamond.images[0] || ""}
                            alt={diamond.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white truncate">
                            {diamond.name}
                          </div>
                          <div className="text-[10px] font-mono text-amber-300">
                            {diamond.carat} ct • {diamond.shape} • SKU: {diamond.sku}
                          </div>
                        </div>
                        <span className="font-mono font-bold text-white pr-2">
                          {formatPrice(diamond.finalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Insured Shipping Address (4 Cols) */}
                <div className="lg:col-span-4 rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-3 space-y-1.5">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-amber-400" />
                    <span>Armored Delivery Destination</span>
                  </span>
                  <div className="font-semibold text-white">
                    {order.shippingAddress.fullName}
                  </div>
                  <div className="text-zinc-400">
                    {order.shippingAddress.street}
                  </div>
                  <div className="text-zinc-400">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </div>
                  <div className="text-zinc-400">
                    {order.shippingAddress.country} • {order.shippingAddress.phone}
                  </div>
                  <div className="text-[11px] font-mono text-cyan-300 pt-1">
                    {order.shippingAddress.email}
                  </div>
                </div>

                {/* Financial Summary & Actions (3 Cols) */}
                <div className="lg:col-span-3 flex flex-col justify-between rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-3 space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-zinc-400">
                      <span>Subtotal:</span>
                      <span className="font-mono">{formatPrice(order.subtotal)}</span>
                    </div>

                    {order.paymentInfo.couponCode && (
                      <div className="flex justify-between text-amber-300 font-semibold">
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {order.paymentInfo.couponCode}:
                        </span>
                        <span className="font-mono">
                          -{formatPrice(order.couponDiscount)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-zinc-200 font-bold border-t border-zinc-800 pt-1">
                      <span>Settled:</span>
                      <span className="font-mono text-emerald-400 text-sm">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Admin Multi-Stage Fulfillment Action Controls */}
                  <div className="pt-2">
                    {order.status === "PENDING_APPROVAL" && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="luxury"
                          size="sm"
                          className="flex-1 text-xs justify-center"
                          disabled={isUpdating}
                          onClick={() => handleApproveOrder(order.id)}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Accept Order
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="px-2"
                          disabled={isUpdating}
                          onClick={() => handleRejectOrder(order.id)}
                          title="Reject Order"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}

                    {order.status === "APPROVED" && (
                      <Button
                        variant="luxury"
                        size="sm"
                        className="w-full text-xs justify-center"
                        disabled={isUpdating}
                        onClick={() => handleDispatchOrder(order.id)}
                      >
                        <Truck className="h-3.5 w-3.5 mr-1.5" />
                        Dispatch via Armored Carrier
                      </Button>
                    )}

                    {order.status === "DISPATCHED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs justify-center text-amber-300 border-amber-500/40 hover:bg-amber-500/10"
                        disabled={isUpdating}
                        onClick={() => handleAdvanceStatus(order.id, "IN_TRANSIT", "Armored convoy en route across regional hubs")}
                      >
                        <Navigation className="h-3.5 w-3.5 mr-1.5" />
                        Mark In Armed Transit
                      </Button>
                    )}

                    {order.status === "IN_TRANSIT" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs justify-center text-amber-300 border-amber-500/40 hover:bg-amber-500/10"
                        disabled={isUpdating}
                        onClick={() => handleAdvanceStatus(order.id, "OUT_FOR_DELIVERY", "Armored courier van dispatched for private handover")}
                      >
                        <Truck className="h-3.5 w-3.5 mr-1.5" />
                        Mark Out for Delivery
                      </Button>
                    )}

                    {order.status === "OUT_FOR_DELIVERY" && (
                      <Button
                        variant="luxury"
                        size="sm"
                        className="w-full text-xs justify-center bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
                        disabled={isUpdating}
                        onClick={() => handleAdvanceStatus(order.id, "DELIVERED", "Client identity confirmed and biometric handover signed")}
                      >
                        <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                        Confirm Biometric Delivery
                      </Button>
                    )}

                    {order.status === "DELIVERED" && (
                      <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 font-mono py-1">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Fulfillment Completed</span>
                      </div>
                    )}

                    {order.status === "CANCELLED" && (
                      <div className="text-[11px] text-rose-400 font-mono text-center py-1">
                        Order Voided
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
