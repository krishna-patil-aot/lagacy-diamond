import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Sun,
  ShieldCheck,
  ArrowRight,
  Leaf,
  Droplets,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: `Sustainability & Zero-Mining Ecological Manifesto | ${siteConfig.brandName}`,
  description:
    `Explore our 100% solar-powered plasma reactors, zero earth displacement, and closed-loop water systems. The definitive ecological alternative to mined fine jewelry by ${siteConfig.brandName}.`,
  keywords: [
    "Sustainable Diamonds",
    "Zero Earth Displacement",
    "Solar Plasma Diamonds",
    "Carbon Neutral Solitaires",
    "Ethical Haute Joaillerie",
    "Type IIa Eco Diamonds",
    siteConfig.brandName,
  ],
  openGraph: {
    title: `Sustainability & Zero-Mining Ecological Manifesto | ${siteConfig.brandName}`,
    description: "Explore our 100% solar-powered plasma reactors and zero earth displacement.",
    url: `${siteConfig.appUrl}/sustainability`,
  },
};

export default function SustainabilityPage() {
  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-14 sm:py-20 border-b border-stone-200/80 bg-gradient-to-b from-[#faf8f5] via-[#f7f5f0] to-[#faf8f5]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/20 bg-emerald-50/80 px-4 py-1.5 text-xs font-mono font-medium text-emerald-900">
            <Leaf className="h-3.5 w-3.5 text-emerald-700" />
            <span>ECO-FRIENDLY &amp; 100% ETHICAL • ZERO MINING</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-stone-900">
            Brilliance Without <br />
            <span className="italic font-normal text-emerald-800">Environmental Harm</span>
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Traditional diamond mining causes massive soil erosion, water pollution, and ecological damage. {siteConfig.brandName} uses 100% clean solar energy to cultivate conflict-free Type IIa diamonds with zero mining footprint.
          </p>
        </div>
      </section>

      {/* 3 Core Environmental Pillars */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-stone-200 bg-white p-8 space-y-4 shadow-xs">
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <Sun className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900">100% Solar Energy</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Our high-temperature plasma microwave reactors run entirely on dedicated solar arrays, ensuring a net-zero carbon footprint from seed to diamond.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-8 space-y-4 shadow-xs">
            <div className="h-12 w-12 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center">
              <Droplets className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900">Closed-Loop Water</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              We employ an airtight, closed-loop chilling system that filters and recycles 99.8% of internal cooling water with zero toxic industrial waste discharge.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-8 space-y-4 shadow-xs">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900">Zero Earth Displacement</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Open-pit diamond mines blast giant craters visible from space. Our diamonds are grown in a clean, modern facility with zero soil disruption.
            </p>
          </div>
        </div>
      </section>

      {/* Comparative LCA Grid */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-stone-200 bg-white overflow-hidden shadow-xs">
          <div className="p-6 sm:p-8 bg-stone-50 border-b border-stone-200 text-stone-900 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                1 Carat Environmental Impact
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Comparison: Mined Diamonds vs. {siteConfig.brandName} Cultivated Solitaires
              </p>
            </div>
            <span className="text-xs font-mono uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
              Third-Party Verified
            </span>
          </div>

          <div className="divide-y divide-stone-200 text-xs sm:text-sm">
            <div className="grid grid-cols-3 p-4 sm:p-6 items-center">
              <span className="font-bold text-stone-900">Earth Displaced</span>
              <span className="text-rose-700 font-mono text-center">~250 Tons</span>
              <span className="text-emerald-700 font-mono font-bold text-right">0.00 Tons (0%)</span>
            </div>

            <div className="grid grid-cols-3 p-4 sm:p-6 items-center bg-stone-50/50">
              <span className="font-bold text-stone-900">Freshwater Consumed</span>
              <span className="text-rose-700 font-mono text-center">~500+ Litres</span>
              <span className="text-emerald-700 font-mono font-bold text-right">100% Recycled</span>
            </div>

            <div className="grid grid-cols-3 p-4 sm:p-6 items-center">
              <span className="font-bold text-stone-900">Carbon Footprint</span>
              <span className="text-rose-700 font-mono text-center">High Excavation CO₂</span>
              <span className="text-emerald-700 font-mono font-bold text-right">Net-Zero (Solar)</span>
            </div>

            <div className="grid grid-cols-3 p-4 sm:p-6 items-center bg-stone-50/50">
              <span className="font-bold text-stone-900">Conflict Risk</span>
              <span className="text-rose-700 font-mono text-center">Opaque Supply Chain</span>
              <span className="text-emerald-700 font-mono font-bold text-right">0% (100% Conflict-Free)</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
          Wear Your Values with Confidence
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
          Explore certified lab-grown diamonds created with care for the earth, transparent pricing, and complete peace of mind.
        </p>
        <Link href="/diamonds">
          <Button variant="luxury" size="lg" className="text-xs sm:text-sm px-8 gap-2 bg-stone-900 hover:bg-stone-800 text-white">
            <span>Browse Certified Diamonds</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
