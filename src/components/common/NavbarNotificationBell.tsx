"use client";

import React, { useState, useRef, useEffect } from "react";
import { useClientNotifications } from "@/hooks/useClientNotifications";
import { useAuthStore } from "@/store/useAuthStore";
import { IInquiry } from "@/types/inquiry.types";
import {
  Bell,
  MessageSquare,
  Sparkles,
  CheckCheck,
  ShieldCheck,
  User,
} from "lucide-react";
import { InquiryConversationModal } from "@/components/contact/InquiryConversationModal";

export function NavbarNotificationBell() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const {
    notifications,
    unreadCount,
    isLoading,
    selectedInquiry,
    setSelectedInquiry,
    markAsRead,
    markAllAsRead,
  } = useClientNotifications();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleOpenNotification = (inquiry: IInquiry) => {
    setSelectedInquiry(inquiry);
    setIsOpen(false);
    void markAsRead(inquiry.id || inquiry.inquiryNumber);
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative p-2 text-stone-500 hover:text-stone-900 transition-colors rounded-lg hover:bg-stone-100/80 focus:outline-hidden"
          title={isAdmin ? "Curator Consultation Alerts" : "Concierge Notifications"}
          aria-label={isAdmin ? "Curator Consultation Alerts" : "Concierge Notifications"}
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Popover */}
        {isOpen && (
          <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-full mt-1 sm:mt-2 sm:w-96 max-w-sm sm:max-w-none mx-auto sm:mx-0 rounded-2xl border border-stone-200 bg-white shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Popover Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 bg-stone-50/70">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span className="font-serif font-semibold text-stone-900 text-sm">
                  {isAdmin ? "Client Inquiries & Alerts" : "Concierge Messages"}
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
            <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 text-xs">
              {isLoading && notifications.length === 0 ? (
                <div className="py-8 text-center text-stone-400 font-mono text-xs">
                  Checking for new messages...
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-10 px-4 text-center">
                  <MessageSquare className="h-8 w-8 mx-auto text-stone-300 mb-2" />
                  <div className="font-medium text-stone-700 text-xs">
                    {isAdmin ? "No Unread Client Inquiries" : "No Messages Yet"}
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1 max-w-[220px] mx-auto">
                    {isAdmin
                      ? "All client consultation threads and messages are currently up to date."
                      : "When our master gemologist replies to your inquiries, they will appear here."}
                  </p>
                </div>
              ) : (
                notifications.map((inquiry) => {
                  const lastMessage =
                    inquiry.messages && inquiry.messages.length > 0
                      ? inquiry.messages[inquiry.messages.length - 1]
                      : null;
                  const isUnread = isAdmin
                    ? (inquiry.unreadAdminCount && inquiry.unreadAdminCount > 0) || inquiry.status === "NEW"
                    : (inquiry.unreadClientCount && inquiry.unreadClientCount > 0) || !inquiry.isClientRead;

                  const previewText = isAdmin
                    ? lastMessage?.message || inquiry.message
                    : inquiry.adminReply || lastMessage?.message || inquiry.message;

                  return (
                    <div
                      key={inquiry.id}
                      onClick={() => handleOpenNotification(inquiry)}
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
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Live End-to-End Conversation Modal */}
      {selectedInquiry && (
        <InquiryConversationModal
          inquiryNumber={selectedInquiry.inquiryNumber}
          isOpen={Boolean(selectedInquiry)}
          onClose={() => setSelectedInquiry(null)}
        />
      )}
    </>
  );
}
