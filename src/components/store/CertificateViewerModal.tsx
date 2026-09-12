"use client";

import React from "react";
import { DialogRoot, DialogContent } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { IDiamond } from "@/types/diamond.types";
import { CertificateView } from "./CertificateView";
import { Award, ShieldCheck } from "lucide-react";

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
          max-w-3xl w-[calc(100%-2rem)] max-h-[92vh]
          flex flex-col p-0 gap-0
          bg-stone-950 border border-amber-900/30 overflow-hidden
        "
      >
        {/* ── Header ─────────────────────────────────── */}
        <div className="flex-shrink-0 flex flex-row items-center justify-between px-5 py-3 bg-gradient-to-r from-stone-900 to-stone-950 border-b border-amber-900/20">
          <div className="flex items-center gap-3 min-w-0 pr-10">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-900/30 border border-amber-700/40 flex-shrink-0">
              <Award className="h-4 w-4 text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-amber-200 tracking-wide truncate">
                {diamond.lab} Authorized Lab Certificate
              </p>
              <p className="text-[11px] font-mono text-stone-400 truncate mt-0.5">
                {diamond.name} · Cert #{diamond.certificateNumber}
              </p>
            </div>
          </div>

          <Badge className="hidden sm:flex items-center gap-1 bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-[10px] font-mono px-2 py-0.5 flex-shrink-0">
            <ShieldCheck className="h-3 w-3" />
            View Only
          </Badge>
        </div>

        {/* ── Certificate Content ─────────────────────── */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden bg-stone-900 p-4 min-h-0"
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        >
          <div className="select-none pointer-events-none">
            <CertificateView diamond={diamond} />
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────── */}
        <div className="flex-shrink-0 px-5 py-2.5 bg-stone-950 border-t border-amber-900/20 flex items-center justify-between text-[10px] font-mono text-stone-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            Viewing only — saving, printing &amp; downloading are not permitted.
          </span>
          <span className="text-amber-800/50 hidden sm:block">Legacy Diamond Foundry</span>
        </div>
      </DialogContent>
    </DialogRoot>
  );
}
