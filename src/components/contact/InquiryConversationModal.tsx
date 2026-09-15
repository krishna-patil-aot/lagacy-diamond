"use client";

import React, { useState, useEffect, useRef } from "react";
import { useInquiryConversation } from "@/hooks/useInquiryConversation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

  const getStatusBadge = () => {
    if (!activeInquiry) return null;
    switch (activeInquiry.status) {
      case "NEW":
        return (
          <Badge variant="gold" className="text-[10px] font-mono gap-1 py-0.5 px-2.5 bg-amber-100 text-amber-900 border-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Curator Reviewing
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge variant="outline" className="text-[10px] font-mono gap-1 py-0.5 px-2.5 border-amber-300 text-amber-900 bg-amber-50">
            <Sparkles className="h-3 w-3 text-amber-600" />
            Active Consultation
          </Badge>
        );
      case "RESOLVED":
        return (
          <Badge variant="success" className="text-[10px] font-mono gap-1 py-0.5 px-2.5 bg-emerald-50 text-emerald-800 border-emerald-300">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            Completed
          </Badge>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-[calc(100%-1.5rem)] sm:w-full p-0 bg-white text-stone-900 border border-stone-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        {/* Luxury Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-stone-200/80 bg-gradient-to-r from-[#faf8f5] via-[#f7f5f0] to-[#faf8f5] relative">
          <div className="flex items-center justify-between gap-3 pr-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full border border-amber-300 bg-amber-100/70 flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="h-4.5 w-4.5 text-amber-700" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="font-serif text-base sm:text-lg font-bold text-stone-900 tracking-wide">
                    {siteConfig.brandName} Concierge Portal
                  </DialogTitle>
                  {getStatusBadge()}
                </div>
                <DialogDescription className="text-xs text-stone-500 mt-0.5 font-mono">
                  {isViewerAdmin ? "Admin Live Consultation • " : ""}Ticket #{activeInquiry?.inquiryNumber || inquiryNumber || "---"} •{" "}
                  {activeInquiry?.inquiryType.replace(/_/g, " ") || "Private Consultation"}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Conversation Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/50">
          {isLoading && !activeInquiry ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-stone-500">
              <Loader2 className="h-6 w-6 animate-spin text-amber-700" />
              <p className="text-xs font-mono">Connecting to DarkGem Atelier Vault...</p>
            </div>
          ) : (
            <>
              {/* Consultation Spec Overview Banner */}
              {activeInquiry && (
                isViewerAdmin ? (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-stone-800 flex flex-wrap items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-amber-800 font-bold">Client:</span>
                      <span className="font-semibold text-stone-900">{activeInquiry.fullName}</span>
                      {activeInquiry.phone && (
                        <span className="text-[11px] font-mono text-stone-500">({activeInquiry.phone})</span>
                      )}
                    </div>
                    {(activeInquiry.preferredCaratRange || activeInquiry.budgetRange) && (
                      <div className="flex items-center gap-3 text-[11px] font-mono text-stone-600">
                        {activeInquiry.preferredCaratRange && (
                          <span>Carat: <strong className="text-amber-900">{activeInquiry.preferredCaratRange}</strong></span>
                        )}
                        {activeInquiry.budgetRange && (
                          <span>Budget: <strong className="text-amber-900">{activeInquiry.budgetRange}</strong></span>
                        )}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  (activeInquiry.preferredCaratRange || activeInquiry.budgetRange) && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-amber-200/80 bg-stone-50 p-2.5 px-3 text-xs text-stone-700 flex flex-wrap items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-center gap-2 text-[11px] font-mono text-amber-900">
                        <Sparkles className="h-3 w-3 text-amber-700" />
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
              <div className="space-y-3 pt-2">
                <AnimatePresence initial={false}>
                  {activeInquiry?.messages && activeInquiry.messages.length > 0 ? (
                    activeInquiry.messages.map((msg, index) => {
                      // Correct chat alignment:
                      // If viewer is ADMIN: admin messages are on RIGHT ("You"), client on LEFT ("Client")
                      // If viewer is CLIENT: client messages are on RIGHT ("You"), admin on LEFT ("Curator")
                      const isMe = isViewerAdmin
                        ? msg.sender === "ADMIN"
                        : msg.sender === "CLIENT";

                      return (
                        <motion.div
                          key={msg.id || index}
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.25 }}
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                          {/* Sender label and time */}
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-stone-500 mb-1 px-1">
                            {isMe ? (
                              <>
                                <span className="text-stone-800 font-semibold">You</span>
                                <span>•</span>
                                <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                              </>
                            ) : msg.sender === "ADMIN" ? (
                              <>
                                <ShieldCheck className="h-3 w-3 text-amber-700" />
                                <span className="text-amber-800 font-bold">{msg.senderName} (Curator)</span>
                                <span>•</span>
                                <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                              </>
                            ) : (
                              <>
                                <span className="text-stone-700 font-semibold">{msg.senderName || "Client"}</span>
                                <span>•</span>
                                <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                              </>
                            )}
                          </div>

                          {/* Chat Bubble: Our side = right (dark/solid), Sender side = left (light/framed) */}
                          <div
                            className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                              isMe
                                ? "bg-stone-900 text-white rounded-tr-xs shadow-xs"
                                : "bg-white text-stone-900 rounded-tl-xs border border-amber-200/90 shadow-xs ring-1 ring-amber-100"
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

        {/* Input Composer & Quick Escalation */}
        <div className="p-3 sm:p-4 border-t border-stone-200 bg-white">
          <form onSubmit={handleSend} className="space-y-2.5">
            {/* Admin Quick Presets */}
            {isViewerAdmin && activeInquiry && (
              <div className="flex flex-wrap items-center gap-1.5 pb-0.5">
                <span className="text-[10px] font-mono text-stone-400 mr-0.5">Curator Presets:</span>
                <button
                  type="button"
                  onClick={() =>
                    setMessageDraft(
                      `Dear ${activeInquiry.fullName},\n\nWe have verified our certified vault for diamonds matching your preference (${activeInquiry.preferredCaratRange || "selected specifications"}). Our curation team has earmarked 2 investment-grade Type IIa solitaires with GIA Dossiers for your private review.\n\nWould you like us to arrange a private video salon consultation?`
                    )
                  }
                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 hover:bg-amber-100/70 border border-stone-200 text-stone-700 hover:text-amber-900 transition-colors cursor-pointer"
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
                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 hover:bg-amber-100/70 border border-stone-200 text-stone-700 hover:text-amber-900 transition-colors cursor-pointer"
                >
                  + Custom Ring CAD
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMessageDraft(
                      `Dear ${activeInquiry.fullName},\n\nThank you for reaching DarkGem Concierge. We have received your consultation request and our Head Gemologist will reach out directly via call/WhatsApp to discuss your gemstone requirements in detail.`
                    )
                  }
                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 hover:bg-amber-100/70 border border-stone-200 text-stone-700 hover:text-amber-900 transition-colors cursor-pointer"
                >
                  + Direct Call Notice
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <Textarea
                rows={2}
                value={messageDraft}
                onChange={(e) => setMessageDraft(e.target.value)}
                placeholder={
                  isViewerAdmin
                    ? "Type your official curator reply into the client consultation stream..."
                    : "Ask our Master Gemologist about diamond cuts, 3D custom settings, or delivery..."
                }
                className="bg-stone-50/60 border-stone-300 text-stone-900 text-xs sm:text-sm resize-none focus-visible:ring-amber-600 focus-visible:border-amber-600 rounded-xl"
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
                className="self-end h-10 px-4 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs gap-1.5 shadow-xs"
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

            {/* Role-Differentiated Contact Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-stone-500">
              <span className="font-mono text-[10px] text-stone-500">
                {isViewerAdmin
                  ? "Press Enter to reply • Direct client communication channel"
                  : "Press Enter to dispatch • Direct atelier line"}
              </span>

              <div className="flex items-center gap-2">
                {isViewerAdmin ? (
                  /* Admin actions: contact the client */
                  <>
                    {activeInquiry?.phone && (
                      <a
                        href={`https://wa.me/${activeInquiry.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `Hello ${activeInquiry.fullName}, this is DarkGem Atelier regarding your consultation #${activeInquiry.inquiryNumber}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px] font-mono px-2.5 bg-emerald-50/80 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
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
                          className="h-7 text-[10px] font-mono px-2.5 bg-white border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-stone-900"
                        >
                          <Phone className="h-3 w-3 text-amber-700 mr-1" />
                          Call Client
                        </Button>
                      </a>
                    )}

                    {activeInquiry?.email && (
                      <a
                        href={`mailto:${activeInquiry.email}?subject=${encodeURIComponent(
                          `DarkGem Haute Gemology - Consultation #${activeInquiry.inquiryNumber}`
                        )}`}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px] font-mono px-2.5 bg-white border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-stone-900"
                        >
                          <Mail className="h-3 w-3 text-stone-500 mr-1" />
                          Email Client
                        </Button>
                      </a>
                    )}
                  </>
                ) : (
                  /* Client actions: contact the Atelier */
                  <>
                    <a
                      href={`https://wa.me/18008458839?text=${encodeURIComponent(
                        `Hello DarkGem, I am inquiring about Consultation #${activeInquiry?.inquiryNumber || inquiryNumber}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] font-mono px-2.5 bg-white border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-stone-900"
                      >
                        <MessageCircle className="h-3 w-3 text-emerald-600 mr-1" />
                        WhatsApp Gemologist
                      </Button>
                    </a>

                    <a href={`tel:${siteConfig.contact.phone}`}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] font-mono px-2.5 bg-white border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-stone-900"
                      >
                        <Phone className="h-3 w-3 text-amber-700 mr-1" />
                        Direct Call
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
