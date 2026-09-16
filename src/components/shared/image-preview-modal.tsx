"use client";

import React, { useEffect, useCallback } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { useDiamondStore } from "@/store/diamond.store";
import { X, ChevronLeft, ChevronRight, Sparkles, Images } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function ImagePreviewModal() {
  const { imagePreview, closeImagePreview, setPreviewIndex } = useDiamondStore();
  const { isOpen, images, title, sku, selectedIndex } = imagePreview;

  const validImages = images && images.length > 0
    ? images
    : ["https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80"];

  const safeIndex = Math.min(Math.max(0, selectedIndex), validImages.length - 1);
  const currentImage = validImages[safeIndex];
  const hasMultiple = validImages.length > 1;

  const handlePrev = useCallback(() => {
    if (!hasMultiple) return;
    setPreviewIndex(safeIndex > 0 ? safeIndex - 1 : validImages.length - 1);
  }, [hasMultiple, safeIndex, validImages.length, setPreviewIndex]);

  const handleNext = useCallback(() => {
    if (!hasMultiple) return;
    setPreviewIndex(safeIndex < validImages.length - 1 ? safeIndex + 1 : 0);
  }, [hasMultiple, safeIndex, validImages.length, setPreviewIndex]);

  // Keyboard navigation for arrow keys
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handlePrev, handleNext]);

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeImagePreview()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md animate-in fade-in-0 duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[96vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-stone-800 bg-stone-950 p-4 sm:p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 focus:outline-hidden text-stone-100 max-h-[95vh] overflow-y-auto flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-stone-800/80 pb-3 shrink-0">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <Badge variant="gold" className="text-xs font-mono tracking-wider px-2 py-0.5">
                  {sku}
                </Badge>
                <Dialog.Title className="text-base sm:text-lg font-serif font-medium text-stone-100 truncate">
                  {title}
                </Dialog.Title>
              </div>
              <p className="text-xs text-stone-400 mt-1 hidden xs:block">
                High-resolution gemological laboratory specimen photography
              </p>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-xl p-2 text-stone-400 hover:bg-stone-800 hover:text-stone-100 transition-colors shrink-0 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </Dialog.Close>
          </div>

          {/* Main Showcase Image Container (Explicit responsive height so image is large and never collapses) */}
          <div className="relative my-3 w-full h-[50vh] sm:h-[58vh] min-h-[320px] max-h-[580px] rounded-2xl overflow-hidden border border-stone-800 bg-stone-900/90 flex items-center justify-center select-none shrink-0 shadow-inner">
            <Image
              src={currentImage}
              alt={`${title} - ${sku} (angle ${safeIndex + 1})`}
              fill
              sizes="(max-width: 1024px) 96vw, 1000px"
              className="object-contain p-2 sm:p-4 transition-opacity duration-200"
              priority
              unoptimized
            />

            {/* Large Prominent Left & Right Navigation Buttons */}
            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-stone-950/80 text-stone-200 hover:bg-amber-500 hover:text-stone-950 border border-stone-600 transition-all shadow-2xl backdrop-blur-md cursor-pointer active:scale-95 group"
                  aria-label="Previous specimen image"
                  title="Previous image (Left Arrow)"
                >
                  <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7 group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-stone-950/80 text-stone-200 hover:bg-amber-500 hover:text-stone-950 border border-stone-600 transition-all shadow-2xl backdrop-blur-md cursor-pointer active:scale-95 group"
                  aria-label="Next specimen image"
                  title="Next image (Right Arrow)"
                >
                  <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </>
            )}

            {/* Image Counter Badge */}
            <div className="absolute bottom-3 right-3 z-10 px-3 py-1.5 rounded-full bg-stone-950/85 backdrop-blur-md border border-stone-700/80 text-xs font-mono text-stone-200 flex items-center gap-1.5 shadow-xl">
              <Images className="h-3.5 w-3.5 text-amber-400" />
              <span>
                {hasMultiple ? `${safeIndex + 1} of ${validImages.length}` : "1 of 1"}
              </span>
            </div>
          </div>

          {/* Thumbnail Gallery Strip */}
          {hasMultiple && (
            <div className="shrink-0 py-2 px-1 border-t border-stone-800/80">
              <div className="flex items-center justify-center gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-stone-700">
                {validImages.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => setPreviewIndex(idx)}
                    className={`relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      idx === safeIndex
                        ? "border-amber-400 ring-2 ring-amber-400/50 scale-105 shadow-lg shadow-amber-500/20 opacity-100"
                        : "border-stone-800 opacity-60 hover:opacity-100 hover:border-stone-600"
                    }`}
                    aria-label={`View specimen angle ${idx + 1}`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail angle ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                      unoptimized
                    />
                    {idx === safeIndex && (
                      <span className="absolute bottom-0 inset-x-0 h-1 bg-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div className="mt-2 flex items-center justify-between text-xs text-stone-400 border-t border-stone-800/80 pt-2.5 shrink-0">
            <span className="flex items-center gap-1.5 text-amber-400/90 font-medium">
              <Sparkles className="h-3.5 w-3.5" /> DarkGems Vault Registry
            </span>
            <span className="font-mono text-[11px] text-stone-400">
              <span className="hidden sm:inline">Use arrow keys or click thumbnails • </span>ESC to dismiss
            </span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}


