"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2, ShoppingBag, ArrowRight, Gem, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useIsMounted } from "@/hooks/useIsMounted";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart, isInCart, openCheckout } = useCartStore();
  const isMounted = useIsMounted();

  const stones = isMounted ? wishlist : [];
  const totalValuation = stones.reduce((acc, stone) => acc + stone.finalPrice, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-700">
            <Heart className="h-4 w-4 fill-amber-700/20" />
            <span>Private Curations Vault</span>
          </div>
          <h1 className="mt-1 font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 tracking-tight">
            Saved Gemstones
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-stone-600">
            Review and compare your bookmarked foundry diamonds before reserving.
          </p>
        </div>

        {stones.length > 0 && (
          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase font-mono text-stone-400 block">Total Curated Value</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-stone-900">
              {formatPrice(totalValuation)}
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      {stones.length === 0 ? (
        <div className="rounded-3xl border border-stone-200 bg-white p-12 sm:p-16 text-center max-w-xl mx-auto space-y-5 shadow-xs">
          <div className="h-16 w-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Heart className="h-8 w-8 text-stone-400 stroke-1" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
            Your Private Collection is Empty
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-md mx-auto">
            You haven’t saved any diamonds to your private curation yet. Explore our verified vault collection to bookmark certified Type IIa stones for comparison.
          </p>
          <div className="pt-2">
            <Link href="/diamonds">
              <Button variant="luxury" size="lg" className="text-xs sm:text-sm px-6 gap-2">
                <Gem className="h-4 w-4" />
                <span>Explore Certified Diamonds</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Stones Grid (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {stones.map((stone) => {
              const inCart = isInCart(stone._id);
              return (
                <div
                  key={stone._id}
                  className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs hover:border-amber-400/60 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden border border-stone-100 bg-stone-50 shrink-0">
                      <Image
                        src={
                          stone.images && stone.images[0]
                            ? stone.images[0]
                            : "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80"
                        }
                        alt={stone.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/diamonds/${stone._id}`}
                          className="font-serif font-bold text-sm sm:text-base text-stone-900 hover:text-amber-800 transition-colors truncate max-w-[180px] sm:max-w-none"
                        >
                          {stone.name}
                        </Link>
                        <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-900">
                          {stone.lab}
                        </Badge>
                      </div>

                      <div className="text-xs font-mono text-stone-500 truncate">
                        {stone.carat} ct • {stone.shape} • {stone.color} / {stone.clarity} • Cut: {stone.cut}
                      </div>

                      <div className="text-[11px] text-stone-400 font-mono truncate">
                        SKU: {stone.sku} • Cert #{stone.certificateNumber}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100 gap-3">
                    <div className="text-left sm:text-right">
                      <span className="text-base sm:text-lg font-bold font-mono text-stone-900">
                        {formatPrice(stone.finalPrice)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant={inCart ? "secondary" : "luxury"}
                        size="sm"
                        onClick={() => addToCart(stone)}
                        disabled={inCart}
                        className="text-xs h-8 gap-1.5"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span>{inCart ? "In Vault" : "Reserve"}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleWishlist(stone)}
                        className="text-stone-400 hover:text-rose-600 hover:bg-rose-50 h-8 px-2"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
              <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
                Curations Overview
              </h2>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Saved Gemstones:</span>
                  <span className="font-mono font-bold text-stone-900">{stones.length} Lot(s)</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Armored Escrow Transit:</span>
                  <span className="text-emerald-700 font-mono font-bold">COMPLIMENTARY</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Inspection Privilege:</span>
                  <span className="font-mono text-stone-900">30 Days</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-900 border-t border-stone-100 pt-3">
                  <span>Total Valuation:</span>
                  <span className="font-mono text-amber-900">{formatPrice(totalValuation)}</span>
                </div>
              </div>

              <Button
                variant="luxury"
                size="lg"
                onClick={openCheckout}
                className="w-full text-xs sm:text-sm h-11 justify-center gap-2"
              >
                <span>Proceed to Vault Escrow</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="rounded-2xl border border-amber-900/20 bg-amber-50/50 p-5 space-y-2 text-xs text-stone-600">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <ShieldCheck className="h-4 w-4 text-amber-700" />
                <span>Vault Price Hold</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Items saved in your wishlist are monitored in real time. Direct foundry valuations are locked upon reservation in your private vault.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
