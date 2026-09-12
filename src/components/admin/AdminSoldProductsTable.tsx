"use client";

import React from "react";
import Image from "next/image";
import { useAdminSoldProducts } from "@/hooks/useAdminSoldProducts";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { formatPrice } from "@/lib/utils";
import {
  DollarSign,
  Gem,
  Scale,
  TrendingUp,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export function AdminSoldProductsTable() {
  const {
    paginatedSoldProducts,
    totalFilteredCount,
    totalPages,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    stats,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
  } = useAdminSoldProducts();

  const startRecord = totalFilteredCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalFilteredCount);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 text-[10px] font-mono font-semibold">
            <Clock className="h-3 w-3" />
            Approved for Dispatch
          </span>
        );
      case "DISPATCHED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-0.5 text-[10px] font-mono font-semibold">
            <Truck className="h-3 w-3" />
            Armored Dispatched
          </span>
        );
      case "IN_TRANSIT":
      case "OUT_FOR_DELIVERY":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 text-[10px] font-mono font-semibold">
            <Truck className="h-3 w-3 animate-pulse" />
            In Armed Transit
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-mono font-semibold">
            <CheckCircle2 className="h-3 w-3" />
            Delivered & Signed
          </span>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const statusOptions = [
    { id: "ALL", label: "All Sales" },
    { id: "APPROVED", label: "Approved" },
    { id: "DISPATCHED", label: "Dispatched" },
    { id: "IN_TRANSIT", label: "In Transit" },
    { id: "DELIVERED", label: "Delivered" },
  ];

  return (
    <div className="space-y-5">
      {/* 1. Top Sales Metric KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-stone-500">
              Total Gemstones Sold
            </span>
            <Gem className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-stone-900">
            {stats.totalSoldUnits} lots
          </div>
          <p className="mt-1 text-[11px] text-stone-400">Confirmed acquisitions</p>
        </div>

        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-stone-500">
              Realized Vault Revenue
            </span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-700">
            {formatPrice(stats.totalRealizedRevenue)}
          </div>
          <p className="mt-1 text-[11px] text-stone-400">Total settled sales</p>
        </div>

        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-stone-500">
              Crystallized Weight Sold
            </span>
            <Scale className="h-4 w-4 text-cyan-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-stone-900">
            {stats.totalCaratsSold} ct
          </div>
          <p className="mt-1 text-[11px] text-stone-400">Total carat mass delivered</p>
        </div>

        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-stone-500">
              Average Lot Value
            </span>
            <TrendingUp className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-stone-900">
            {formatPrice(stats.avgOrderValue)}
          </div>
          <p className="mt-1 text-[11px] text-stone-400">Average transaction size</p>
        </div>
      </div>

      {/* 2. Status Filter Tabs (Dedicated horizontal scrollable pill row) */}
      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-100/80 p-1 text-xs min-w-max">
          {statusOptions.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <Button
                key={tab.id}
                variant={isActive ? "luxury" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter(tab.id)}
                className={`h-8 px-3.5 text-xs font-medium transition-all whitespace-nowrap shrink-0 rounded-lg ${
                  isActive
                    ? "bg-stone-900 text-white shadow-xs hover:bg-stone-800 font-semibold"
                    : "text-stone-600 hover:text-stone-900 hover:bg-white/80"
                }`}
              >
                <span>{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* 3. Action Toolbar: Search + Rows Per Page */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-50/70 p-2.5 sm:p-3 rounded-xl border border-stone-200/80">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <Input
            placeholder="Search by gemstone, SKU, buyer, or certificate..."
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

      {/* 4. Shadcn UI Table */}
      <div className="rounded-xl border border-stone-200 overflow-hidden bg-white shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Gemstone Lot</TableHead>
              <TableHead className="min-w-[150px]">4Cs Specifications</TableHead>
              <TableHead className="min-w-[170px]">VIP Client / Buyer</TableHead>
              <TableHead className="w-[140px]">Settled Price</TableHead>
              <TableHead className="w-[130px]">Order Ref & Date</TableHead>
              <TableHead className="w-[150px] text-right">Fulfillment Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSoldProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-44 text-center">
                  <div className="space-y-2 py-6">
                    <Gem className="mx-auto h-8 w-8 text-stone-300" />
                    <p className="text-xs sm:text-sm font-medium text-stone-600">
                      No sold products found matching your search and filter criteria.
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
              paginatedSoldProducts.map((item, idx) => (
                <TableRow
                  key={`${item.orderId}-${item.diamondId}-${idx}`}
                  className="hover:bg-stone-50/70 transition-colors"
                >
                  {/* Gemstone Lot */}
                  <TableCell className="align-middle">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 rounded-lg overflow-hidden border border-stone-200 bg-stone-900 flex-shrink-0 shadow-xs">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-stone-900 truncate max-w-[200px] text-xs sm:text-sm">
                          {item.name}
                        </div>
                        <div className="text-[10px] font-mono text-stone-400">
                          SKU: {item.sku}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* 4Cs Specifications */}
                  <TableCell className="align-middle font-mono text-xs">
                    <div className="text-stone-900 font-medium">
                      {item.carat} ct • {item.shape}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {item.color} / {item.clarity} • {item.cut} Cut
                    </div>
                    <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
                      {item.lab} #{item.certificateNumber}
                    </div>
                  </TableCell>

                  {/* VIP Client / Buyer */}
                  <TableCell className="align-middle text-xs">
                    <div className="font-semibold text-stone-900">
                      {item.buyerName}
                    </div>
                    <div className="text-[11px] text-stone-500 truncate max-w-[180px]">
                      {item.buyerEmail}
                    </div>
                    <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                      {item.buyerCity}, {item.buyerCountry}
                    </div>
                  </TableCell>

                  {/* Settled Price */}
                  <TableCell className="align-middle font-mono">
                    <div className="text-sm font-bold text-emerald-700">
                      {formatPrice(item.soldPrice)}
                    </div>
                    {item.originalPrice > item.soldPrice && (
                      <div className="text-[10px] text-stone-400 line-through">
                        {formatPrice(item.originalPrice)}
                      </div>
                    )}
                    <div className="text-[10px] text-stone-500 uppercase mt-0.5">
                      {item.paymentMethod.replace("_", " ")}
                    </div>
                  </TableCell>

                  {/* Order Ref & Date */}
                  <TableCell className="align-middle font-mono text-xs">
                    <div className="font-bold text-stone-900">
                      #{item.orderNumber}
                    </div>
                    <div className="text-[11px] text-stone-500" suppressHydrationWarning>
                      {new Date(item.soldDate).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </TableCell>

                  {/* Fulfillment Status */}
                  <TableCell className="align-middle text-right">
                    {getStatusBadge(item.orderStatus)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 5. Pagination Controls Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-stone-600">
        <div>
          Showing <span className="font-semibold text-stone-900">{startRecord}</span> to{" "}
          <span className="font-semibold text-stone-900">{endRecord}</span> of{" "}
          <span className="font-semibold text-stone-900">{totalFilteredCount}</span> sold lots
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
    </div>
  );
}
