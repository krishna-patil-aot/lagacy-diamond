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
  Star,
  Quote,
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
            <Atom className="h-3.5 w-3.5 text-amber-700" />
            <span>100% CERTIFIED LAB-GROWN DIAMONDS • DIRECT FACTORY RATES</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 leading-[1.15]"
          >
            Direct From Our Lab To{" "}
            <motion.span
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="inline-block text-stone-800 underline decoration-stone-300 underline-offset-8 transition-colors hover:decoration-amber-400"
            >
              Your Special Moments
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto max-w-2xl text-xs sm:text-sm text-stone-600 leading-relaxed"
          >
            Legacy Diamond brings you 100% genuine Type IIa certified diamonds grown with solar power. By eliminating retail middlemen, we offer the finest sparkle, IGI & GIA certifications, and honest pricing.
          </motion.p>

          {/* Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1"
          >
            <Link href="/diamonds">
              <Button variant="luxury" size="lg" className="w-full sm:w-auto text-xs sm:text-sm px-6 h-10 sm:h-11 shadow-xs hover:shadow-md transition-shadow bg-stone-900 hover:bg-stone-800 text-white">
                <Search className="h-3.5 w-3.5 mr-2" />
                Browse Certified Diamonds
              </Button>
            </Link>

            <Link href="/gemology">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-xs sm:text-sm px-6 h-10 sm:h-11 hover:border-stone-400 transition-colors">
                Diamond Buying Guide (4Cs)
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
              Shop by Popular Diamond Shape
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
                Handpicked Collection
              </span>
            </div>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Featured Certified Diamonds
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-600">
              Direct-from-factory certified diamonds with exceptional crystal clarity, eye-clean perfection, and maximum sparkle.
            </p>
          </div>

          <Link href="/diamonds">
            <Button variant="ghost" className="text-xs text-stone-800 hover:text-stone-900 group">
              <span>View All Diamonds</span>
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
              Simple Diamond Guide
            </Badge>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              The 4 Cs of Lab-Grown Diamonds Made Simple
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Every diamond is 100% genuine carbon, independently certified and graded to the highest laboratory standards by IGI and GIA.
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
                Determines how brightly your diamond sparkles. We specialize in Ideal and Excellent cuts for breathtaking brilliance.
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
              <h3 className="text-base font-bold text-stone-900">2. Diamond Colour</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Graded from D (completely colourless) to warm shades. Our diamonds shine in rare, pure D, E, and F colourless grades.
              </p>
              <div className="text-[11px] font-mono text-stone-500 pt-1">
                D (Pure Colourless) to J
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
              <h3 className="text-base font-bold text-stone-900">3. Clarity & Purity</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Clean and sparkling with zero visible flaws. We offer Flawless (FL) down to Very Slightly Included (VS), all 100% eye-clean.
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
                Direct factory pricing means you get a larger, grander diamond carat for a fraction of traditional showroom prices.
              </p>
              <div className="text-[11px] font-mono text-stone-500 pt-1">
                0.30 ct to 10.00 ct+
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Factory Story Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border border-stone-200 bg-gradient-to-r from-amber-50/60 via-rose-50/40 to-orange-50/60 p-8 sm:p-12 text-center space-y-5 shadow-xs"
        >
          <Badge variant="orange" className="font-mono text-[10px]">
            Direct From Factory To You
          </Badge>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 tracking-tight">
            Grown in Our Lab. Delivered Safely to Your Door.
          </h2>
          <p className="mx-auto max-w-xl text-xs sm:text-sm text-stone-600 leading-relaxed">
            Save up to 60-70% compared to traditional retail jewelers. Enjoy genuine IGI/GIA certificates, free insured delivery across India, and an easy 30-day money-back guarantee.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/diamonds">
              <Button variant="luxury" size="lg" className="w-full sm:w-auto px-7 bg-stone-900 hover:bg-stone-800 text-white">
                Browse All Diamonds
              </Button>
            </Link>
            <Link href="/sustainability">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-7">
                Our Eco-Friendly Promise
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 5. Collector Experiences & Testimonials */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Customer Reviews & Experiences
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Real stories from couples, families, and engagement ring buyers across India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Review 1 */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <Quote className="h-6 w-6 text-amber-600/40" />
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                &ldquo;We ordered a 2.4ct Oval D-VVS1 for our engagement. When our family jeweller inspected the stone under 40x magnification, he was stunned by the Type IIa purity and fire. Legacy Diamond saved us over ₹1.5 Lakhs compared to showroom prices.&rdquo;
              </p>
            </div>
            <div className="border-t border-stone-100 pt-3">
              <span className="font-bold text-xs text-stone-900 block">Aarav & Meera S.</span>
              <span className="text-[10px] text-stone-400 font-mono">Mumbai, Maharashtra • Custom Oval Engagement Ring</span>
            </div>
          </div>

          {/* Review 2 */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <Quote className="h-6 w-6 text-amber-600/40" />
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                &ldquo;Knowing our diamond was grown using 100% solar energy with zero environmental destruction gave us complete peace of mind. The insured doorstep delivery was safe and the IGI certificate was easily verified online.&rdquo;
              </p>
            </div>
            <div className="border-t border-stone-100 pt-3">
              <span className="font-bold text-xs text-stone-900 block">Rohan & Ananya K.</span>
              <span className="text-[10px] text-stone-400 font-mono">Bengaluru, Karnataka • 2.1ct Round Solitaire</span>
            </div>
          </div>

          {/* Review 3 */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <Quote className="h-6 w-6 text-amber-600/40" />
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                &ldquo;The AI Assistant helped me find an eye-clean Emerald cut diamond that fit my exact budget within seconds. The custom platinum setting crafted by their artisans is stunning.&rdquo;
              </p>
            </div>
            <div className="border-t border-stone-100 pt-3">
              <span className="font-bold text-xs text-stone-900 block">Pooja M.</span>
              <span className="text-[10px] text-stone-400 font-mono">New Delhi • Emerald Step Solitaire</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Private Consultation Callout */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-stone-800 bg-stone-950 p-8 sm:p-12 text-stone-100 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Custom Jewellery & Free Consultations</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Design Your Dream Custom Jewellery
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              Book a personalized appointment with our diamond specialists in Mumbai, Bengaluru, Delhi, or connect with us directly over a video call.
            </p>
          </div>

          <div className="shrink-0">
            <Link href="/contact">
              <Button variant="luxury" size="lg" className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-8 h-12 text-sm shadow-lg shadow-amber-600/20">
                Book Free Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JewelryStore",
            name: "Legacy Diamond Foundry",
            description:
              "Cultivating Type IIa certified diamonds in high-temperature solar reactors with zero earth displacement.",
            url: "https://legacydiamond.luxury",
            logo: "https://legacydiamond.luxury/favicon.ico",
            telephone: "+1-800-LEGACY-DIA",
            priceRange: "$$$$",
            paymentAccepted: "Credit Card, Wire Transfer, Vault Escrow",
            currenciesAccepted: "USD, EUR, GBP, CHF",
          }),
        }}
      />

      {/* Quick View Modal */}
      <DiamondQuickViewModal
        diamond={quickViewDiamond}
        isOpen={Boolean(quickViewDiamond)}
        onClose={() => setQuickViewDiamond(null)}
      />
    </div>
  );
}
