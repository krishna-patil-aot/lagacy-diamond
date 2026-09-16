"use client";
/* eslint-disable react-hooks/incompatible-library */

import React, { useState } from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  DataTableToolbar,
  DataTableFilterDropdown,
} from "./data-table-toolbar";
import { GlobalPagination } from "./pagination";

import { Database, Loader2 } from "lucide-react";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalCount?: number;
  pageCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  filterDropdowns?: DataTableFilterDropdown[];
  actionButton?: React.ReactNode;
  onResetFilters?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  renderMobileCard?: (item: TData) => React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalCount = data.length,
  pageCount = 1,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filterDropdowns,
  actionButton,
  onResetFilters,
  emptyTitle = "No records found",

  emptyDescription = "There are currently no items matching your criteria in the registry.",
  renderMobileCard,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      {(onSearchChange || filterDropdowns?.length || actionButton) && (
        <DataTableToolbar
          searchPlaceholder={searchPlaceholder}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          filterDropdowns={filterDropdowns}
          actionButton={actionButton}
          onResetFilters={onResetFilters}
        />
      )}

      {/* Main Table & Mobile Card Container */}
      <div className="rounded-xl border border-stone-200/80 bg-white shadow-xs overflow-hidden">
        {/* Mobile & Tablet Card View (rendered when renderMobileCard prop is provided) */}
        {renderMobileCard && (
          <div className="block lg:hidden p-3 sm:p-4 bg-stone-50/30">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-stone-200/80 shadow-xs">
                <Loader2 className="h-6 w-6 animate-spin text-amber-600 mb-2" />
                <span className="text-xs font-mono text-stone-500">
                  Querying vault inventory records...
                </span>
              </div>
            ) : data.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {data.map((item, idx) => (
                  <React.Fragment key={idx}>
                    {renderMobileCard(item)}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-stone-200/80 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-400 mb-2">
                  <Database className="h-5 w-5" />
                </div>
                <h4 className="font-serif text-sm font-semibold text-stone-800">
                  {emptyTitle}
                </h4>
                <p className="text-xs text-stone-500 mt-1 max-w-xs">
                  {emptyDescription}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Desktop Table View */}
        <div
          className={`table-scroll-container ${renderMobileCard ? "hidden lg:block" : "block"}`}
        >
          <Table>
            <TableHeader className="bg-stone-50/80 border-b border-stone-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-xs font-semibold text-stone-700 py-3.5 px-4 tracking-tight whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-48 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 text-stone-500">
                      <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                      <span className="text-xs font-mono">
                        Querying vault inventory records...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-b border-stone-100 hover:bg-stone-50/60 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 px-4 text-xs">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-44 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 py-6 text-stone-500">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-400">
                        <Database className="h-5 w-5" />
                      </div>
                      <h4 className="font-serif text-sm font-semibold text-stone-800">
                        {emptyTitle}
                      </h4>
                      <p className="text-xs text-stone-500 max-w-sm">
                        {emptyDescription}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Global Shared Pagination Component */}
        {onPageChange && (
          <GlobalPagination
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={pageSize}
            pageCount={pageCount}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
