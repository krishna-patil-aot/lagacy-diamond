"use client";

import React, { useState } from "react";
import {
  MapPin,
  Mail,
  Clock,
  ShieldCheck,
  Send,
  Loader2,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useContactForm } from "@/hooks/useContactForm";
import { InquiryType } from "@/types/contact.types";

const FAQ_ITEMS = [
  {
    question: "Are Legacy Diamonds 100% real diamonds?",
    answer:
      "Yes, 100% real. Our lab-grown diamonds share the exact same chemical structure (pure carbon), physical hardness (10 on Mohs scale), and brilliant sparkle (2.42 refractive index) as mined diamonds. They are certified and graded by top international laboratories like IGI and GIA.",
  },
  {
    question: "Which certificate will I receive with my diamond?",
    answer:
      "Every single diamond from Legacy Diamond comes with an official, verifiable grading certificate from either IGI (International Gemological Institute) or GIA (Gemological Institute of America). The unique certificate number is also microscopically laser-inscribed on the diamond's girdle for complete verification.",
  },
  {
    question: "How does safe and insured delivery work across India?",
    answer:
      "We provide 100% free insured delivery across all major cities and pin codes in India via reputed secure logistics partners (such as Sequel Logistics and Blue Dart Apex). Every package is tamper-evident, sealed with a security lock, fully insured, and requires an OTP/signature upon doorstep delivery.",
  },
  {
    question: "Can I customize an engagement ring or select my own setting?",
    answer:
      "Yes! Our in-house jewelry artisans and 3D CAD designers can create your dream ring in 18k Yellow Gold, Rose Gold, White Gold, or 950 Platinum. Simply select 'Custom Engagement Ring Design' in the form below or chat with our Diamond Expert on WhatsApp.",
  },
  {
    question: "What is your return and exchange policy?",
    answer:
      "We offer a 30-day money-back guarantee. If you are not completely satisfied with your diamond, you can return it within 30 days in its original condition with the lab certificate for a 100% full refund.",
  },
];

