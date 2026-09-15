"use client";

import React from "react";
import { DialogRoot, DialogContent } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { IDiamond } from "@/types/diamond.types";
import { CertificateView } from "./CertificateView";
import { Award, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site.config";

interface CertificateViewerModalProps {
  open: boolean;
  onClose: () => void;
  diamond: IDiamond | null;
}

export function CertificateViewerModal({
  open,
  onClose,
  diamond,
}: CertificateViewerModalProps) {
  // Block all save / print / copy keyboard shortcuts while modal is open
  React.useEffect(() => {
    if (!open) return;

    const blockAction = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (
        (e.ctrlKey || e.metaKey) &&
        (key === "s" || key === "p" || key === "c" || key === "a")
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("keydown", blockAction, { capture: true });
    return () => {
      window.removeEventListener("keydown", blockAction, { capture: true });
    };
  }, [open]);

  if (!diamond) return null;

  return (
    <DialogRoot open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="
          max-w-3xl w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-h-[78dvh] sm:max-h-[85vh]
          flex flex-col p-0 gap-0
          bg-white border border-stone-200 overflow-hidden shadow-2xl
          [&>button]:text-stone-500 [&>button]:hover:bg-stone-100 [&>button]:hover:text-stone-900
        "
      >
        {/* ── Header ─────────────────────────────────── */}
        <div className="flex-shrink-0 flex flex-row items-center justify-between px-4 sm:px-5 py-3 bg-stone-50/90 border-b border-stone-200">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-8 sm:pr-10">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-100 border border-amber-300 flex-shrink-0">
              <Award className="h-4 w-4 text-amber-800" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-stone-900 tracking-wide truncate font-serif">
                {diamond.lab} Authorized Lab Certificate
              </p>
              <p className="text-[10px] sm:text-[11px] font-mono text-stone-500 truncate mt-0.5">
                {diamond.name} · Cert #{diamond.certificateNumber}
              </p>
            </div>
          </div>

          <Badge className="hidden sm:flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono px-2 py-0.5 flex-shrink-0">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            View Only
          </Badge>
        </div>

        {/* ── Certificate Content ─────────────────────── */}
        <div
          className="flex-1 overflow-y-auto overflow-x-auto bg-[#f8f6f0] p-2 sm:p-4 min-h-0"
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        >
          <div className="select-none pointer-events-none">
            <CertificateView diamond={diamond} />
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────── */}
        <div className="flex-shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-1 text-[10px] font-mono text-stone-500 text-center sm:text-left">
          <span className="flex items-center justify-center sm:justify-start gap-1.5">
            <ShieldCheck className="h-3 w-3 text-emerald-600 flex-shrink-0" />
            Viewing only — saving, printing &amp; downloading are not permitted.
          </span>
          <span className="text-stone-400 hidden sm:block">{siteConfig.contact.legalEntityName}</span>
        </div>
      </DialogContent>
    </DialogRoot>
  );
}
