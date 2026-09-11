"use client";

import React, { useState } from "react";
import { useDiamonds } from "@/hooks/useDiamonds";
import { useFilterStore } from "@/store/useFilterStore";
import { DiamondCard } from "@/components/store/DiamondCard";
import { DiamondFilterSidebar } from "@/components/store/DiamondFilterSidebar";
import { DiamondSortBar } from "@/components/store/DiamondSortBar";
import { DiamondQuickViewModal } from "@/components/store/DiamondQuickViewModal";
import { IDiamond } from "@/types/diamond.types";
import { Button } from "@/components/ui/Button";
import { Gem, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

export default function DiamondsCatalogPage() {
  const { diamonds, meta, isLoading, error, refetch } = useDiamonds();
  const { page, setPage, resetFilters } = useFilterStore();
  const [quickViewDiamond, setQuickViewDiamond] = useState<IDiamond | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Page Header */}
      <div className="border-b border-stone-200 pb-5">
        <div className="flex items-center gap-2">
          <Gem className="h-4 w-4 text-amber-700" />
          <span className="text-xs uppercase font-mono tracking-widest text-stone-500">
            Laboratory Cultivation Vault
          </span>
        </div>
        <h1 className="mt-1 font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 tracking-tight">
          Legacy Diamond Collection
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
          Grown in our advanced diamond laboratory with zero mining impact. Pure optical clarity, laser-inscribed certifications, and direct foundry pricing.
        </p>
      </div>

      {/* Sort, Search, and On-Demand Filter Controls */}
      <DiamondSortBar
        totalCount={meta?.totalCount || diamonds.length}
        isFilterOpen={isFilterOpen}
        onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
      />

      {/* ON-DEMAND COLLAPSIBLE FILTER PANEL */}
      {isFilterOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <DiamondFilterSidebar />
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={refetch}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading Skeleton State */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="aspect-[4/5] rounded-2xl border border-stone-200 bg-white shadow-xs animate-pulse"
            />
          ))}
        </div>
      ) : diamonds.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-stone-200 bg-white py-16 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-500">
            <SlidersHorizontal className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-900">
              No Lab-Grown Diamonds Match This Filter
            </h3>
            <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
              Try adjusting the carat weight range, price slider, or selecting additional shapes.
            </p>
          </div>
          <Button variant="luxury" size="sm" onClick={resetFilters}>
            Reset All Filters
          </Button>
        </div>
      ) : (
        /* Full Width Diamond Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {diamonds.map((diamond) => (
            <DiamondCard
              key={diamond._id}
              diamond={diamond}
              onQuickView={(d) => setQuickViewDiamond(d)}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-stone-200 pt-6">
          <span className="text-xs font-mono text-stone-500">
            Page {meta.currentPage} of {meta.totalPages} ({meta.totalCount} diamonds)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Quick View Dialog */}
      <DiamondQuickViewModal
        diamond={quickViewDiamond}
        isOpen={Boolean(quickViewDiamond)}
        onClose={() => setQuickViewDiamond(null)}
      />
    </div>
  );
}
