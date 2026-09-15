import React from "react";
import { IAdminInventoryStats } from "@/types/admin.types";
import { formatPrice } from "@/lib/utils";
import { Gem, DollarSign, Scale, Tag, AlertTriangle } from "lucide-react";

interface AdminStatsGridProps {
  stats: IAdminInventoryStats;
}

export function AdminStatsGrid({ stats }: AdminStatsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
      {/* 1. Total Diamonds */}
      <div className="rounded-xl border border-stone-200/80 bg-white p-3 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] sm:text-xs uppercase font-mono tracking-wider text-stone-500 truncate">
            Total Diamonds
          </span>
          <Gem className="h-4 w-4 text-amber-600 shrink-0" />
        </div>
        <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold font-mono text-stone-900 truncate">
          {stats.totalDiamonds}
        </div>
        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-stone-400 truncate">Foundry cultivated lots</p>
      </div>

      {/* 2. Total Catalog Value */}
      <div className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-mono tracking-wider text-stone-500">
            Vault Valuation
          </span>
          <DollarSign className="h-4 w-4 text-emerald-600" />
        </div>
        <div className="mt-2 text-2xl font-bold font-mono text-stone-900">
          {formatPrice(stats.totalInventoryValue)}
        </div>
        <p className="mt-1 text-[11px] text-stone-400">Direct foundry value</p>
      </div>

      {/* 3. Total Carats */}
      <div className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-mono tracking-wider text-stone-500">
            Total Carats
          </span>
          <Scale className="h-4 w-4 text-cyan-600" />
        </div>
        <div className="mt-2 text-2xl font-bold font-mono text-stone-900">
          {stats.totalCarats} ct
        </div>
        <p className="mt-1 text-[11px] text-stone-400">Total crystallized weight</p>
      </div>

      {/* 4. Featured Rare Curations */}
      <div className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-mono tracking-wider text-stone-500">
            Featured Lots
          </span>
          <Tag className="h-4 w-4 text-rose-500" />
        </div>
        <div className="mt-2 text-2xl font-bold font-mono text-stone-900">
          {stats.featuredCount}
        </div>
        <p className="mt-1 text-[11px] text-stone-400">Frontpage showcases</p>
      </div>

      {/* 5. Out of Stock Alert */}
      <div className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-mono tracking-wider text-stone-500">
            Out of Stock
          </span>
          <AlertTriangle className={`h-4 w-4 ${stats.outOfStockCount > 0 ? "text-amber-600" : "text-stone-300"}`} />
        </div>
        <div className={`mt-2 text-2xl font-bold font-mono ${stats.outOfStockCount > 0 ? "text-amber-700" : "text-stone-400"}`}>
          {stats.outOfStockCount}
        </div>
        <p className="mt-1 text-[11px] text-stone-400">Needs replenishment</p>
      </div>
    </div>
  );
}
