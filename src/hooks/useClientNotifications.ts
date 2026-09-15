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

  return {
    notifications,
    unreadCount,
    isLoading,
    selectedInquiry: activeInquiry,
    setSelectedInquiry: setActiveInquiry,
    markAsRead,
    markAllAsRead: markAllRead,
    refetch: fetchNotifications,
  };
}
