"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isLoading?: boolean;
  itemName?: string;
  pageSizeOptions?: number[];
  className?: string;
}

export function GlobalPagination({
  currentPage,
  totalCount,
  pageSize,
  pageCount,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  itemName = "lots",
  pageSizeOptions = [5, 10, 25, 50],
  className = "",
}: PaginationProps) {
  const safePageCount = Math.max(1, pageCount);
  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-200/80 px-4 py-3 bg-stone-50/50 text-xs text-stone-500 rounded-b-xl ${className}`}
    >
      {/* Records Info & Page Size */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 w-full sm:w-auto">
        <span className="font-mono text-[11px] sm:text-xs">
          Showing{" "}
          <strong className="text-stone-800 font-semibold">
            {startRecord}
          </strong>{" "}
          -{" "}
          <strong className="text-stone-800 font-semibold">{endRecord}</strong>{" "}
          of{" "}
          <strong className="text-stone-800 font-semibold">{totalCount}</strong>{" "}
          {itemName}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-1">
            <span className="text-stone-500 text-[11px]">Rows:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => onPageSizeChange(Number(val))}
            >
              <SelectTrigger className="h-7 w-[64px] text-xs bg-white border-stone-200 shadow-2xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((opt) => (
                  <SelectItem key={opt} value={String(opt)} className="text-xs">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Page Navigation Controls */}
      <div className="flex items-center justify-center gap-1 w-full sm:w-auto">
        <span className="font-mono mr-2 text-[11px] text-stone-600">
          Page {currentPage} of {safePageCount}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1 || isLoading}
          className="h-7 w-7 p-0 border-stone-200 bg-white hover:bg-stone-100 hover:text-stone-900"
          title="First page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          className="h-7 w-7 p-0 border-stone-200 bg-white hover:bg-stone-100 hover:text-stone-900"
          title="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= safePageCount || isLoading}
          className="h-7 w-7 p-0 border-stone-200 bg-white hover:bg-stone-100 hover:text-stone-900"
          title="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safePageCount)}
          disabled={currentPage >= safePageCount || isLoading}
          className="h-7 w-7 p-0 border-stone-200 bg-white hover:bg-stone-100 hover:text-stone-900"
          title="Last page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default GlobalPagination;
