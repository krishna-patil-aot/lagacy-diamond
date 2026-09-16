"use client";

import React from "react";
import { Input } from "@/components/ui/Input";
import { FormSelect, FormSelectOption } from "@/components/ui/FormSelect";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface DataTableFilterDropdown {
  label: string;
  value: string;
  options: FormSelectOption[];
  onChange: (value: string) => void;
}

export interface DataTableToolbarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  filterDropdowns?: DataTableFilterDropdown[];
  actionButton?: React.ReactNode;
  onResetFilters?: () => void;
}

export function DataTableToolbar({
  searchPlaceholder = "Search records...",
  searchValue,
  onSearchChange,
  filterDropdowns,
  actionButton,
  onResetFilters,
}: DataTableToolbarProps) {
  const hasActiveFilters = Boolean(
    searchValue?.trim() ||
    filterDropdowns?.some(
      (f) => f.value && f.value !== "ALL" && f.value !== "",
    ),
  );

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-50/70 p-2.5 sm:p-3 rounded-xl border border-stone-200/80">
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        {onSearchChange && (
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-8 text-xs h-9 bg-white border-stone-200"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        {filterDropdowns?.map((filter, index) => (
          <div key={index} className="w-36 sm:w-44">
            <FormSelect
              value={filter.value}
              onChange={filter.onChange}
              options={filter.options}
              className="text-xs h-9 bg-white"
            />
          </div>
        ))}

        {hasActiveFilters && onResetFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-9 px-2.5 text-xs text-stone-500 hover:text-stone-900"
          >
            <X className="h-3 w-3 mr-1" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      {actionButton && <div className="shrink-0">{actionButton}</div>}
    </div>
  );
}
