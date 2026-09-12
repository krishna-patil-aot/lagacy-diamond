"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { IDiamond } from "@/types/diamond.types";
import { useAdminOrders } from "@/hooks/useAdminOrders";
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
import { Input } from "@/components/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { formatPrice } from "@/lib/utils";
import { IOrder, OrderStatus } from "@/types/order.types";
import {
  Check,
  X,
  Clock,
  ShieldCheck,
  MapPin,
  Tag,
  ShoppingBag,
  Truck,
  Navigation,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Phone,
  Mail,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useOrderDocumentsEmail } from "@/hooks/useOrderDocumentsEmail";

export function AdminOrderApprovalList() {
  const {
    orders,
    paginatedOrders,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalFilteredCount,
    pendingCount,
    approvedCount,
    dispatchedCount,
    deliveredCount,
    cancelledCount,
    handleApproveOrder,
    handleDispatchOrder,
    handleAdvanceStatus,
    handleRejectOrder,
    refetch,
    isUpdating,
  } = useAdminOrders();

  const [inspectOrderId, setInspectOrderId] = useState<string | null>(null);
  const inspectOrder = useMemo(() => {
    if (!inspectOrderId) return null;
    const target = inspectOrderId.toUpperCase().trim();
    return (
      orders.find(
        (o) =>
          (o.id && o.id.toUpperCase() === target) ||
          (o.orderNumber && o.orderNumber.toUpperCase() === target)
      ) || null
    );
  }, [inspectOrderId, orders]);

  const setInspectOrder = (order: IOrder | null) => {
    setInspectOrderId(order ? order.orderNumber || order.id : null);
  };

  const { sendOrderDocuments, isSending } = useOrderDocumentsEmail();

  const startRecord = totalFilteredCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalFilteredCount);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return (
          <Badge variant="gold" className="text-[11px] gap-1 font-mono">
            <Clock className="h-3 w-3" /> Awaiting Review
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge variant="success" className="text-[11px] gap-1 font-mono">
            <ShieldCheck className="h-3 w-3" /> Approved
          </Badge>
        );
      case "DISPATCHED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 text-[11px] font-mono font-medium">
            <Truck className="h-3 w-3" /> Dispatched
          </span>
        );
      case "IN_TRANSIT":
      case "OUT_FOR_DELIVERY":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-[11px] font-mono font-medium animate-pulse">
            <Truck className="h-3 w-3" /> In Transit
          </span>
        );
      case "DELIVERED":
        return (
          <Badge variant="success" className="text-[11px] gap-1 font-mono">
            <ShieldCheck className="h-3 w-3" /> Delivered
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="destructive" className="text-[11px] font-mono">
            Voided
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-4 sm:p-6 shadow-xs">
      {/* 1. Top Header & Overview Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 tracking-tight">
              Client Order Approvals & Vault Dispatch
            </h3>
            {pendingCount > 0 && (
              <Badge variant="gold" className="text-[11px] gap-1 animate-pulse font-mono">
                <Clock className="h-3 w-3" /> {pendingCount} Pending Review
              </Badge>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage gemstone order approvals, review customer verification, and authorize armored transit dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-stone-500 self-start sm:self-center shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-8 text-xs text-stone-600 hover:text-stone-900 border-stone-200 shadow-2xs"
            title="Synchronize orders with vault database"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1 text-stone-500" />
            <span>Sync</span>
          </Button>
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 px-3 py-1.5 text-stone-700 border border-stone-200 shadow-xs">
            <ShoppingBag className="h-3.5 w-3.5 text-stone-500" />
            <span>Total Orders:</span>
            <strong className="text-stone-900 font-bold">{orders.length}</strong>
          </span>
        </div>
      </div>

      {/* 2. Status Filter Tabs (Dedicated row with horizontal scroll, perfectly aligned, never wraps awkwardly) */}
      <div className="overflow-x-auto pb-1 -mt-1 scrollbar-none">
        <div className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-100/80 p-1 text-xs min-w-max">
          {(
            [
              { id: "ALL", label: "All Orders", count: orders.length },
              { id: "PENDING_APPROVAL", label: "Pending Review", count: pendingCount },
              { id: "APPROVED", label: "Approved", count: approvedCount },
              { id: "DISPATCHED", label: "In Transit", count: dispatchedCount },
              { id: "DELIVERED", label: "Delivered", count: deliveredCount },
              { id: "CANCELLED", label: "Cancelled", count: cancelledCount },
            ] as const
          ).map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <Button
                key={tab.id}
                variant={isActive ? "luxury" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter(tab.id as OrderStatus | "ALL")}
                className={`h-8 px-3.5 text-xs font-medium transition-all whitespace-nowrap shrink-0 rounded-lg ${
                  isActive
                    ? "bg-stone-900 text-white shadow-xs hover:bg-stone-800 font-semibold"
                    : "text-stone-600 hover:text-stone-900 hover:bg-white/80"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-mono leading-none ${
                      isActive
                        ? "bg-stone-800 text-amber-300 font-bold"
                        : "bg-stone-200/90 text-stone-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* 3. Search Bar & Controls Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-50/70 p-2.5 sm:p-3 rounded-xl border border-stone-200/80">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <Input
            placeholder="Search by order #, client name, email, city, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 text-xs h-9 bg-white border-stone-200 focus:border-stone-400 w-full rounded-lg shadow-xs"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-stone-400 hover:text-stone-700"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-stone-500 font-mono">
          <span className="hidden sm:inline text-stone-500">
            Showing <strong className="text-stone-900 font-semibold">{startRecord}</strong>-
            <strong className="text-stone-900 font-semibold">{endRecord}</strong> of{" "}
            <strong className="text-stone-900 font-semibold">{totalFilteredCount}</strong>
          </span>

          <div className="hidden sm:block h-4 w-px bg-stone-200" />

          <div className="flex items-center gap-2">
            <span className="text-stone-600">Rows per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                setPageSize(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[76px] rounded-lg border-stone-200 bg-white px-2.5 py-1 text-xs font-mono text-stone-900 shadow-xs focus:ring-stone-400">
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent align="end" className="min-w-[5rem] rounded-xl border-stone-200 bg-white shadow-lg">
                <SelectItem value="5" className="text-xs font-mono">5</SelectItem>
                <SelectItem value="10" className="text-xs font-mono">10</SelectItem>
                <SelectItem value="20" className="text-xs font-mono">20</SelectItem>
                <SelectItem value="50" className="text-xs font-mono">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Shadcn Table */}
      <div className="rounded-xl border border-stone-200 overflow-hidden bg-white shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50/80 border-b border-stone-200">
              <TableHead className="w-[150px] font-mono text-xs py-3.5 px-4">Order Reference</TableHead>
              <TableHead className="min-w-[190px] text-xs py-3.5 px-4">Client Details</TableHead>
              <TableHead className="min-w-[210px] text-xs py-3.5 px-4">Gemstone Lots</TableHead>
              <TableHead className="w-[140px] text-xs py-3.5 px-4">Settlement</TableHead>
              <TableHead className="w-[150px] text-xs py-3.5 px-4">Fulfillment Status</TableHead>
              <TableHead className="w-[210px] text-right text-xs py-3.5 px-4">Curator Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-44 text-center">
                  <div className="space-y-2 py-6">
                    <ShoppingBag className="mx-auto h-8 w-8 text-stone-300" />
                    <p className="text-xs sm:text-sm font-medium text-stone-600">
                      No client orders found matching your search and filter criteria.
                    </p>
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchQuery("")}
                        className="text-xs text-stone-500 underline"
                      >
                        Clear Search Query
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-stone-50/70 transition-colors border-b border-stone-100">
                  {/* 1. Order ID & Date */}
                  <TableCell className="align-middle font-mono py-3.5 px-4">
                    <div className="font-bold text-stone-900 text-xs sm:text-sm">
                      #{order.orderNumber || order.id}
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-[11px] text-stone-500 mt-1 font-mono" suppressHydrationWarning>
                      <Clock className="h-3 w-3 text-stone-400 shrink-0" />
                      <span>
                        {new Date(order.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-400 font-mono pl-4.5" suppressHydrationWarning>
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </TableCell>

                  {/* 2. Client Details */}
                  <TableCell className="align-middle py-3.5 px-4">
                    <div className="font-semibold text-stone-900 text-xs sm:text-sm truncate max-w-[190px]">
                      {order.shippingAddress?.fullName || "Private Client"}
                    </div>
                    <div className="text-[11px] text-stone-500 inline-flex items-center gap-1.5 mt-1 truncate max-w-[190px]">
                      <Mail className="h-3 w-3 text-stone-400 shrink-0" />
                      <span className="truncate">{order.shippingAddress?.email}</span>
                    </div>
                    <div className="text-[11px] text-stone-500 inline-flex items-center gap-1.5 mt-0.5">
                      <Phone className="h-3 w-3 text-stone-400 shrink-0" />
                      <span>{order.shippingAddress?.phone}</span>
                    </div>
                    <div className="text-[10px] text-stone-400 inline-flex items-center gap-1.5 mt-0.5 truncate max-w-[190px]">
                      <MapPin className="h-3 w-3 text-amber-600 shrink-0" />
                      <span className="truncate">
                        {order.shippingAddress?.city}, {order.shippingAddress?.state}
                      </span>
                    </div>
                  </TableCell>

                  {/* 3. Gemstones Lots */}
                  <TableCell className="align-middle py-3.5 px-4">
                    <div className="space-y-1.5">
                      {order.items.slice(0, 2).map((item) => (
                        <div key={item._id} className="flex items-center gap-2.5">
                          <div className="relative h-9 w-9 rounded-lg overflow-hidden border border-stone-200 bg-stone-50 shrink-0 shadow-2xs">
                            <Image
                              src={item.images[0] || ""}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-stone-900 truncate max-w-[160px]">
                              {item.name}
                            </div>
                            <div className="text-[10px] font-mono text-stone-500">
                              {item.carat} ct • {item.shape} • {item.lab} #{item.certificateNumber}
                            </div>
                          </div>
                        </div>
                      ))}

                      {order.items.length > 2 && (
                        <span className="text-[10px] font-mono text-stone-500 italic block pl-1">
                          +{order.items.length - 2} more gemstone lot(s)
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* 4. Settlement & Total */}
                  <TableCell className="align-middle font-mono py-3.5 px-4">
                    <div className="font-bold text-stone-900 text-xs sm:text-sm">
                      {formatPrice(order.totalAmount)}
                    </div>
                    {order.couponDiscount > 0 && (
                      <div className="text-[10px] text-emerald-700 font-semibold inline-flex items-center gap-1 mt-1">
                        <Tag className="h-3 w-3 shrink-0" />
                        <span>Saved {formatPrice(order.couponDiscount)}</span>
                      </div>
                    )}
                    <div className="text-[10px] text-stone-500 mt-1 uppercase block">
                      {order.paymentInfo?.method?.replace("_", " ") || "Card"}
                    </div>
                  </TableCell>

                  {/* 5. Status Badge */}
                  <TableCell className="align-middle py-3.5 px-4">
                    <div className="inline-flex items-center">
                      {getStatusBadge(order.status)}
                    </div>
                  </TableCell>

                  {/* 6. Actions */}
                  <TableCell className="align-middle py-3.5 px-4 text-right">
                    <div className="flex flex-col items-end justify-center gap-1.5">
                      {order.status === "PENDING_APPROVAL" && (
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            variant="luxury"
                            size="sm"
                            className="h-7 text-xs px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs inline-flex items-center gap-1 whitespace-nowrap"
                            disabled={isUpdating}
                            onClick={() => handleApproveOrder(order.id)}
                            title="Accept and Approve Order"
                          >
                            <Check className="h-3.5 w-3.5 shrink-0" />
                            <span>Accept</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-rose-700 border-rose-300 bg-rose-50 hover:bg-rose-100 hover:text-rose-900 inline-flex items-center gap-1"
                            disabled={isUpdating}
                            onClick={() => handleRejectOrder(order.id)}
                            title="Reject / Cancel Order"
                          >
                            <X className="h-3.5 w-3.5 shrink-0" />
                          </Button>
                        </div>
                      )}

                      {order.status === "APPROVED" && (
                        <Button
                          variant="luxury"
                          size="sm"
                          className="h-7 text-xs px-2.5 inline-flex items-center gap-1.5 shadow-xs whitespace-nowrap"
                          disabled={isUpdating}
                          onClick={() => handleDispatchOrder(order.id)}
                        >
                          <Truck className="h-3.5 w-3.5 shrink-0" />
                          <span>Dispatch</span>
                        </Button>
                      )}

                      {order.status === "DISPATCHED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2.5 text-amber-900 border-amber-300 bg-amber-50 hover:bg-amber-100 inline-flex items-center gap-1.5 whitespace-nowrap"
                          disabled={isUpdating}
                          onClick={() =>
                            handleAdvanceStatus(
                              order.id,
                              "IN_TRANSIT",
                              "Armored convoy en route across regional logistics hubs"
                            )
                          }
                        >
                          <Navigation className="h-3.5 w-3.5 shrink-0" />
                          <span>In Transit</span>
                        </Button>
                      )}

                      {order.status === "IN_TRANSIT" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2.5 text-amber-900 border-amber-300 bg-amber-50 hover:bg-amber-100 inline-flex items-center gap-1.5 whitespace-nowrap"
                          disabled={isUpdating}
                          onClick={() =>
                            handleAdvanceStatus(
                              order.id,
                              "OUT_FOR_DELIVERY",
                              "Armored courier van dispatched for scheduled handover"
                            )
                          }
                        >
                          <Truck className="h-3.5 w-3.5 shrink-0" />
                          <span>Out for Delivery</span>
                        </Button>
                      )}

                      {order.status === "OUT_FOR_DELIVERY" && (
                        <Button
                          variant="luxury"
                          size="sm"
                          className="h-7 text-xs px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 inline-flex items-center gap-1.5 whitespace-nowrap shadow-xs"
                          disabled={isUpdating}
                          onClick={() =>
                            handleAdvanceStatus(
                              order.id,
                              "DELIVERED",
                              "Client identity verified and biometric delivery confirmed"
                            )
                          }
                        >
                          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                          <span>Confirm Delivery</span>
                        </Button>
                      )}

                      {order.status === "DELIVERED" && (
                        <span className="text-[11px] font-mono text-emerald-700 font-semibold inline-flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>Fulfilled</span>
                        </span>
                      )}

                      {order.status === "CANCELLED" && (
                        <span className="text-[11px] font-mono text-rose-700 font-medium inline-flex items-center gap-1">
                          <X className="h-3 w-3 shrink-0" />
                          <span>Lot Released</span>
                        </span>
                      )}

                      {/* Admin Email Documents Dispatch Action - Only displayed when order is Fulfilled */}
                      {order.status === "DELIVERED" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => sendOrderDocuments(order)}
                          disabled={isSending(order.id)}
                          className="h-6 px-2 text-[11px] font-mono text-stone-700 hover:text-stone-900 border-stone-200 bg-white hover:bg-stone-50 shadow-2xs inline-flex items-center gap-1 whitespace-nowrap"
                          title={`Dispatch official invoice and certificates to ${order.shippingAddress?.email || "customer"}`}
                        >
                          {isSending(order.id) ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin text-amber-600 shrink-0" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <Mail className="h-3 w-3 text-amber-600 shrink-0" />
                              <span>Email Docs</span>
                            </>
                          )}
                        </Button>
                      )}

                      {/* View Details Modal Trigger */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setInspectOrder(order)}
                        className="h-6 px-2 text-[11px] text-stone-600 hover:text-stone-900 font-mono hover:bg-stone-100 mt-0.5 inline-flex items-center gap-1 whitespace-nowrap"
                      >
                        <Eye className="h-3 w-3 shrink-0" />
                        <span>View Details</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-stone-600">
        <div>
          Showing <span className="font-semibold text-stone-900">{startRecord}</span> to{" "}
          <span className="font-semibold text-stone-900">{endRecord}</span> of{" "}
          <span className="font-semibold text-stone-900">{totalFilteredCount}</span> orders
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(1)}
            title="First Page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            title="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page Indicators */}
          <div className="flex items-center gap-1 px-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === totalPages ||
                  Math.abs(p - currentPage) <= 1
              )
              .map((pageNumber, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && pageNumber - prev > 1;

                return (
                  <React.Fragment key={pageNumber}>
                    {showEllipsis && <span className="px-1 text-stone-400">…</span>}
                    <Button
                      variant={currentPage === pageNumber ? "luxury" : "outline"}
                      size="sm"
                      className={`h-8 w-8 p-0 text-xs font-mono ${
                        currentPage === pageNumber
                          ? "bg-stone-900 text-white font-bold shadow-xs"
                          : "text-stone-700 hover:bg-stone-100"
                      }`}
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  </React.Fragment>
                );
              })}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            title="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(totalPages)}
            title="Last Page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Order Inspection Detail Dialog */}
      {inspectOrder && (
        <Dialog open={Boolean(inspectOrder)} onOpenChange={(open) => !open && setInspectOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Order Reference #{inspectOrder.orderNumber || inspectOrder.id}</DialogTitle>
                <div>{getStatusBadge(inspectOrder.status)}</div>
              </div>
              <DialogDescription>
                Placed on {new Date(inspectOrder.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs pt-2">
              {/* Shipping Destination */}
              <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-semibold flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-amber-600" />
                  <span>Insured Delivery Address</span>
                </span>
                <div className="font-semibold text-stone-900 text-sm">{inspectOrder.shippingAddress?.fullName}</div>
                <div className="text-stone-600">{inspectOrder.shippingAddress?.street}</div>
                <div className="text-stone-600">
                  {inspectOrder.shippingAddress?.city}, {inspectOrder.shippingAddress?.state} {inspectOrder.shippingAddress?.postalCode}, {inspectOrder.shippingAddress?.country}
                </div>
                <div className="text-stone-600 font-mono pt-0.5">
                  Phone: {inspectOrder.shippingAddress?.phone} • Email: {inspectOrder.shippingAddress?.email}
                </div>
              </div>

              {/* Items in Order */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-semibold block">
                  Gemstone Lots ({inspectOrder.items.length})
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {inspectOrder.items.map((item: IDiamond) => (
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
                          <div className="font-semibold text-stone-900">{item.name}</div>
                          <div className="text-[11px] font-mono text-stone-500">
                            {item.carat} ct • {item.shape} • {item.color}/{item.clarity} • Cut: {item.cut}
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
                  <span className="font-mono text-stone-900 font-medium">{formatPrice(inspectOrder.subtotal)}</span>
                </div>
                {inspectOrder.couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount:</span>
                    <span className="font-mono">-{formatPrice(inspectOrder.couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Insured Armored Courier Transit:</span>
                  <span className="font-mono text-emerald-700 font-semibold">FREE / COMPLIMENTARY</span>
                </div>
                <div className="flex justify-between text-stone-900 font-bold border-t border-stone-200 pt-1.5 text-sm">
                  <span>Settlement Total:</span>
                  <span className="font-mono text-base text-emerald-700">{formatPrice(inspectOrder.totalAmount)}</span>
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
                    Recipient: <strong className="text-amber-300">{inspectOrder.shippingAddress?.email}</strong>
                  </div>
                </div>

                {inspectOrder.status === "DELIVERED" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="luxury"
                    onClick={() => sendOrderDocuments(inspectOrder)}
                    disabled={isSending(inspectOrder.id)}
                    className="h-7 text-xs font-mono gap-1.5 shrink-0 shadow-xs"
                  >
                    {isSending(inspectOrder.id) ? (
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
                    {inspectOrder.status === "CANCELLED"
                      ? "Order voided"
                      : "Email available once order is fulfilled"}
                  </span>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
