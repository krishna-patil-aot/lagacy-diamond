"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp } from "lucide-react";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { useIsMounted } from "@/hooks/useIsMounted";

export function ScrollToTopButton() {
  const isMounted = useIsMounted();
  const { scaleX, showScrollTop, scrollToTop } = useSmoothScroll();

  if (!isMounted) return null;

  return (
    <>
      {/* 1. Motion Scroll Progress Indicator Bar */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-rose-400 to-amber-600 origin-left z-50 pointer-events-none"
      />

      {/* 2. Floating Motion Back to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.75, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.75, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.92 }}
            onClick={scrollToTop}
            aria-label="Smooth scroll back to top"
            className="fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-stone-200/90 bg-white/95 text-stone-700 shadow-md backdrop-blur-md transition-colors hover:border-stone-400 hover:bg-white hover:text-stone-900 cursor-pointer"
          >
            <ArrowUp className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
