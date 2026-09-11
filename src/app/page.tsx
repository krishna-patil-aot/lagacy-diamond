"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useFeaturedDiamonds } from "@/hooks/useFeaturedDiamonds";
import { DiamondCard } from "@/components/store/DiamondCard";
import { DiamondQuickViewModal } from "@/components/store/DiamondQuickViewModal";
import { IDiamond, DiamondShape } from "@/types/diamond.types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useFilterStore } from "@/store/useFilterStore";
import { useRouter } from "next/navigation";
import {
  Gem,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Layers,
  Search,
  Atom,
} from "lucide-react";
import { motion } from "motion/react";

const QUICK_SHAPES: { shape: DiamondShape; label: string }[] = [
  { shape: "Round", label: "Round Brilliant" },
  { shape: "Emerald", label: "Emerald Step Cut" },
  { shape: "Oval", label: "Oval Radiance" },
  { shape: "Princess", label: "Princess Square" },
  { shape: "Cushion", label: "Baroque Cushion" },
  { shape: "Radiant", label: "Aurora Radiant" },
];

export default function HomePage() {
  const router = useRouter();
  const { featuredDiamonds, isLoading } = useFeaturedDiamonds();
  const [quickViewDiamond, setQuickViewDiamond] = useState<IDiamond | null>(null);
  const { toggleShape, resetFilters } = useFilterStore();

  const handleShapeSelect = (shape: DiamondShape) => {
    resetFilters();
    toggleShape(shape);
    router.push("/diamonds");
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-16 overflow-x-hidden">
      {/* 1. Minimalist Hero Section */}
      <section className="relative py-10 sm:py-14 lg:py-16 flex items-center justify-center border-b border-stone-200/80 bg-gradient-to-b from-[#faf8f5] via-[#f7f5f0] to-[#faf8f5] overflow-hidden">
        {/* Subtle Warm Natural Gradient Radiance */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-gradient-to-tr from-amber-100/60 via-rose-100/40 to-orange-100/50 blur-[90px] rounded-full pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8 space-y-4 sm:space-y-5">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-stone-200/90 bg-white/90 px-3.5 py-1 text-xs font-mono font-medium text-stone-700 shadow-xs backdrop-blur-xs"
          >
            <Atom className="h-3.5 w-3.5 text-stone-700" />
            <span>CULTIVATED IN OUR ADVANCED FOUNDRY • DIRECT TO CONSUMER</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 leading-[1.15]"
          >
            From Our Lab To{" "}
            <motion.span
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="inline-block text-stone-800 underline decoration-stone-300 underline-offset-8 transition-colors hover:decoration-amber-400"
            >
              Your Legacy
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto max-w-2xl text-xs sm:text-sm text-stone-600 leading-relaxed"
          >
            Legacy Diamond cultivates certified Type IIa diamonds in our proprietary laboratory. By cutting out middleman jewelers, we deliver pure optical fire with zero earth mining footprint at direct foundry pricing.
          </motion.p>

          {/* Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1"
          >
            <Link href="/diamonds">
              <Button variant="luxury" size="lg" className="w-full sm:w-auto text-xs sm:text-sm px-6 h-10 sm:h-11 shadow-xs hover:shadow-md transition-shadow">
                <Search className="h-3.5 w-3.5 mr-2" />
                Explore Cultivated Diamonds
              </Button>
            </Link>

            <Link href="/diamonds?discount=true">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-xs sm:text-sm px-6 h-10 sm:h-11 hover:border-stone-400 transition-colors">
                Direct Foundry Lots
                <ArrowRight className="h-3.5 w-3.5 ml-2" />
              </Button>
            </Link>
          </motion.div>

          {/* Quick Shape Jump Chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="pt-2 sm:pt-3"
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-mono block mb-2">
              Explore by Cultivated Silhouette
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {QUICK_SHAPES.map(({ shape, label }) => (
                <motion.button
                  key={shape}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleShapeSelect(shape)}
                  className="rounded-full border border-stone-200 bg-white/80 px-3 py-1 sm:px-3.5 sm:py-1.5 text-xs font-medium text-stone-700 backdrop-blur-xs transition-colors hover:border-stone-400 hover:bg-white hover:text-stone-900 cursor-pointer shadow-xs"
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Featured Diamonds Showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-5"
        >
          <div>
            <div className="flex items-center gap-2">
              <Gem className="h-4 w-4 text-amber-700" />
              <span className="text-xs uppercase font-mono tracking-widest text-stone-500">
                Foundry Selection
              </span>
            </div>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Featured Laboratory Cultivations
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-600">
              Direct-from-foundry certified gemstones displaying exceptional crystal clarity and optical dispersion.
            </p>
          </div>

          <Link href="/diamonds">
            <Button variant="ghost" className="text-xs text-stone-800 hover:text-stone-900 group">
              <span>View Full Foundry Catalog</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        {/* Diamonds Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="aspect-[4/5] rounded-2xl border border-stone-200 bg-white shadow-xs animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDiamonds.map((diamond, index) => (
              <motion.div
                key={diamond._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                <DiamondCard
                  diamond={diamond}
                  onQuickView={(d) => setQuickViewDiamond(d)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 3. The 4 Cs Science Feature Section */}
      <section id="the-4cs" className="border-y border-stone-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto space-y-2"
          >
            <Badge variant="gold" className="uppercase tracking-widest text-[10px]">
              Clean Crystallization Science
            </Badge>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              The 4 Cs of Lab-Grown Diamonds
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Every diamond cultivated in our foundry is chemically identical to earth diamonds, graded according to rigorous IGI and GIA laboratory criteria.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Cut */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: 0.05 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-stone-200 bg-stone-50/70 p-5 space-y-2.5 hover:border-stone-300 transition-colors shadow-xs hover:shadow-md"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-stone-200 text-stone-800 shadow-xs">
                <Sparkles className="h-4.5 w-4.5 text-amber-600" />
              </div>
              <h3 className="text-base font-bold text-stone-900">1. Precision Cut</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Determines how light reflects through pavilion facets. Our master cutters craft Ideal and Excellent grades for optimal brilliance.
              </p>
              <div className="text-[11px] font-mono text-stone-500 pt-1">
                Ideal • Excellent • Very Good
              </div>
            </motion.div>

            {/* Color */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: 0.12 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-stone-200 bg-stone-50/70 p-5 space-y-2.5 hover:border-stone-300 transition-colors shadow-xs hover:shadow-md"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-stone-200 text-stone-800 shadow-xs">
                <Layers className="h-4.5 w-4.5 text-sky-600" />
              </div>
              <h3 className="text-base font-bold text-stone-900">2. Optical Color</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Graded from D (pure colorless) through warm tint scales. Our CVD crystallization chambers ensure rare D, E, and F colorless purity.
              </p>
              <div className="text-[11px] font-mono text-stone-500 pt-1">
                D (Pure Colorless) to K
              </div>
            </motion.div>

            {/* Clarity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: 0.19 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-stone-200 bg-stone-50/70 p-5 space-y-2.5 hover:border-stone-300 transition-colors shadow-xs hover:shadow-md"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-stone-200 text-stone-800 shadow-xs">
                <Award className="h-4.5 w-4.5 text-rose-600" />
              </div>
              <h3 className="text-base font-bold text-stone-900">3. Crystal Clarity</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Free of earth mineral inclusions. We curate diamonds graded Flawless (FL) down to Very Slightly Included (VS), assuring eye-clean perfection.
              </p>
              <div className="text-[11px] font-mono text-stone-500 pt-1">
                FL • IF • VVS1 • VVS2 • VS1
              </div>
            </motion.div>

            {/* Carat */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: 0.26 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-stone-200 bg-stone-50/70 p-5 space-y-2.5 hover:border-stone-300 transition-colors shadow-xs hover:shadow-md"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-stone-200 text-stone-800 shadow-xs">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-stone-900">4. Carat Weight</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Because we cultivate diamonds in our own lab, you acquire larger, commanding carat weights for a fraction of mined diamond retail costs.
              </p>
              <div className="text-[11px] font-mono text-stone-500 pt-1">
                0.30 ct to 10.00 ct+
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Foundry Story Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border border-stone-200 bg-gradient-to-r from-amber-50/60 via-rose-50/40 to-orange-50/60 p-8 sm:p-12 text-center space-y-5 shadow-xs"
        >
          <Badge variant="orange" className="font-mono text-[10px]">
            Direct-to-Consumer Foundry
          </Badge>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 tracking-tight">
            Cultivated in Our Lab. Delivered to Your Door.
          </h2>
          <p className="mx-auto max-w-xl text-xs sm:text-sm text-stone-600 leading-relaxed">
            Eliminate traditional jeweler markups. Browse certified lab-grown diamonds with full IGI/GIA documentation, armored insured delivery, and our 30-day foundry guarantee.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/diamonds">
              <Button variant="luxury" size="lg" className="w-full sm:w-auto px-7">
                Browse Foundry Collection
              </Button>
            </Link>
            <Link href="/diamonds?discount=true">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-7">
                View Direct Offers
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Quick View Modal */}
      <DiamondQuickViewModal
        diamond={quickViewDiamond}
        isOpen={Boolean(quickViewDiamond)}
        onClose={() => setQuickViewDiamond(null)}
      />
    </div>
  );
}
