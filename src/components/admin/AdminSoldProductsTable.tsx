"use client";

import React from "react";
import Image from "next/image";
import { useAdminSoldProducts } from "@/hooks/useAdminSoldProducts";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  DollarSign,
  Gem,
  Scale,
  TrendingUp,
  Search,
  Truck,
  CheckCircle2,
  Clock,
} from "lucide-react";

export function AdminSoldProductsTable() {
  const {
    filteredSoldProducts,
    stats,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
  } = useAdminSoldProducts();

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
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Sales Metric KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-stone-200/90 bg-white p-4 shadow-xs">
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

        <div className="rounded-xl border border-stone-200/90 bg-white p-4 shadow-xs">
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

        <div className="rounded-xl border border-stone-200/90 bg-white p-4 shadow-xs">
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

        <div className="rounded-xl border border-stone-200/90 bg-white p-4 shadow-xs">
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

      {/* 2. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Search by gemstone, SKU, buyer, or GIA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-stone-500 font-mono flex-shrink-0">Filter Status:</span>
          {["ALL", "APPROVED", "DISPATCHED", "IN_TRANSIT", "DELIVERED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-2.5 py-1 text-xs font-mono transition-colors flex-shrink-0 ${
                statusFilter === status
                  ? "bg-stone-900 text-white font-medium shadow-xs"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {status === "ALL" ? "All Sales" : status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Sold Products Table */}
      <div className="rounded-2xl border border-stone-200/90 bg-white shadow-xs overflow-hidden">
        {filteredSoldProducts.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Gem className="mx-auto h-12 w-12 text-stone-300" />
            <h3 className="font-serif text-lg font-light text-stone-800">
              No Sold Products Found
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              When client diamond reservations are approved and dispatched, their sold lot records and buyer settlement details will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-mono uppercase tracking-wider text-stone-500">
                  <th className="py-3 px-4">Gemstone Lot</th>
                  <th className="py-3 px-4">4Cs Specifications</th>
                  <th className="py-3 px-4">VIP Client / Buyer</th>
                  <th className="py-3 px-4">Settled Price</th>
                  <th className="py-3 px-4">Order Ref & Date</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
                {filteredSoldProducts.map((item, idx) => (
                  <tr
                    key={`${item.orderId}-${item.diamondId}-${idx}`}
                    className="hover:bg-stone-50/50 transition-colors"
                  >
                    {/* Gemstone Lot */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 rounded-lg overflow-hidden border border-stone-200 bg-stone-900 flex-shrink-0">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-stone-900 truncate max-w-[200px]">
                            {item.name}
                          </div>
                          <div className="text-[11px] font-mono text-stone-400">
                            SKU: {item.sku}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 4Cs Specifications */}
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <div className="text-stone-900 font-medium">
                        {item.carat} ct • {item.shape}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {item.color} / {item.clarity} • {item.cut} Cut
                      </div>
                      <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
                        {item.lab} #{item.certificateNumber}
                      </div>
                    </td>

                    {/* VIP Client / Buyer */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-stone-900">
                        {item.buyerName}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate max-w-[180px]">
                        {item.buyerEmail}
                      </div>
                      <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                        {item.buyerCity}, {item.buyerCountry}
                      </div>
                    </td>

                    {/* Settled Price */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-sm font-bold text-emerald-700">
                        {formatPrice(item.soldPrice)}
                      </div>
                      {item.originalPrice > item.soldPrice && (
                        <div className="text-[11px] text-stone-400 line-through">
                          {formatPrice(item.originalPrice)}
                        </div>
                      )}
                      <div className="text-[10px] text-stone-500 uppercase mt-0.5">
                        {item.paymentMethod.replace("_", " ")}
                      </div>
                    </td>

                    {/* Order Ref & Date */}
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <div className="font-bold text-stone-900">
                        #{item.orderNumber}
                      </div>
                      <div className="text-[11px] text-stone-500" suppressHydrationWarning>
                        {new Date(item.soldDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </td>

                    {/* Fulfillment Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(item.orderStatus)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
