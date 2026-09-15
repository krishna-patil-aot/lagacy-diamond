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
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: `About Us | The Story of ${siteConfig.brandName}`,
  description:
    `Discover how ${siteConfig.brandName} cultivates 100% conflict-free, Type IIa certified diamonds using solar plasma reactors. Pure optical brilliance, GIA & IGI grading, and zero earth displacement.`,
  keywords: [
    siteConfig.brandName,
    `About ${siteConfig.brandName}`,
    "Solar Plasma Diamonds",
    "Type IIa Certified Gemstones",
    "GIA Certified Lab Diamonds",
    "Sustainable Haute Joaillerie",
    "Geneva Diamond Atelier",
  ],
  openGraph: {
    title: `About Us | The ${siteConfig.brandName} Story`,
    description:
      "Cultivating the world's purest Type IIa diamonds in high-temperature solar reactors. Zero earth displacement. Pure brilliance.",
    type: "website",
    url: `${siteConfig.appUrl}/about`,
  },
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${siteConfig.brandName}`,
    description:
      `${siteConfig.brandName} is a high-technology gemological atelier cultivating Type IIa diamonds with clean solar energy and zero earth displacement.`,
    publisher: {
      "@type": "Organization",
      name: siteConfig.contact.legalEntityName,
      url: siteConfig.appUrl,
      logo: `${siteConfig.appUrl}/favicon.ico`,
      founder: "DarkGem Gemological Collective",
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
            <span>OUR STORY • 100% CERTIFIED &amp; CONFLICT-FREE</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-[1.15]">
            Diamonds Created With <br />
            <span className="italic font-normal text-amber-800">Clean Solar Plasma</span>
          </h1>

          <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl mx-auto">
            {siteConfig.brandName} was founded with a clear purpose: fine jewellery should celebrate love and life&apos;s special milestones without harming the earth. We harness clean solar energy to cultivate diamonds that are chemically, physically, and optically identical to mined diamonds — bringing you pure brilliance at direct atelier prices.
          </p>
        </div>
      </section>

      {/* The 4 Core Pillars */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            The {siteConfig.brandName} Promise
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
              Only 1-2% of all mined diamonds in the world qualify as Type IIa (pure carbon with zero nitrogen impurities). Every {siteConfig.brandName} solitaire achieves this rare benchmark.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs hover:border-amber-300 transition-all space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-800">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">IGI &amp; GIA Certified</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Independently examined, graded, and micro-laser inscribed on the girdle by internationally recognized gemological laboratories.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs hover:border-amber-300 transition-all space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-800">
              <Factory className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">Direct Atelier Rates</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              By removing middleman distributors, celebrity royalties, and retail showroom overheads, we pass 100% of the savings directly to you.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison: Atelier Cultivation vs Earth Mining */}
      <section className="bg-stone-100/70 text-stone-800 py-16 sm:py-20 border-y border-stone-200/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-800 font-bold">
              Comparative Impact Analysis
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900">
              Why Solar-Cultivated Solitaires are the Future
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              How a 1.0-carat diamond impacts our planet depending on how it is sourced.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mined Diamond */}
            <div className="rounded-2xl border border-rose-200 bg-white p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="text-xs font-mono uppercase tracking-wider text-rose-700 font-bold">
                Traditional Earth Mining
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-stone-600">
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">•</span>
                  <span><strong className="text-stone-900">250 tons</strong> of earth blasted and displaced per carat</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">•</span>
                  <span><strong className="text-stone-900">Over 500 litres</strong> of clean water consumed and polluted</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">•</span>
                  <span><strong className="text-stone-900">High carbon emissions</strong> from diesel-powered excavation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">•</span>
                  <span>Multiple middleman layers increasing customer retail prices</span>
                </li>
              </ul>
            </div>

            {/* DarkGem Haute Joaillerie */}
            <div className="rounded-2xl border border-amber-300 bg-white p-6 sm:p-8 space-y-4 relative shadow-sm ring-1 ring-amber-400/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-800 font-bold">
                  {siteConfig.brandName}
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                  100% Eco-Pure
                </span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-stone-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong className="text-stone-900">Zero earth displaced</strong> or mined</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong className="text-stone-900">Closed-loop recycled water</strong> system</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong className="text-stone-900">100% clean solar energy</strong> powering our growth chambers</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong className="text-stone-900">Authentic IGI / GIA certificate</strong> for each stone</span>
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
              Consult Gemological Expert
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
