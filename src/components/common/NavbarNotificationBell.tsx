"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavbarNotifications } from "@/hooks/useNavbarNotifications";
import { useAuthStore } from "@/store/useAuthStore";
import { IInquiry } from "@/types/inquiry.types";
import {
  Bell,
  MessageSquare,
  MessageCircle,
  Sparkles,
  CheckCheck,
  ShieldCheck,
  User,
} from "lucide-react";
import { InquiryConversationModal } from "@/components/contact/InquiryConversationModal";
import { LiveInquiryAlert } from "@/components/common/LiveInquiryAlert";
import { useRouter } from "next/navigation";

interface NavbarNotificationBellProps {
  hideModal?: boolean;
}

export function NavbarNotificationBell({ hideModal = false }: NavbarNotificationBellProps = {}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const {
    unreadCount,
    inquiries,
    chatNotifications,
    isLoading,
    selectedInquiry,
    setSelectedInquiry,
    closeConversation,
    markInquiryAsRead,
    markAllAsRead,
  } = useNavbarNotifications();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Compute sorted inquiries
  const sortedInquiries = useMemo(() => {
    return [...inquiries].sort((a, b) => {
      const aUnread = isAdmin
        ? (typeof a.unreadAdminCount === "number" && a.unreadAdminCount > 0) || a.status === "NEW"
        : (typeof a.unreadClientCount === "number" && a.unreadClientCount > 0) || a.isClientRead === false;
      const bUnread = isAdmin
        ? (typeof b.unreadAdminCount === "number" && b.unreadAdminCount > 0) || b.status === "NEW"
        : (typeof b.unreadClientCount === "number" && b.unreadClientCount > 0) || b.isClientRead === false;

      if (aUnread && !bUnread) return -1;
      if (!aUnread && bUnread) return 1;

      const getLatestTime = (inq: IInquiry): number => {
        const lastMsg =
          inq.messages && inq.messages.length > 0
            ? inq.messages[inq.messages.length - 1]
            : null;
        const msgTime = lastMsg?.createdAt ? new Date(lastMsg.createdAt).getTime() : 0;
        const updateTime = inq.updatedAt ? new Date(inq.updatedAt).getTime() : 0;
        const createTime = inq.createdAt ? new Date(inq.createdAt).getTime() : 0;
        return Math.max(msgTime, updateTime, createTime);
      };

      return getLatestTime(b) - getLatestTime(a);
    });
  }, [inquiries, isAdmin]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleOpenInquiry = (inquiry: IInquiry) => {
    setSelectedInquiry(inquiry);
    setIsOpen(false);
    void markInquiryAsRead(inquiry.id || inquiry.inquiryNumber);
  };

  const handleOpenChat = (conversationId?: string) => {
    setIsOpen(false);
    if (isAdmin) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("darkgems_open_admin_chat", {
            detail: { conversationId },
          })
        );
      }
      const targetUrl = conversationId
        ? `/admin?tab=CHAT&conversationId=${encodeURIComponent(conversationId)}`
        : "/admin?tab=CHAT";
      router.push(targetUrl);
    } else {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("darkgems_open_user_chat"));
      }
    }
  };

  const hasAnyNotifications = chatNotifications.length > 0 || sortedInquiries.length > 0;

  return (
    <>
      {/* Real-time floating incoming alert banner */}
      {!hideModal && <LiveInquiryAlert />}

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative p-2 text-stone-500 hover:text-stone-900 transition-colors rounded-lg hover:bg-stone-100/80 focus:outline-hidden cursor-pointer"
          title={isAdmin ? "Curator Alerts & Client Messages" : "Concierge Notifications"}
          aria-label={isAdmin ? "Curator Alerts & Client Messages" : "Concierge Notifications"}
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white shadow-xs animate-pulse font-mono">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Popover */}
        {isOpen && (
          <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-full mt-1 sm:mt-2 sm:w-96 max-w-sm sm:max-w-none mx-auto sm:mx-0 rounded-2xl border border-stone-200 bg-white shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 font-sans">
            {/* Popover Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 bg-stone-50/70">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span className="font-serif font-semibold text-stone-900 text-sm">
                  {isAdmin ? "Client Inquiries & Live Chats" : "Concierge Messages"}
                </span>
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => void markAllAsRead()}
                  className="text-[11px] font-mono text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <CheckCheck className="h-3.5 w-3.5 text-amber-600" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto divide-y divide-stone-100 text-xs">
              {isLoading && !hasAnyNotifications ? (
                <div className="py-8 text-center text-stone-400 font-mono text-xs">
                  Checking for new messages...
                </div>
              ) : !hasAnyNotifications ? (
                <div className="py-10 px-4 text-center">
                  <MessageSquare className="h-8 w-8 mx-auto text-stone-300 mb-2" />
                  <div className="font-medium text-stone-700 text-xs">
                    {isAdmin ? "No Unread Client Messages" : "No Messages Yet"}
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1 max-w-[220px] mx-auto">
                    {isAdmin
                      ? "All live client chats and consultation threads are up to date."
                      : "When our master gemologist replies, messages will appear here."}
                  </p>
                </div>
              ) : (
                <>
                  {/* 1. Live WhatsApp Chat Notifications for Admin */}
                  {isAdmin && chatNotifications.map((conv) => (
                    <div
                      key={`chat-${conv.id}`}
                      onClick={() => handleOpenChat(conv.id)}
                      className="p-3.5 bg-emerald-50/30 hover:bg-emerald-50/60 transition-colors cursor-pointer flex gap-3 items-start border-l-4 border-emerald-500"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                        <MessageCircle className="h-4 w-4 text-emerald-700" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-stone-900 text-xs truncate flex items-center gap-1.5">
                            <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded font-mono uppercase font-bold">
                              Live Chat
                            </span>
                            {conv.participant.name}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-700 font-bold shrink-0">
                            {conv.unreadCountAdmin} new
                          </span>
                        </div>
                        <p className="text-stone-700 text-xs line-clamp-2 leading-relaxed">
                          {conv.lastMessage?.content || "Client started a live consultation"}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-800 pt-0.5">
                          <span>{conv.participant.email} • Click to open in Admin Chat</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* 1b. Live WhatsApp Chat Notification for Non-Admin Client */}
                  {!isAdmin && chatNotifications.length === 0 && unreadCount > 0 && (
                    <div
                      onClick={() => handleOpenChat()}
                      className="p-3.5 bg-emerald-50/40 hover:bg-emerald-50/70 transition-colors cursor-pointer flex gap-3 items-start border-l-4 border-emerald-500"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                        <MessageCircle className="h-4 w-4 text-emerald-700" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-stone-900 text-xs truncate flex items-center gap-1.5">
                            <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded font-mono uppercase font-bold">
                              Atelier Chat
                            </span>
                            Curator Response
                          </span>
                          <span className="text-[10px] font-mono text-emerald-700 font-bold shrink-0">
                            New
                          </span>
                        </div>
                        <p className="text-stone-700 text-xs line-clamp-2 leading-relaxed">
                          Our Master Gemologist has sent an update regarding your diamond consultation.
                        </p>
                        <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-800 pt-0.5">
                          <span>Click to open live chat modal</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. Formal Inquiry Notifications */}
                  {sortedInquiries.map((inquiry) => {
                    const lastMessage =
                      inquiry.messages && inquiry.messages.length > 0
                        ? inquiry.messages[inquiry.messages.length - 1]
                        : null;
                    const isUnread = isAdmin
                      ? (inquiry.unreadAdminCount && inquiry.unreadAdminCount > 0) || inquiry.status === "NEW"
                      : (inquiry.unreadClientCount && inquiry.unreadClientCount > 0) || !inquiry.isClientRead;

                    const previewText =
                      lastMessage?.message || inquiry.adminReply || inquiry.message;

                    return (
                      <div
                        key={`inq-${inquiry.id}`}
                        onClick={() => handleOpenInquiry(inquiry)}
                        className={`p-3.5 hover:bg-amber-50/30 transition-colors cursor-pointer flex gap-3 items-start ${
                          isUnread ? "bg-amber-50/25" : ""
                        }`}
                      >
                        <div
                          className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                            isUnread ? "bg-amber-500 shadow-xs animate-pulse" : "bg-transparent"
                          }`}
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono font-bold text-stone-900 text-[11px] truncate">
                              #{inquiry.inquiryNumber} {isAdmin && `• ${inquiry.fullName}`}
                            </span>
                            <span className="text-[10px] font-mono text-stone-400 shrink-0">
                              {new Date(inquiry.updatedAt || inquiry.createdAt).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <p className="text-stone-700 text-xs line-clamp-2 leading-relaxed">
                            {previewText}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] font-mono text-amber-800 pt-0.5">
                            {isAdmin ? (
                              <>
                                <User className="h-3 w-3 text-amber-600" />
                                <span>{inquiry.email} • Click to open thread</span>
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="h-3 w-3 text-amber-600" />
                                <span>Curator Reply • Click to view</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Live End-to-End Conversation Modal - rendered once across viewports */}
      {!hideModal && selectedInquiry && (
        <InquiryConversationModal
          inquiryNumber={selectedInquiry.inquiryNumber}
          isOpen={Boolean(selectedInquiry)}
          onClose={() => {
            closeConversation();
            setSelectedInquiry(null);
          }}
        />
      )}
    </>
  );
}
