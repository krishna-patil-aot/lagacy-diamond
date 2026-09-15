"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useFeaturedDiamonds } from "@/hooks/useFeaturedDiamonds";
import { DiamondCard } from "@/components/store/DiamondCard";
import { DiamondQuickViewModal } from "@/components/store/DiamondQuickViewModal";
import { IDiamond, DiamondShape } from "@/types/diamond.types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Slider } from "@/components/ui/Slider";
import { useFilterStore } from "@/store/useFilterStore";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/config/site.config";
import { InquiryConversationModal } from "@/components/contact/InquiryConversationModal";
import {
  Gem,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Search,
  Atom,
  Star,
  Flame,
  Compass,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { motion } from "motion/react";

interface IShapeSpec {
  shape: DiamondShape;
  label: string;
  tagline: string;
  facets: number;
  lightReturn: string;
  fireScore: string;
  description: string;
  ratio: string;
}

const QUICK_SHAPES: IShapeSpec[] = [
  {
    shape: "Round",
    label: "Round Brilliant",
    tagline: "The Optical Pinnacle of Light Refraction",
    facets: 57,
    lightReturn: "99.8%",
    fireScore: "99.4%",
    description: "57 engineered facets calculating absolute total internal reflection. Maximum fiery scintillation and rainbow dispersion.",
    ratio: "1.00 : 1.00",
  },
  {
    shape: "Emerald",
    label: "Emerald Step Cut",
    tagline: "Hall of Mirrors & Architectural Purity",
    facets: 49,
    lightReturn: "97.6%",
    fireScore: "96.9%",
    description: "Concentric rectangular step facets creating an endless optical abyss. Favored by royalty for showcasing crystal clarity.",
    ratio: "1.40 : 1.00",
  },
  {
    shape: "Oval",
    label: "Oval Radiance",
    tagline: "Elongated Grace with Maximum Spread",
    facets: 58,
    lightReturn: "98.9%",
    fireScore: "98.2%",
    description: "Combines brilliant-cut sparkle with an alluring elongating silhouette, maximizing finger coverage and presence.",
    ratio: "1.35 : 1.00",
  },
  {
    shape: "Princess",
    label: "Princess Square",
    tagline: "Modern Geometric Power & Edge",
    facets: 76,
    lightReturn: "98.4%",
    fireScore: "98.1%",
    description: "Inverted pyramid pavilion with chevron facets delivering intense four-cornered brilliance and sharp geometry.",
    ratio: "1.02 : 1.00",
  },
  {
    shape: "Cushion",
    label: "Baroque Cushion",
    tagline: "Vintage Pillow Softness & Broad Fire",
    facets: 64,
    lightReturn: "98.1%",
    fireScore: "98.7%",
    description: "Rounded pillow corners radiating broad flashes of colored spectral fire, reminiscent of classic European heirlooms.",
    ratio: "1.05 : 1.00",
  },
  {
    shape: "Radiant",
    label: "Aurora Radiant",
    tagline: "Step-Cut Profile Meets Brilliant Fire",
    facets: 70,
    lightReturn: "99.1%",
    fireScore: "98.9%",
    description: "Cut-corner rectangular silhouette engineered with 70 brilliant facets, producing intense crackling sparkle.",
    ratio: "1.25 : 1.00",
  },
];

const CRAFT_CHAPTERS = [
  {
    step: "01",
    title: "Solar Plasma Synthesis",
    subtitle: "Interstellar Carbon Crystallization",
    description: "Inside proprietary vacuum reactors heated to 3,000°C by 100% solar energy, methane and hydrogen gases disassociate into pure cosmic carbon ions, depositing atom-by-atom into a Type IIa diamond lattice.",
    badge: "100% Solar Powered",
  },
  {
    step: "02",
    title: "Laser Nanometer Faceting",
    subtitle: "Cut to Optical Infinity",
    description: "Guided by laser interferometer scanning, each raw crystal is planned and cleaved to nanometer tolerances. Every facet angle is locked to the critical optical angle of 24.4° for zero light leakage.",
    badge: "Nanometer Precision",
  },
  {
    step: "03",
    title: "Master Haute Atelier Setting",
    subtitle: "Forged in 18K Gold & 950 Platinum",
    description: "At our Geneva atelier, master jewelers hand-forge bespoke claws, cathedral shoulders, and hidden halos in recycled 18k Gold or aerospace-grade 950 Platinum, ensuring heirloom longevity.",
    badge: "Geneva Bench Craft",
  },
  {
    step: "04",
    title: "Sovereign GIA Verification",
    subtitle: "Micro-Laser Dossier & Insured Delivery",
    description: "Every finished gemstone is independently graded by GIA or IGI, microscopically laser-inscribed with a unique registry number, and dispatched via fully insured armored courier.",
    badge: "GIA / IGI Laser Inscribed",
  },
];

const TESTIMONIALS = [
  {
    quote: "Receiving our DarkGem solitaire in London was like opening a vault from another century. The Type IIa crystal clarity is so pure it seems almost liquid. Exceptional concierge service from start to finish.",
    author: "Lady Eleanor Vance",
    location: "Kensington, London",
    detail: "Custom 3.42ct Emerald Solitaire in 950 Platinum",
    rating: 5,
  },
  {
    quote: "Knowing our engagement diamond was created using 100% solar energy with zero earth destruction made our commitment even more meaningful. The fire dispersion outshines every mined ring we compared.",
    author: "Julian & Priya Mercer",
    location: "Zurich, Switzerland",
    detail: "Bespoke 2.80ct Oval Radiance Solitaire",
    rating: 5,
  },
  {
    quote: "The direct communication with the Master Gemologist through the live portal gave me absolute peace of mind. Every CAD iteration was handled with utmost care. DarkGem is redefining modern luxury.",
    author: "Marcus Aurelius Thorne",
    location: "New York, USA",
    detail: "4.15ct Round Brilliant Sovereign Commission",
    rating: 5,
  },
];

export default function HomePage() {
  const router = useRouter();
  const { featuredDiamonds, isLoading } = useFeaturedDiamonds();
  const [quickViewDiamond, setQuickViewDiamond] = useState<IDiamond | null>(null);
  const [selectedShape, setSelectedShape] = useState<IShapeSpec>(QUICK_SHAPES[0]);
  const [caratSlider, setCaratSlider] = useState<number>(2.0);
  const [isConciergeOpen, setIsConciergeOpen] = useState<boolean>(false);
  const { toggleShape, resetFilters } = useFilterStore();

  const handleShapeSelect = (shape: DiamondShape) => {
    resetFilters();
    toggleShape(shape);
    router.push("/diamonds");
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-24 overflow-x-hidden bg-[#faf8f5] text-stone-900 selection:bg-amber-200 selection:text-stone-900">
      {/* ---------------------------------------------------- */}
      {/* PROLOGUE: THE LIGHT HORIZON (CINEMATIC HERO) */}
      {/* ---------------------------------------------------- */}
      <section className="relative min-h-[85vh] flex items-center justify-center border-b border-stone-200/80 bg-gradient-to-b from-[#faf8f5] via-[#f7f5f0] to-[#faf8f5] overflow-hidden pt-12 pb-16">
        {/* Soft Radiant Sunlight Aura */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-gradient-to-tr from-amber-200/50 via-rose-100/40 to-orange-100/50 blur-[110px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#faf8f5] to-transparent pointer-events-none" />

        {/* Ambient Floating Particle Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(180,140,60,0.06)_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-amber-900/20 bg-white/90 px-4 py-1.5 text-xs font-mono font-medium text-amber-900 shadow-xs backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-700 animate-pulse" />
            <span>BORN IN DARKNESS • PERFECTED IN LIGHT • 100% SOLAR TYPE IIa</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="font-serif text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-stone-900 leading-[1.08]"
          >
            Where Cosmic Carbon <br />
            <span className="italic font-normal text-amber-800">
              Becomes Sovereign Brilliance
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mx-auto max-w-2xl text-xs sm:text-base text-stone-600 leading-relaxed font-normal"
          >
            {siteConfig.brandName} crafts investment-grade Type IIa certified diamonds cultivated inside proprietary 3,000°C solar plasma reactors. Uncompromising optical fire, IGI &amp; GIA grading dossiers, and zero earth displacement.
          </motion.p>

          {/* Primary Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <Link href="/diamonds">
              <Button
                variant="luxury"
                size="lg"
                className="w-full sm:w-auto text-xs sm:text-sm px-8 h-12 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl shadow-md transition-all hover:scale-[1.02]"
              >
                <Search className="h-4 w-4 mr-2" />
                Explore The Vault Collection
              </Button>
            </Link>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsConciergeOpen(true)}
              className="w-full sm:w-auto text-xs sm:text-sm px-7 h-12 rounded-xl border-stone-300 bg-white/90 text-stone-800 hover:border-amber-600 hover:text-amber-900 shadow-xs backdrop-blur-xs transition-all hover:scale-[1.02]"
            >
              <Sparkles className="h-4 w-4 mr-2 text-amber-700" />
              Enter Private Salon Concierge
            </Button>
          </motion.div>

          {/* Quick Shape Jump Chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="pt-6 sm:pt-8"
          >
            <span className="text-[10px] uppercase tracking-[0.25em] text-stone-500 font-mono block mb-3">
              Explore Sovereign Solitaire Cuts
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
              {QUICK_SHAPES.map((item) => (
                <motion.button
                  key={item.shape}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleShapeSelect(item.shape)}
                  className="rounded-full border border-stone-200 bg-white/90 px-4 py-1.5 text-xs font-medium text-stone-700 backdrop-blur-md transition-all hover:border-amber-400 hover:bg-white hover:text-stone-900 cursor-pointer shadow-xs"
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* CHAPTER 1: THE COSMIC GENESIS (STORYTELLING CARDS) */}
      {/* ---------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <Badge variant="outline" className="text-[10px] font-mono tracking-widest text-amber-800 border-amber-300 bg-amber-50 uppercase px-3 py-1">
            Chapter I • The Cosmic Genesis
          </Badge>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            How Dark Carbon Becomes Sovereign Fire
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Every diamond in history was forged in subterranean darkness. We harness that exact cosmic crystallization inside renewable solar plasma crucibles — achieving chemical perfection without scarred landscapes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 space-y-4 relative shadow-xs hover:border-amber-300 transition-colors"
          >
            <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
              <Atom className="h-6 w-6" />
            </div>
            <span className="font-mono text-xs text-amber-800 font-semibold block">01 • THE DARK ORIGIN</span>
            <h3 className="font-serif text-xl font-bold text-stone-900">Stellar Carbon Seed</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              We select ultra-rare diamond crystal seeds with zero nitrogen impurities. Methane gas extracted from renewable biological processes supplies pure cosmic carbon atoms.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-stone-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-700" />
              <span>100% Pure Carbon Lattice</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-2xl border border-amber-300 bg-gradient-to-b from-amber-50/70 to-white p-6 sm:p-8 space-y-4 relative shadow-xs hover:border-amber-400 transition-colors"
          >
            <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Flame className="h-6 w-6 text-amber-700 animate-pulse" />
            </div>
            <span className="font-mono text-xs text-amber-800 font-semibold block">02 • SOLAR CRUCIBLE</span>
            <h3 className="font-serif text-xl font-bold text-stone-900">3,000°C Plasma Reactor</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Inside proprietary microwave reactors, 100% solar energy generates plasma hotter than the sun’s surface. Carbon ions rain down onto the seed, crystallizing at 10 to 15 microns per hour.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-amber-900">
              <Sparkles className="h-3.5 w-3.5 text-amber-700" />
              <span>Zero Earth Displacement</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 space-y-4 relative shadow-xs hover:border-amber-300 transition-colors"
          >
            <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="font-mono text-xs text-amber-800 font-semibold block">03 • OPTICAL SOVEREIGNTY</span>
            <h3 className="font-serif text-xl font-bold text-stone-900">Type IIa Perfection</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Less than 2% of mined diamonds achieve Type IIa chemical purity. DarkGem solitaires exhibit absolute optical transparency, zero fluorescence haze, and maximum fire dispersion.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-stone-700">
              <Award className="h-3.5 w-3.5 text-amber-700" />
              <span>GIA &amp; IGI Verified Dossier</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* CHAPTER 2: INTERACTIVE SOLITAIRE VISUALIZER */}
      {/* ---------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <Badge variant="outline" className="text-[10px] font-mono tracking-widest text-amber-800 border-amber-300 bg-amber-50 uppercase px-3 py-1">
              Chapter II • The Solitaire Visualizer
            </Badge>
            <h2 className="mt-2 font-serif text-2xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              Interactive Diamond Fire &amp; Facet Explorer
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-600">
              Experience the optical characteristics, facet geometry, and proportional sparkle across each signature DarkGem cut.
            </p>
          </div>

          <Link href="/diamonds">
            <Button variant="ghost" className="text-xs text-amber-800 hover:text-amber-900 font-mono group">
              <span>View Certified Registry</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Visualizer Workbench */}
        <div className="rounded-3xl border border-stone-200 bg-gradient-to-br from-white via-[#faf8f5] to-white p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Interactive Shape Selector Chips & Carat Scale */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-800 flex items-center gap-1.5 font-bold">
                  <Compass className="h-3.5 w-3.5" />
                  <span>Select Signature Cut</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {QUICK_SHAPES.map((item) => {
                    const isSelected = selectedShape.shape === item.shape;
                    return (
                      <button
                        key={item.shape}
                        type="button"
                        onClick={() => setSelectedShape(item)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-amber-600 bg-amber-100/60 text-amber-950 shadow-xs font-semibold"
                            : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900"
                        }`}
                      >
                        <div className="font-semibold text-xs">{item.shape}</div>
                        <div className="text-[10px] font-mono text-stone-500 mt-0.5">{item.facets} Facets</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Carat Scale Slider */}
              <div className="space-y-3 p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-stone-700 flex items-center gap-1.5">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-amber-700" />
                    <span>Target Carat Scale</span>
                  </span>
                  <span className="text-sm font-mono font-bold text-amber-800">
                    {caratSlider.toFixed(2)} Carats
                  </span>
                </div>
                <Slider
                  min={0.8}
                  max={5.0}
                  step={0.1}
                  value={[caratSlider]}
                  onValueChange={(val) => setCaratSlider(val[0])}
                  className="py-1 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-stone-500">
                  <span>0.80 ct</span>
                  <span>2.50 ct (Popular)</span>
                  <span>5.00 ct</span>
                </div>
              </div>

              {/* Consultation Trigger Button */}
              <Button
                variant="luxury"
                size="md"
                onClick={() => setIsConciergeOpen(true)}
                className="w-full text-xs font-mono h-11 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-xl gap-2 shadow-xs"
              >
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Inquire {caratSlider.toFixed(2)}ct {selectedShape.shape} with Concierge</span>
              </Button>
            </div>

            {/* Right: Dynamic Optical Shimmer Canvas & Metrics */}
            <div className="lg:col-span-7 rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 space-y-6 relative shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <div className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                    {selectedShape.label}
                  </div>
                  <div className="text-xs font-mono text-amber-800 mt-0.5">
                    {selectedShape.tagline}
                  </div>
                </div>
                <Badge variant="gold" className="text-[10px] font-mono px-2.5 py-0.5 bg-amber-100 text-amber-900 border-amber-300">
                  Type IIa Verified
                </Badge>
              </div>

              {/* Animated Facet Radiance Simulation Box */}
              <div className="relative h-44 sm:h-52 rounded-2xl bg-gradient-to-br from-amber-50/60 via-[#fcfbfa] to-stone-100 flex items-center justify-center overflow-hidden border border-amber-200/60">
                <motion.div
                  key={`${selectedShape.shape}-${caratSlider}`}
                  initial={{ scale: 0.85, opacity: 0, rotate: -5 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative flex items-center justify-center"
                  style={{
                    transform: `scale(${0.9 + (caratSlider / 5) * 0.4})`,
                  }}
                >
                  {/* Outer Crystal Halo */}
                  <div className="absolute -inset-8 rounded-full bg-amber-300/30 blur-xl animate-pulse" />
                  
                  {/* Central Diamond Facet Icon */}
                  <div className="h-28 w-28 rounded-2xl bg-white border-2 border-amber-500 shadow-xl flex items-center justify-center transform rotate-45 relative">
                    <Gem className="h-12 w-12 text-amber-700 transform -rotate-45" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-100/30 to-transparent opacity-60 rounded-2xl" />
                  </div>
                </motion.div>

                <div className="absolute bottom-3 right-3 text-[10px] font-mono text-stone-500 bg-white/90 px-2 py-1 rounded-md border border-stone-200">
                  Scale Ratio: {selectedShape.ratio}
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                {selectedShape.description}
              </p>

              {/* Live Optical Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-center">
                  <div className="text-[10px] font-mono uppercase text-stone-500">Light Return</div>
                  <div className="text-base font-bold text-stone-900 mt-1">{selectedShape.lightReturn}</div>
                  <div className="text-[9px] font-mono text-stone-400">Total Internal Refl.</div>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-center">
                  <div className="text-[10px] font-mono uppercase text-stone-500">Fire Dispersion</div>
                  <div className="text-base font-bold text-amber-800 mt-1">{selectedShape.fireScore}</div>
                  <div className="text-[9px] font-mono text-stone-400">Prismatic Spectrum</div>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-center">
                  <div className="text-[10px] font-mono uppercase text-stone-500">Facet Structure</div>
                  <div className="text-base font-bold text-stone-900 mt-1">{selectedShape.facets} Facets</div>
                  <div className="text-[9px] font-mono text-stone-400">Laser Engineered</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* CHAPTER 3: FEATURED VAULT COLLECTION */}
      {/* ---------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <Badge variant="outline" className="text-[10px] font-mono tracking-widest text-amber-800 border-amber-300 bg-amber-50 uppercase px-3 py-1">
              Chapter III • The Curated Vault
            </Badge>
            <h2 className="mt-2 font-serif text-2xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              Featured Sovereign Certified Solitaires
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-600">
              Hand-selected for absolute crystal purity, zero ocular cloudiness, and sovereign optical fire.
            </p>
          </div>

          <Link href="/diamonds">
            <Button variant="luxury" size="sm" className="text-xs font-mono h-10 px-5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl shadow-xs">
              <span>View Entire Registry</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>

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

      {/* ---------------------------------------------------- */}
      {/* CHAPTER 4: THE HAUTE ATELIER CRAFT TIMELINE */}
      {/* ---------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <Badge variant="outline" className="text-[10px] font-mono tracking-widest text-amber-800 border-amber-300 bg-amber-50 uppercase px-3 py-1">
            Chapter IV • The Haute Atelier Craft
          </Badge>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            The Journey From Plasma To Heirloom
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Every step of a DarkGem creation is governed by exacting European gemological protocol.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CRAFT_CHAPTERS.map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="rounded-2xl border border-stone-200 bg-white p-6 space-y-4 hover:border-amber-300 transition-colors flex flex-col justify-between shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-bold text-amber-700/60">{item.step}</span>
                  <Badge variant="outline" className="text-[10px] font-mono border-amber-300 text-amber-800 bg-amber-50">
                    {item.badge}
                  </Badge>
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-900">{item.title}</h3>
                <div className="text-xs font-mono text-amber-800">{item.subtitle}</div>
                <p className="text-xs text-stone-600 leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* CHAPTER 5: CLIENT TESTIMONIALS & HEIRLOOM STORIES */}
      {/* ---------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="outline" className="text-[10px] font-mono tracking-widest text-amber-800 border-amber-300 bg-amber-50 uppercase px-3 py-1">
            Chapter V • Heirloom Chronicles
          </Badge>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            Loved By Discerning Collectors
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Voices from clients who chose the path of sustainable optical purity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-7 space-y-4 flex flex-col justify-between shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-600">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-500" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="border-t border-stone-100 pt-3 space-y-1">
                <div className="font-serif font-bold text-sm text-stone-900">{t.author}</div>
                <div className="text-[11px] font-mono text-stone-500">{t.location}</div>
                <div className="text-[10px] font-mono text-amber-800 font-semibold">{t.detail}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* CHAPTER 6: PRIVATE CONCIERGE INVITATION */}
      {/* ---------------------------------------------------- */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50/70 via-[#fcfbfa] to-amber-50/70 p-8 sm:p-14 text-center space-y-6 shadow-xs relative overflow-hidden">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-100/70 px-4 py-1 text-xs font-mono font-medium text-amber-900">
            <Sparkles className="h-3.5 w-3.5 text-amber-700" />
            <span>DIRECT ATELIER ACCESS</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight">
            Begin Your DarkGem Commission
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
            Connect directly with our Lead Gemologist to discuss bespoke 3D CAD ring settings, private vault viewings, or certified solitaire acquisitions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              variant="luxury"
              size="lg"
              onClick={() => setIsConciergeOpen(true)}
              className="w-full sm:w-auto text-xs sm:text-sm px-8 h-12 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl shadow-md"
            >
              <Sparkles className="h-4 w-4 mr-2 text-amber-400" />
              Open Live Concierge Chat
            </Button>

            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-xs sm:text-sm px-7 h-12 rounded-xl border-stone-300 bg-white text-stone-800 hover:border-amber-600 hover:text-stone-900 shadow-xs"
              >
                Schedule Salon Appointment
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewDiamond && (
        <DiamondQuickViewModal
          diamond={quickViewDiamond}
          isOpen={Boolean(quickViewDiamond)}
          onClose={() => setQuickViewDiamond(null)}
        />
      )}

      {/* Live Concierge Conversation Modal */}
      <InquiryConversationModal
        inquiryNumber={null}
        isOpen={isConciergeOpen}
        onClose={() => setIsConciergeOpen(false)}
      />
    </div>
  );
}
