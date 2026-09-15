"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useNotFoundNavigation } from "@/hooks/useNotFoundNavigation";
import {
  Gem,
  ArrowLeft,
  Home,
  Search,
  Compass,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Package,
} from "lucide-react";

export default function GlobalNotFound() {
  const {
    searchQuery,
    setSearchQuery,
    handleSearch,
    handleGoBack,
    destinations,
  } = useNotFoundNavigation();

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Refraction Glow */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-[600px] rounded-full bg-gradient-to-b from-amber-100/40 via-stone-100/20 to-transparent blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-2xl text-center space-y-8">
        {/* Emblem & 404 Badge */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-stone-900 text-stone-50 border border-stone-800 shadow-xl shadow-stone-900/10">
            <Gem className="h-9 w-9 text-amber-300 animate-pulse" />
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-stone-950 font-mono text-[10px] font-bold shadow-xs">
              ?
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Badge variant="gold" className="text-[11px] font-mono tracking-wider uppercase px-2.5 py-0.5">
              Error 404 &bull; Lot Unregistered
            </Badge>
          </div>
        </div>

        {/* Heading & Gemological Context */}
        <div className="space-y-3">
          <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-light text-stone-900 tracking-tight">
            Lot Not Found in Vault Registry
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-stone-600 max-w-lg mx-auto leading-relaxed">
            The gemological parcel or page you requested does not exist in our foundry database. It may have been acquired by another collector or relocated.
          </p>
        </div>

        {/* Quick Vault Search Form */}
        <form
          onSubmit={handleSearch}
          className="mx-auto max-w-md w-full flex items-center gap-2 rounded-2xl border border-stone-200/90 bg-white p-1.5 shadow-sm focus-within:border-stone-400 focus-within:ring-2 focus-within:ring-stone-200 transition-all"
        >
          <div className="pl-3 text-stone-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search diamonds by SKU, shape, or carat..."
            aria-label="Search diamonds by SKU, shape, or carat"
            className="flex-1 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none min-w-0"
          />
          <Button
            type="submit"
            variant="luxury"
            size="sm"
            className="text-xs h-9 px-4 shrink-0"
          >
            Locate Lot
          </Button>
        </form>

        {/* Primary Navigation Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-2 w-full max-w-md mx-auto">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleGoBack}
            className="w-full sm:w-auto text-xs sm:text-sm justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2 text-stone-500" />
            Previous Page
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="luxury"
              size="md"
              className="w-full text-xs sm:text-sm justify-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Foundry Main Page
            </Button>
          </Link>

          <Link href="/diamonds">
            <Button
              variant="secondary"
              size="md"
              className="text-xs sm:text-sm"
            >
              <Compass className="h-4 w-4 mr-2 text-stone-600" />
              Explore All Diamonds
            </Button>
          </Link>
        </div>

        {/* Curated Recommendations Cards */}
        <div className="border-t border-stone-200/80 pt-8 mt-8">
          <p className="text-xs font-mono uppercase tracking-widest text-stone-400 mb-4">
            Curated Vault Destinations
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            {destinations.map((dest) => (
              <Link
                key={dest.href}
                href={dest.href}
                className="group relative flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white/70 p-4 transition-all hover:border-stone-400 hover:bg-white hover:shadow-sm"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-stone-800 group-hover:bg-stone-900 group-hover:text-stone-50 transition-colors">
                      {dest.iconName === "diamonds" && <Gem className="h-3.5 w-3.5" />}
                      {dest.iconName === "direct" && <Sparkles className="h-3.5 w-3.5 text-amber-500" />}
                      {dest.iconName === "home" && <ShieldCheck className="h-3.5 w-3.5" />}
                    </div>
                    {dest.badge && (
                      <Badge variant="gold" className="text-[9px] py-0 px-1.5 font-mono">
                        {dest.badge}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-serif text-sm font-semibold text-stone-900 pt-1 group-hover:text-amber-900 transition-colors flex items-center justify-between">
                    <span>{dest.title}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-stone-300 group-hover:text-stone-600 transition-transform group-hover:translate-x-0.5" />
                  </h3>
                  <p className="text-[11px] text-stone-500 leading-normal line-clamp-2">
                    {dest.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Brand Assurance Footnote */}
        <div className="flex items-center justify-center gap-4 text-xs font-mono text-stone-400 pt-2">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> 100% Conflict-Free
          </span>
          <span>&bull;</span>
          <span className="inline-flex items-center gap-1">
            <Package className="h-3.5 w-3.5 text-stone-500" /> Armored Handover Guarantee
          </span>
        </div>
      </div>
    </div>
  );
}
