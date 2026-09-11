"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { IDiamond } from "@/types/diamond.types";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatCarat } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { Check, ShoppingBag, ShieldCheck } from "lucide-react";

interface DiamondQuickViewModalProps {
  diamond: IDiamond | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DiamondQuickViewModal({
  diamond,
  isOpen,
  onClose,
}: DiamondQuickViewModalProps) {
  const { addToCart, isInCart } = useCartStore();

  if (!diamond) return null;

  const inCart = isInCart(diamond._id);
  const displayImage =
    diamond.images && diamond.images.length > 0
      ? diamond.images[0]
      : "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80";

  return (
    <Dialog open={isOpen} onOpenChange={onClose} className="max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
        {/* Left: Product Image */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
          <Image
            src={displayImage}
            alt={diamond.name}
            fill
            className="object-cover"
          />
          {diamond.discountPercentage > 0 && (
            <div className="absolute top-3 left-3">
              <Badge variant="orange" className="font-semibold">
                {diamond.discountPercentage}% Direct Off
              </Badge>
            </div>
          )}
        </div>

        {/* Right: Diamond Details */}
        <div className="flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-stone-500 font-semibold">
                {diamond.shape} • Lab-Grown
              </span>
              <span className="text-stone-300">•</span>
              <span className="text-[11px] font-mono text-stone-400">
                {diamond.sku}
              </span>
            </div>

            <h2 className="mt-1 text-xl font-bold text-stone-900">
              {diamond.name}
            </h2>

            {/* Price Section */}
            <div className="mt-2.5 flex items-baseline gap-2.5">
              <span className="text-2xl font-bold font-mono text-stone-900">
                {formatPrice(diamond.finalPrice)}
              </span>
              {diamond.discountPercentage > 0 && (
                <span className="text-xs font-mono text-stone-400 line-through">
                  {formatPrice(diamond.price)}
                </span>
              )}
            </div>

            {/* 4Cs Specifications Grid */}
            <div className="mt-3.5 grid grid-cols-4 gap-1.5 rounded-xl border border-stone-200 bg-stone-50/80 p-2.5 text-center">
              <div>
                <span className="block text-[9px] uppercase text-stone-400 font-mono">Carat</span>
                <span className="text-xs font-semibold text-stone-800">{formatCarat(diamond.carat)}</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase text-stone-400 font-mono">Color</span>
                <span className="text-xs font-semibold text-amber-900">{diamond.color}</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase text-stone-400 font-mono">Clarity</span>
                <span className="text-xs font-semibold text-stone-800">{diamond.clarity}</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase text-stone-400 font-mono">Cut</span>
                <span className="text-xs font-semibold text-stone-800">{diamond.cut}</span>
              </div>
            </div>

            {/* Additional Proportions */}
            <div className="mt-3 space-y-1 text-xs text-stone-600">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span>Certification:</span>
                <span className="font-semibold text-stone-800">
                  {diamond.lab} ({diamond.certificateNumber})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span>Measurements:</span>
                <span className="font-mono text-stone-800">
                  {diamond.dimensions.length} × {diamond.dimensions.width} × {diamond.dimensions.depth} mm
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>Table & Depth:</span>
                <span className="font-mono text-stone-800">
                  {diamond.tablePercentage}% Table / {diamond.depthPercentage}% Depth
                </span>
              </div>
            </div>

            <p className="mt-2.5 text-xs text-stone-500 leading-relaxed line-clamp-2">
              {diamond.description}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-1">
            <Button
              variant="luxury"
              className="w-full justify-center text-xs h-10"
              onClick={() => addToCart(diamond)}
              disabled={inCart}
            >
              {inCart ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Reserved in Private Vault
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                  Reserve Direct from Lab
                </>
              )}
            </Button>

            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-1 text-stone-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>IGI / GIA Certified</span>
              </div>
              <Link
                href={`/diamonds/${diamond._id}`}
                onClick={onClose}
                className="font-medium text-stone-800 hover:underline text-xs"
              >
                View Full Spec Sheet →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
