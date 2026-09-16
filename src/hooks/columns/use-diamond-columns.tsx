"use client";

import React, { useMemo, useCallback } from "react";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { IDiamond } from "@/types/diamond.types";
import { useDiamondStore } from "@/store/diamond.store";
import {
  getEnabledColumn,
  getActionColumn,
} from "@/utils/column-helpers";

import { updateDiamondFeaturedAction } from "@/actions/diamond.action";
import { apiHandler } from "@/utils/api-handler";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatCarat } from "@/lib/utils";
import { Sparkles } from "lucide-react";

import { broadcastDiamondEvent, DIAMOND_EVENTS } from "@/lib/diamond-events";

export function useDiamondColumns(): ColumnDef<IDiamond>[] {
  const { openEditModal, openDeleteDialog, updateItemInList, openImagePreview } =
    useDiamondStore();

  const handleToggleFeatured = useCallback(
    async (diamond: IDiamond, newFeatured: boolean): Promise<boolean> => {
      const result = await apiHandler(
        () => updateDiamondFeaturedAction(diamond._id, newFeatured),
        {
          successMessage: newFeatured
            ? `${diamond.sku} featured in premier showroom`
            : `${diamond.sku} removed from featured showcase`,
          errorMessage: "Failed to update featured status",
        }
      );

      if (result.success) {
        updateItemInList({ ...diamond, featured: newFeatured });
        broadcastDiamondEvent(DIAMOND_EVENTS.FEATURED_TOGGLED, diamond._id);
        return true;
      }
      return false;
    },
    [updateItemInList]
  );

  const columns = useMemo<ColumnDef<IDiamond>[]>(
    () => [
      {
        accessorKey: "sku",
        header: () => <span className="text-xs font-semibold text-stone-700">Gemstone Lot</span>,
        cell: ({ row }) => {
          const diamond = row.original;
          const thumbnail =
            diamond.images && diamond.images.length > 0
              ? diamond.images[0]
              : "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=200&q=80";

          return (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  openImagePreview(diamond.images, diamond.name, diamond.sku)
                }
                className="relative h-10 w-10 shrink-0 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 hover:border-amber-400 hover:ring-2 hover:ring-amber-400/30 transition-all cursor-pointer group"
                title="Click to view specimen photograph"
              >
                <Image
                  src={thumbnail}
                  alt={diamond.name}
                  fill
                  sizes="40px"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  unoptimized
                />
                {diamond.featured && (
                  <span className="absolute right-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
                    <Sparkles className="h-2 w-2" />
                  </span>
                )}
              </button>
              <div className="flex flex-col min-w-0">
                <span className="font-mono text-xs font-bold text-stone-900 tracking-tight">
                  {diamond.sku}
                </span>
                <span className="text-[11px] text-stone-500 truncate max-w-[160px] sm:max-w-[200px]">
                  {diamond.name}
                </span>
              </div>
            </div>
          );
        },
      },

      {
        accessorKey: "shape",
        header: () => <span className="text-xs font-semibold text-stone-700">Shape & Specs</span>,
        cell: ({ row }) => {
          const diamond = row.original;
          return (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <Badge variant="default" className="text-[10px] font-mono px-1.5 py-0">
                  {diamond.shape}
                </Badge>
                <span className="text-xs font-bold font-mono text-stone-900">
                  {formatCarat(diamond.carat)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-stone-500">
                <span>{diamond.color}</span>
                <span>•</span>
                <span>{diamond.clarity}</span>
                <span>•</span>
                <span>{diamond.cut}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "finalPrice",
        header: () => <span className="text-xs font-semibold text-stone-700">Valuation</span>,
        cell: ({ row }) => {
          const diamond = row.original;
          const hasDiscount = diamond.discountPercentage > 0;

          return (
            <div className="flex flex-col">
              <span className="text-xs font-bold font-mono text-stone-900">
                {formatPrice(diamond.finalPrice)}
              </span>
              {hasDiscount && (
                <div className="flex items-center gap-1 text-[10px]">
                  <span className="text-stone-400 line-through">
                    {formatPrice(diamond.price)}
                  </span>
                  <span className="font-semibold text-amber-700 font-mono">
                    -{diamond.discountPercentage}%
                  </span>
                </div>
              )}
            </div>
          );
        },
      },
      getEnabledColumn<IDiamond>({
        accessorKey: "featured",
        headerLabel: "Featured",
        onToggle: handleToggleFeatured,
      }),
      {
        accessorKey: "certificateNumber",
        header: () => <span className="text-xs font-semibold text-stone-700">Certification</span>,
        cell: ({ row }) => {
          const diamond = row.original;
          return (
            <div className="flex flex-col gap-0.5">
              <Badge variant="cyan" className="text-[10px] font-mono w-fit px-1.5 py-0">
                {diamond.lab}
              </Badge>
              <span className="text-[11px] font-mono text-stone-500">
                {diamond.certificateNumber}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "stockQuantity",
        header: () => <span className="text-xs font-semibold text-stone-700">Vault Stock</span>,
        cell: ({ row }) => {
          const qty = row.original.stockQuantity;
          const isOut = qty <= 0;

          return (
            <Badge
              variant={isOut ? "destructive" : qty < 3 ? "gold" : "success"}
              className="text-[10px] font-mono"
            >
              {isOut ? "Sold Out" : `${qty} Available`}
            </Badge>
          );
        },
      },
      getActionColumn<IDiamond>({
        onEdit: (item) => openEditModal(item),
        onDelete: (item) => openDeleteDialog(item._id, `${item.name} (${item.sku})`),
      }),
    ],
    [openEditModal, openDeleteDialog, handleToggleFeatured, openImagePreview]
  );


  return columns;
}
