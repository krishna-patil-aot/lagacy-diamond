"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useClientNotifications } from "@/hooks/useClientNotifications";
import { useAuthStore } from "@/store/useAuthStore";
import { IChatConversation } from "@/types/chat.types";
import { IInquiry } from "@/types/inquiry.types";
import { subscribeToChatEvents, CHAT_EVENTS } from "@/lib/chat-events";

export interface IUseNavbarNotificationsReturn {
  unreadCount: number;
  inquiries: IInquiry[];
  chatNotifications: IChatConversation[];
  isLoading: boolean;
  selectedInquiry: IInquiry | null;
  setSelectedInquiry: (inquiry: IInquiry | null) => void;
  closeConversation: () => void;
  markInquiryAsRead: (inquiryId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useNavbarNotifications(): IUseNavbarNotificationsReturn {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const {
    notifications: inquiries,
    unreadCount: inquiryUnread,
    isLoading: inquiriesLoading,
    selectedInquiry,
    setSelectedInquiry,
    closeConversation,
    markAsRead: markInquiryAsRead,
    markAllAsRead: markAllInquiriesRead,
    refetch: refetchInquiries,
  } = useClientNotifications();

  const [chatConversations, setChatConversations] = useState<IChatConversation[]>([]);
  const [chatUnread, setChatUnread] = useState<number>(0);
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  const fetchChatNotifications = useCallback(async () => {
    try {
      if (isAdmin) {
        const res = await fetch("/api/chat/conversations");
        const data = await res.json();
        if (data.success && Array.isArray(data.conversations)) {
          const allConvs = data.conversations as IChatConversation[];
          const unreadConvs = allConvs.filter((c) => c.unreadCountAdmin > 0);
          setChatConversations(unreadConvs);
          setChatUnread(typeof data.totalUnread === "number" ? data.totalUnread : 0);
        }
      } else if (user?.email) {
        const res = await fetch(`/api/chat/unread?email=${encodeURIComponent(user.email)}`);
        const data = await res.json();
        if (data.success && typeof data.unreadCount === "number") {
          setChatUnread(data.unreadCount);
        }
      }
    } catch {
      // Ignore background network error
    } finally {
      setChatLoading(false);
    }
  }, [isAdmin, user]);

  // Initial fetch and focus synchronization
  useEffect(() => {
    let isSubscribed = true;
    const runAsync = async () => {
      await Promise.resolve();
      if (isSubscribed) {
        void fetchChatNotifications();
      }
    };
    void runAsync();

    const handleFocus = () => {
      void fetchChatNotifications();
    };

    window.addEventListener("focus", handleFocus);

    // 10s background heartbeat only when tab is visible
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        void fetchChatNotifications();
      }
    }, 10000);

    return () => {
      isSubscribed = false;
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [fetchChatNotifications]);

  // Real-time bus listener (event-driven, on message sent, read, or updated)
  useEffect(() => {
    const unsub = subscribeToChatEvents((event) => {
      if (
        event.type === CHAT_EVENTS.MESSAGE_SENT ||
        event.type === CHAT_EVENTS.MESSAGES_READ ||
        event.type === CHAT_EVENTS.CONVERSATION_UPDATED
      ) {
        void fetchChatNotifications();
      }
    });
    return unsub;
  }, [fetchChatNotifications]);

  const totalUnread = useMemo(() => {
    return inquiryUnread + chatUnread;
  }, [inquiryUnread, chatUnread]);

  const markAllAsRead = useCallback(async () => {
    await markAllInquiriesRead();
    setChatUnread(0);
  }, [markAllInquiriesRead]);

  const refetch = useCallback(async () => {
    await refetchInquiries();
    await fetchChatNotifications();
  }, [refetchInquiries, fetchChatNotifications]);

  return {
    unreadCount: totalUnread,
    inquiries,
    chatNotifications: chatConversations,
    isLoading: inquiriesLoading || chatLoading,
    selectedInquiry,
    setSelectedInquiry,
    closeConversation,
    markInquiryAsRead,
    markAllAsRead,
    refetch,
  };
}
