"use client";

import { useEffect, useCallback } from "react";
import { useInquiryStore } from "@/store/useInquiryStore";
import { IInquiry, MessageSenderType } from "@/types/inquiry.types";

const STORAGE_KEY = "darkgem_active_inquiries";

export function useInquiryConversation(initialInquiryNumber?: string) {
  const {
    activeInquiry,
    setActiveInquiry,
    isLoading,
    isSending,
    recentTickets,
    openConversation,
    fetchActiveInquiry,
    sendMessage: storeSendMessage,
    markInquiryRead,
    startLiveSync,
  } = useInquiryStore();

  // Keep live sync running
  useEffect(() => {
    const cleanup = startLiveSync();
    return () => {
      cleanup();
    };
  }, [startLiveSync]);

  const saveTicketToHistory = useCallback((ticketNumber: string) => {
    const cleanNum = ticketNumber.trim().toUpperCase();
    if (!cleanNum) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing: string[] = raw ? JSON.parse(raw) : [];
      const updated = [cleanNum, ...existing.filter((item) => item !== cleanNum)].slice(0, 10);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const loadInquiry = useCallback(
    async (inquiryIdOrNumber: string): Promise<IInquiry | null> => {
      const cleanId = inquiryIdOrNumber.trim().toUpperCase();
      if (!cleanId) return null;

      const result = await fetchActiveInquiry(cleanId, false);
      if (result) {
        saveTicketToHistory(result.inquiryNumber);
        void markInquiryRead(result.inquiryNumber);
      }
      return result;
    },
    [fetchActiveInquiry, saveTicketToHistory, markInquiryRead]
  );

  const sendMessage = useCallback(
    async (
      messageText: string,
      senderRole?: MessageSenderType,
      senderName?: string,
      senderEmail?: string
    ): Promise<boolean> => {
      return storeSendMessage(messageText, senderRole, senderName, senderEmail);
    },
    [storeSendMessage]
  );

  // Initial load if provided
  useEffect(() => {
    if (initialInquiryNumber) {
      void openConversation(initialInquiryNumber);
    }
  }, [initialInquiryNumber, openConversation]);

  return {
    activeInquiry,
    setActiveInquiry,
    isLoading,
    isSending,
    recentTickets,
    loadInquiry,
    sendMessage,
    saveTicketToHistory,
  };
}
