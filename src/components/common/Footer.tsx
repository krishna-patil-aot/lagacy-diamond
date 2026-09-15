import React from "react";
import Link from "next/link";
import { ExternalLink, Gem, ShieldCheck, Sun, Lock } from "lucide-react";

import { siteConfig } from "@/config/site.config";

export function Footer() {
  return (
    <footer className="border-t border-stone-200/80 bg-[#f7f5f0] text-stone-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand & Mission (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 text-stone-50 border border-stone-800 shadow-xs">
                <Gem className="h-4.5 w-4.5 text-amber-200" />
              </div>
              <div>
                <span className="font-serif text-base tracking-[0.14em] font-bold text-stone-900 block leading-none">
                  {siteConfig.brandName.toUpperCase()}
                </span>
                <span className="text-[9px] uppercase tracking-[0.22em] text-stone-400 font-mono mt-0.5 block">
                  Haute Gemology &amp; Solitaires
                </span>
              </div>
            </Link>

            <p className="text-xs text-stone-600 leading-relaxed max-w-sm">
              Cultivated in 100% solar plasma reactors with zero earth
              displacement. Sovereign Type IIa certified diamonds, transparent
              atelier pricing, and fully insured white-glove delivery worldwide.
            </p>

            <div className="flex items-center gap-3 pt-2 text-[11px] text-stone-500 font-mono">
              <span className="flex items-center gap-1">
                <Sun className="h-3.5 w-3.5 text-amber-700" /> 100% Solar
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" /> IGI
                &amp; GIA
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-amber-700" /> Insured Vault
                Delivery
              </span>
            </div>
          </div>

          {/* Column 2: The Collection (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-stone-900 font-bold">
              Shop Diamonds
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/diamonds"
                  className="hover:text-stone-900 transition-colors"
                >
                  All Diamonds
                </Link>
              </li>
              <li>
                <Link
                  href="/diamonds?shape=Round"
                  className="hover:text-stone-900 transition-colors"
                >
                  Round Cut
                </Link>
              </li>
              <li>
                <Link
                  href="/diamonds?shape=Oval"
                  className="hover:text-stone-900 transition-colors"
                >
                  Oval Cut
                </Link>
              </li>
              <li>
                <Link
                  href="/diamonds?shape=Emerald"
                  className="hover:text-stone-900 transition-colors"
                >
                  Emerald Cut
                </Link>
              </li>
              <li>
                <Link
                  href="/diamonds?shape=Cushion"
                  className="hover:text-stone-900 transition-colors"
                >
                  Cushion Cut
                </Link>
              </li>
              <li>
                <Link
                  href="/diamonds?discount=true"
                  className="hover:text-amber-800 transition-colors font-medium"
                >
                  Special Offers
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: The Foundry (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-stone-900 font-bold">
              About & Guides
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/about"
                  className="hover:text-stone-900 transition-colors"
                >
                  Our Story (About Us)
                </Link>
              </li>
              <li>
                <Link
                  href="/gemology"
                  className="hover:text-stone-900 transition-colors"
                >
                  4Cs Diamond Buying Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/sustainability"
                  className="hover:text-stone-900 transition-colors"
                >
                  Eco-Friendly & Pure
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  className="hover:text-stone-900 transition-colors"
                >
                  Saved Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Concierge & Client Care (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-stone-900 font-bold">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-stone-900 transition-colors font-medium text-amber-900"
                >
                  Talk to Diamond Expert
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-stone-900 transition-colors"
                >
                  Help & FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="hover:text-stone-900 transition-colors"
                >
                  Delivery & 30-Day Returns
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-stone-900 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-stone-900 transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Engineer Credit */}
        <div className="border-t border-stone-200/80 pt-6 pb-28 sm:pb-10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs sm:pr-28 lg:pr-36 pb-safe mb-5">
          <p className="text-stone-500 font-medium">
            © {siteConfig.copyrightYear} {siteConfig.contact.legalEntityName}.
            All rights reserved. 100% Conflict-free Type IIa certified.
          </p>

          <div className="flex items-center gap-2 bg-stone-100/90 border border-stone-200/80 px-3.5 py-1.5 rounded-full shadow-xs">
            <span className="text-stone-500 font-medium">
              Software Engineer:
            </span>
            <Link
              href="https://www.linkedin.com/in/krishnapatil-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-stone-900 hover:text-amber-800 underline underline-offset-4 decoration-stone-300 hover:decoration-amber-800 transition-colors inline-flex items-center gap-1 group"
              title="View Krishna Patil's LinkedIn Profile"
            >
              <span>Krishna Patil</span>
              <ExternalLink className="h-3.5 w-3.5 text-stone-400 group-hover:text-amber-800 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
