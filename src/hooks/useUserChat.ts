"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  IChatConversation,
  IChatMessage,
  IChatParticipant,
} from "@/types/chat.types";
import {
  subscribeToChatEvents,
  broadcastChatEvent,
  CHAT_EVENTS,
  IChatEventPayload,
} from "@/lib/chat-events";
import { toast } from "sonner";

const GUEST_CHANNEL_STORAGE_KEY = "darkgems_chat_guest_channel_v1";
const GUEST_INFO_STORAGE_KEY = "darkgems_chat_guest_info_v1";

function playNotificationChime(): void {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Gentle luxury bell frequency: 880Hz (A5) -> 1320Hz (E6)
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // AudioContext blocked or restricted
  }
}

export interface IUseUserChatReturn {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleChat: () => void;
  conversation: IChatConversation | null;
  messages: IChatMessage[];
  hasMoreMessages: boolean;
  isLoadingEarlier: boolean;
  loadEarlierMessages: () => Promise<void>;
  totalMessageCount: number;
  isLoading: boolean;
  isSending: boolean;
  unreadCount: number;
  messageDraft: string;
  setMessageDraft: (draft: string) => void;
  guestName: string;
  setGuestName: (name: string) => void;
  guestEmail: string;
  setGuestEmail: (email: string) => void;
  isGuestConfigured: boolean;
  handleSaveGuestInfo: (e: React.FormEvent) => void;
  handleSendMessage: (e?: React.FormEvent, customContent?: string) => Promise<boolean>;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  isSoundEnabled: boolean;
  setIsSoundEnabled: (enabled: boolean) => void;
}

