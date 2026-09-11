import React from "react";
import Link from "next/link";
import { Award, ChevronLeft, CheckCircle2, RotateCcw, Truck } from "lucide-react";

export default function TermsConditionsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Return to Legacy Diamond</span>
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-stone-200 pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700">
          <Award className="h-3.5 w-3.5 text-amber-600" />
          <span>Effective: March 2026</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
          Terms & Foundry Guarantees
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">
          Review the contractual conditions, laboratory-grown diamond guarantees, and direct-to-consumer vault protocols established by Legacy Diamond.
        </p>
      </div>

      {/* Content Sections */}
      <div className="space-y-8 text-sm text-stone-700 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>1. Lab-Grown Authenticity & Optical Parity</span>
          </h2>
          <p>
            All gemstones sold through this application are certified **laboratory-cultivated natural carbon diamonds**. They possess identical chemical, physical, and optical properties to earth-mined diamonds (pure crystallized carbon, Type IIa crystal lattice, Mohs hardness of 10, and refractive index of 2.42).
          </p>
          <p>
            Every diamond is accompanied by an independent grading report from an internationally recognized gemological institute (IGI or GIA) verifying the 4 Cs: Carat, Color, Clarity, and Cut proportions.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-stone-700" />
            <span>2. 30-Day Foundry Inspection & Return Privilege</span>
          </h2>
          <p>
            We afford every client a 30-calendar-day examination privilege from the date of physical receipt. If the gemstone does not satisfy your optical expectations:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-stone-600">
            <li>The diamond must remain in its original, unworn state with intact security seals.</li>
            <li>The official original physical grading dossier and GIA / IGI certificate must be returned in full.</li>
            <li>Return shipping must be conducted through our prepaid, armored, and fully insured courier protocol.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Truck className="h-4 w-4 text-stone-700" />
            <span>3. Armored Insured Transit & Custody Transfer</span>
          </h2>
          <p>
            All shipments from our foundry to the designated delivery address are fully insured by Legacy Diamond up to the moment of authorized physical signature. Risk of loss transfers exclusively upon documented receipt by the designated recipient.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900">4. Direct-from-Foundry Pricing & Promotional Codes</h2>
          <p>
            Prices published on the application represent direct foundry valuation without retail markup. Promotional lot discounts (e.g. VIP privilege coupons such as <code>KRISHNAVIP</code>) are applied during checkout prior to final settlement. We reserve the right to correct typographical valuation discrepancies prior to curator approval.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 border-t border-stone-200 pt-6">
          <h2 className="text-lg font-bold text-stone-900">5. Governing Law & Dispute Resolution</h2>
          <p>
            These terms are governed by the laws of the State of New York and international commercial arbitration standards. For questions regarding foundry contracts, email:
          </p>
          <p className="font-mono text-xs text-stone-800 bg-stone-100 p-3 rounded-xl border border-stone-200 inline-block">
            Legacy Diamond Legal Counsel • contracts@legacydiamond.com • 740 Park Ave, New York, NY
          </p>
        </section>
      </div>
    </div>
  );
}
