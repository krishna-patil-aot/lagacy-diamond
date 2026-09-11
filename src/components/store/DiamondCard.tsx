"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Eye, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { IDiamond } from "@/types/diamond.types";
import { formatPrice, formatCarat } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { useCartStore } from "@/store/useCartStore";

interface DiamondCardProps {
  diamond: IDiamond;
  onQuickView?: (diamond: IDiamond) => void;
}

export function DiamondCard({ diamond, onQuickView }: DiamondCardProps) {
  const { toggleWishlist, isInWishlist } = useCartStore();
  const isWishlisted = isInWishlist(diamond._id);

  const displayImage =
    diamond.images && diamond.images.length > 0
      ? diamond.images[0]
      : "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white transition-shadow duration-200 hover:border-stone-400/80 hover:shadow-lg"
    >
      {/* Visual Header / Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        <Image
          src={displayImage}
          alt={diamond.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Soft Ambient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-60" />

        {/* Top Badges (Discount & Certificate) */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 z-10">
          {diamond.discountPercentage > 0 && (
            <Badge variant="orange" className="font-semibold tracking-wide">
              {diamond.discountPercentage}% Direct Off
            </Badge>
          )}
          {diamond.featured && (
            <Badge variant="pink" className="gap-1 font-medium">
              <Sparkles className="h-3 w-3 text-rose-500" />
              Foundry Reserve
            </Badge>
          )}
        </div>

        {/* Top Right Actions (Wishlist & Quick View) */}
        <div className="absolute right-3 top-3 flex flex-col gap-2 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(diamond);
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all shadow-xs ${
              isWishlisted
                ? "bg-rose-500 text-white shadow-rose-500/20"
                : "bg-white/85 text-stone-600 hover:bg-white hover:text-stone-900"
            }`}
            aria-label="Toggle wishlist"
          >
            <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-current" : ""}`} />
          </button>

          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(diamond);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-stone-600 backdrop-blur-md hover:bg-white hover:text-stone-900 transition-all opacity-0 group-hover:opacity-100 shadow-xs"
              aria-label="Quick view diamond details"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Floating Lab Tag */}
        <div className="absolute bottom-2.5 left-3 z-10">
          <span className="rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-mono tracking-wider text-stone-800 border border-stone-200/80 shadow-xs">
            {diamond.lab} Inscribed • {diamond.certificateNumber}
          </span>
        </div>
      </div>

      {/* Content & Specs */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
            {diamond.shape} • {diamond.cut} Cut
          </span>
          <Link href={`/diamonds/${diamond._id}`}>
            <h3 className="mt-0.5 text-sm sm:text-base font-semibold text-stone-900 group-hover:text-stone-700 transition-colors line-clamp-1">
              {diamond.name}
            </h3>
          </Link>
        </div>

        {/* The 4 Cs Specs Pill Matrix */}
        <div className="my-2.5 grid grid-cols-4 gap-1 rounded-xl border border-stone-100 bg-stone-50/80 p-2 text-center text-xs">
          <div>
            <span className="block text-[9px] uppercase text-stone-400 font-mono">Carat</span>
            <span className="font-semibold text-stone-800">{formatCarat(diamond.carat)}</span>
          </div>
          <div>
            <span className="block text-[9px] uppercase text-stone-400 font-mono">Color</span>
            <span className="font-semibold text-amber-900">{diamond.color}</span>
          </div>
          <div>
            <span className="block text-[9px] uppercase text-stone-400 font-mono">Clarity</span>
            <span className="font-semibold text-stone-800">{diamond.clarity}</span>
          </div>
          <div>
            <span className="block text-[9px] uppercase text-stone-400 font-mono">Cut</span>
            <span className="font-semibold text-stone-800">{diamond.cut.slice(0, 4)}</span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-auto flex items-end justify-between pt-2.5 border-t border-stone-100">
          <div>
            {diamond.discountPercentage > 0 ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-bold text-stone-900 font-mono">
                  {formatPrice(diamond.finalPrice)}
                </span>
                <span className="text-xs text-stone-400 line-through font-mono">
                  {formatPrice(diamond.price)}
                </span>
              </div>
            ) : (
              <span className="text-base sm:text-lg font-bold text-stone-900 font-mono">
                {formatPrice(diamond.finalPrice)}
              </span>
            )}
            <span className="block text-[10px] text-stone-500">
              Direct lab foundry custody
            </span>
          </div>

          <Link href={`/diamonds/${diamond._id}`}>
            <span className="text-xs font-semibold text-stone-800 hover:text-stone-600 underline underline-offset-4 decoration-stone-300 hover:decoration-stone-700 transition-all">
              Inspect →
            </span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
