import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Atom,
  Sun,
  Award,
  ArrowRight,
  CheckCircle2,
  Gem,
  Factory,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About Us | The Story of Legacy Diamond Foundry",
  description:
    "Discover how Legacy Diamond cultivates 100% conflict-free, Type IIa certified diamonds using solar plasma reactors. Pure optical brilliance, GIA & IGI grading, and zero mining impact.",
  keywords: [
    "Legacy Diamond",
    "About Legacy Diamond",
    "Lab Grown Diamond Foundry",
    "Solar Powered Diamonds",
    "Type IIa Diamonds",
    "GIA Certified Lab Diamonds",
    "Ethical Fine Jewelry",
  ],
  openGraph: {
    title: "About Us | The Legacy Diamond Foundry Story",
    description:
      "Cultivating the world's most brilliant diamonds in high-temperature solar reactors. Zero mining. Pure brilliance.",
    type: "website",
    url: "https://legacydiamond.luxury/about",
  },
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Legacy Diamond Foundry",
    description:
      "Legacy Diamond is a high-technology gemological foundry cultivating Type IIa diamonds with solar energy and zero earth displacement.",
    publisher: {
      "@type": "Organization",
      name: "Legacy Diamond Foundry Inc.",
      url: "https://legacydiamond.luxury",
      logo: "https://legacydiamond.luxury/favicon.ico",
      founder: "Legacy Diamond Engineering Collective",
      foundingDate: "2024",
    },
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 border-b border-stone-200/80 bg-gradient-to-b from-[#faf8f5] via-[#f5f2eb] to-[#faf8f5]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-900/20 bg-amber-50/80 px-4 py-1.5 text-xs font-mono font-medium text-amber-900">
            <Atom className="h-3.5 w-3.5 text-amber-700" />
            <span>OUR STORY • 100% CERTIFIED & CONFLICT-FREE</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-[1.15]">
            Diamonds Created With <br />
            <span className="italic font-normal text-amber-800">Clean Solar Energy</span>
          </h1>

          <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl mx-auto">
            Legacy Diamond was founded with a clear purpose: fine jewellery should celebrate love and life&apos;s special milestones without harming the earth. We use clean solar energy to grow diamonds that are chemically, physically, and optically identical to mined diamonds — bringing you pure brilliance at direct factory prices.
          </p>
        </div>
      </section>

      {/* The 4 Core Pillars */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            The Legacy Diamond Promise
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Every diamond in our collection satisfies four uncompromising standards of excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs hover:border-amber-300 transition-all space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-800">
              <Sun className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">100% Solar Powered</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Our advanced growth reactors run exclusively on dedicated solar energy, guaranteeing a clean green footprint from seed crystal to polished gemstone.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs hover:border-amber-300 transition-all space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-800">
              <Gem className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">Type IIa Purity</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Only 1-2% of all mined diamonds in the world qualify as Type IIa (pure carbon with zero nitrogen impurities). Every Legacy Diamond achieves this rare benchmark.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs hover:border-amber-300 transition-all space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-800">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">IGI & GIA Certified</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Independently examined, graded, and micro-laser inscribed on the girdle by internationally recognized gemological laboratories.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs hover:border-amber-300 transition-all space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-800">
              <Factory className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">Direct Factory Rates</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              By removing middleman distributors, celebrity royalties, and retail showroom overheads, we pass 100% of the savings directly to you.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison: Foundry Cultivation vs Earth Mining */}
      <section className="bg-stone-900 text-stone-100 py-16 sm:py-20 border-y border-stone-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
              Comparative Impact Analysis
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white">
              Why Lab-Grown Diamonds are the Future
            </h2>
            <p className="text-xs sm:text-sm text-stone-400">
              How a 1.0-carat diamond impacts our planet depending on how it is sourced.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mined Diamond */}
            <div className="rounded-2xl border border-rose-900/40 bg-stone-950/60 p-6 sm:p-8 space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">
                Traditional Earth Mining
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-stone-400">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>250 tons</strong> of earth blasted and displaced per carat</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>Over 500 litres</strong> of clean water consumed and polluted</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>High carbon emissions</strong> from diesel-powered excavation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>Multiple middleman layers increasing customer retail prices</span>
                </li>
              </ul>
            </div>

            {/* Legacy Diamond */}
            <div className="rounded-2xl border border-amber-500/50 bg-stone-950 p-6 sm:p-8 space-y-4 relative shadow-xl shadow-amber-950/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                  Legacy Diamond
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  100% Eco-Pure
                </span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-stone-200">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Zero earth displaced</strong> or mined</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Closed-loop recycled water</strong> system</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>100% clean solar energy</strong> powering our growth chambers</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Authentic IGI / GIA certificate</strong> for each stone</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Master Faceting & Craftsmanship */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8 text-center">
        <div className="space-y-3">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Cut and Polished With Laser Precision
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Every rough crystal is scanned in 3D to map its internal light reflection. Our master diamond polishers use automated high-precision lasers to cut facets at exact angles for maximum sparkle and rainbow fire.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/diamonds">
            <Button variant="luxury" size="lg" className="w-full sm:w-auto text-xs sm:text-sm gap-2 bg-stone-900 hover:bg-stone-800 text-white">
              <span>Browse Certified Diamonds</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-xs sm:text-sm">
              Talk to Diamond Expert
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
