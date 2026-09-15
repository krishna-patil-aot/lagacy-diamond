"use client";

import React from "react";
import { IFilterMeta } from "@/types/filter.types";
import { useDiamondPagination } from "@/hooks/useDiamondPagination";
import { Button } from "@/components/ui/Button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Layers,
} from "lucide-react";

export interface DiamondPaginationProps {
  meta: IFilterMeta | null;
  targetScrollElementId?: string;
  className?: string;
}

export function DiamondPagination({
  meta,
  targetScrollElementId = "diamonds-catalog-section",
  className = "",
}: DiamondPaginationProps) {
  const {
    currentPage,
    totalPages,
    totalCount,
    limit,
    pageSizeOptions,
    startRecord,
    endRecord,
    hasNextPage,
    hasPrevPage,
    pageNumbers,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setPageSize,
  } = useDiamondPagination({ meta, targetScrollElementId });

  if (!meta || totalCount === 0) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl border border-stone-200 bg-white/90 p-4 sm:p-5 shadow-xs backdrop-blur-xs flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${className}`}
    >
      {/* Left: Summary & Cards Per Page Selector */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 w-full md:w-auto text-xs text-stone-600">
        {/* Count summary */}
        <div className="font-mono text-[11px] sm:text-xs">
          Showing{" "}
          <span className="font-semibold text-stone-900">{startRecord}</span>{" "}
          to <span className="font-semibold text-stone-900">{endRecord}</span>{" "}
          of{" "}
          <span className="font-semibold text-stone-900">{totalCount}</span>{" "}
          diamonds
          <span className="ml-1 text-stone-400">
            (Page {currentPage} of {totalPages})
          </span>
        </div>

        <span className="hidden sm:inline-block text-stone-300">|</span>

        {/* Page Size Selector (5, 10, 15 cards) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] font-mono text-stone-500">
            <Layers className="h-3.5 w-3.5 text-amber-700" />
            <span>Cards per page:</span>
          </div>

          <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
            {pageSizeOptions.map((size) => {
              const isSelected = limit === size;
              return (
                <Button
                  key={size}
                  type="button"
                  variant={isSelected ? "luxury" : "ghost"}
                  size="sm"
                  onClick={() => setPageSize(size)}
                  className={`h-6 px-2.5 text-[11px] font-mono rounded-md transition-all ${
                    isSelected
                      ? "bg-stone-900 text-white font-bold shadow-2xs"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
                  }`}
                >
                  {size}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Page Navigation Buttons */}
      <div className="flex items-center justify-center gap-1.5 w-full md:w-auto">
        {/* First Page button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasPrevPage}
          onClick={firstPage}
          className="h-8 w-8 p-0 text-stone-600 disabled:opacity-40 hover:bg-stone-100"
          title="First Page"
          aria-label="First Page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasPrevPage}
          onClick={prevPage}
          className="h-8 w-8 p-0 text-stone-600 disabled:opacity-40 hover:bg-stone-100"
          title="Previous Page"
          aria-label="Previous Page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Numbered Page Buttons */}
        <div className="flex items-center gap-1 px-1">
          {pageNumbers.map((p, idx) => {
            if (p === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1.5 text-stone-400 font-mono text-xs select-none"
                >
                  …
                </span>
              );
            }

            const isCurrent = p === currentPage;
            return (
              <Button
                key={p}
                type="button"
                variant={isCurrent ? "luxury" : "outline"}
                size="sm"
                onClick={() => goToPage(p)}
                className={`h-8 min-w-[2rem] px-2 text-xs font-mono transition-all ${
                  isCurrent
                    ? "bg-stone-900 text-white font-bold shadow-xs hover:bg-stone-800"
                    : "text-stone-700 hover:bg-stone-100 border-stone-200"
                }`}
                aria-current={isCurrent ? "page" : undefined}
                aria-label={`Page ${p}`}
              >
                {p}
              </Button>
            );
          })}
        </div>

        {/* Next button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasNextPage}
          onClick={nextPage}
          className="h-8 w-8 p-0 text-stone-600 disabled:opacity-40 hover:bg-stone-100"
          title="Next Page"
          aria-label="Next Page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last Page button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasNextPage}
          onClick={lastPage}
          className="h-8 w-8 p-0 text-stone-600 disabled:opacity-40 hover:bg-stone-100"
          title="Last Page"
          aria-label="Last Page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
