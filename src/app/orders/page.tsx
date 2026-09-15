"use client";

import React from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/common/AuthGuard";
import { useUserOrders } from "@/hooks/useUserOrders";
import { UserOrdersTable } from "@/components/orders/UserOrdersTable";
import { UserOrderDetailsModal } from "@/components/orders/UserOrderDetailsModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { formatPrice } from "@/lib/utils";
import {
  Package,
  Sparkles,
  RefreshCw,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  ShieldCheck,
  Truck,
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
    paginatedOrders,
    isLoading,
    isAdmin,
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
    inspectOrder,
    setInspectOrder,
    handleCancelOrder,
    isCancelling,
    statusCounts,
    insuredTotal,
    refetch,
    orders,
  } = useUserOrders();

  const startRecord =
    totalFilteredCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalFilteredCount);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* 1. Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-700">
            <Package className="h-4 w-4" />
            <span>Private Vault Custody & Satellite Escort</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1 tracking-tight">
            My Certified Orders & Armored Tracking
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time armored logistics tracking, official purchase invoices, and GIA/IGI verified lab certificates.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && (
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-amber-800 border-amber-300 bg-amber-50 hover:bg-amber-100"
              >
                Curator Admin Portal
              </Button>
            </Link>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs text-stone-600 hover:text-stone-900"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>
          <Link href="/diamonds">
            <Button variant="luxury" size="sm" className="text-xs">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Explore Collection
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] uppercase font-mono text-stone-400 block">Total Acquisitions</span>
          <span className="text-xl sm:text-2xl font-serif font-bold text-stone-900 block mt-1">
            {orders.length}
          </span>
          <span className="text-[11px] font-mono text-stone-500 mt-0.5 block">Recorded Orders</span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] uppercase font-mono text-stone-400 block">In Armed Transit</span>
          <span className="text-xl sm:text-2xl font-serif font-bold text-amber-600 block mt-1">
            {statusCounts.inTransit}
          </span>
          <span className="text-[11px] font-mono text-amber-800 flex items-center gap-1 mt-0.5">
            <Truck className="h-3 w-3" /> Brink&apos;s Escort
          </span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] uppercase font-mono text-stone-400 block">Vault Delivered</span>
          <span className="text-xl sm:text-2xl font-serif font-bold text-emerald-600 block mt-1">
            {statusCounts.delivered}
          </span>
          <span className="text-[11px] font-mono text-emerald-800 flex items-center gap-1 mt-0.5">
            <ShieldCheck className="h-3 w-3" /> Biometric Signed
          </span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] uppercase font-mono text-stone-400 block">Insured Vault Total</span>
          <span className="text-xl sm:text-2xl font-serif font-bold font-mono text-stone-900 block mt-1">
            {formatPrice(insuredTotal)}
          </span>
          <span className="text-[11px] font-mono text-emerald-700 block mt-0.5">100% Escrow Protected</span>
        </div>
      </div>

      {/* 3. Status Filter Tabs (Horizontal scroll on mobile, like admin panel) */}
      <div className="overflow-x-auto pb-1 -mt-1 scrollbar-none">
        <div className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-100/80 p-1 text-xs min-w-max">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === "ALL"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
            }`}
          >
            <span>All Orders</span>
            <span className="rounded-full bg-stone-200/80 px-1.5 py-0.2 text-[10px] font-mono">
              {statusCounts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("PENDING_APPROVAL")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === "PENDING_APPROVAL"
                ? "bg-white text-amber-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
            }`}
          >
            <Clock className="h-3 w-3 text-amber-600" />
            <span>Awaiting Review</span>
            {statusCounts.pending > 0 && (
              <span className="rounded-full bg-amber-100 text-amber-800 px-1.5 py-0.2 text-[10px] font-mono font-bold">
                {statusCounts.pending}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("APPROVED")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === "APPROVED"
                ? "bg-white text-emerald-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
            }`}
          >
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            <span>Vault Sealed</span>
            {statusCounts.approved > 0 && (
              <span className="rounded-full bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[10px] font-mono">
                {statusCounts.approved}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("IN_TRANSIT")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === "IN_TRANSIT"
                ? "bg-white text-amber-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
            }`}
          >
            <Truck className="h-3 w-3 text-amber-600" />
            <span>In Armed Transit</span>
            {statusCounts.inTransit > 0 && (
              <span className="rounded-full bg-amber-100 text-amber-800 px-1.5 py-0.2 text-[10px] font-mono">
                {statusCounts.inTransit}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("DELIVERED")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === "DELIVERED"
                ? "bg-white text-emerald-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
            }`}
          >
            <span>Delivered</span>
            {statusCounts.delivered > 0 && (
              <span className="rounded-full bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[10px] font-mono">
                {statusCounts.delivered}
              </span>
            )}
          </button>

          {statusCounts.cancelled > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter("CANCELLED")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === "CANCELLED"
                  ? "bg-white text-rose-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
              }`}
            >
              <span>Cancelled</span>
              <span className="rounded-full bg-rose-100 text-rose-800 px-1.5 py-0.2 text-[10px] font-mono">
                {statusCounts.cancelled}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Search Bar & Rows Controls Toolbar (Like Admin Panel) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-50/70 p-2.5 sm:p-3 rounded-xl border border-stone-200/80">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <Input
            placeholder="Search by order #, diamond name, shape, SKU, cert #, city..."
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

        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 text-xs text-stone-500 font-mono w-full sm:w-auto">
          <span className="text-stone-500">
            Showing <strong className="text-stone-900 font-semibold">{startRecord}</strong>-
            <strong className="text-stone-900 font-semibold">{endRecord}</strong> of{" "}
            <strong className="text-stone-900 font-semibold">{totalFilteredCount}</strong>
          </span>

          <div className="hidden sm:block h-4 w-px bg-stone-200" />

          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-stone-600 text-[11px] sm:text-xs">Rows:</span>
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

      {/* 5. User Orders Table (Shadcn Table) */}
      <UserOrdersTable
        orders={paginatedOrders}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onClearSearch={() => setSearchQuery("")}
        onInspectOrder={(order) => setInspectOrder(order)}
        onCancelOrder={handleCancelOrder}
        isCancelling={isCancelling}
      />

      {/* 6. Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs font-mono text-stone-600">
          <div>
            Showing <strong className="text-stone-900 font-semibold">{startRecord}</strong>-
            <strong className="text-stone-900 font-semibold">{endRecord}</strong> of{" "}
            <strong className="text-stone-900 font-semibold">{totalFilteredCount}</strong> orders
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

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages)
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
      )}

      {/* 7. Detailed Order & Armored Tracking Modal */}
      <UserOrderDetailsModal
        order={inspectOrder}
        onClose={() => setInspectOrder(null)}
      />
    </div>
  );
}
