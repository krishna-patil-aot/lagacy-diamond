import React from "react";
import Link from "next/link";
import { ShieldCheck, ChevronLeft, Lock, FileText, Eye } from "lucide-react";
import { siteConfig } from "@/config/site.config";

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Return to {siteConfig.brandName}</span>
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-stone-200 pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Last Updated: March 2026</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
          Privacy & Client Data Protocol
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">
          At {siteConfig.brandName}, our solar-cultivated diamond atelier respects your right to discretion, secure transactional privacy, and transparent custody.
        </p>
      </div>

      {/* Content Sections */}
      <div className="space-y-8 text-sm text-stone-700 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Lock className="h-4 w-4 text-stone-700" />
            <span>1. Information We Collect</span>
          </h2>
          <p>
            When you explore, reserve, or purchase laboratory-cultivated diamonds directly from our foundry application, we collect essential personal identification data:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-stone-600">
            <li>
              <strong>Client Identification:</strong> Legal full name, encrypted contact telephone, and private correspondence email address.
            </li>
            <li>
              <strong>Armored Courier Logistics:</strong> Physical street addresses, residential delivery protocols, and identity verification upon delivery.
            </li>
            <li>
              <strong>Certificate Custody:</strong> Archival matching of IGI / GIA laser inscription numbers associated with your private vault ledger.
            </li>
            <li>
              <strong>Technical Logs:</strong> Browser session metadata, IP addresses, and interactive 360-degree rotation preferences.
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Eye className="h-4 w-4 text-stone-700" />
            <span>2. Foundry Data Custody & Security</span>
          </h2>
          <p>
            Because we eliminate traditional retail broker chains and sell direct-to-consumer, your transaction data never passes through third-party jeweler networks. All payment card details and wire transit credentials are cryptographically protected via 256-bit AES encryption.
          </p>
          <p>
            We do not sell, rent, or trade private customer registries to advertising syndicates. Data retention is strictly bounded by international gemological provenance tracking and tax compliance statutes.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-stone-700" />
            <span>3. Laser Inscription & Archival Record Keeping</span>
          </h2>
          <p>
            Every diamond grown in our laboratory is micro-inscribed via high-precision laser on its girdle with an official accreditation laboratory registry number (e.g., IGI or GIA). We maintain a redundant, tamper-evident archival database of these certificates to facilitate lifetime warranty claims, resale authenticity checks, and estate valuation appraisals.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900">4. Your Regulatory Rights</h2>
          <p>
            Under the General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA), you retain full authority to request:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="rounded-xl border border-stone-200 bg-white p-4">
              <h4 className="font-semibold text-stone-900 mb-1">Right to Erasure</h4>
              <p className="text-xs text-stone-500">Request purging of personal details following complete delivery and warranty registration.</p>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-4">
              <h4 className="font-semibold text-stone-900 mb-1">Right of Data Export</h4>
              <p className="text-xs text-stone-500">Export your laboratory grading dossiers, receipts, and order histories as portable JSON or PDF.</p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 border-t border-stone-200 pt-6">
          <h2 className="text-lg font-bold text-stone-900">5. Contact Our Privacy Officer</h2>
          <p>
            For legal inquiries regarding personal data, vault records, or identity authorization, contact our compliance counsel:
          </p>
          <p className="font-mono text-xs text-stone-800 bg-stone-100 p-3 rounded-xl border border-stone-200 inline-block">
            {siteConfig.contact.legalEntityName} Compliance • {siteConfig.contact.supportEmail} • {siteConfig.contact.addressLine1}, {siteConfig.contact.city}, {siteConfig.contact.country}
          </p>
        </section>
      </div>
    </div>
  );
}
