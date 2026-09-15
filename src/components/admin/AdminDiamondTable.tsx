"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
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
import { formatPrice, formatCarat } from "@/lib/utils";
import { IDiamond } from "@/types/diamond.types";
import {
  Search,
  X,
  Edit2,
  Trash2,
  ExternalLink,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Gem,
} from "lucide-react";

interface AdminDiamondTableProps {
  diamonds: IDiamond[];
  totalCount: number;
  onEdit: (diamond: IDiamond) => void;
  onDelete: (diamond: IDiamond) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
}

export function AdminDiamondTable({
  diamonds,
  totalCount,
  onEdit,
  onDelete,
  searchQuery,
  onSearchChange,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  totalPages,
}: AdminDiamondTableProps) {
  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="space-y-4 rounded-2xl border border-stone-200/80 bg-white p-4 sm:p-6 shadow-xs">
      {/* 1. Header & Quick Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <span>Gemstone Inventory Lots</span>
            <Badge variant="cyan" className="text-[11px] font-mono">
              {totalCount} Certified
            </Badge>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Registered lab-grown certified diamonds with real-time vault inventory, pricing, and specs.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-stone-500 self-start sm:self-center shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 px-3 py-1.5 text-stone-700 border border-stone-200 shadow-xs">
            <Gem className="h-3.5 w-3.5 text-amber-600" />
            <span>Vault Registry:</span>
            <strong className="text-stone-900 font-bold">{totalCount} lots</strong>
          </span>
        </div>
      </div>

      {/* 2. Action Toolbar: Search + Rows Per Page */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-50/70 p-2.5 sm:p-3 rounded-xl border border-stone-200/80">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <Input
            placeholder="Search by diamond name, SKU, shape, certificate..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-8 text-xs h-9 bg-white border-stone-200 focus:border-stone-400 w-full rounded-lg shadow-xs"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-stone-400 hover:text-stone-700"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 text-xs text-stone-500 font-mono w-full sm:w-auto">
          <span className="text-stone-500">
            Showing <strong className="text-stone-900 font-semibold">{startRecord}</strong>-
            <strong className="text-stone-900 font-semibold">{endRecord}</strong> of{" "}
            <strong className="text-stone-900 font-semibold">{totalCount}</strong>
          </span>

          <div className="hidden sm:block h-4 w-px bg-stone-200" />

          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-stone-600 text-[11px] sm:text-xs">Rows:</span>
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

      {/* 3. Shadcn UI Table */}
      <div className="rounded-xl border border-stone-200 overflow-hidden bg-white shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Gemstone Lot</TableHead>
              <TableHead className="min-w-[150px]">The 4 Cs</TableHead>
              <TableHead className="w-[130px]">Lab & Cert</TableHead>
              <TableHead className="w-[100px]">Original</TableHead>
              <TableHead className="w-[90px]">Discount</TableHead>
              <TableHead className="w-[120px]">Final Price</TableHead>
              <TableHead className="w-[110px]">Vault Stock</TableHead>
              <TableHead className="w-[90px]">Tier</TableHead>
              <TableHead className="w-[110px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {diamonds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-44 text-center">
                  <div className="space-y-2 py-6">
                    <Gem className="mx-auto h-8 w-8 text-stone-300" />
                    <p className="text-xs sm:text-sm font-medium text-stone-600">
                      No gemstone lots found matching your search criteria.
                    </p>
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSearchChange("")}
                        className="text-xs text-stone-500 underline"
                      >
                        Clear Search Filter
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              diamonds.map((diamond) => {
                const img =
                  diamond.images && diamond.images.length > 0
                    ? diamond.images[0]
                    : "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=200&q=80";

                return (
                  <TableRow
                    key={diamond._id}
                    className="hover:bg-stone-50/70 transition-colors group"
                  >
                    {/* Gemstone Lot */}
                    <TableCell className="align-middle">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-50 shadow-xs">
                          <Image
                            src={img}
                            alt={diamond.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 max-w-[190px]">
                          <div className="font-semibold text-stone-900 truncate text-xs sm:text-sm">
                            {diamond.name}
                          </div>
                          <div className="text-[10px] font-mono text-amber-700">
                            SKU: {diamond.sku}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* 4 Cs */}
                    <TableCell className="align-middle font-mono text-xs">
                      <div className="font-semibold text-stone-900">
                        {formatCarat(diamond.carat)} • {diamond.shape}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {diamond.color} / {diamond.clarity} • {diamond.cut}
                      </div>
                    </TableCell>

                    {/* Lab & Cert */}
                    <TableCell className="align-middle">
                      <span className="font-mono text-xs font-semibold text-stone-800">
                        {diamond.lab}
                      </span>
                      <div className="text-[10px] font-mono text-stone-400 truncate max-w-[120px]">
                        #{diamond.certificateNumber}
                      </div>
                    </TableCell>

                    {/* Original Price */}
                    <TableCell className="align-middle font-mono text-xs text-stone-400">
                      {formatPrice(diamond.price)}
                    </TableCell>

                    {/* Discount */}
                    <TableCell className="align-middle">
                      {diamond.discountPercentage > 0 ? (
                        <Badge variant="gold" className="font-mono text-[10px]">
                          {diamond.discountPercentage}% OFF
                        </Badge>
                      ) : (
                        <span className="text-stone-300 font-mono text-xs">-</span>
                      )}
                    </TableCell>

                    {/* Final Price */}
                    <TableCell className="align-middle font-mono text-xs font-bold text-stone-900">
                      {formatPrice(diamond.finalPrice)}
                    </TableCell>

                    {/* Vault Stock */}
                    <TableCell className="align-middle font-mono text-xs">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          diamond.stockQuantity > 0
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {diamond.stockQuantity > 0
                          ? `${diamond.stockQuantity} in vault`
                          : "Out of stock"}
                      </span>
                    </TableCell>

                    {/* Tier */}
                    <TableCell className="align-middle">
                      {diamond.featured ? (
                        <Badge variant="cyan" className="gap-1 text-[10px]">
                          <Sparkles className="h-3 w-3" />
                          Featured
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-stone-500">
                          Standard
                        </Badge>
                      )}
                    </TableCell>

                    {/* Action Buttons */}
                    <TableCell className="align-middle text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/diamonds/${diamond._id}`}
                          target="_blank"
                          title="View Live Listing"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-stone-400 hover:text-stone-900 hover:bg-stone-100"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(diamond)}
                          className="h-7 w-7 p-0 text-stone-400 hover:text-stone-900 hover:bg-stone-100"
                          title="Edit Diamond"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(diamond)}
                          className="h-7 w-7 p-0 text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Diamond"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* 4. Pagination Controls Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-stone-600">
        <div>
          Showing <span className="font-semibold text-stone-900">{startRecord}</span> to{" "}
          <span className="font-semibold text-stone-900">{endRecord}</span> of{" "}
          <span className="font-semibold text-stone-900">{totalCount}</span> gemstones
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
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

          {/* Page Indicator Buttons */}
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