export default function ContactPage() {
  const { formData, updateField, submitInquiry, isSubmitting, isSuccess, resetSuccess } =
    useContactForm();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-x-hidden">
      {/* Header */}
      <section className="relative py-14 sm:py-20 border-b border-stone-200/80 bg-gradient-to-b from-[#faf8f5] via-[#f7f5f0] to-[#faf8f5]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-900/20 bg-amber-50/80 px-4 py-1.5 text-xs font-mono font-medium text-amber-900">
            <Sparkles className="h-3.5 w-3.5 text-amber-700" />
            <span>EXPERT DIAMOND CONSULTATION • WE ARE HAPPY TO HELP</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-stone-900">
            Talk to Our <br />
            <span className="italic font-normal text-amber-800">Diamond Specialists</span>
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
            Whether you want to design a custom engagement ring, select the best 4Cs diamond within your budget, or book a consultation, our team is always ready to guide you.
          </p>
        </div>
      </section>

      {/* Main Grid: Contact Form (7 Cols) + Contact Hubs (5 Cols) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Inquiry Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                Send Us a Message
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Fill in the details below and our diamond expert will get back to you within 2 to 4 hours.
              </p>
            </div>

            {isSuccess ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-8 text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Message Sent Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                  Thank you. One of our Senior Diamond Specialists has received your request and will connect with you shortly via Call, WhatsApp, or Email.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetSuccess}
                  className="text-xs mt-2"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={submitInquiry} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      placeholder="e.g. Rahul Sharma or Priya Patel"
                      className="bg-stone-50/50 border-stone-200 focus-visible:border-amber-600 focus-visible:ring-amber-600"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="e.g. rahul.sharma@gmail.com"
                      className="bg-stone-50/50 border-stone-200 focus-visible:border-amber-600 focus-visible:ring-amber-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone / WhatsApp Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="bg-stone-50/50 border-stone-200 focus-visible:border-amber-600 focus-visible:ring-amber-600"
                    />
                  </div>

                  {/* Inquiry Type - SHADCN SELECT */}
                  <div className="space-y-1.5">
                    <Label>How Can We Help You? *</Label>
                    <Select
                      value={formData.inquiryType}
                      onValueChange={(val: string) =>
                        updateField("inquiryType", val as InquiryType)
                      }
                    >
                      <SelectTrigger className="h-10 text-xs sm:text-sm bg-stone-50/50 border-stone-200 focus:ring-amber-600 focus:border-amber-600">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CUSTOM_ENGAGEMENT_RING">
                          Custom Engagement Ring Design
                        </SelectItem>
                        <SelectItem value="PRIVATE_VAULT_VIEWING">
                          In-Store & Video Consultation
                        </SelectItem>
                        <SelectItem value="INVESTMENT_GEMSTONE">
                          Large Carat Diamond Inquiry (2ct+)
                        </SelectItem>
                        <SelectItem value="CERTIFICATE_AUTHENTICATION">
                          IGI / GIA Certificate Check
                        </SelectItem>
                        <SelectItem value="ORDER_CONCIERGE">
                          Track Existing Order & Delivery
                        </SelectItem>
                        <SelectItem value="GENERAL_INQUIRY">
                          General Questions & Assistance
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Preferred Carat */}
                  <div className="space-y-1.5">
                    <Label htmlFor="carat">Target Carat Weight</Label>
                    <Input
                      id="carat"
                      type="text"
                      value={formData.preferredCaratRange || ""}
                      onChange={(e) => updateField("preferredCaratRange", e.target.value)}
                      placeholder="e.g. 1.0 - 2.5 ct"
                      className="bg-stone-50/50 border-stone-200 focus-visible:border-amber-600 focus-visible:ring-amber-600"
                    />
                  </div>

                  {/* Target Budget */}
                  <div className="space-y-1.5">
                    <Label htmlFor="budget">Estimated Budget</Label>
                    <Input
                      id="budget"
                      type="text"
                      value={formData.budgetRange || ""}
                      onChange={(e) => updateField("budgetRange", e.target.value)}
                      placeholder="e.g. ₹50,000 - ₹2,50,000"
                      className="bg-stone-50/50 border-stone-200 focus-visible:border-amber-600 focus-visible:ring-amber-600"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <Label htmlFor="message">Your Requirements or Message *</Label>
                  <Textarea
                    id="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    placeholder="Describe your preferred diamond shape, metal setting (18k Gold or Platinum), ring size, or any specific questions you have..."
                    className="bg-stone-50/50 border-stone-200 focus-visible:border-amber-600 focus-visible:ring-amber-600"
                  />
                </div>

                <Button
                  type="submit"
                  variant="luxury"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full text-xs sm:text-sm h-11 justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Your Inquiry</span>
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Consultation Hubs & Direct Contacts */}
          <div className="lg:col-span-5 space-y-6">
            {/* Showroom Contacts */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-5">
              <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
                Our Consultation Hubs
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4 text-amber-700" />
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 block">Mumbai Experience Centre</span>
                    <span className="text-stone-500">
                      Bandra Kurla Complex (BKC), G Block, Bandra East, Mumbai, Maharashtra 400051
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4 text-amber-700" />
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 block">Bengaluru Studio</span>
                    <span className="text-stone-500">
                      100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4 text-amber-700" />
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 block">Delhi NCR Lounge</span>
                    <span className="text-stone-500">
                      Barakhamba Road, Connaught Place, New Delhi 110001
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-stone-100 pt-4 space-y-2.5 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-amber-700" />
                  <span>Call / WhatsApp: +91 98200 12345</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-amber-700" />
                  <span>support@legacydiamond.luxury</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-amber-700" />
                  <span>Mon - Sat: 10:00 AM - 8:00 PM IST</span>
                </div>
              </div>
            </div>

            {/* Trust Assurance */}
            <div className="rounded-2xl border border-amber-900/20 bg-gradient-to-br from-amber-50/60 to-stone-50 p-6 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <ShieldCheck className="h-4 w-4 text-amber-700" />
                <span>100% Privacy & Certified Guarantee</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                All your custom designs, diamond selections, and personal consultations are kept strictly private. Every diamond is accompanied by an authentic IGI or GIA certificate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Clear, simple answers to common questions about our certified lab-grown diamonds.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-xl border border-stone-200 bg-white overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
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
          })}
        </div>
      </section>
    </div>
  );
}
