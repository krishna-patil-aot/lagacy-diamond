"use client";

import React from "react";
import Image from "next/image";
import { Edit2, Trash2, ExternalLink, Sparkles } from "lucide-react";
import { IDiamond } from "@/types/diamond.types";
import { formatPrice, formatCarat } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

interface AdminDiamondTableProps {
  diamonds: IDiamond[];
  onEdit: (diamond: IDiamond) => void;
  onDelete: (diamond: IDiamond) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function AdminDiamondTable({
  diamonds,
  onEdit,
  onDelete,
  searchQuery,
  onSearchChange,
}: AdminDiamondTableProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-stone-200/80 bg-white p-4 sm:p-6 shadow-sm">
      {/* Table Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-serif font-medium text-stone-900">Vault Inventory Lots</h3>
          <p className="text-xs text-stone-500">
            Showing {diamonds.length} registered lab-grown certified gemstones
          </p>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Filter table by SKU, cut, or cert..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-stone-200 bg-stone-50/80 px-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400"
          />
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto rounded-xl border border-stone-200">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-stone-200 bg-stone-50/80 text-[11px] font-mono uppercase tracking-wider text-stone-500">
            <tr>
              <th className="py-3.5 pl-4 pr-3">Gemstone</th>
              <th className="px-3 py-3.5">The 4 Cs</th>
              <th className="px-3 py-3.5">Lab & Cert</th>
              <th className="px-3 py-3.5">Original</th>
              <th className="px-3 py-3.5">Discount</th>
              <th className="px-3 py-3.5">Final Price</th>
              <th className="px-3 py-3.5">Stock</th>
              <th className="px-3 py-3.5">Status</th>
              <th className="py-3.5 pl-3 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 bg-white">
            {diamonds.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-stone-400">
                  No diamond records found matching your criteria.
                </td>
              </tr>
            ) : (
              diamonds.map((diamond) => {
                const img =
                  diamond.images && diamond.images.length > 0
                    ? diamond.images[0]
                    : "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=200&q=80";

                return (
                  <tr
                    key={diamond._id}
                    className="hover:bg-stone-50/80 transition-colors group"
                  >
                    {/* Gemstone Thumbnail & Name */}
                    <td className="py-3 pl-4 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-50">
                          <Image
                            src={img}
                            alt={diamond.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="max-w-[180px]">
                          <div className="font-medium text-stone-900 truncate">
                            {diamond.name}
                          </div>
                          <div className="text-[10px] font-mono text-amber-700">
                            {diamond.sku}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 4 Cs */}
                    <td className="px-3 py-3">
                      <div className="font-medium text-stone-800">
                        {formatCarat(diamond.carat)} • {diamond.shape}
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono">
                        {diamond.color} / {diamond.clarity} / {diamond.cut}
                      </div>
                    </td>

                    {/* Lab */}
                    <td className="px-3 py-3">
                      <span className="font-semibold text-stone-700">
                        {diamond.lab}
                      </span>
                      <div className="text-[10px] font-mono text-stone-400 truncate max-w-[120px]">
                        {diamond.certificateNumber}
                      </div>
                    </td>

                    {/* Original Price */}
                    <td className="px-3 py-3 font-mono text-stone-400">
                      {formatPrice(diamond.price)}
                    </td>

                    {/* Discount */}
                    <td className="px-3 py-3">
                      {diamond.discountPercentage > 0 ? (
                        <Badge variant="gold" className="font-mono">
                          {diamond.discountPercentage}% OFF
                        </Badge>
                      ) : (
                        <span className="text-stone-300 font-mono">-</span>
                      )}
                    </td>

                    {/* Final Price */}
                    <td className="px-3 py-3 font-mono font-bold text-stone-900">
                      {formatPrice(diamond.finalPrice)}
                    </td>

                    {/* Stock Quantity */}
                    <td className="px-3 py-3">
                      <span
                        className={`font-mono font-medium ${
                          diamond.stockQuantity > 0
                            ? "text-stone-700"
                            : "text-rose-600 font-bold"
                        }`}
                      >
                        {diamond.stockQuantity} in vault
                      </span>
                    </td>

                    {/* Featured / Live */}
                    <td className="px-3 py-3">
                      {diamond.featured ? (
                        <Badge variant="cyan" className="gap-1 text-[10px]">
                          <Sparkles className="h-3 w-3" />
                          Featured
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          Standard
                        </Badge>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 pl-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/diamonds/${diamond._id}`}
                          target="_blank"
                          className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                          title="View Live Catalog Listing"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => onEdit(diamond)}
                          className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                          title="Edit Diamond"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(diamond)}
                          className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete Diamond"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
