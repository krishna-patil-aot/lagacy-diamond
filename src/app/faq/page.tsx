"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { siteConfig } from "@/config/site.config";

interface IFAQ {
  category: "AUTHENTICITY" | "PURCHASING" | "SHIPPING" | "CUSTOM";
  question: string;
  answer: string;
}

const ALL_FAQS: IFAQ[] = [
  {
    category: "AUTHENTICITY",
    question: "Are lab-grown diamonds real diamonds? Will they pass a diamond tester?",
    answer:
      "Yes, 100%. Lab-grown diamonds are real diamonds made of pure crystallized carbon in the exact same crystal structure. They have identical chemical, physical, and optical properties as earth-mined diamonds (Mohs hardness of 10 and refractive index of 2.42). They pass all standard diamond thermal and optical testers used by certified jewellers.",
  },
  {
    category: "AUTHENTICITY",
    question: "Do your diamonds come with official IGI or GIA certificates?",
    answer:
      `Yes! Every single diamond from ${siteConfig.brandName} comes with an independent, authentic grading certificate from either IGI (International Gemological Institute) or GIA (Gemological Institute of America). The unique certificate number is also microscopically laser-inscribed on the diamond's girdle so you can verify it anytime on the official IGI or GIA report check portal.`,
  },
  {
    category: "AUTHENTICITY",
    question: "What makes Type IIa diamonds the highest quality?",
    answer:
      "Type IIa is the purest chemical classification of diamonds, representing less than 2% of mined diamonds worldwide. They have zero measurable nitrogen impurities, which gives them exceptional clarity, crystal transparency, and maximum optical fire under both sunlight and indoor lighting.",
  },
  {
    category: "PURCHASING",
    question: "Why are your diamond prices 60% to 70% lower than traditional retail stores?",
    answer:
      "Traditional jewellery brands have large retail showroom rents, celebrity endorsements, distributor cuts, and multiple middleman commissions. Because we grow diamonds in our high-tech foundry and sell directly to you online, we eliminate these extra markups and pass 100% of the savings directly to you at honest factory rates.",
  },
  {
    category: "PURCHASING",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major payment modes including UPI (Google Pay, PhonePe, Paytm), Net Banking, Visa, MasterCard, RuPay, American Express, easy EMI plans, and direct NEFT/RTGS bank transfers with official GST invoices.",
  },
  {
    category: "SHIPPING",
    question: "How does safe delivery work across India?",
    answer:
      "We provide 100% free and fully insured delivery across all major cities and towns in India via trusted secure logistics partners (such as Sequel Logistics and Blue Dart). Every diamond is shipped in tamper-evident, security-sealed discreet packaging and delivered directly to your doorstep with OTP verification.",
  },
  {
    category: "SHIPPING",
    question: "What is your return and refund policy?",
    answer:
      "We offer a hassle-free 30-day money-back guarantee. If you are not completely happy with your diamond, you can initiate a return within 30 days in its original condition with the laboratory certificate for a 100% full refund with complimentary insured pickup.",
  },
  {
    category: "CUSTOM",
    question: "Can I order a custom engagement ring or customized jewellery setting?",
    answer:
      "Yes! Our master jewellery artisans and 3D CAD designers can craft your dream engagement ring, pendant, or earrings in 18k Yellow Gold, Rose Gold, White Gold, or 950 Platinum. Choose any loose certified diamond from our collection and share your reference photos or design ideas with our specialists.",
  },
  {
    category: "CUSTOM",
    question: "Do you offer free ring resizing?",
    answer:
      "Yes, we provide one complimentary ring resizing within the first 60 days of delivery. We arrange free insured pickup and doorstep delivery so your ring fits you perfectly.",
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = ALL_FAQS.filter((faq) => {
    const matchesCat = activeCategory === "ALL" || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-14 sm:space-y-20 pb-20 overflow-x-hidden">
      {/* Header */}
      <section className="relative py-14 sm:py-20 border-b border-stone-200/80 bg-gradient-to-b from-[#faf8f5] via-[#f7f5f0] to-[#faf8f5]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-900/20 bg-amber-50/80 px-4 py-1.5 text-xs font-mono font-medium text-amber-900">
            <HelpCircle className="h-3.5 w-3.5 text-amber-700" />
            <span>HELP & FREQUENTLY ASKED QUESTIONS</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-stone-900">
            Frequently Asked Questions
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
            Everything you need to know about our certified lab-grown diamonds, IGI and GIA certificates, transparent pricing, safe insured delivery, and custom jewellery design.
          </p>

          {/* Search Bar using Shadcn Input with icon */}
          <div className="max-w-md mx-auto pt-2">
            <Input
              icon={<Search className="h-4 w-4 text-stone-400" />}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (e.g., IGI, GIA, delivery, returns, purity)..."
              className="h-11 rounded-2xl bg-white border-stone-200 focus-visible:border-amber-600 focus-visible:ring-amber-600 text-xs sm:text-sm shadow-xs"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Category Filters using Shadcn Button */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-stone-200 pb-4">
          {[
            { id: "ALL", label: "All Questions" },
            { id: "AUTHENTICITY", label: "Purity & Certification" },
            { id: "PURCHASING", label: "Pricing & Payment" },
            { id: "SHIPPING", label: "Delivery & Returns" },
            { id: "CUSTOM", label: "Custom Jewellery" },
          ].map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "luxury" : "secondary"}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
              className="rounded-full text-xs h-8 px-4"
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 text-stone-500 text-xs">
              No questions found matching &ldquo;{searchQuery}&rdquo;. Try another search term or talk to our diamond experts.
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-stone-200 bg-white overflow-hidden transition-all shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-semibold text-stone-900 hover:text-amber-800 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-stone-400 transition-transform duration-200 shrink-0 ml-2 ${
                        isOpen ? "rotate-180 text-amber-700" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-stone-600 leading-relaxed border-t border-stone-100 pt-3 bg-stone-50/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Help CTA Card */}
        <div className="rounded-2xl border border-amber-900/20 bg-gradient-to-br from-amber-50/70 to-stone-50 p-6 sm:p-8 text-center space-y-4 shadow-xs">
          <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-800 flex items-center justify-center mx-auto">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
            Have a Specific Diamond Question?
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
            Our certified gemologists and AI Diamond Concierge are available 7 days a week to help you choose the perfect certified stone.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/diamonds">
              <Button variant="luxury" size="sm" className="bg-stone-900 hover:bg-stone-800 text-white text-xs px-5">
                Browse Certified Diamonds
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="sm" className="text-xs px-5">
                Talk to Diamond Expert
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
