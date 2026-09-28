"use client";

import React from "react";
import Image from "next/image";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { IOrder, OrderStatus } from "@/types/order.types";
import {
  Clock,
  ShieldCheck,
  Truck,
  ShoppingBag,
  Eye,
  ArrowRight,
  CreditCard,
  Building,
  Lock,
  Award,
  X,
  Loader2,
  QrCode,
} from "lucide-react";
import Link from "next/link";
import { DoorstepPaymentModal } from "@/components/orders/DoorstepPaymentModal";

interface UserOrdersTableProps {
  orders: IOrder[];
  isLoading: boolean;
  searchQuery: string;
  onClearSearch: () => void;
  onInspectOrder: (order: IOrder) => void;
  onCancelOrder?: (orderId: string) => Promise<boolean | void>;
  isCancelling?: boolean;
}

export function UserOrdersTable({
  orders,
  isLoading,
  searchQuery,
  onClearSearch,
  onInspectOrder,
  onCancelOrder,
  isCancelling = false,
}: UserOrdersTableProps) {
  const [doorstepPaymentOrder, setDoorstepPaymentOrder] = React.useState<IOrder | null>(null);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return (
          <Badge variant="gold" className="text-[11px] font-mono inline-flex items-center gap-1.5 px-2.5 py-0.5 whitespace-nowrap">
            <Clock className="h-3 w-3 shrink-0" />
            <span>Awaiting Review</span>
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge variant="success" className="text-[11px] font-medium inline-flex items-center gap-1.5 px-2.5 py-0.5 whitespace-nowrap shrink-0">
            <ShieldCheck className="h-3 w-3 shrink-0" />
            <span>Vault Sealed</span>
          </Badge>
        );
      case "DISPATCHED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap shrink-0">
            <Truck className="h-3 w-3 shrink-0" />
            <span>Dispatched</span>
          </span>
        );
      case "IN_TRANSIT":
      case "OUT_FOR_DELIVERY":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 text-[11px] font-medium animate-pulse whitespace-nowrap shrink-0">
            <Truck className="h-3 w-3 shrink-0" />
            <span>In Armed Transit</span>
          </span>
        );
      case "DELIVERED":
        return (
          <Badge variant="success" className="text-[11px] font-medium inline-flex items-center gap-1.5 px-2.5 py-0.5 whitespace-nowrap shrink-0">
            <ShieldCheck className="h-3 w-3 shrink-0" />
            <span>Delivered & Signed</span>
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="destructive" className="text-[11px] font-medium inline-flex items-center gap-1.5 px-2.5 py-0.5 whitespace-nowrap shrink-0">
            <X className="h-3 w-3 shrink-0" />
            <span>Cancelled</span>
          </Badge>
        );
      default:
        return <Badge variant="outline" className="text-[11px] font-medium whitespace-nowrap shrink-0">{status}</Badge>;
    }
  };

  const getPaymentBadge = (method: string) => {
    switch (method) {
      case "VAULT_ESCROW":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 whitespace-nowrap">
            <Lock className="h-2.5 w-2.5 text-amber-600 shrink-0" />
            <span>Vault Escrow</span>
          </span>
        );
      case "WIRE_TRANSFER":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 whitespace-nowrap">
            <Building className="h-2.5 w-2.5 text-stone-500 shrink-0" />
            <span>Wire Transfer</span>
          </span>
        );
      case "DIGITAL_COD_UPI":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
            <QrCode className="h-2.5 w-2.5 text-emerald-600 shrink-0" />
            <span>Digital COD (UPI)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 whitespace-nowrap">
            <CreditCard className="h-2.5 w-2.5 text-stone-500 shrink-0" />
            <span>Secured Card</span>
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-16 text-center space-y-3 shadow-xs">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-amber-700 mx-auto" />
        <span className="text-xs font-mono text-stone-600 uppercase tracking-wider block font-medium">
          Loading your diamond vault records...
        </span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center space-y-4 shadow-xs">
        <ShoppingBag className="mx-auto h-12 w-12 text-stone-300" />
        <div className="space-y-1">
          <h3 className="font-serif text-lg font-bold text-stone-800">
            No Orders Found
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {searchQuery
              ? `No certified orders match "${searchQuery}". Try modifying your search or filter.`
              : "You do not have any diamond orders matching the current filter. Explore our curated catalog to acquire certified gemstones."}
          </p>
        </div>
        {searchQuery ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSearch}
            className="text-xs"
          >
            Clear Search Filter
          </Button>
        ) : (
          <Link href="/diamonds">
            <Button variant="luxury" size="sm" className="px-6 text-xs">
              Explore Certified Diamonds
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 overflow-hidden bg-white shadow-xs">
      {/* Mobile & Tablet Card View (visible on screen widths < lg) */}
      <div className="block lg:hidden p-3 sm:p-4 bg-stone-50/40">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {orders.map((order) => {
            const primaryItem = order.items[0];
            const remainingCount = order.items.length - 1;
            const trackingCode =
              order.trackingInfo?.trackingNumber ||
              `BRK-${order.orderNumber || order.id}`;

            return (
              <div
                key={order.id}
                onClick={() => onInspectOrder(order)}
                className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-xs hover:border-amber-400/80 hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="space-y-3">
                  {/* Card Header: Order # & Status */}
                  <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2.5">
                    <div>
                      <span className="font-mono text-xs font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
                        #{order.orderNumber || order.id}
                      </span>
                      <div
                        className="flex items-center gap-1.5 text-[11px] font-mono text-stone-500 mt-0.5"
                        suppressHydrationWarning
                      >
                        <Clock className="h-3 w-3 text-stone-400 shrink-0" />
                        <span>
                          {new Date(order.createdAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">{getStatusBadge(order.status)}</div>
                  </div>

                  {/* Gemstone Lot Preview */}
                  {primaryItem && (
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0 shadow-2xs">
                        <Image
                          src={primaryItem.images[0] || ""}
                          alt={primaryItem.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-stone-900 text-xs truncate">
                          {primaryItem.name}
                        </div>
                        <div className="text-[11px] font-mono text-amber-900">
                          {primaryItem.carat} ct • {primaryItem.shape} • {primaryItem.color}/{primaryItem.clarity}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                            <Award className="h-2.5 w-2.5 text-amber-600 shrink-0" />
                            <span>{primaryItem.lab || "GIA"} #{primaryItem.certificateNumber}</span>
                          </span>
                          {remainingCount > 0 && (
                            <span className="inline-flex items-center text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                              +{remainingCount} more lot{remainingCount > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Settlement & Logistics Information Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-stone-400 uppercase block">Settlement</span>
                      <span className="font-mono font-bold text-stone-900 text-sm">
                        {formatPrice(order.totalAmount)}
                      </span>
                      <div className="mt-1">{getPaymentBadge(order.paymentInfo?.method || "CREDIT_CARD")}</div>
                      {order.couponDiscount > 0 && (
                        <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                          Saved: -{formatPrice(order.couponDiscount)}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-stone-400 uppercase block">Logistics Ref</span>
                      <div className="text-[11px] font-mono text-stone-700 font-semibold truncate mt-0.5">
                        {trackingCode}
                      </div>
                      <div className="text-[10px] text-stone-500 flex items-center gap-1 mt-1 truncate">
                        <Truck className="h-3 w-3 text-stone-400 shrink-0" />
                        <span className="truncate">{order.trackingInfo?.carrier || "Brink's Armored"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div
                  className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-stone-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    type="button"
                    variant="luxury"
                    size="sm"
                    onClick={() => onInspectOrder(order)}
                    className="flex-1 min-w-[120px] h-8 text-xs font-medium shadow-2xs inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <Eye className="h-3.5 w-3.5 shrink-0" />
                    <span>Track & Details</span>
                  </Button>

                  {order.paymentInfo?.method === "DIGITAL_COD_UPI" &&
                    order.status !== "CANCELLED" && (
                      <>
                        {order.paymentInfo.paymentStatus === "PAID" ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDoorstepPaymentOrder(order)}
                            className="h-8 text-xs font-medium inline-flex items-center justify-center gap-1.5 whitespace-nowrap border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
                          >
                            <Lock className="h-3.5 w-3.5 shrink-0" />
                            <span>OTP: {order.paymentInfo.deliveryHandoverOtp || "Revealed"}</span>
                          </Button>
                        ) : order.status === "OUT_FOR_DELIVERY" ? (
                          <Button
                            type="button"
                            variant="luxury"
                            size="sm"
                            onClick={() => setDoorstepPaymentOrder(order)}
                            className="h-8 text-xs font-medium inline-flex items-center justify-center gap-1.5 whitespace-nowrap bg-emerald-700 hover:bg-emerald-800 text-white animate-pulse"
                          >
                            <QrCode className="h-3.5 w-3.5 shrink-0" />
                            <span>Pay at Doorstep (QR)</span>
                          </Button>
                        ) : (
                          <span
                            className="h-8 px-2 text-[10px] font-mono inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-100/80 text-stone-600"
                            title="Payment unlocks when courier arrives at delivery address"
                          >
                            <Lock className="h-2.5 w-2.5 text-stone-400 shrink-0" />
                            <span>Pay on Arrival</span>
                          </span>
                        )}
                      </>
                    )}

                  {order.status === "PENDING_APPROVAL" && onCancelOrder && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isCancelling}
                      onClick={() => onCancelOrder(order.id)}
                      className="h-8 text-xs px-2.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-medium inline-flex items-center justify-center gap-1 shrink-0 whitespace-nowrap"
                    >
                      {isCancelling ? (
                        <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                      ) : (
                        <X className="h-3 w-3 shrink-0" />
                      )}
                      <span>Cancel</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop Table View (visible on screen widths >= lg) */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50/80 border-b border-stone-200">
              <TableHead className="w-[160px] font-mono text-xs py-3.5 px-4 whitespace-nowrap">Order Reference</TableHead>
              <TableHead className="min-w-[270px] text-xs py-3.5 px-4 whitespace-nowrap">Gemstone Lot(s)</TableHead>
              <TableHead className="w-[150px] text-xs py-3.5 px-4 whitespace-nowrap">Settlement</TableHead>
              <TableHead className="min-w-[200px] text-xs py-3.5 px-4 whitespace-nowrap">Tracking & Status</TableHead>
              <TableHead className="min-w-[240px] text-right text-xs py-3.5 px-4 whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const primaryItem = order.items[0];
              const remainingCount = order.items.length - 1;
              const trackingCode =
                order.trackingInfo?.trackingNumber ||
                `BRK-${order.orderNumber || order.id}`;

              return (
                <TableRow
                  key={order.id}
                  className="hover:bg-amber-50/20 transition-colors border-b border-stone-100 cursor-pointer"
                  onClick={() => onInspectOrder(order)}
                >
                  {/* 1. Order Reference */}
                  <TableCell className="align-middle font-mono py-3.5 px-4">
                    <div className="font-bold text-stone-900 text-xs sm:text-sm">
                      #{order.orderNumber || order.id}
                    </div>
                    <div
                      className="text-[11px] text-stone-500 mt-1 flex items-center gap-1.5 font-mono"
                      suppressHydrationWarning
                    >
                      <Clock className="h-3 w-3 text-stone-400 shrink-0" />
                      <span>
                        {new Date(order.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div
                      className="text-[10px] text-stone-400 font-mono pl-4.5"
                      suppressHydrationWarning
                    >
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </TableCell>

                  {/* 2. Gemstones Lot */}
                  <TableCell className="align-middle py-3.5 px-4">
                    {primaryItem ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <div className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0 shadow-2xs">
                            <Image
                              src={primaryItem.images[0] || ""}
                              alt={primaryItem.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-stone-900 text-xs sm:text-sm truncate max-w-[210px]">
                              {primaryItem.name}
                            </div>
                            <div className="text-[11px] font-mono text-amber-800">
                              {primaryItem.carat} ct • {primaryItem.shape} • {primaryItem.color}/{primaryItem.clarity}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                            <Award className="h-2.5 w-2.5 text-amber-600 shrink-0" />
                            <span>{primaryItem.lab || "GIA"} #{primaryItem.certificateNumber}</span>
                          </span>

                          {remainingCount > 0 && (
                            <span className="inline-flex items-center text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                              +{remainingCount} more lot{remainingCount > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-stone-400 font-mono">No lots attached</span>
                    )}
                  </TableCell>

                  {/* 3. Settlement */}
                  <TableCell className="align-middle py-3.5 px-4 font-mono">
                    <div className="font-bold text-stone-900 text-xs sm:text-sm">
                      {formatPrice(order.totalAmount)}
                    </div>
                    <div className="mt-1">
                      {getPaymentBadge(order.paymentInfo?.method || "CREDIT_CARD")}
                    </div>
                    {order.couponDiscount > 0 && (
                      <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                        Saved: -{formatPrice(order.couponDiscount)}
                      </div>
                    )}
                  </TableCell>

                  {/* 4. Tracking & Status */}
                  <TableCell className="align-middle py-3.5 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center">{getStatusBadge(order.status)}</div>
                      <div className="text-[11px] font-mono text-stone-600 truncate max-w-[190px] flex items-center gap-1">
                        <Truck className="h-3 w-3 text-stone-400 shrink-0" />
                        <span className="truncate">{order.trackingInfo?.carrier || "Brink's Armored Services"}</span>
                      </div>
                      <div className="text-[10px] font-mono text-stone-400 pl-4">
                        Ref: <strong className="text-stone-700 font-semibold">{trackingCode}</strong>
                      </div>
                    </div>
                  </TableCell>

                  {/* 5. Actions */}
                  <TableCell
                    className="align-middle py-3.5 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="luxury"
                        size="sm"
                        onClick={() => onInspectOrder(order)}
                        className="h-7 text-xs px-2.5 font-mono shadow-2xs inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                        title="View custody timeline and details"
                      >
                        <Eye className="h-3.5 w-3.5 shrink-0" />
                        <span>Track & Details</span>
                      </Button>

                      {order.paymentInfo?.method === "DIGITAL_COD_UPI" &&
                        order.status !== "CANCELLED" && (
                          <>
                            {order.paymentInfo.paymentStatus === "PAID" ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setDoorstepPaymentOrder(order)}
                                className="h-7 text-xs font-medium inline-flex items-center gap-1 px-2.5 whitespace-nowrap border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
                              >
                                <Lock className="h-3 w-3 shrink-0" />
                                <span>OTP: {order.paymentInfo.deliveryHandoverOtp || "View"}</span>
                              </Button>
                            ) : order.status === "OUT_FOR_DELIVERY" ? (
                              <Button
                                type="button"
                                variant="luxury"
                                size="sm"
                                onClick={() => setDoorstepPaymentOrder(order)}
                                className="h-7 text-xs font-medium inline-flex items-center gap-1 px-2.5 whitespace-nowrap bg-emerald-700 hover:bg-emerald-800 text-white animate-pulse"
                              >
                                <QrCode className="h-3 w-3 shrink-0" />
                                <span>Pay at Doorstep</span>
                              </Button>
                            ) : (
                              <span
                                className="h-7 px-2.5 text-[10px] font-mono inline-flex items-center gap-1 rounded-md border border-stone-200 bg-stone-100 text-stone-600 cursor-default"
                                title="Payment QR unlocks when the courier arrives at your address"
                              >
                                <Lock className="h-2.5 w-2.5 text-stone-400 shrink-0" />
                                <span>Pay on Arrival</span>
                              </span>
                            )}
                          </>
                        )}

                      {order.status === "PENDING_APPROVAL" && onCancelOrder && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isCancelling}
                          onClick={() => onCancelOrder(order.id)}
                          className="h-7 text-xs px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-mono inline-flex items-center gap-1"
                          title="Cancel order before vault curator verification"
                        >
                          {isCancelling ? (
                            <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                          ) : (
                            <X className="h-3 w-3 shrink-0" />
                          )}
                          <span>Cancel</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Doorstep Dynamic QR & OTP Release Modal */}
      <DoorstepPaymentModal
        order={doorstepPaymentOrder}
        isOpen={Boolean(doorstepPaymentOrder)}
        onClose={() => setDoorstepPaymentOrder(null)}
      />
    </div>
  );
}
