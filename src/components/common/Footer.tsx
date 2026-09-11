import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-stone-200/80 bg-[#f7f5f0]/80 backdrop-blur-xs text-stone-600">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10 flex flex-col items-center justify-center text-center space-y-2 text-xs sm:text-sm">
        <p className="text-stone-500 font-medium tracking-wide">
          © 2026 Legacy Diamond Foundry Inc. All rights reserved.
        </p>
        <p className="text-stone-600 flex items-center justify-center gap-1.5 flex-wrap">
          <span className="text-stone-500">Site Architect & Lead Engineer:</span>
          <Link
            href="https://www.linkedin.com/in/krishnapatil"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-stone-900 hover:text-amber-800 underline underline-offset-4 decoration-stone-300 hover:decoration-amber-800 transition-colors inline-flex items-center gap-1 group"
            title="View Krishna Patil's LinkedIn Profile"
          >
            <span>Krishna Patil</span>
            <ExternalLink className="h-3.5 w-3.5 text-stone-400 group-hover:text-amber-800 transition-colors" />
          </Link>
        </p>
      </div>
    </footer>
  );
}


