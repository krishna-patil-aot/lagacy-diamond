"use client";

import React, { useState } from "react";
import { IOrder, IOrderTimelineEvent } from "@/types/order.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ShieldCheck,
  MapPin,
  HelpCircle,
  ChevronDown,
  Lock,
  Truck,
  FileText,
  CheckCircle2,
} from "lucide-react";

interface VaultLogFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: IOrder;
}

interface ICustodyFaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const CUSTODY_FAQS: ICustodyFaqItem[] = [
  {
    id: "faq-transit-security",
    question: "How is the diamond specimen secured during armed transit?",
    answer:
      "All specimens travel inside tamper-evident nitrogen-sealed lockboxes aboard satellite-monitored, ballistic-armored vehicles operated by Brink's Global Services with bonded armed security escorts.",
    category: "Armored Transport",
  },
  {
    id: "faq-biometric",
    question: "What does Biometric Handover & ID verification require?",
    answer:
      "Before custody is transferred, the armed courier verifies government-issued photo ID and collects a biometric cryptographic digital signature that matches the authorized client name on the order manifest.",
    category: "Identity Verification",
  },
  {
    id: "faq-escrow-insurance",
    question: "Is my shipment 100% insured against loss or tampering?",
    answer:
      "Yes. Every consignment carries 100% full replacement value vault escrow insurance underwritten through Lloyd's of London and our Geneva depository from origin dispatch until verified client signature.",
    category: "Insurance & Escrow",
  },
  {
    id: "faq-cert-inspection",
    question: "How do I verify the laboratory grading certification?",
    answer:
      "Your physical order arrives with the official GIA or IGI grading certificate. You can cross-verify the laser girdle inscription under a loupe against the QR code and certificate number on your invoice.",
    category: "Certification",
  },
  {
    id: "faq-schedule",
    question:
      "What happens if I am not available at the scheduled delivery time?",
    answer:
      "If you are unavailable, the escort officer will never leave the consignment unattended. The lot is safely re-routed to the nearest secure partner depository vault until delivery is rescheduled.",
    category: "Delivery Logistics",
  },
];

export function VaultLogFaqModal({
  isOpen,
  onClose,
  order,
}: VaultLogFaqModalProps) {
  const [expandedFaq, setExpandedFaq] = useState<string | null>(
    CUSTODY_FAQS[0].id,
  );

  const toggleFaq = (id: string) => {
    setExpandedFaq((prev) => (prev === id ? null : id));
  };

  const timelineEvents: IOrderTimelineEvent[] =
    order.timeline && order.timeline.length > 0
      ? [...order.timeline].reverse()
      : [
          {
            status: order.status,
            title: "Order Processed & Logged",
            description:
              "Consignment securely initialized in sovereign foundry registry.",
            location: "Geneva Central Vault",
            timestamp: order.createdAt || new Date().toISOString(),
          },
        ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-[94vw] sm:w-full max-h-[90dvh] sm:max-h-[88dvh] overflow-y-auto overflow-x-hidden p-3 sm:p-6 space-y-3.5 sm:space-y-5 min-w-0">
        {/* Header */}
        <DialogHeader className="border-b border-stone-200 pb-3 pr-10 sm:pr-12 min-w-0">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
              <Lock className="h-4 w-4 shrink-0" />
            </span>
            <DialogTitle className="font-serif text-base sm:text-lg md:text-xl font-bold text-stone-900 truncate">
              Vault Custody Log &amp; Security FAQ
            </DialogTitle>
            <Badge
              variant="gold"
              className="text-[10px] font-mono whitespace-nowrap shrink-0 truncate max-w-[140px] xs:max-w-none"
            >
              #{order.orderNumber || order.id}
            </Badge>
          </div>
          <DialogDescription className="text-[11px] sm:text-xs text-stone-500 pt-1">
            Official chain of custody milestones, GPS transit checkpoints, and
            client security protocols.
          </DialogDescription>
        </DialogHeader>

        {/* Section 1: Live Chain-of-Custody Timeline Log */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-semibold flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-stone-600 shrink-0" />
              <span>Chain of Custody Milestones ({timelineEvents.length})</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1 shrink-0">
              <ShieldCheck className="h-3 w-3 shrink-0" /> Brink&apos;s Verified
            </span>
          </div>

          <div className="space-y-2">
            {timelineEvents.map((event, idx) => (
              <div
                key={`${event.timestamp}-${idx}`}
                className="rounded-xl border border-stone-200/90 bg-stone-50/70 p-2.5 sm:p-3 text-xs space-y-1 shadow-2xs hover:border-stone-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                    <span className="font-semibold text-stone-900 text-xs sm:text-sm flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>{event.title}</span>
                    </span>
                    {event.location && (
                      <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/80 font-mono inline-flex items-center gap-1 shrink-0">
                        <MapPin className="h-2.5 w-2.5 text-amber-600 shrink-0" />
                        <span>{event.location}</span>
                      </span>
                    )}
                  </div>
                  <span
                    className="text-[10px] text-stone-400 font-mono shrink-0 self-start sm:self-center"
                    suppressHydrationWarning
                  >
                    {new Date(event.timestamp).toLocaleString([], {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <p className="text-stone-600 text-[11px] leading-relaxed pl-5 break-words">
                  {event.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Armored Transit & Security FAQs (Accordion) */}
        <div className="space-y-3 pt-2 border-t border-stone-200/80">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-900 font-semibold flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span>Armored Transit Protocol FAQs</span>
            </span>
            <span className="text-[10px] font-mono text-stone-500 shrink-0">
              Escort Policy
            </span>
          </div>

          <div className="space-y-2">
            {CUSTODY_FAQS.map((faq) => {
              const isExpanded = expandedFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-2.5 sm:p-3 text-left gap-2 sm:gap-3 hover:bg-stone-50/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-xs font-semibold text-stone-900 leading-snug break-words">
                        {faq.question}
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                        isExpanded ? "rotate-180 text-amber-600" : ""
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="px-2.5 sm:px-3 pb-2.5 sm:pb-3 pt-0.5 border-t border-stone-100 text-xs text-stone-600 leading-relaxed bg-stone-50/40">
                      <p className="pt-2 text-[11px] sm:text-xs break-words">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-stone-200">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-stone-500 font-mono">
            <Truck className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span className="truncate">
              Brink&apos;s Global Armored Services Escort
            </span>
          </div>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onClose}
            className="w-full sm:w-auto h-8 text-xs font-medium cursor-pointer"
          >
            Close Custody FAQ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
