"use client";

import React, { useState } from "react";
import { Search, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { IInquiry, ITrackInquiryResponse } from "@/types/inquiry.types";
import { InquiryConversationModal } from "@/components/contact/InquiryConversationModal";

export function InquiryStatusTracker() {
  const [inquiryNumber, setInquiryNumber] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inquiryResult, setInquiryResult] = useState<IInquiry | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConversationOpen, setIsConversationOpen] = useState<boolean>(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inquiryNumber.trim().toUpperCase();
    if (!query) return;

    setIsLoading(true);
    setErrorMessage(null);
    setInquiryResult(null);

    try {
      const res = await fetch(`/api/inquiries/track?inquiryNumber=${encodeURIComponent(query)}`);
      const json = (await res.json()) as ITrackInquiryResponse;

      if (!res.ok || !json.success || !json.data) {
        setErrorMessage(json.error || "No inquiry found matching reference number. Please check your reference code.");
      } else {
        setInquiryResult(json.data);
      }
    } catch {
      setErrorMessage("Network error checking inquiry status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-amber-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Concierge Inquiry Status Tracker</span>
          </div>
          <h3 className="font-serif text-lg font-bold text-stone-900 mt-1">
            Track Submitted Message & Curator Response
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Check the live status or read the gemologist reply using your reference number.
          </p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <Input
            type="text"
            value={inquiryNumber}
            onChange={(e) => setInquiryNumber(e.target.value)}
            placeholder="Enter reference (e.g. INQ-123456)"
            className="pl-9 text-xs h-10 font-mono uppercase bg-stone-50/50 border-stone-200 focus:border-stone-400 rounded-xl"
          />
        </div>
        <Button
          type="submit"
          variant="luxury"
          size="sm"
          disabled={isLoading || !inquiryNumber.trim()}
          className="h-10 px-5 text-xs font-mono rounded-xl shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
          ) : (
            <Search className="h-3.5 w-3.5 mr-1.5" />
          )}
          <span>Track Status</span>
        </Button>
      </form>

      {/* Error State */}
      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Result Card */}
      {inquiryResult && (
        <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-5 space-y-4 text-xs animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-stone-900 text-sm">
                #{inquiryResult.inquiryNumber}
              </span>
              <span className="text-stone-500 font-mono">
                • {inquiryResult.inquiryType.replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  inquiryResult.status === "RESOLVED"
                    ? "success"
                    : inquiryResult.status === "IN_PROGRESS"
                    ? "gold"
                    : "outline"
                }
                className="text-[10px] font-mono"
              >
                {inquiryResult.status === "NEW"
                  ? "Under Review"
                  : inquiryResult.status === "IN_PROGRESS"
                  ? "Curator Replied"
                  : "Completed"}
              </Badge>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-stone-500">Your Inquiry:</span>
            <div className="p-3 rounded-lg bg-white border border-stone-200 text-stone-700 whitespace-pre-wrap leading-relaxed">
              {inquiryResult.message}
            </div>
          </div>

          {inquiryResult.adminReply ? (
            <div className="space-y-1.5 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center justify-between text-amber-900 font-bold text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  Lead Gemologist Official Response
                </span>
                {inquiryResult.repliedAt && (
                  <span className="text-stone-500 font-mono font-normal text-[10px]">
                    {new Date(inquiryResult.repliedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-stone-800 leading-relaxed whitespace-pre-wrap text-xs">
                {inquiryResult.adminReply}
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-stone-100/60 text-stone-500 text-center font-mono text-[11px]">
              Our lead curator is reviewing your gemstone parameters. You will receive a notification and direct reply shortly.
            </div>
          )}

          {/* Interactive Chat Launcher Button */}
          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              variant="luxury"
              size="sm"
              onClick={() => setIsConversationOpen(true)}
              className="text-xs font-mono gap-1.5 h-9 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Open Live Consultation Chat &amp; Reply</span>
            </Button>
          </div>
        </div>
      )}

      {/* Live Conversation Modal */}
      {inquiryResult && (
        <InquiryConversationModal
          inquiryNumber={inquiryResult.inquiryNumber}
          isOpen={isConversationOpen}
          onClose={() => setIsConversationOpen(false)}
        />
      )}
    </div>
  );
}
