"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { AuthGuard } from "@/components/common/AuthGuard";
import { useUserOrders } from "@/hooks/useUserOrders";
import { OrderTrackingTimeline } from "@/components/orders/OrderTrackingTimeline";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import {
  Package,
  Truck,
  ShieldCheck,
  Clock,
  MapPin,
  Tag,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";

export default function OrdersPage() {
  return (
    <AuthGuard fallbackMessage="Access to client purchase history and armored transit tracking requires an authenticated session.">
      <OrdersContent />
    </AuthGuard>
  );
}

function OrdersContent() {
  const {
    filteredOrders,
    activeOrders,
    deliveredOrders,
    isLoading,
    isAdmin,
    statusFilter,
    setStatusFilter,
    refetch,
    orders,
  } = useUserOrders();

  if (isAdmin) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-stone-300 border-t-amber-800" />
        <p className="text-xs font-mono uppercase tracking-widest text-stone-600">
          Redirecting to Curator Admin Portal...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-700">
            <Package className="h-4 w-4" />
            <span>Private Vault Custody & Transit</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            My Certified Orders & Armored Tracking
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time satellite tracking for lab-grown diamond orders sealed under GIA inscription custody.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs text-stone-600 hover:text-stone-900"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh Tracking
          </Button>
          <Link href="/diamonds">
            <Button variant="luxury" size="sm" className="text-xs">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Explore Collection
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] uppercase font-mono text-stone-400 block">Total Orders</span>
          <span className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            {orders.length}
          </span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] uppercase font-mono text-stone-400 block">Active In Transit</span>
          <span className="text-xl sm:text-2xl font-serif font-bold text-amber-600">
            {activeOrders.length}
          </span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] uppercase font-mono text-stone-400 block">Vault Delivered</span>
          <span className="text-xl sm:text-2xl font-serif font-bold text-emerald-600">
            {deliveredOrders.length}
          </span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] uppercase font-mono text-stone-400 block">Insured Custody Total</span>
          <span className="text-xl sm:text-2xl font-serif font-bold font-mono text-stone-900">
            {formatPrice(orders.reduce((sum, o) => sum + o.totalAmount, 0))}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs overflow-x-auto">
        {(["ALL", "PENDING_APPROVAL", "APPROVED", "DISPATCHED", "IN_TRANSIT", "DELIVERED", "CANCELLED"] as const).map(
          (status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                statusFilter === status
                  ? "bg-stone-900 text-stone-50 shadow-xs"
                  : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              {status === "ALL" && `All Orders (${orders.length})`}
              {status === "PENDING_APPROVAL" && "Awaiting Approval"}
              {status === "APPROVED" && "Curator Approved"}
              {status === "DISPATCHED" && "Armored Dispatched"}
              {status === "IN_TRANSIT" && "In Armed Transit"}
              {status === "DELIVERED" && "Delivered"}
              {status === "CANCELLED" && "Cancelled"}
            </button>
          )
        )}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="py-20 text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900 mx-auto" />
          <span className="text-xs font-mono text-stone-400 uppercase tracking-wider block">
            Synchronizing Armored Tracking with Geneva Vault Registry...
          </span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center space-y-4 shadow-xs">
          <ShoppingBag className="mx-auto h-12 w-12 text-stone-300" />
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-stone-800">
              No Vault Orders Found
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              You do not have any orders matching the selected status filter. Explore the foundry catalog to acquire certified gemstones.
            </p>
          </div>
          <Link href="/diamonds">
            <Button variant="luxury" size="sm" className="px-6 text-xs">
              Explore Available Diamonds
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7 space-y-6 shadow-sm transition-all hover:shadow-md"
            >
              {/* Card Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-base font-bold text-stone-900">
                      #{order.orderNumber || order.id}
                    </span>
                    {order.status === "PENDING_APPROVAL" && (
                      <Badge variant="gold" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" /> Awaiting Curator Review
                      </Badge>
                    )}
                    {order.status === "APPROVED" && (
                      <Badge variant="success" className="text-xs">
                        <ShieldCheck className="h-3 w-3 mr-1" /> Approved & Vault Sealed
                      </Badge>
                    )}
                    {["DISPATCHED", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(order.status) && (
                      <Badge variant="gold" className="text-xs animate-pulse">
                        <Truck className="h-3 w-3 mr-1" /> In Armored Transit
                      </Badge>
                    )}
                    {order.status === "DELIVERED" && (
                      <Badge variant="success" className="text-xs">
                        <ShieldCheck className="h-3 w-3 mr-1" /> Hand-Delivered & Signed
                      </Badge>
                    )}
                    {order.status === "CANCELLED" && (
                      <Badge variant="destructive" className="text-xs">
                        Cancelled
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-stone-400 font-mono block" suppressHydrationWarning>
                    Placed on {new Date(order.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase font-mono text-stone-400 block">Total Settlement</span>
                  <span className="text-lg font-bold font-mono text-stone-900">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Real-World Timeline Tracker (Amazon / Flipkart Progress Bar) */}
              <OrderTrackingTimeline order={order} />

              {/* Order Items & Shipping Address Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                {/* Ordered Diamonds (7 Cols) */}
                <div className="lg:col-span-7 space-y-3">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block">
                    Certified Gemstones ({order.items.length})
                  </span>
                  <div className="space-y-2.5">
                    {order.items.map((diamond) => (
                      <div
                        key={diamond._id}
                        className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50/80 p-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-stone-200 bg-white flex-shrink-0">
                            <Image
                              src={diamond.images[0] || ""}
                              alt={diamond.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-stone-900">{diamond.name}</div>
                            <div className="text-[11px] font-mono text-amber-800">
                              {diamond.carat} ct • {diamond.shape} • {diamond.color} / {diamond.clarity} • Cut: {diamond.cut}
                            </div>
                            <div className="text-[10px] text-stone-400 font-mono">
                              Cert: {diamond.certificateNumber} ({diamond.lab || "GIA"})
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-bold text-stone-900">
                            {formatPrice(diamond.finalPrice)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address & Settlement (5 Cols) */}
                <div className="lg:col-span-5 rounded-xl border border-stone-100 bg-stone-50/60 p-4 space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-amber-700" />
                      <span>Armored Delivery Handover Location</span>
                    </span>
                    <div className="font-semibold text-stone-900 mt-1">
                      {order.shippingAddress.fullName}
                    </div>
                    <div className="text-stone-600">
                      {order.shippingAddress.street}
                    </div>
                    <div className="text-stone-600">
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                    </div>
                    <div className="text-stone-600">
                      {order.shippingAddress.country} • {order.shippingAddress.phone}
                    </div>
                    <div className="text-[11px] font-mono text-amber-800 pt-0.5">
                      {order.shippingAddress.email}
                    </div>
                  </div>

                  <div className="border-t border-stone-200 pt-3 space-y-1.5">
                    <div className="flex justify-between text-stone-500">
                      <span>Lot Subtotal:</span>
                      <span className="font-mono">{formatPrice(order.subtotal)}</span>
                    </div>

                    {order.paymentInfo.couponCode && (
                      <div className="flex justify-between text-amber-800 font-semibold">
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          Coupon Privilege ({order.paymentInfo.couponCode}):
                        </span>
                        <span className="font-mono">-{formatPrice(order.couponDiscount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-stone-500">
                      <span>Armored Insurance:</span>
                      <span className="font-mono text-emerald-700">COMPLIMENTARY</span>
                    </div>

                    <div className="flex justify-between text-stone-900 font-bold border-t border-stone-200 pt-1.5 text-sm">
                      <span>Total Valuation Settled:</span>
                      <span className="font-mono text-emerald-700">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
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
