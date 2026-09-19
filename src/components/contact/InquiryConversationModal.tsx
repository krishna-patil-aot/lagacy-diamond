"use client";

import React, { useState, useEffect, useRef } from "react";
import { useInquiryConversation } from "@/hooks/useInquiryConversation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Textarea";
import {
  Sparkles,
  Send,
  Loader2,
  ShieldCheck,
  Phone,
  MessageCircle,
  Mail,
  X,
  Gem,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { siteConfig } from "@/config/site.config";

interface InquiryConversationModalProps {
  inquiryNumber: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InquiryConversationModal({
  inquiryNumber,
  isOpen,
  onClose,
}: InquiryConversationModalProps) {
  const { user } = useAuthStore();
  const isViewerAdmin = user?.role === "ADMIN";

  const { activeInquiry, isLoading, isSending, loadInquiry, sendMessage } =
    useInquiryConversation(inquiryNumber || undefined);

  const [messageDraft, setMessageDraft] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync inquiry when prop changes
  useEffect(() => {
    if (inquiryNumber && isOpen) {
      void loadInquiry(inquiryNumber);
    }
  }, [inquiryNumber, isOpen, loadInquiry]);

  // Auto scroll to bottom of conversation
  useEffect(() => {
    if (activeInquiry?.messages && activeInquiry.messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeInquiry?.messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageDraft.trim() || isSending) return;

    const ok = await sendMessage(
      messageDraft,
      isViewerAdmin ? "ADMIN" : "CLIENT",
      isViewerAdmin ? user?.name || "Curator Gemologist" : activeInquiry?.fullName,
      isViewerAdmin
        ? user?.email || siteConfig.contact.conciergeEmail
        : activeInquiry?.email
    );
    if (ok) {
      setMessageDraft("");
    }
  };

  const formatInquiryType = (type?: string) => {
    if (!type) return "Private Consultation";
    return type
      .split("_")
      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
      .join(" ");
  };

  const getStatusBadge = () => {
    if (!activeInquiry) return null;
    switch (activeInquiry.status) {
      case "NEW":
        return (
          <Badge
            variant="gold"
            className="text-[10px] font-mono tracking-wide gap-1.5 py-0.5 px-2.5 whitespace-nowrap shrink-0 bg-amber-100 text-amber-900 border-amber-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span>Curator Reviewing</span>
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge
            variant="outline"
            className="text-[10px] font-mono tracking-wide gap-1.5 py-0.5 px-2.5 whitespace-nowrap shrink-0 border-amber-300 text-amber-900 bg-amber-50"
          >
            <Sparkles className="h-3 w-3 text-amber-600 shrink-0" />
            <span>Active Salon</span>
          </Badge>
        );
      case "RESOLVED":
        return (
          <Badge
            variant="success"
            className="text-[10px] font-mono tracking-wide gap-1.5 py-0.5 px-2.5 whitespace-nowrap shrink-0 bg-emerald-50 text-emerald-800 border-emerald-300"
          >
            <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
            <span>Completed</span>
          </Badge>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        hideCloseButton={true}
        className="max-w-2xl w-[calc(100%-1.5rem)] sm:w-full p-0 bg-white text-stone-900 border border-stone-200/90 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[90dvh]"
      >
        {/* Luxury Atelier Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-stone-200/80 bg-gradient-to-r from-[#faf8f5] via-[#f7f5f0] to-[#faf8f5] relative pr-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              {/* Brand Gem Crest */}
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Gem className="h-5 w-5 text-amber-300" />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="font-serif text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                    {siteConfig.brandName} Concierge Salon
                  </DialogTitle>
                  {getStatusBadge()}
                </div>

                <div className="flex items-center gap-2 flex-wrap text-xs text-stone-600">
                  <span className="font-mono text-[11px] font-semibold text-stone-800 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-md">
                    Ticket #{activeInquiry?.inquiryNumber || inquiryNumber || "---"}
                  </span>
                  <span className="text-stone-400 hidden sm:inline">•</span>
                  <span className="font-sans text-[11px] sm:text-xs text-stone-600 font-medium">
                    {formatInquiryType(activeInquiry?.inquiryType)}
                  </span>
                  {isViewerAdmin && (
                    <span className="font-mono text-[10px] text-amber-800 bg-amber-100/70 border border-amber-300 px-1.5 py-0.5 rounded-md font-semibold">
                      Curator Channel
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Exactly ONE Luxury Close Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-200/70 shrink-0 transition-colors"
              aria-label="Close conversation modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Conversation Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/60">
          {isLoading && !activeInquiry ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-stone-500">
              <Loader2 className="h-6 w-6 animate-spin text-amber-700" />
              <p className="text-xs font-mono">Connecting to DarkGems Atelier Vault...</p>
            </div>
          ) : !activeInquiry ? (
            <div className="py-14 flex flex-col items-center justify-center space-y-3 text-center px-4 text-stone-600">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-sm sm:text-base font-bold text-stone-900">
                  Private Gemological Consultation
                </h4>
                <p className="text-xs text-stone-500 max-w-sm">
                  Start a direct consultation inquiry with our Master Gemologists for bespoke solitaires, custom diamond calibrations, or private vault viewings.
                </p>
              </div>
              <a href="/contact" onClick={onClose} className="pt-2">
                <Button variant="luxury" size="sm" className="text-xs px-4">
                  Open New Consultation Ticket
                </Button>
              </a>
            </div>
          ) : (
            <>
              {/* Consultation Spec Overview Banner */}
              {activeInquiry && (
                isViewerAdmin ? (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-amber-200 bg-amber-50/90 p-3 text-xs text-stone-800 flex flex-wrap items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-amber-900 font-bold">Client:</span>
                      <span className="font-semibold text-stone-900">{activeInquiry.fullName}</span>
                      {activeInquiry.phone && (
                        <span className="text-[11px] font-mono text-stone-600">({activeInquiry.phone})</span>
                      )}
                    </div>
                    {(activeInquiry.preferredCaratRange || activeInquiry.budgetRange) && (
                      <div className="flex items-center gap-3 text-[11px] font-mono text-stone-700">
                        {activeInquiry.preferredCaratRange && (
                          <span>Carat: <strong className="text-amber-950 font-bold">{activeInquiry.preferredCaratRange}</strong></span>
                        )}
                        {activeInquiry.budgetRange && (
                          <span>Budget: <strong className="text-amber-950 font-bold">{activeInquiry.budgetRange}</strong></span>
                        )}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  (activeInquiry.preferredCaratRange || activeInquiry.budgetRange) && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-amber-200/80 bg-white p-3 text-xs text-stone-700 flex flex-wrap items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-900">
                        <Sparkles className="h-3.5 w-3.5 text-amber-700" />
                        <span className="font-semibold uppercase tracking-wider text-[10px]">Your Selection:</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-stone-600">
                        {activeInquiry.preferredCaratRange && (
                          <span>Carat: <strong className="text-stone-900">{activeInquiry.preferredCaratRange}</strong></span>
                        )}
                        {activeInquiry.budgetRange && (
                          <span>Budget: <strong className="text-stone-900">{activeInquiry.budgetRange}</strong></span>
                        )}
                      </div>
                    </motion.div>
                  )
                )
              )}

              {/* Message Stream */}
              <div className="space-y-4 pt-1">
                <AnimatePresence initial={false}>
                  {activeInquiry?.messages && activeInquiry.messages.length > 0 ? (
                    activeInquiry.messages.map((msg, index) => {
                      const isMe = isViewerAdmin
                        ? msg.sender === "ADMIN"
                        : msg.sender === "CLIENT";

                      return (
                        <motion.div
                          key={msg.id || index}
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                          {/* Sender label and time */}
                          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mb-1 px-1">
                            {isMe ? (
                              <>
                                <span className="text-stone-800 font-semibold">You</span>
                                <span className="text-stone-300">•</span>
                                <span className="font-mono text-[10px]">
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </>
                            ) : msg.sender === "ADMIN" ? (
                              <>
                                <div className="flex items-center gap-1 text-amber-900 font-bold">
                                  <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
                                  <span>{msg.senderName || "Curator Gemologist"}</span>
                                </div>
                                <span className="text-stone-300">•</span>
                                <span className="font-mono text-[10px]">
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-1 text-stone-800 font-semibold">
                                  <User className="h-3.5 w-3.5 text-stone-400" />
                                  <span>{msg.senderName || "Client"}</span>
                                </div>
                                <span className="text-stone-300">•</span>
                                <span className="font-mono text-[10px]">
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Chat Bubble */}
                          <div
                            className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words shadow-xs ${
                              isMe
                                ? "bg-stone-900 text-stone-100 rounded-tr-xs"
                                : "bg-white text-stone-900 rounded-tl-xs border border-stone-200"
                            }`}
                          >
                            {msg.message}
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-stone-500 text-xs font-mono">
                      No messages recorded in this consultation ticket yet.
                    </div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </>
          )}
        </div>

        {/* Input Composer & Quick Escalation Footer */}
        <div className="p-3 sm:p-4 border-t border-stone-200/80 bg-white space-y-3">
          {/* Admin Quick Presets */}
          {isViewerAdmin && activeInquiry && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                Curator Response Presets:
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setMessageDraft(
                      `Dear ${activeInquiry.fullName},\n\nWe have verified our certified vault for diamonds matching your preference (${activeInquiry.preferredCaratRange || "selected specifications"}). Our curation team has earmarked 2 investment-grade Type IIa solitaires with GIA Dossiers for your private review.\n\nWould you like us to arrange a private video salon consultation?`
                    )
                  }
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 transition-colors cursor-pointer"
                >
                  + Solitaire Curation
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMessageDraft(
                      `Dear ${activeInquiry.fullName},\n\nOur master bench jewelers are ready to draft custom 3D CAD renders for your bespoke setting. We specialize in 18k Yellow Gold, Rose Gold, Midnight Noir Gold, and 950 Platinum.\n\nPlease share your ring size and target delivery date.`
                    )
                  }
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 transition-colors cursor-pointer"
                >
                  + Custom Ring CAD
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMessageDraft(
                      `Dear ${activeInquiry.fullName},\n\nThank you for reaching DarkGems Concierge. We have received your consultation request and our Head Gemologist will reach out directly via call/WhatsApp to discuss your gemstone requirements in detail.`
                    )
                  }
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 transition-colors cursor-pointer"
                >
                  + Direct Call Notice
                </button>
              </div>
            </div>
          )}

          {/* Composer Box */}
          <form onSubmit={handleSend} className="space-y-2">
            <div className="relative flex items-end gap-2 bg-stone-50 border border-stone-200 rounded-2xl p-1.5 focus-within:border-stone-400 focus-within:bg-white transition-all shadow-2xs">
              <Textarea
                rows={2}
                value={messageDraft}
                onChange={(e) => setMessageDraft(e.target.value)}
                placeholder={
                  isViewerAdmin
                    ? "Type your official curator reply into the client consultation stream..."
                    : "Ask our Master Gemologist about diamond cuts, 3D custom settings, or delivery..."
                }
                className="flex-1 bg-transparent border-0 p-2 text-xs sm:text-sm text-stone-900 resize-none focus-visible:ring-0 focus-visible:outline-none min-h-[44px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend(e);
                  }
                }}
              />

              <Button
                type="submit"
                variant="luxury"
                size="md"
                disabled={isSending || !messageDraft.trim()}
                className="h-10 px-4 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs gap-1.5 rounded-xl shrink-0 shadow-xs"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Send</span>
                  </>
                )}
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-stone-500 pt-0.5">
              <span className="text-[10px] text-stone-400 font-sans">
                {isViewerAdmin
                  ? "Press Enter to reply • Direct client communication channel"
                  : "Press Enter to dispatch • Direct atelier concierge line"}
              </span>

              {/* Role-Specific Quick Channels */}
              <div className="flex items-center gap-2 flex-wrap">
                {isViewerAdmin ? (
                  <>
                    {activeInquiry?.phone && (
                      <a
                        href={`https://wa.me/${activeInquiry.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `Hello ${activeInquiry.fullName}, this is DarkGems Atelier regarding your consultation #${activeInquiry.inquiryNumber}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px] font-sans px-2.5 rounded-full bg-emerald-50/80 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                        >
                          <MessageCircle className="h-3 w-3 text-emerald-600 mr-1" />
                          WhatsApp Client
                        </Button>
                      </a>
                    )}

                    {activeInquiry?.phone && (
                      <a href={`tel:${activeInquiry.phone}`}>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px] font-sans px-2.5 rounded-full bg-white border-stone-200 text-stone-700 hover:bg-stone-100"
                        >
                          <Phone className="h-3 w-3 text-amber-700 mr-1" />
                          Call Client
                        </Button>
                      </a>
                    )}

                    {activeInquiry?.email && (
                      <a
                        href={`mailto:${activeInquiry.email}?subject=${encodeURIComponent(
                          `DarkGems Haute Gemology - Consultation #${activeInquiry.inquiryNumber}`
                        )}`}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px] font-sans px-2.5 rounded-full bg-white border-stone-200 text-stone-700 hover:bg-stone-100"
                        >
                          <Mail className="h-3 w-3 text-stone-500 mr-1" />
                          Email Client
                        </Button>
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    <a
                      href={`https://wa.me/18008458839?text=${encodeURIComponent(
                        `Hello DarkGems, I am inquiring about Consultation #${activeInquiry?.inquiryNumber || inquiryNumber}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] font-sans px-2.5 rounded-full bg-emerald-50/80 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                      >
                        <MessageCircle className="h-3 w-3 text-emerald-600 mr-1" />
                        WhatsApp Atelier
                      </Button>
                    </a>
                    <a href="tel:+18008458839">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] font-sans px-2.5 rounded-full bg-white border-stone-200 text-stone-700 hover:bg-stone-100"
                      >
                        <Phone className="h-3 w-3 text-amber-700 mr-1" />
                        Call Atelier
                      </Button>
                    </a>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
