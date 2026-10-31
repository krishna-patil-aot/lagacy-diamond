"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useUserChat } from "@/hooks/useUserChat";
import { ChatMessageBubble, ChatDateDivider } from "@/components/chat/ChatMessageBubble";
import { groupMessagesByDateAndSender } from "@/lib/chat-utils";
import { ChatQuickReplies } from "@/components/chat/ChatQuickReplies";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Lock,
  Volume2,
  VolumeX,
  ShieldCheck,
  User,
  Mail,
  Loader2,
  ChevronLeft,
  Clock,
} from "lucide-react";
import { siteConfig } from "@/config/site.config";

export function UserChatWidget() {
  const isMounted = useIsMounted();
  const pathname = usePathname();

  const {
    isOpen,
    toggleChat,
    setIsOpen,
    messages,
    hasMoreMessages,
    isLoadingEarlier,
    loadEarlierMessages,
    totalMessageCount,
    isLoading,
    isSending,
    unreadCount,
    messageDraft,
    setMessageDraft,
    guestName,
    setGuestName,
    guestEmail,
    setGuestEmail,
    isGuestConfigured,
    handleSaveGuestInfo,
    handleSendMessage,
    messagesContainerRef,
    isSoundEnabled,
    setIsSoundEnabled,
  } = useUserChat();

  const [inputRows] = useState<number>(1);

  // Group messages by Date & consecutive sender clusters for multiple message management
  const messageDateGroups = React.useMemo(() => {
    return groupMessagesByDateAndSender(messages);
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  if (!isMounted || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {/* 1. Floating WhatsApp Launcher Button (Responsive placement, hides on mobile when chat is open) */}
      <div
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 sm:z-50 items-center ${
          isOpen ? "hidden sm:flex" : "flex"
        }`}
      >
        <button
          type="button"
          onClick={toggleChat}
          aria-label="Toggle Live Atelier Chat"
          className="group relative flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-hidden focus:ring-4 focus:ring-emerald-300/60 cursor-pointer"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white transition-transform group-hover:rotate-90 duration-200" />
          ) : (
            <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white fill-white/20 transition-transform group-hover:scale-110" />
          )}

          {/* Unread Message Badge */}
          {unreadCount > 0 && !isOpen && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5.5 min-w-5.5 sm:h-6 sm:min-w-6 items-center justify-center rounded-full bg-rose-600 px-1.5 text-[10px] sm:text-[11px] font-mono font-bold text-white shadow-md animate-bounce">
              {unreadCount}
            </span>
          )}

          {/* Tooltip on hover (desktop only) */}
          {!isOpen && (
            <span className="pointer-events-none absolute right-16 hidden sm:block whitespace-nowrap rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 font-sans">
              Chat with Atelier Curator • <span className="text-emerald-400 font-bold">Online</span>
            </span>
          )}
        </button>
      </div>

      {/* 2. WhatsApp-Style Live Chat Window (Full-screen mobile app feel, floating modal on desktop) */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Atelier Live Chat Window"
          className="fixed inset-0 z-50 flex flex-col bg-[#efeae2] h-dvh sm:h-[620px] sm:max-h-[85vh] sm:w-[420px] sm:inset-auto sm:bottom-22 sm:right-6 sm:rounded-2xl sm:border sm:border-stone-300 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200 font-sans"
        >
          {/* Header (WhatsApp Luxury Green Theme) */}
          <div className="flex items-center justify-between px-3.5 py-3 sm:px-4 sm:py-3.5 bg-stone-900 text-white border-b border-stone-800 shrink-0 select-none">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Back button on mobile */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="sm:hidden p-1.5 -ml-1 text-stone-300 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                aria-label="Close chat"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="relative shrink-0">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-stone-800 border border-amber-400/40 text-amber-200">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                {/* Active Status Dot */}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-emerald-500 ring-2 ring-stone-900" />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif text-xs sm:text-sm font-semibold tracking-wide text-white truncate">
                    {siteConfig.brandName} Atelier
                  </h3>
                  <span className="rounded bg-amber-500/20 px-1 py-0.2 text-[9px] uppercase tracking-wider font-mono text-amber-300 border border-amber-500/30 shrink-0">
                    Live
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-emerald-400 font-medium truncate">
                  Curator Online • Replies instantly
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1 text-stone-300 shrink-0">
              <button
                type="button"
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                className="p-1.5 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                title={isSoundEnabled ? "Mute notification sound" : "Enable notification sound"}
              >
                {isSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-stone-500" />}
              </button>

              {/* Close Button on Desktop */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="hidden sm:flex p-1.5 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                title="Close chat window"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* End-to-End Encryption Notice */}
          <div className="bg-amber-50/90 border-b border-amber-200/80 px-3 py-1.5 flex items-center justify-center gap-1.5 text-[9px] sm:text-[10px] text-amber-900 font-mono select-none">
            <Lock className="h-3 w-3 text-amber-700 shrink-0" />
            <span className="truncate">End-to-End Atelier Channel • GIA Advisory</span>
          </div>

          {/* Chat Messages Body (WhatsApp Luxury Textured Wallpaper) */}
          <div
            ref={messagesContainerRef}
            className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-1 bg-[#efeae2] bg-[radial-gradient(#d3cbbe_0.8px,transparent_0.8px)] [background-size:16px_16px] relative overscroll-contain"
          >
            {/* If guest is not configured, show welcome guest card */}
            {!isGuestConfigured ? (
              <div className="my-auto py-4 sm:py-6 px-2 sm:px-4">
                <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-sm space-y-3.5 sm:space-y-4">
                  <div className="text-center space-y-1">
                    <div className="mx-auto flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                      <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h4 className="font-serif text-sm sm:text-base font-semibold text-stone-900">
                      Connect with Vault Curator
                    </h4>
                    <p className="text-[11px] sm:text-xs text-stone-500 leading-relaxed">
                      Direct WhatsApp-style concierge for certified diamonds, custom solitaire settings, and order assistance.
                    </p>
                  </div>

                  <form onSubmit={handleSaveGuestInfo} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-mono text-stone-600 block mb-1">
                        Your Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                        <Input
                          placeholder="e.g. Eleanor Vance"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="pl-9 text-base sm:text-xs h-9.5 sm:h-9 bg-stone-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-stone-600 block mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                        <Input
                          type="email"
                          required
                          placeholder="e.g. client@estate.luxury"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="pl-9 text-base sm:text-xs h-9.5 sm:h-9 bg-stone-50"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="luxury"
                      className="w-full justify-center text-xs h-9.5 sm:h-9 mt-2 cursor-pointer"
                    >
                      Start Live Consultation
                    </Button>
                  </form>
                </div>
              </div>
            ) : (
              <>
                {/* Clean blank prompt - first message comes strictly from the user */}
                {messages.length === 0 && !isLoading && (
                  <div className="text-center my-10 sm:my-14 space-y-3 px-4 select-none">
                    <div className="mx-auto flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white border border-stone-200 text-stone-700 shadow-xs">
                      <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-stone-900">
                        Direct Atelier Concierge
                      </p>
                      <p className="text-[11px] text-stone-500 leading-relaxed max-w-[240px] mx-auto">
                        Type your message below to begin consultation with our Master Gemologist.
                      </p>
                    </div>
                  </div>
                )}

                {/* Cursor-Based Message Pagination: Load Earlier Messages */}
                {hasMoreMessages && (
                  <div className="flex justify-center pb-2 select-none">
                    <button
                      type="button"
                      onClick={() => void loadEarlierMessages()}
                      disabled={isLoadingEarlier}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 hover:bg-white text-stone-700 hover:text-stone-900 border border-stone-300 text-[10px] font-mono shadow-2xs transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isLoadingEarlier ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin text-emerald-700" />
                          <span>Retrieving earlier archive...</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 text-stone-400" />
                          <span>Load earlier messages ({totalMessageCount - messages.length} remaining)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Messages Timeline with Date Dividers & Sender Clusters (1-on-1 No redundant headers) */}
                {messageDateGroups.map((dateGroup, groupIdx) => (
                  <div key={`user-date-group-${groupIdx}`} className="space-y-1">
                    <ChatDateDivider dateLabel={dateGroup.dateLabel} />
                    {dateGroup.items.map((item) => (
                      <ChatMessageBubble
                        key={item.message.id}
                        message={item.message}
                        isSelf={item.message.sender === "USER"}
                        showSenderHeader={false}
                        isFirstInCluster={item.isFirstInCluster}
                        isLastInCluster={item.isLastInCluster}
                      />
                    ))}
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && messages.length === 0 && (
                  <div className="flex items-center justify-center py-10 text-stone-400 gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-xs">Connecting to secure atelier...</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quick Prompts Carousel (Only when configured) */}
          {isGuestConfigured && (
            <div className="bg-[#efeae2]/90 backdrop-blur-xs px-2 sm:px-3 py-1 border-t border-stone-200/60 shrink-0">
              <ChatQuickReplies
                onSelect={(prompt) => void handleSendMessage(undefined, prompt)}
                disabled={isSending}
              />
            </div>
          )}

          {/* Input Footer with safe-area padding for mobile home indicators */}
          {isGuestConfigured && (
            <div className="p-2 sm:p-2.5 bg-white border-t border-stone-200 shrink-0 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] sm:pb-2.5">
              <form
                onSubmit={(e) => void handleSendMessage(e)}
                className="flex items-center gap-2"
              >
                <div className="flex-1 relative rounded-2xl border border-stone-300 focus-within:border-emerald-600 bg-stone-50 transition-colors">
                  <textarea
                    rows={inputRows}
                    value={messageDraft}
                    onChange={(e) => setMessageDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="w-full resize-none bg-transparent px-3.5 py-2 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden max-h-24 leading-normal"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!messageDraft.trim() || isSending}
                  className="flex h-9.5 w-9.5 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-[#005c4b] hover:bg-[#004a3c] disabled:bg-stone-300 text-white shadow-xs transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                  title="Send message"
                  aria-label="Send message"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <Send className="h-4 w-4 text-white ml-0.5" />
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}
