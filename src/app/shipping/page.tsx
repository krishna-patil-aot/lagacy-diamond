import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Armored Transit & Escrow Delivery Protocols | Legacy Diamond",
  description:
    "Discover how Legacy Diamond ensures 100% insured armored courier transit, tamper-evident vault packaging, biometric delivery verification, and a 30-day inspection privilege.",
  keywords: [
    "Armored Diamond Shipping",
    "Insured Jewelry Courier",
    "Brinks Jewelry Delivery",
    "Secure Diamond Escrow",
    "Legacy Diamond Delivery",
    "30 Day Diamond Return Policy",
  ],
  openGraph: {
    title: "Armored Transit & Escrow Delivery Protocols | Legacy Diamond",
    description: "100% insured armored courier transit and tamper-evident vault delivery.",
    url: "https://legacydiamond.luxury/shipping",
  },
};

export default function ShippingPage() {
  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-16 sm:py-24 border-b border-stone-200/80 bg-gradient-to-b from-[#faf8f5] via-[#f5f2eb] to-[#faf8f5]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-stone-800/20 bg-stone-900 text-stone-100 px-4 py-1.5 text-xs font-mono font-medium">
            <Lock className="h-3.5 w-3.5 text-amber-400" />
            <span>SAFE, DISCREET & FULLY INSURED DELIVERY</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-[1.15]">
            Free Insured Doorstep Delivery & <br />
            <span className="italic font-normal text-amber-800">30-Day Easy Returns</span>
          </h1>

          <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl mx-auto">
            Fine diamond jewellery requires the highest standard of safety. Every Legacy Diamond is delivered in tamper-proof, discreet packaging with 100% insurance coverage and real-time tracking across India.
          </p>
        </div>
      </section>

      {/* 4 Stages of Transit */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            How We Deliver Safely to Your Door
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            From the moment your diamond leaves our safe to the moment it reaches your hands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stage 1 */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-serif font-bold text-base">
              1
            </div>
            <h3 className="font-serif text-base font-bold text-stone-900">Tamper-Proof Packaging</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Your diamond and official IGI/GIA certificate are placed in a luxury jewellery box sealed with an individual security barcode hologram to ensure zero tampering.
            </p>
          </div>

          {/* Stage 2 */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-serif font-bold text-base">
              2
            </div>
            <h3 className="font-serif text-base font-bold text-stone-900">Trusted Secure Couriers</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Shipped exclusively via specialized high-value logistics partners (such as Sequel Logistics and Blue Dart Apex). Never sent through ordinary parcel mail.
            </p>
          </div>

          {/* Stage 3 */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-serif font-bold text-base">
              3
            </div>
            <h3 className="font-serif text-base font-bold text-stone-900">100% Free Insurance</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every shipment is insured for 100% of its value during transit. In the rare event of transit loss or delay, full replacement or 100% refund is guaranteed.
            </p>
          </div>

          {/* Stage 4 */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-serif font-bold text-base">
              4
            </div>
            <h3 className="font-serif text-base font-bold text-stone-900">OTP & Handover Verification</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Parcels are never left unattended. Handover is completed strictly in person with OTP or signature verification for total security.
            </p>
          </div>
        </div>
      </section>

      {/* 30-Day Inspection Privilege */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-stone-800 bg-stone-950 p-8 sm:p-12 text-stone-100 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400">
              <Eye className="h-4 w-4" />
              <span>30-Day Money-Back Guarantee</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Examine Your Diamond in Natural Sunlight
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              View your diamond under natural light, show it to your family, and have it independently verified. If you are not completely in love with it, return it within 30 days for a 100% full refund with free insured pickup.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Link href="/orders">
              <Button variant="luxury" size="lg" className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-6">
                Track Existing Order
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="text-stone-200 border-stone-700 bg-transparent hover:bg-stone-800 hover:text-white hover:border-stone-500 px-6 transition-colors"
              >
                Contact Delivery Support
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