export function useUserChat(): IUseUserChatReturn {
  const { user, isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [conversation, setConversation] = useState<IChatConversation | null>(null);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [messageDraft, setMessageDraft] = useState<string>("");
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(false);
  const [isLoadingEarlier, setIsLoadingEarlier] = useState<boolean>(false);
  const [totalMessageCount, setTotalMessageCount] = useState<number>(0);
  const nextCursorRef = useRef<string | undefined>(undefined);

  // Initialize guest info safely for SSR / hydration consistency
  const [guestName, setGuestName] = useState<string>("");
  const [guestEmail, setGuestEmail] = useState<string>("");
  const [isGuestSaved, setIsGuestSaved] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const loadGuestInfo = async () => {
      await Promise.resolve();
      if (!isMounted) return;
      try {
        const stored = localStorage.getItem(GUEST_INFO_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as { name?: string; email?: string };
          if (parsed.name) setGuestName(parsed.name);
          if (parsed.email) {
            setGuestEmail(parsed.email);
            setIsGuestSaved(true);
          }
        }
      } catch {
        // Ignore
      }
    };
    void loadGuestInfo();
    return () => {
      isMounted = false;
    };
  }, []);

  const isGuestConfigured = Boolean((isAuthenticated && user) || isGuestSaved);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const prevMessagesCountRef = useRef<number>(0);

  // Resolve channel ID
  const getChannelId = useCallback((): string => {
    if (isAuthenticated && user?.id) {
      return `user_${user.id}`;
    }
    if (typeof window !== "undefined") {
      let stored = localStorage.getItem(GUEST_CHANNEL_STORAGE_KEY);
      if (!stored) {
        stored = `guest_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
        localStorage.setItem(GUEST_CHANNEL_STORAGE_KEY, stored);
      }
      return stored;
    }
    return "guest_fallback";
  }, [isAuthenticated, user]);

  // Fetch or initialize conversation
  const initConversation = useCallback(async () => {
    const channelId = getChannelId();
    const participant: IChatParticipant = {
      name: (isAuthenticated && user?.name) ? user.name : guestName.trim() || "Private Client",
      email: (isAuthenticated && user?.email) ? user.email : guestEmail.trim() || "guest@darkgems.luxury",
      role: isAuthenticated ? "CUSTOMER" : "GUEST",
      avatarUrl: user?.avatarUrl,
    };

    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId, participant }),
      });

      const data = await res.json();
      if (data.success && data.conversation) {
        setConversation(data.conversation);
        setUnreadCount(data.conversation.unreadCountUser || 0);
        return data.conversation as IChatConversation;
      }
    } catch {
      // Network retry
    }
    return null;
  }, [getChannelId, isAuthenticated, user, guestName, guestEmail]);

  // Load messages for the active conversation with cursor pagination
  const loadMessages = useCallback(
    async (convId: string, isSilent: boolean = false) => {
      try {
        if (!isSilent) {
          await Promise.resolve();
          setIsLoading(true);
        }

        const res = await fetch(`/api/chat/conversations/${convId}/messages?limit=40`);
        const data = await res.json();
        if (data.success && Array.isArray(data.messages)) {
          const newMsgs = data.messages as IChatMessage[];
          nextCursorRef.current = data.nextCursor;
          setHasMoreMessages(Boolean(data.hasMore));
          if (typeof data.totalCount === "number") {
            setTotalMessageCount(data.totalCount);
          } else {
            setTotalMessageCount(newMsgs.length);
          }

          // If new admin message arrived while user was listening, play chime & toast
          if (
            isSilent &&
            newMsgs.length > prevMessagesCountRef.current &&
            prevMessagesCountRef.current > 0
          ) {
            const latest = newMsgs[newMsgs.length - 1];
            if (latest.sender === "ADMIN") {
              if (isSoundEnabled) playNotificationChime();
              if (!isOpen) {
                toast("New Atelier Message", {
                  description: latest.content.length > 50 ? `${latest.content.slice(0, 50)}...` : latest.content,
                });
              }
            }
          }

          prevMessagesCountRef.current = newMsgs.length;
          setMessages(newMsgs);

          if (data.conversation) {
            setConversation(data.conversation);
            setUnreadCount(data.conversation.unreadCountUser || 0);
          }
        }
      } catch {
        // Silently fail on background poll
      } finally {
        if (!isSilent) setIsLoading(false);
      }
    },
    [isOpen, isSoundEnabled]
  );

  // Load earlier messages on demand for client chat
  const loadEarlierMessages = useCallback(async () => {
    if (!conversation?.id || !nextCursorRef.current || isLoadingEarlier || !hasMoreMessages) {
      return;
    }

    try {
      setIsLoadingEarlier(true);
      const res = await fetch(
        `/api/chat/conversations/${conversation.id}/messages?limit=40&before=${encodeURIComponent(
          nextCursorRef.current
        )}`
      );
      const data = await res.json();

      if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
        const earlierMsgs = data.messages as IChatMessage[];
        nextCursorRef.current = data.nextCursor;
        setHasMoreMessages(Boolean(data.hasMore));
        if (typeof data.totalCount === "number") {
          setTotalMessageCount(data.totalCount);
        }

        const container = messagesContainerRef.current;
        const prevHeight = container ? container.scrollHeight : 0;
        const prevTop = container ? container.scrollTop : 0;

        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const deduplicatedEarlier = earlierMsgs.filter((m) => !existingIds.has(m.id));
          return [...deduplicatedEarlier, ...prev];
        });

        requestAnimationFrame(() => {
          if (container) {
            const newHeight = container.scrollHeight;
            container.scrollTop = prevTop + (newHeight - prevHeight);
          }
        });
      } else {
        setHasMoreMessages(false);
      }
    } catch (err) {
      console.warn("Failed to load earlier client messages:", err);
    } finally {
      setIsLoadingEarlier(false);
    }
  }, [conversation, isLoadingEarlier, hasMoreMessages]);

  // Mark messages as read when drawer is open
  const markAsRead = useCallback(async (convId: string) => {
    try {
      await fetch(`/api/chat/conversations/${convId}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "USER" }),
      });
      setUnreadCount(0);
      setMessages((prev) =>
        prev.map((m) => (m.sender === "ADMIN" ? { ...m, status: "READ" } : m))
      );
    } catch {
      // Ignore
    }
  }, []);

  // Poll unread count badge
  const fetchUnreadCount = useCallback(async () => {
    const email = user?.email || guestEmail;
    if (!email) return;

    try {
      const res = await fetch(`/api/chat/unread?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success && typeof data.unreadCount === "number") {
        setUnreadCount(data.unreadCount);
      }
    } catch {
      // Ignore
    }
  }, [user?.email, guestEmail]);

  // Initial load deferred past synchronous effect turn
  useEffect(() => {
    let isSubscribed = true;
    const runAsync = async () => {
      await Promise.resolve();
      if (isSubscribed) {
        void fetchUnreadCount();
      }
    };
    void runAsync();
    return () => {
      isSubscribed = false;
    };
  }, [fetchUnreadCount]);

  // When opening chat, load conversation and messages (only mark read if there are unread messages)
  useEffect(() => {
    if (isOpen) {
      let isSubscribed = true;
      const setupOpenChat = async () => {
        await Promise.resolve();
        if (!isSubscribed) return;
        const conv = conversation || (await initConversation());
        if (conv?.id && isSubscribed) {
          await loadMessages(conv.id);
          if (conv.unreadCountUser > 0) {
            await markAsRead(conv.id);
          }
        }
      };
      void setupOpenChat();
      return () => {
        isSubscribed = false;
      };
    }
  }, [isOpen, conversation, initConversation, loadMessages, markAsRead]);

  // Low-frequency fallback heartbeat (30s) only if chat is open and window is visible
  useEffect(() => {
    if (!isOpen || !conversation?.id) return;

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        void loadMessages(conversation.id, true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isOpen, conversation?.id, loadMessages]);

  // Sync on window focus when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      if (isOpen && conversation?.id) {
        void loadMessages(conversation.id, true);
      } else {
        void fetchUnreadCount();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [isOpen, conversation?.id, loadMessages, fetchUnreadCount]);

  // Listen to cross-tab BroadcastChannel events with strict type-guarding (NO infinite loops)
  useEffect(() => {
    const unsubscribe = subscribeToChatEvents((event: IChatEventPayload) => {
      if (conversation?.id && event.conversationId === conversation.id) {
        if (event.type === CHAT_EVENTS.MESSAGE_SENT) {
          void loadMessages(conversation.id, true);
          // Only mark as read if an ADMIN sent the message and chat is currently open
          if (isOpen && event.sender === "ADMIN") {
            void markAsRead(conversation.id);
          }
        } else if (event.type === CHAT_EVENTS.MESSAGES_READ && event.sender === "ADMIN") {
          // Admin read our messages -> update local status without another network request
          setMessages((prev) =>
            prev.map((m) => (m.sender === "USER" ? { ...m, status: "READ" } : m))
          );
        }
      } else if (event.type === CHAT_EVENTS.MESSAGE_SENT && event.sender === "ADMIN") {
        void fetchUnreadCount();
      }
    });

    return unsubscribe;
  }, [conversation?.id, isOpen, loadMessages, markAsRead, fetchUnreadCount]);

  // Auto-scroll messages container safely without scrolling the parent window
  useEffect(() => {
    if (isOpen && messages.length > 0 && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [isOpen, messages]);

  const handleSaveGuestInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestEmail.trim()) {
      toast.error("Email required", { description: "Please enter your email to start chat." });
      return;
    }

    const payload = {
      name: guestName.trim() || "Private Client",
      email: guestEmail.trim().toLowerCase(),
    };

    try {
      localStorage.setItem(GUEST_INFO_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore
    }

    setIsGuestSaved(true);
    toast.success("Connected to Atelier", {
      description: "You may now converse directly with our Gemologist.",
    });

    void initConversation().then((conv) => {
      if (conv?.id) {
        void loadMessages(conv.id);
      }
    });
  };

  const handleSendMessage = async (
    e?: React.FormEvent,
    customContent?: string
  ): Promise<boolean> => {
    if (e) e.preventDefault();
    const content = customContent || messageDraft;
    if (!content.trim() || isSending) return false;

    // Ensure conversation exists
    let activeConv = conversation;
    if (!activeConv) {
      activeConv = await initConversation();
    }
    if (!activeConv?.id) {
      toast.error("Chat Offline", { description: "Could not establish server connection." });
      return false;
    }

    const senderName = isAuthenticated && user?.name ? user.name : guestName.trim() || "Private Client";
    const senderEmail = isAuthenticated && user?.email ? user.email : guestEmail.trim() || "guest@darkgems.luxury";

    setIsSending(true);

    // Optimistic message append
    const tempId = `temp_${Date.now()}`;
    const optimisticMessage: IChatMessage = {
      id: tempId,
      conversationId: activeConv.id,
      sender: "USER",
      senderName,
      senderEmail,
      content: content.trim(),
      status: "SENT",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setMessageDraft("");

    try {
      const res = await fetch(`/api/chat/conversations/${activeConv.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          sender: "USER",
          senderName,
          senderEmail,
          senderAvatar: user?.avatarUrl,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? (data.message as IChatMessage) : m))
        );
        if (data.conversation) {
          setConversation(data.conversation);
        }

        // Broadcast real-time message event to all client windows & admin consoles
        broadcastChatEvent(
          CHAT_EVENTS.MESSAGE_SENT,
          activeConv.id,
          "USER",
          data.message.id,
          senderName,
          content.trim()
        );

        return true;
      } else {
        throw new Error(data.error || "Failed to send");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error sending message";
      toast.error("Message not sent", { description: msg });
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setMessageDraft(content);
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  return {
    isOpen,
    setIsOpen,
    toggleChat,
    conversation,
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
  };
}
