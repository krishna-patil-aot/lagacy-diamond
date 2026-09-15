import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: `The Gemological 4Cs Masterclass & Diamond Guide | ${siteConfig.brandName}`,
  description:
    "An authoritative masterclass on diamond grading: Cut, Color, Clarity, and Carat weight. Understand Type IIa crystal purity, proportions, fluorescence, and GIA & IGI laboratory standards.",
  keywords: [
    ...siteConfig.seo.keywords,
    "Diamond 4Cs Guide",
    "Diamond Cut Grading",
    "Diamond Clarity Scale",
    "Diamond Color Scale",
    "Type IIa Diamonds",
    "GIA Lab Diamond Grading",
    "IGI Diamond Certification",
    "Diamond Proportions",
  ],
  openGraph: {
    title: `The Gemological 4Cs Masterclass | ${siteConfig.brandName}`,
    description: "An authoritative masterclass on diamond grading: Cut, Color, Clarity, and Carat.",
    url: `${siteConfig.appUrl}/gemology`,
    siteName: siteConfig.brandName,
  },
};

export default function GemologyPage() {
  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-16 sm:py-24 border-b border-stone-200/80 bg-gradient-to-b from-[#faf8f5] via-[#f5f2eb] to-[#faf8f5]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-900/20 bg-amber-50/80 px-4 py-1.5 text-xs font-mono font-medium text-amber-900">
            <Compass className="h-3.5 w-3.5 text-amber-700" />
            <span>FOUNDRY GEMOLOGY ARCHIVES • MASTER EDUCATION</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-[1.15]">
            The Architecture of Fire: <br />
            <span className="italic font-normal text-amber-800">The 4Cs Masterclass</span>
          </h1>

          <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl mx-auto">
            A diamond is not merely an ornament; it is a masterwork of optical geometry and atomic purity.
            Learn the four fundamental grading criteria that dictate a gemstone’s radiance, rarity, and value.
          </p>
        </div>
      </section>

      {/* 4Cs Detailed Sections */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 1. CUT */}
        <div className="rounded-3xl border border-stone-200 bg-white p-8 sm:p-12 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-serif font-bold text-lg">
              1
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-800 font-bold block">
                The Most Important Factor
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Cut Grade & Maximum Sparkle
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
            While nature and science govern colour and clarity, <strong>Cut</strong> is the result of master craftsmanship. An Ideal or Excellent cut acts like internal mirrors: light enters the top, bounces inside the diamond, and reflects straight back to your eyes as dazzling white brilliance and rainbow fire.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4 space-y-1.5 text-xs">
              <span className="font-bold text-stone-900 block">Table Percentage</span>
              <p className="text-stone-500">The flat top surface. Ideal range is 54% to 60% for maximum light return.</p>
            </div>
            <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4 space-y-1.5 text-xs">
              <span className="font-bold text-stone-900 block">Depth Percentage</span>
              <p className="text-stone-500">Total height of diamond. Ideal range is 60% to 62.5% so light does not leak out from the sides.</p>
            </div>
            <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4 space-y-1.5 text-xs">
              <span className="font-bold text-stone-900 block">Polish & Symmetry</span>
              <p className="text-stone-500">Precise facet alignment ensuring crisp, sharp, mirror-like sparkle.</p>
            </div>
          </div>
        </div>

        {/* 2. COLOR */}
        <div className="rounded-3xl border border-stone-200 bg-white p-8 sm:p-12 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-serif font-bold text-lg">
              2
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-800 font-bold block">
                Pure & Ice-White
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Diamond Colour (D through J)
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
            In white diamonds, the absence of colour indicates the highest quality. Mined diamonds frequently contain nitrogen atoms that cause a yellowish tint. In our solar reactors, we grow <strong>Type IIa crystals</strong>—the purest carbon form with zero nitrogen impurities—yielding ice-white diamonds in top D, E, and F colourless grades.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="rounded-xl border border-amber-400 bg-amber-50/50 p-3 text-center">
              <span className="font-mono font-bold text-amber-900 text-base block">D - F</span>
              <span className="text-stone-600 font-medium">Colourless (Highest Grade)</span>
            </div>
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-center">
              <span className="font-mono font-bold text-stone-800 text-base block">G - H</span>
              <span className="text-stone-500 font-medium">Near Colourless (Best Value)</span>
            </div>
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-center">
              <span className="font-mono font-bold text-stone-800 text-base block">I - J</span>
              <span className="text-stone-500 font-medium">Faint Warmth</span>
            </div>
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-center">
              <span className="font-mono font-bold text-stone-800 text-base block">K - Z</span>
              <span className="text-stone-500 font-medium">Visible Tint</span>
            </div>
          </div>
        </div>

        {/* 3. CLARITY */}
        <div className="rounded-3xl border border-stone-200 bg-white p-8 sm:p-12 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-serif font-bold text-lg">
              3
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-800 font-bold block">
                Eye-Clean Purity
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Clarity: From Flawless to Eye-Clean
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
            Clarity measures microscopic natural characteristics (inclusions) evaluated under 10x magnification. All {siteConfig.brandName} diamonds are hand-selected from <strong>FL down to VS2</strong>, guaranteeing they appear 100% clean and flawless to the naked eye.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-center">
              <span className="font-mono font-bold text-stone-900 text-sm block">FL / IF</span>
              <span className="text-stone-500">Flawless</span>
            </div>
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-center">
              <span className="font-mono font-bold text-stone-900 text-sm block">VVS1 / VVS2</span>
              <span className="text-stone-500">Very Very Slight</span>
            </div>
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-center">
              <span className="font-mono font-bold text-stone-900 text-sm block">VS1 / VS2</span>
              <span className="text-stone-500">Eye-Clean (Smart Choice)</span>
            </div>
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-center">
              <span className="font-mono font-bold text-stone-900 text-sm block">SI1 / SI2</span>
              <span className="text-stone-500">Slight Inclusions</span>
            </div>
          </div>
        </div>

        {/* 4. CARAT */}
        <div className="rounded-3xl border border-stone-200 bg-white p-8 sm:p-12 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-serif font-bold text-lg">
              4
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-800 font-bold block">
                Weight & Finger Size
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Carat Weight & Visual Spread
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
            One carat equals exactly 200 milligrams (0.20 grams). However, diamond shape determines how large it looks on the hand. Shapes like <strong>Oval, Emerald, and Pear</strong> have an elongated surface area, appearing up to 15% larger on hand than a Round diamond of identical weight.
          </p>
        </div>
      </section>

      {/* CTA Box */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="rounded-3xl border border-stone-200/90 bg-gradient-to-b from-stone-50 via-white to-amber-50/30 p-8 sm:p-12 text-stone-900 space-y-4 shadow-sm">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Find Your Dream Diamond
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
            Use our interactive filter tool or ask our AI Diamond Concierge to find the best certified diamond matching your exact budget and 4Cs preferences.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/diamonds">
              <Button variant="luxury" size="lg" className="bg-stone-900 hover:bg-stone-800 text-white font-medium">
                Filter Certified Diamonds
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="text-stone-800 border-stone-300 bg-white hover:bg-stone-100 hover:text-stone-900 transition-colors"
              >
                Talk to Diamond Expert
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
