"use client";

import { create } from "zustand";
import {
  IInquiry,
  IInquiryMessage,
  IGetInquiryDetailsResponse,
  ISendInquiryMessageResponse,
  IClientNotificationsResponse,
  MessageSenderType,
} from "@/types/inquiry.types";
import {
  subscribeToInquiryEvents,
  broadcastInquiryEvent,
  INQUIRY_EVENTS,
  IInquiryEventPayload,
} from "@/lib/inquiry-events";
import { toast } from "sonner";
import { siteConfig } from "@/config/site.config";

const STORAGE_TICKETS_KEY = "darkgem_active_inquiries";

/**
 * Synthesizes a subtle luxury crystal harmonic bell via Web Audio API.
 * Non-blocking, pure native browser API, zero dependencies.
 */
function playLuxuryChime(): void {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15); // E6 sparkle

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // AudioContext blocked or not allowed on un-interacted page
  }
}

export interface IInquiryStoreState {
  activeInquiry: IInquiry | null;
  isConversationOpen: boolean;
  inquiries: IInquiry[];
  notifications: IInquiry[];
  unreadCount: number;
  isLoading: boolean;
  isSending: boolean;
  recentTickets: string[];
  lastSyncedAt: number;

  // Actions
  initialize: () => void;
  fetchNotifications: () => Promise<void>;
  openConversation: (inquiryIdOrNumber: string) => Promise<void>;
  closeConversation: () => void;
  setActiveInquiry: (inquiry: IInquiry | null) => void;
  setInquiries: (inquiries: IInquiry[]) => void;
  fetchActiveInquiry: (inquiryIdOrNumber?: string, silent?: boolean) => Promise<IInquiry | null>;
  sendMessage: (
    messageText: string,
    senderRole?: MessageSenderType,
    senderName?: string,
    senderEmail?: string
  ) => Promise<boolean>;
  markInquiryRead: (inquiryIdOrNumber: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  startLiveSync: () => () => void;
}

let pollingIntervalId: NodeJS.Timeout | null = null;
let eventUnsubscribe: (() => void) | null = null;

export const useInquiryStore = create<IInquiryStoreState>((set, get) => ({
  activeInquiry: null,
  isConversationOpen: false,
  inquiries: [],
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isSending: false,
  recentTickets: [],
  lastSyncedAt: 0,

  initialize: () => {
    if (typeof window === "undefined") return;

    // Load recent tickets from localStorage
    try {
      const raw = localStorage.getItem(STORAGE_TICKETS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const tickets = parsed.filter((item): item is string => typeof item === "string");
          set({ recentTickets: tickets });
        }
      }
    } catch {
      // Ignore parse failure
    }

    // Subscribe to cross-tab / local broadcast events
    if (!eventUnsubscribe) {
      eventUnsubscribe = subscribeToInquiryEvents((event?: IInquiryEventPayload) => {
        const state = get();
        // If active conversation matches the event, refetch silently
        if (state.activeInquiry && event) {
          const currentTicket = state.activeInquiry.inquiryNumber.toUpperCase();
          const targetNum = event.inquiryNumber?.toUpperCase();
          const targetId = event.inquiryId;

          if (targetNum === currentTicket || targetId === state.activeInquiry.id) {
            void state.fetchActiveInquiry(currentTicket, true);
          }
        }

        // Always refresh notifications and inquiries list
        void state.fetchNotifications();
      });
    }

    // Initial fetch of notifications
    void get().fetchNotifications();
  },

  fetchNotifications: async () => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("diamond_auth_token") : null;
      const recentTickets = get().recentTickets;
      const params = new URLSearchParams();
      if (recentTickets.length > 0) {
        params.set("tickets", recentTickets.join(","));
      }

      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`/api/inquiries/notifications?${params.toString()}`, {
        headers,
        cache: "no-store",
      });

      const json = (await res.json()) as IClientNotificationsResponse;
      if (json.success && Array.isArray(json.data)) {
        const prevUnread = get().unreadCount;
        const newUnread = json.unreadCount ?? 0;

        // If new notifications arrived from counterpart, chime
        if (newUnread > prevUnread) {
          playLuxuryChime();
        }

        set({
          notifications: json.data,
          unreadCount: newUnread,
          lastSyncedAt: Date.now(),
        });
      }
    } catch {
      // Silent fail in background
    }
  },

  openConversation: async (inquiryIdOrNumber: string) => {
    const cleanId = inquiryIdOrNumber.trim().toUpperCase();
    if (!cleanId) return;

    set({ isConversationOpen: true, isLoading: true });

    // Save ticket to local history
    try {
      const existing = get().recentTickets;
      const updated = [cleanId, ...existing.filter((item) => item !== cleanId)].slice(0, 10);
      localStorage.setItem(STORAGE_TICKETS_KEY, JSON.stringify(updated));
      set({ recentTickets: updated });
    } catch {
      // Ignore storage errors
    }

    const inquiry = await get().fetchActiveInquiry(cleanId, false);
    if (inquiry) {
      void get().markInquiryRead(inquiry.inquiryNumber);
    }
    set({ isLoading: false });
  },

  closeConversation: () => {
    set({ isConversationOpen: false, activeInquiry: null });
  },

  setActiveInquiry: (inquiry: IInquiry | null) => {
    set({ activeInquiry: inquiry });
  },

  setInquiries: (inquiries: IInquiry[]) => {
    set({ inquiries });
  },

  fetchActiveInquiry: async (inquiryIdOrNumber?: string, silent: boolean = false) => {
    const target = inquiryIdOrNumber || get().activeInquiry?.inquiryNumber;
    if (!target) return null;

    if (!silent) {
      set({ isLoading: true });
    }

    try {
      const res = await fetch(`/api/inquiries/${encodeURIComponent(target)}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as IGetInquiryDetailsResponse;

      if (json.success && json.data) {
        const currentInquiry = get().activeInquiry;
        const freshInquiry = json.data;

        // Check if new messages arrived from counterpart
        if (currentInquiry && currentInquiry.inquiryNumber === freshInquiry.inquiryNumber) {
          const prevCount = currentInquiry.messages?.length || 0;
          const newCount = freshInquiry.messages?.length || 0;

          if (newCount > prevCount) {
            const lastMsg = freshInquiry.messages?.[newCount - 1];
            if (lastMsg) {
              playLuxuryChime();
              toast.info(`New message from ${lastMsg.senderName}`, {
                description:
                  lastMsg.message.length > 70
                    ? `${lastMsg.message.slice(0, 70)}...`
                    : lastMsg.message,
              });
            }
          }
        }

        set({ activeInquiry: freshInquiry, lastSyncedAt: Date.now() });
        return freshInquiry;
      }
      return null;
    } catch {
      return null;
    } finally {
      if (!silent) {
        set({ isLoading: false });
      }
    }
  },

  sendMessage: async (
    messageText: string,
    senderRole?: MessageSenderType,
    senderName?: string,
    senderEmail?: string
  ) => {
    const active = get().activeInquiry;
    if (!active) {
      toast.error("No active consultation ticket selected.");
      return false;
    }

    const trimmed = messageText.trim();
    if (!trimmed) {
      toast.error("Please enter a message before transmitting.");
      return false;
    }

    set({ isSending: true });

    // 1. Optimistic Message Injection into Zustand Store
    const token =
      typeof window !== "undefined" ? localStorage.getItem("diamond_auth_token") : null;
    const isRoleAdmin = senderRole === "ADMIN";
    const resolvedSenderRole: MessageSenderType = senderRole || (isRoleAdmin ? "ADMIN" : "CLIENT");
    const resolvedName = senderName || (isRoleAdmin ? "Curator Gemologist" : active.fullName || "Client");
    const resolvedEmail =
      senderEmail || (isRoleAdmin ? siteConfig.contact.conciergeEmail : active.email);

    const optimisticMsg: IInquiryMessage = {
      id: `opt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender: resolvedSenderRole,
      senderName: resolvedName,
      senderEmail: resolvedEmail,
      message: trimmed,
      createdAt: new Date().toISOString(),
    };

    const currentMessages = active.messages ? [...active.messages, optimisticMsg] : [optimisticMsg];
    set({
      activeInquiry: { ...active, messages: currentMessages },
    });

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`/api/inquiries/${encodeURIComponent(active.inquiryNumber)}/messages`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: trimmed,
          senderName: resolvedName,
          senderEmail: resolvedEmail,
          senderRole: resolvedSenderRole,
        }),
      });

      const json = (await res.json()) as ISendInquiryMessageResponse;

      if (json.success && json.data) {
        // Update store with canonical server response
        set({ activeInquiry: json.data, lastSyncedAt: Date.now() });

        // Update inquiry in the inquiries list if present
        const currentList = get().inquiries;
        if (currentList.length > 0) {
          const updatedList = currentList.map((item) =>
            item.inquiryNumber === json.data?.inquiryNumber ? json.data : item
          );
          set({ inquiries: updatedList });
        }

        // Broadcast across all open browser windows & tabs
        broadcastInquiryEvent(
          INQUIRY_EVENTS.INQUIRY_REPLIED,
          json.data.id,
          json.data.inquiryNumber
        );

        // Refresh notifications
        void get().fetchNotifications();

        toast.success(
          isRoleAdmin
            ? "Reply transmitted to client consultation thread."
            : "Message transmitted to DarkGem Concierge."
        );
        return true;
      } else {
        toast.error(json.error || "Failed to transmit message.");
        // Rollback optimistic message on failure
        void get().fetchActiveInquiry(active.inquiryNumber, true);
        return false;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error transmitting message";
      toast.error(msg);
      void get().fetchActiveInquiry(active.inquiryNumber, true);
      return false;
    } finally {
      set({ isSending: false });
    }
  },

  markInquiryRead: async (inquiryIdOrNumber: string) => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("diamond_auth_token") : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      await fetch(`/api/inquiries/${encodeURIComponent(inquiryIdOrNumber)}/read`, {
        method: "PATCH",
        headers,
      });

      // Update notifications locally
      const cleanTarget = inquiryIdOrNumber.toUpperCase();
      const updatedNotifications = get().notifications.map((n) => {
        if (n.inquiryNumber.toUpperCase() === cleanTarget || n.id === inquiryIdOrNumber) {
          return { ...n, isClientRead: true, unreadClientCount: 0, unreadAdminCount: 0 };
        }
        return n;
      });

      const remainingUnread = updatedNotifications.filter(
        (n) => (n.unreadClientCount && n.unreadClientCount > 0) || (n.unreadAdminCount && n.unreadAdminCount > 0)
      ).length;

      set({
        notifications: updatedNotifications,
        unreadCount: remainingUnread,
      });
    } catch {
      // Ignore
    }
  },

  markAllRead: async () => {
    const unread = get().notifications;
    set({
      notifications: unread.map((n) => ({
        ...n,
        isClientRead: true,
        unreadClientCount: 0,
        unreadAdminCount: 0,
      })),
      unreadCount: 0,
    });

    for (const item of unread) {
      void get().markInquiryRead(item.inquiryNumber);
    }
  },

  /**
   * Starts a dynamic 2.5s heartbeat polling mechanism.
   * Auto-synchronizes active conversation & notifications without requiring page refresh.
   */
  startLiveSync: () => {
    get().initialize();

    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
    }

    pollingIntervalId = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        const state = get();
        // If an inquiry conversation is open, poll it
        if (state.isConversationOpen && state.activeInquiry) {
          void state.fetchActiveInquiry(state.activeInquiry.inquiryNumber, true);
        }
        // Poll notifications
        void state.fetchNotifications();
      }
    }, 2500);

    return () => {
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
        pollingIntervalId = null;
      }
    };
  },
}));
