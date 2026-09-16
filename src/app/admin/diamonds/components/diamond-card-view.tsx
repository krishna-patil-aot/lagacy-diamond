"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import { IDiamond } from "@/types/diamond.types";
import { useDiamondStore } from "@/store/diamond.store";
import { Badge } from "@/components/ui/Badge";
import { EnabledSwitch } from "@/components/shared/enabled-switch";
import { formatPrice, formatCarat } from "@/lib/utils";
import { updateDiamondFeaturedAction } from "@/actions/diamond.action";
import { apiHandler } from "@/utils/api-handler";
import { Edit, Trash2, Sparkles, ZoomIn, Database, Loader2 } from "lucide-react";

import { broadcastDiamondEvent, DIAMOND_EVENTS } from "@/lib/diamond-events";

export function DiamondCardItem({ diamond }: { diamond: IDiamond }) {
  const {
    openEditModal,
    openDeleteDialog,
    updateItemInList,
    openImagePreview,
  } = useDiamondStore();

  const handleToggleFeatured = useCallback(
    async (target: IDiamond, newFeatured: boolean): Promise<boolean> => {
      const result = await apiHandler(
        () => updateDiamondFeaturedAction(target._id, newFeatured),
        {
          successMessage: newFeatured
            ? `${target.sku} featured in premier showroom`
            : `${target.sku} removed from featured showcase`,
          errorMessage: "Failed to update featured status",
        }
      );

      if (result.success) {
        updateItemInList({ ...target, featured: newFeatured });
        broadcastDiamondEvent(DIAMOND_EVENTS.FEATURED_TOGGLED, target._id);
        return true;
      }
      return false;
    },
    [updateItemInList]
  );

  const thumbnail =
    diamond.images && diamond.images.length > 0
      ? diamond.images[0]
      : "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=200&q=80";

  const hasDiscount = diamond.discountPercentage > 0;
  const isOut = diamond.stockQuantity <= 0;

  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-3.5">
      {/* Top Row: Thumbnail + SKU + Actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() =>
              openImagePreview(diamond.images, diamond.name, diamond.sku)
            }
            className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 hover:border-amber-400 hover:ring-2 hover:ring-amber-400/30 transition-all cursor-pointer group"
            title="Click to view specimen photograph"
          >
            <Image
              src={thumbnail}
              alt={diamond.name}
              fill
              sizes="56px"
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              unoptimized
            />
            {diamond.featured && (
              <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
                <Sparkles className="h-2 w-2" />
              </span>
            )}
            <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <ZoomIn className="h-4 w-4" />
            </div>
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-xs font-bold text-stone-900 tracking-tight">
                {diamond.sku}
              </span>
              <Badge variant="cyan" className="text-[9px] font-mono px-1 py-0">
                {diamond.lab}
              </Badge>
            </div>
            <h4 className="text-xs font-medium text-stone-800 truncate mt-0.5" title={diamond.name}>
              {diamond.name}
            </h4>
            <span className="text-[10px] text-stone-400 font-mono">
              {diamond.certificateNumber}
            </span>
          </div>
        </div>

        {/* Edit & Delete Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => openEditModal(diamond)}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
            title="Edit lot"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() =>
              openDeleteDialog(diamond._id, `${diamond.name} (${diamond.sku})`)
            }
            className="p-1.5 rounded-lg text-stone-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title="Delete lot"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Middle: Specifications Pill */}
      <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 text-xs">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-[10px] font-mono px-1.5 py-0">
            {diamond.shape}
          </Badge>
          <span className="font-mono font-bold text-stone-900">
            {formatCarat(diamond.carat)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-stone-600">
          <span>{diamond.color}</span>
          <span>•</span>
          <span>{diamond.clarity}</span>
          <span>•</span>
          <span>{diamond.cut}</span>
        </div>
      </div>

      {/* Price & Stock */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div>
          <div className="text-sm font-bold font-mono text-stone-900">
            {formatPrice(diamond.finalPrice)}
          </div>
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

        <Badge
          variant={isOut ? "destructive" : diamond.stockQuantity < 3 ? "gold" : "success"}
          className="text-[10px] font-medium whitespace-nowrap shrink-0"
        >
          {isOut ? "Sold Out" : `${diamond.stockQuantity} In Stock`}
        </Badge>
      </div>

      {/* Bottom: Featured Switch Toggle */}
      <div className="flex items-center justify-between border-t border-stone-100 pt-2.5 text-xs text-stone-600">
        <span className="text-[11px] font-medium text-stone-600">
          Showroom Showcase
        </span>
        <EnabledSwitch
          checked={diamond.featured}
          onToggle={(newVal) => handleToggleFeatured(diamond, newVal)}
        />

      </div>
    </div>
  );
}

export interface DiamondCardViewProps {
  items: IDiamond[];
  isLoading?: boolean;
}

export function DiamondCardView({ items, isLoading = false }: DiamondCardViewProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-stone-200/80 shadow-xs">
        <Loader2 className="h-6 w-6 animate-spin text-amber-600 mb-2" />
        <span className="text-xs font-mono text-stone-500">Querying vault inventory records...</span>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-stone-200/80 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-400 mb-2">
          <Database className="h-5 w-5" />
        </div>
        <h4 className="font-serif text-sm font-semibold text-stone-800">No records found</h4>
        <p className="text-xs text-stone-500 mt-1 max-w-xs">
          There are currently no gemstone lots matching your filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      {items.map((diamond) => (
        <DiamondCardItem key={diamond._id} diamond={diamond} />
      ))}
    </div>
  );
}
