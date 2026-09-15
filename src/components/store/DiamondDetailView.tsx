"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IDiamond } from "@/types/diamond.types";
import { formatPrice, formatCarat } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/useCartStore";
import { useProductPdf } from "@/hooks/useProductPdf";
import { useCertificateViewer } from "@/hooks/useCertificateViewer";
import { CertificateViewerModal } from "./CertificateViewerModal";
import {
  ShieldCheck,
  Award,
  ShoppingBag,
  Heart,
  Check,
  ChevronLeft,
  Compass,
  Sparkles,
  Download,
  Loader2,
} from "lucide-react";
import { Diamond360Viewer } from "./Diamond360Viewer";

interface DiamondDetailViewProps {
  diamond: IDiamond;
}

export function DiamondDetailView({ diamond }: DiamondDetailViewProps) {
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"gallery" | "360">("gallery");
  const { addToCart, isInCart, toggleWishlist, isInWishlist } = useCartStore();
  const { downloadSpecPdf, isDownloadingSpec } = useProductPdf();
  const { viewerState, openCertificate, closeCertificate } = useCertificateViewer();

  const isCart = isInCart(diamond._id);
  const isWish = isInWishlist(diamond._id);

  const images =
    diamond.images && diamond.images.length > 0
      ? diamond.images
      : ["https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Back to Catalog Breadcrumb */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link
          href="/diamonds"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Return to Legacy Collection</span>
        </Link>
        <span className="text-xs font-mono text-stone-400">
          Foundry SKU: {diamond.sku}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Gallery (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-100/70 p-1 w-full sm:w-fit">
            <button
              onClick={() => setViewMode("gallery")}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-center ${
                viewMode === "gallery"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              High-Res Gallery
            </button>
            <button
              onClick={() => setViewMode("360")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "360"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>Interactive 360° Inspection</span>
            </button>
          </div>

          {viewMode === "360" ? (
            <Diamond360Viewer diamond={diamond} />
          ) : (
            <>
              {/* Main Large Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-sm">
                <Image
                  src={images[activeImageIndex] || images[0]}
                  alt={diamond.name}
                  fill
                  priority
                  className="object-cover transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {diamond.discountPercentage > 0 && (
                    <Badge variant="orange" className="text-xs px-3 py-1 font-bold">
                      {diamond.discountPercentage}% Direct Off
                    </Badge>
                  )}
                  {diamond.featured && (
                    <Badge variant="pink" className="text-xs px-3 py-1 gap-1">
                      <Sparkles className="h-3 w-3 text-rose-500" />
                      Foundry Reserve
                    </Badge>
                  )}
                </div>

                {/* Inscription Watermark */}
                <div className="absolute bottom-4 right-4 rounded-lg bg-white/90 backdrop-blur-xs px-3 py-1 text-xs font-mono text-stone-800 border border-stone-200 shadow-xs">
                  {diamond.lab} Inscribed: {diamond.certificateNumber}
                </div>
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative h-18 w-22 flex-shrink-0 overflow-hidden rounded-xl border transition-all ${
                        activeImageIndex === idx
                          ? "border-stone-900 ring-2 ring-stone-900/20"
                          : "border-stone-200 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image src={img} alt={`View ${idx}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Foundry Description */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 space-y-2 shadow-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900 font-mono flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-stone-700" />
              <span>Foundry Cultivation & Cut Notes</span>
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-stone-600">
              {diamond.description}
            </p>
          </div>
        </div>

        {/* Right Details Pane (5 Columns) */}
        <div className="lg:col-span-5 space-y-5">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-stone-500 font-semibold">
              {diamond.shape} • Lab-Grown Brilliant
            </span>
            <h1 className="mt-1 text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
              {diamond.name}
            </h1>
            <p className="mt-1 text-xs text-stone-500 font-mono">
              Certificate: {diamond.lab} #{diamond.certificateNumber}
            </p>
          </div>

          {/* Price & Savings Presentation */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-mono uppercase text-stone-400">
                Direct Foundry Price
              </span>
              {diamond.discountPercentage > 0 && (
                <span className="text-xs text-amber-800 font-mono font-medium">
                  Direct Savings {formatPrice(diamond.price - diamond.finalPrice)}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-mono font-bold text-stone-900">
                {formatPrice(diamond.finalPrice)}
              </span>
              {diamond.discountPercentage > 0 && (
                <span className="text-sm font-mono text-stone-400 line-through">
                  {formatPrice(diamond.price)}
                </span>
              )}
            </div>

            <p className="text-xs text-stone-500 pt-1">
              Direct-to-consumer pricing. Includes fully insured armored transit and 30-day foundry inspection privilege.
            </p>
          </div>

          {/* The 4 Cs Benchmark Grid */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-stone-700 font-semibold">
              The 4 Cs Specification
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-stone-100 bg-stone-50/80 p-2.5">
                <span className="block text-[10px] text-stone-400 uppercase font-mono">Carat Weight</span>
                <span className="text-sm font-bold text-stone-900 font-mono">{formatCarat(diamond.carat)}</span>
              </div>
              <div className="rounded-xl border border-stone-100 bg-stone-50/80 p-2.5">
                <span className="block text-[10px] text-stone-400 uppercase font-mono">Color Grade</span>
                <span className="text-sm font-bold text-amber-900 font-mono">{diamond.color} Grade</span>
              </div>
              <div className="rounded-xl border border-stone-100 bg-stone-50/80 p-2.5">
                <span className="block text-[10px] text-stone-400 uppercase font-mono">Clarity</span>
                <span className="text-sm font-bold text-stone-900 font-mono">{diamond.clarity}</span>
              </div>
              <div className="rounded-xl border border-stone-100 bg-stone-50/80 p-2.5">
                <span className="block text-[10px] text-stone-400 uppercase font-mono">Cut Grade</span>
                <span className="text-sm font-bold text-stone-900 font-mono">{diamond.cut}</span>
              </div>
            </div>
          </div>

          {/* Proportions Table */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-2 text-xs">
            <h3 className="text-xs font-mono uppercase tracking-wider text-stone-700 font-semibold mb-2">
              Gemological Proportions
            </h3>
            <div className="divide-y divide-stone-100">
              <div className="flex justify-between py-1.5">
                <span className="text-stone-500">Measurements (L × W × D)</span>
                <span className="font-mono text-stone-800">
                  {diamond.dimensions.length} × {diamond.dimensions.width} × {diamond.dimensions.depth} mm
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-stone-500">Table Percentage</span>
                <span className="font-mono text-stone-800">{diamond.tablePercentage}%</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-stone-500">Depth Percentage</span>
                <span className="font-mono text-stone-800">{diamond.depthPercentage}%</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-stone-500">Polish / Symmetry</span>
                <span className="text-stone-800">{diamond.polish} / {diamond.symmetry}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-stone-500">Current Stock</span>
                <span className="font-mono text-stone-800">{diamond.stockQuantity} in foundry</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-1">
            <Button
              variant="luxury"
              size="lg"
              className="w-full justify-center text-xs sm:text-sm h-11 bg-stone-900 hover:bg-stone-800 text-white font-medium"
              onClick={() => addToCart(diamond)}
              disabled={isCart}
            >
              {isCart ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-emerald-400" />
                  Added to Your Cart
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="md"
              className="w-full justify-center text-xs h-10"
              onClick={() => toggleWishlist(diamond)}
            >
              <Heart className={`h-3.5 w-3.5 mr-1.5 ${isWish ? "fill-current text-rose-500" : ""}`} />
              {isWish ? "Saved in Wishlist" : "Add to Wishlist"}
            </Button>
          </div>

          {/* Official Documentation & PDF Downloads */}
          <div className="rounded-2xl border border-amber-900/20 bg-gradient-to-br from-amber-50/50 to-stone-50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-900 font-semibold flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-amber-700" />
                <span>Official Certification</span>
              </span>
              <span className="text-[10px] font-mono text-stone-500">
                {diamond.lab} #{diamond.certificateNumber}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* View Certificate — opens inline viewer modal, no download */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openCertificate(diamond)}
                className="w-full justify-center gap-2 border-amber-300/80 hover:border-amber-500 text-xs font-medium text-stone-800"
              >
                <Award className="h-3.5 w-3.5 text-amber-700" />
                <span>View Certificate</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => downloadSpecPdf(diamond._id, diamond.sku)}
                disabled={isDownloadingSpec}
                className="w-full justify-center gap-2 text-xs font-medium text-stone-700"
              >
                {isDownloadingSpec ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-stone-600" />
                ) : (
                  <Download className="h-3.5 w-3.5 text-stone-600" />
                )}
                <span>Details Card (PDF)</span>
              </Button>
            </div>
          </div>

          {/* Security & Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-200 text-[11px] text-stone-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>Free Insured Delivery</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <span>Certified &amp; Hallmarked</span>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate View-Only Modal */}
      <CertificateViewerModal
        open={viewerState.open}
        onClose={closeCertificate}
        diamond={viewerState.diamond}
      />
    </div>
  );
}
