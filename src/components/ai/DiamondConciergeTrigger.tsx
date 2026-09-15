"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { DiamondConciergeModal } from "./DiamondConciergeModal";

export const DiamondConciergeTrigger: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      {/* Floating AI Concierge Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2 sm:gap-2.5 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 text-stone-100 border border-amber-500/40 hover:border-amber-400 px-3 py-2.5 sm:px-4 sm:py-3 rounded-full shadow-2xl hover:shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          aria-label="Open AI Diamond Concierge"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>

          <div className="h-6 w-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
          </div>

          <div className="text-left hidden sm:block">
            <div className="text-xs font-semibold text-white tracking-wide flex items-center gap-1.5">
              <span>AI Concierge</span>
              <span className="text-[9px] uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-sans">
                Live
              </span>
            </div>
            <div className="text-[10px] text-stone-400">Ask any diamond question</div>
          </div>
        </button>
      </div>

      <DiamondConciergeModal isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};
