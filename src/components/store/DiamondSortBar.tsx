"use client";

import React from "react";
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import { useFilterStore } from "@/store/useFilterStore";
import { DiamondSortOption } from "@/types/filter.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

interface DiamondSortBarProps {
  totalCount: number;
  isFilterOpen: boolean;
  onToggleFilter: () => void;
}

export function DiamondSortBar({
  totalCount,
  isFilterOpen,
  onToggleFilter,
}: DiamondSortBarProps) {
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    shapes,
    toggleShape,
    colors,
    toggleColor,
    cuts,
    toggleCut,
    clarities,
    toggleClarity,
    minDiscount,
    setMinDiscount,
    resetFilters,
    activeFilterCount,
  } = useFilterStore();

  const count = activeFilterCount();

  return (
    <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-3.5 sm:p-4 shadow-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Input
            icon={<Search className="h-4 w-4 text-stone-400" />}
            type="text"
            placeholder="Search by shape, SKU, or IGI/GIA certificate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 bg-stone-50/70 border-stone-200 text-xs sm:text-sm focus-visible:bg-white focus-visible:border-stone-400 pr-8"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Count, On-Demand Filter Button & Sort Controls */}
        <div className="flex items-center justify-between gap-2.5 sm:justify-end">
          <span className="text-xs font-mono text-stone-500 hidden md:inline">
            <span className="text-stone-900 font-bold">{totalCount}</span> Diamonds
          </span>

          {/* ON-DEMAND FILTER TOGGLE BUTTON */}
          <Button
            variant={isFilterOpen ? "default" : "outline"}
            size="sm"
            onClick={onToggleFilter}
            className="flex items-center gap-1.5 text-xs font-medium h-9"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
            {count > 0 && (
              <span className={`rounded-full text-[10px] font-bold px-1.5 py-0.2 ${
                isFilterOpen ? "bg-white text-stone-900" : "bg-stone-900 text-white"
              }`}>
                {count}
              </span>
            )}
            {isFilterOpen ? (
              <ChevronUp className="h-3.5 w-3.5 ml-0.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
            )}
          </Button>

          {/* Shadcn UI Sort Dropdown */}
          <div className="flex items-center gap-1.5">
            <Select
              value={sortBy}
              onValueChange={(val) => setSortBy(val as DiamondSortOption)}
            >
              <SelectTrigger className="w-[175px] h-9 text-xs border-stone-200 bg-white">
                <SelectValue placeholder="Sort Collection" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="featured">Featured Curations</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="carat_desc">Carat: High to Low</SelectItem>
                <SelectItem value="discount_desc">Direct Discount</SelectItem>
                <SelectItem value="newest">Recently Cultivated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {count > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100 text-xs">
          <span className="text-stone-400 font-mono text-[11px] mr-1">
            Active:
          </span>

          {shapes.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 rounded-full bg-stone-100 border border-stone-200 px-2.5 py-0.5 text-stone-700 text-[11px]"
            >
              {s}
              <button onClick={() => toggleShape(s)} className="hover:text-stone-950">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {colors.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-amber-900 text-[11px]"
            >
              Color {c}
              <button onClick={() => toggleColor(c)} className="hover:text-amber-950">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {cuts.map((cut) => (
            <span
              key={cut}
              className="inline-flex items-center gap-1 rounded-full bg-stone-100 border border-stone-200 px-2.5 py-0.5 text-stone-700 text-[11px]"
            >
              Cut: {cut}
              <button onClick={() => toggleCut(cut)} className="hover:text-stone-950">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {clarities.map((cl) => (
            <span
              key={cl}
              className="inline-flex items-center gap-1 rounded-full bg-stone-100 border border-stone-200 px-2.5 py-0.5 text-stone-700 text-[11px]"
            >
              Clarity: {cl}
              <button onClick={() => toggleClarity(cl)} className="hover:text-stone-950">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {minDiscount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-2.5 py-0.5 text-orange-900 text-[11px]">
              Min {minDiscount}% Off
              <button onClick={() => setMinDiscount(0)} className="hover:text-orange-950">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          <button
            onClick={resetFilters}
            className="text-[11px] text-stone-400 hover:text-stone-900 underline ml-2 cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}
