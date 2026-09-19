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
      className={`rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3.5 transition-all ${className}`}
    >
      {/* Summary & Page Size Controls */}
      <div className="flex flex-wrap items-center justify-between sm:justify-start gap-3 w-full lg:w-auto text-xs text-stone-600">
        {/* Count summary */}
        <div className="text-xs text-stone-600">
          Showing <strong className="text-stone-900 font-semibold">{startRecord}–{endRecord}</strong> of{" "}
          <strong className="text-stone-900 font-semibold">{totalCount}</strong> diamonds
          <span className="ml-1.5 font-mono text-[11px] text-stone-400">
            (Page {currentPage} of {totalPages})
          </span>
        </div>

        <div className="hidden sm:block h-3.5 w-px bg-stone-200" />

        {/* Page Size Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-stone-500">Per page:</span>
          <div className="inline-flex items-center p-0.5 rounded-lg bg-stone-100 border border-stone-200/80">
            {pageSizeOptions.map((size) => {
              const isSelected = limit === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setPageSize(size)}
                  className={`h-6 min-w-[24px] px-2 text-[11px] font-mono rounded-md transition-all cursor-pointer ${
                    isSelected
                      ? "bg-stone-900 text-white font-semibold shadow-2xs"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-center gap-1 w-full lg:w-auto pt-1 lg:pt-0 border-t lg:border-t-0 border-stone-100">
        {/* First Page */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasPrevPage}
          onClick={firstPage}
          className="h-8 w-8 p-0 rounded-lg text-stone-600 disabled:opacity-30 hover:bg-stone-100"
          title="First Page"
          aria-label="First Page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>

        {/* Previous */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasPrevPage}
          onClick={prevPage}
          className="h-8 w-8 p-0 rounded-lg text-stone-600 disabled:opacity-30 hover:bg-stone-100"
          title="Previous Page"
          aria-label="Previous Page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        {/* Numbered Page Buttons */}
        <div className="flex items-center gap-1 px-1">
          {pageNumbers.map((p, idx) => {
            if (p === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1 text-stone-400 font-mono text-xs select-none"
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
                className={`h-8 min-w-[32px] px-2 text-xs font-mono rounded-lg transition-all ${
                  isCurrent
                    ? "bg-stone-900 text-white font-semibold shadow-xs hover:bg-stone-800"
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

        {/* Next */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasNextPage}
          onClick={nextPage}
          className="h-8 w-8 p-0 rounded-lg text-stone-600 disabled:opacity-30 hover:bg-stone-100"
          title="Next Page"
          aria-label="Next Page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>

        {/* Last */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasNextPage}
          onClick={lastPage}
          className="h-8 w-8 p-0 rounded-lg text-stone-600 disabled:opacity-30 hover:bg-stone-100"
          title="Last Page"
          aria-label="Last Page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
