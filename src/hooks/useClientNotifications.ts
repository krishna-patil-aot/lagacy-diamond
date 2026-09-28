"use client";

import { useEffect, useCallback } from "react";
import { useInquiryStore } from "@/store/useInquiryStore";
import { IInquiry } from "@/types/inquiry.types";

export interface IUseClientNotificationsReturn {
  notifications: IInquiry[];
  unreadCount: number;
  isLoading: boolean;
  selectedInquiry: IInquiry | null;
  setSelectedInquiry: (inquiry: IInquiry | null) => void;
  closeConversation: () => void;
  markAsRead: (inquiryId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useClientNotifications(): IUseClientNotificationsReturn {
  const {
    notifications,
    unreadCount,
    isLoading,
    activeInquiry,
    setActiveInquiry,
    closeConversation: storeCloseConversation,
    fetchNotifications,
    markInquiryRead,
    markAllRead,
    startLiveSync,
  } = useInquiryStore();

  useEffect(() => {
    const cleanup = startLiveSync();
    return () => {
      cleanup();
    };
  }, [startLiveSync]);

  const markAsRead = useCallback(
    async (inquiryId: string) => {
      await markInquiryRead(inquiryId);
    },
    [markInquiryRead]
  );

  const closeConversation = useCallback(() => {
    storeCloseConversation();
  }, [storeCloseConversation]);

  const setSelectedInquiry = useCallback(
    (inquiry: IInquiry | null) => {
      if (!inquiry) {
        storeCloseConversation();
      } else {
        setActiveInquiry(inquiry);
      }
    },
    [setActiveInquiry, storeCloseConversation]
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    selectedInquiry: activeInquiry,
    setSelectedInquiry,
    closeConversation,
    markAsRead,
    markAllAsRead: markAllRead,
    refetch: fetchNotifications,
  };
}
