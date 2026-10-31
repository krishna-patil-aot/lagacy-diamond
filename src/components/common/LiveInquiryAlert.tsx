"use client";

import React, { useState, useEffect } from "react";
import { useInquiryStore } from "@/store/useInquiryStore";
import { useAuthStore } from "@/store/useAuthStore";
import { subscribeToChatEvents, CHAT_EVENTS, IChatEventPayload } from "@/lib/chat-events";
import { MessageSquare, MessageCircle, Sparkles, X, ArrowRight, ShieldCheck, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface IChatAlertState {
  conversationId: string;
  senderName: string;
  messageText: string;
}

export function LiveInquiryAlert() {
  const router = useRouter();
  const { incomingAlert, dismissIncomingAlert, openConversation } = useInquiryStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const [chatAlert, setChatAlert] = useState<IChatAlertState | null>(null);

  // Auto-dismiss inquiry alert after 10 seconds
  useEffect(() => {
    if (!incomingAlert) return;
    const timer = setTimeout(() => {
      dismissIncomingAlert();
    }, 10000);
    return () => clearTimeout(timer);
  }, [incomingAlert, dismissIncomingAlert]);

  // Auto-dismiss chat alert after 8 seconds
  useEffect(() => {
    if (!chatAlert) return;
    const timer = setTimeout(() => {
      setChatAlert(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [chatAlert]);

  // Subscribe to real-time client chat events
  useEffect(() => {
    if (!isAdmin) return;

    const unsub = subscribeToChatEvents((payload: IChatEventPayload) => {
      if (payload.type === CHAT_EVENTS.MESSAGE_SENT && payload.sender === "USER") {
        setChatAlert({
          conversationId: payload.conversationId,
          senderName: payload.senderName || "Private Client",
          messageText: payload.content || "Sent a live message in Atelier Chat",
        });
      }
    });

    return unsub;
  }, [isAdmin]);

  // 1. Live WhatsApp Chat Alert for Admin
  if (chatAlert && isAdmin) {
    return (
      <aside
        role="alert"
        aria-live="assertive"
        className="fixed top-18 sm:top-20 right-3 sm:right-6 left-3 sm:left-auto sm:w-96 z-50 rounded-2xl border border-emerald-500/50 bg-stone-900/95 text-white shadow-2xl backdrop-blur-md p-4 animate-in fade-in slide-in-from-top-3 duration-250 font-sans"
      >
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5 shadow-xs">
            <MessageCircle className="h-5 w-5 animate-pulse" />
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center justify-between gap-1">
              <span className="font-mono text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                Live Client Chat
              </span>
              <button
                type="button"
                onClick={() => setChatAlert(null)}
                className="text-stone-400 hover:text-white p-1 -mr-1 -mt-1 rounded-lg transition-colors cursor-pointer"
                title="Dismiss alert"
                aria-label="Dismiss alert"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-300">
              <User className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="text-emerald-300 font-semibold truncate">
                {chatAlert.senderName}
              </span>
              <span className="text-stone-400 shrink-0">• Just now</span>
            </div>

            <p className="text-xs text-stone-200 line-clamp-2 leading-relaxed bg-stone-800/80 p-2.5 rounded-xl border border-stone-700/60 font-sans">
              &ldquo;{chatAlert.messageText}&rdquo;
            </p>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  setChatAlert(null);
                  router.push("/admin");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-102 active:scale-98"
              >
                <span>Open in Admin Chat</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setChatAlert(null)}
                className="text-[11px] font-mono text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // 2. Standard Inquiry Alert
  if (!incomingAlert) return null;

  const isSenderAdmin = incomingAlert.senderRole === "ADMIN";

  return (
    <aside
      role="alert"
      aria-live="assertive"
      className="fixed top-18 sm:top-20 right-3 sm:right-6 left-3 sm:left-auto sm:w-96 z-50 rounded-2xl border border-amber-500/40 bg-stone-900/95 text-white shadow-2xl backdrop-blur-md p-4 animate-in fade-in slide-in-from-top-3 duration-250"
    >
      <div className="flex items-start gap-3">
        {/* Glowing Status Icon */}
        <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-400 mt-0.5 shadow-xs">
          {isSenderAdmin ? (
            <Sparkles className="h-5 w-5 animate-pulse" />
          ) : (
            <MessageSquare className="h-5 w-5 animate-pulse" />
          )}
        </div>

        {/* Content Details */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center justify-between gap-1">
            <span className="font-mono text-xs font-bold text-amber-400 tracking-wider">
              #{incomingAlert.inquiry.inquiryNumber}
            </span>
            <button
              type="button"
              onClick={dismissIncomingAlert}
              className="text-stone-400 hover:text-white p-1 -mr-1 -mt-1 rounded-lg transition-colors cursor-pointer"
              title="Dismiss alert"
              aria-label="Dismiss alert"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-300">
            {isSenderAdmin ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span className="text-amber-300 font-semibold truncate">
                  {incomingAlert.senderName}
                </span>
              </>
            ) : (
              <>
                <User className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span className="text-amber-300 font-semibold truncate">
                  {incomingAlert.senderName}
                </span>
              </>
            )}
            <span className="text-stone-400 shrink-0">• New message</span>
          </div>

          <p className="text-xs text-stone-200 line-clamp-2 leading-relaxed bg-stone-800/80 p-2.5 rounded-xl border border-stone-700/60 font-sans">
            &ldquo;{incomingAlert.messageText}&rdquo;
          </p>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => {
                void openConversation(incomingAlert.inquiry.inquiryNumber);
                dismissIncomingAlert();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-102 active:scale-98"
            >
              <span>{isAdmin && !isSenderAdmin ? "Inspect Inquiry" : "View Reply"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={dismissIncomingAlert}
              className="text-[11px] font-mono text-stone-400 hover:text-stone-200 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
