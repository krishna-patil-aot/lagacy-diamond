"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  IChatConversation,
  IChatMessage,
  ChatConversationViewMode,
  ChatRoleFilter,
  ChatSortOption,
  IChatPaginationState,
} from "@/types/chat.types";
import {
  subscribeToChatEvents,
  broadcastChatEvent,
  CHAT_EVENTS,
  IChatEventPayload,
} from "@/lib/chat-events";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

function playAdminMessageChime(): void {
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
    // Double pulse luxury chime: 587Hz (D5) -> 880Hz (A5)
    osc.frequency.setValueAtTime(587, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.09, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // AudioContext blocked
  }
}

export interface IUseAdminChatReturn {
  conversations: IChatConversation[];
  filteredConversations: IChatConversation[];
  paginatedConversations: IChatConversation[];
  paginationState: IChatPaginationState;
  activeConversation: IChatConversation | null;
  messages: IChatMessage[];
  filteredMessages: IChatMessage[];
  hasMoreMessages: boolean;
  isLoadingEarlier: boolean;
  loadEarlierMessages: () => Promise<void>;
  totalMessageCount: number;
  isLoading: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  totalUnread: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterUnreadOnly: boolean;
  setFilterUnreadOnly: (unreadOnly: boolean) => void;
  roleFilter: ChatRoleFilter;
  setRoleFilter: (role: ChatRoleFilter) => void;
  sortBy: ChatSortOption;
  setSortBy: (sort: ChatSortOption) => void;
  viewMode: ChatConversationViewMode;
  setViewMode: (mode: ChatConversationViewMode) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  inChatSearch: string;
  setInChatSearch: (search: string) => void;
  adminDraft: string;
  setAdminDraft: (draft: string) => void;
  selectConversation: (conv: IChatConversation | null) => void;
  selectConversationById: (convId: string) => Promise<void>;
  handleSendReply: (e?: React.FormEvent, customContent?: string) => Promise<boolean>;
  refreshConversations: () => Promise<void>;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  isSoundEnabled: boolean;
  setIsSoundEnabled: (enabled: boolean) => void;
}

export function useAdminChat(): IUseAdminChatReturn {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<IChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<IChatConversation | null>(null);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [totalUnread, setTotalUnread] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterUnreadOnly, setFilterUnreadOnly] = useState<boolean>(false);
  const [roleFilter, setRoleFilter] = useState<ChatRoleFilter>("ALL");
  const [sortBy, setSortBy] = useState<ChatSortOption>("RECENT");
  const [viewMode, setViewMode] = useState<ChatConversationViewMode>("TABLE");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [inChatSearch, setInChatSearch] = useState<string>("");
  const [adminDraft, setAdminDraft] = useState<string>("");
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(false);
  const [isLoadingEarlier, setIsLoadingEarlier] = useState<boolean>(false);
  const [totalMessageCount, setTotalMessageCount] = useState<number>(0);
  const nextCursorRef = useRef<string | undefined>(undefined);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const prevMessagesCountRef = useRef<number>(0);
  const activeConvIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeConvIdRef.current = activeConversation?.id || null;
  }, [activeConversation]);

  // Load conversations list
  const loadConversations = useCallback(
    async (isSilent: boolean = false) => {
      try {
        if (!isSilent) {
          await Promise.resolve();
          setIsLoading(true);
        }

        const queryParams = new URLSearchParams();
        if (searchQuery.trim()) {
          queryParams.set("search", searchQuery.trim());
        }

        const res = await fetch(`/api/chat/conversations?${queryParams.toString()}`);
        const data = await res.json();

        if (data.success && Array.isArray(data.conversations)) {
          const list = data.conversations as IChatConversation[];
          setConversations(list);
          setTotalUnread(typeof data.totalUnread === "number" ? data.totalUnread : 0);

          // Update active conversation in-memory reference
          if (activeConvIdRef.current) {
            const updatedActive = list.find((c) => c.id === activeConvIdRef.current);
            if (updatedActive) {
              setActiveConversation(updatedActive);
            }
          }
        }
      } catch {
        // Silently fail on background poll
      } finally {
        if (!isSilent) setIsLoading(false);
      }
    },
    [searchQuery]
  );

  // Mark conversation read by Admin
  const markAsRead = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`/api/chat/conversations/${convId}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "ADMIN" }),
      });
      const data = await res.json();
      if (data.success && data.conversation) {
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? (data.conversation as IChatConversation) : c))
        );
        setMessages((prev) =>
          prev.map((m) => (m.sender === "USER" ? { ...m, status: "READ" } : m))
        );

        // Broadcast lively update across tabs and SSE
        broadcastChatEvent(CHAT_EVENTS.MESSAGES_READ, convId, "ADMIN");
      }
    } catch {
      // Ignore
    }
  }, []);

  // Load messages for a conversation with cursor pagination support
  const loadMessages = useCallback(
    async (convId: string, isSilent: boolean = false) => {
      try {
        if (!isSilent) {
          await Promise.resolve();
          setIsLoadingMessages(true);
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

          // Audio notification for incoming client message
          if (
            isSilent &&
            newMsgs.length > prevMessagesCountRef.current &&
            prevMessagesCountRef.current > 0
          ) {
            const latest = newMsgs[newMsgs.length - 1];
            if (latest.sender === "USER") {
              if (isSoundEnabled) playAdminMessageChime();
              toast.info(`Client Message from ${latest.senderName}`, {
                description: latest.content.length > 60 ? `${latest.content.slice(0, 60)}...` : latest.content,
              });
            }
          }

          prevMessagesCountRef.current = newMsgs.length;
          setMessages(newMsgs);

          // AUTO-READ: If Admin is actively viewing this conversation, mark unread client messages as READ immediately
          const hasUnreadUserMsg = newMsgs.some(
            (m) => m.sender === "USER" && m.status !== "READ"
          );
          if (hasUnreadUserMsg) {
            void markAsRead(convId);
          }
        }
      } catch {
        // Silently fail on poll
      } finally {
        if (!isSilent) setIsLoadingMessages(false);
      }
    },
    [isSoundEnabled, markAsRead]
  );

  // Load earlier historical messages on demand (cursor pagination)
  const loadEarlierMessages = useCallback(async () => {
    if (!activeConvIdRef.current || !nextCursorRef.current || isLoadingEarlier || !hasMoreMessages) {
      return;
    }

    const currentConvId = activeConvIdRef.current;
    const currentCursor = nextCursorRef.current;

    try {
      setIsLoadingEarlier(true);
      const res = await fetch(
        `/api/chat/conversations/${currentConvId}/messages?limit=40&before=${encodeURIComponent(
          currentCursor
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

        // Measure scroll height before prepending to restore exact visual position
        const container = messagesContainerRef.current;
        const prevHeight = container ? container.scrollHeight : 0;
        const prevTop = container ? container.scrollTop : 0;

        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const deduplicatedEarlier = earlierMsgs.filter((m) => !existingIds.has(m.id));
          return [...deduplicatedEarlier, ...prev];
        });

        // Restore scroll position so viewport does not jump
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
      console.warn("Failed to load earlier messages:", err);
    } finally {
      setIsLoadingEarlier(false);
    }
  }, [isLoadingEarlier, hasMoreMessages]);

  // Select a conversation from the sidebar (or null to unselect on mobile)
  const selectConversation = useCallback(
    (conv: IChatConversation | null) => {
      setActiveConversation(conv);
      if (conv) {
        prevMessagesCountRef.current = 0;
        void loadMessages(conv.id);
        void markAsRead(conv.id);
      } else {
        setMessages([]);
      }
    },
    [loadMessages, markAsRead]
  );

  // Directly select and open a specific client conversation by ID
  const selectConversationById = useCallback(
    async (convId: string) => {
      if (!convId) return;
      let conv = conversations.find((c) => c.id === convId);
      if (!conv) {
        try {
          const res = await fetch(`/api/chat/conversations/${convId}/messages?limit=1`);
          const data = await res.json();
          if (data.success && data.conversation) {
            conv = data.conversation as IChatConversation;
          }
        } catch {
          // Ignore
        }
      }
      if (conv) {
        selectConversation(conv);
        void markAsRead(conv.id);
      }
      void loadConversations(true);
    },
    [conversations, selectConversation, markAsRead, loadConversations]
  );

  // Initial fetch deferred past synchronous effect execution
  useEffect(() => {
    let isMounted = true;
    const runAsync = async () => {
      await Promise.resolve();
      if (isMounted) {
        void loadConversations();
      }
    };
    void runAsync();
    return () => {
      isMounted = false;
    };
  }, [loadConversations]);

  // Active chat lively sync: 1.5 seconds for active consultation, 4 seconds for general list
  useEffect(() => {
    const isChatActive = Boolean(activeConversation?.id);
    const intervalTime = isChatActive ? 1500 : 4000;

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        if (activeConvIdRef.current) {
          void loadMessages(activeConvIdRef.current, true);
        }
        void loadConversations(true);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [loadConversations, loadMessages, activeConversation?.id]);

  // Sync on window focus when admin returns to tab
  useEffect(() => {
    const handleFocus = () => {
      void loadConversations(true);
      if (activeConvIdRef.current) {
        void loadMessages(activeConvIdRef.current, true);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loadConversations, loadMessages]);

  // Real-time broadcast channel subscriber (event-driven, no unnecessary API calls)
  useEffect(() => {
    const unsubscribe = subscribeToChatEvents((event: IChatEventPayload) => {
      if (event.type === CHAT_EVENTS.MESSAGE_SENT) {
        void loadConversations(true);
        if (activeConvIdRef.current && event.conversationId === activeConvIdRef.current) {
          void loadMessages(activeConvIdRef.current, true);
          if (event.sender === "USER") {
            void markAsRead(activeConvIdRef.current);
          }
        }
      } else if (event.type === CHAT_EVENTS.MESSAGES_READ) {
        // When client marks admin messages as read, lively update local admin messages to READ (double ticks!)
        if (activeConvIdRef.current && event.conversationId === activeConvIdRef.current) {
          setMessages((prev) =>
            prev.map((m) => (m.sender === "ADMIN" ? { ...m, status: "READ" } : m))
          );
        }
      }
    });

    return unsubscribe;
  }, [loadConversations, loadMessages, markAsRead]);

  // Auto-scroll messages container safely without scrolling the parent page / window
  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Send admin reply
  const handleSendReply = async (
    e?: React.FormEvent,
    customContent?: string
  ): Promise<boolean> => {
    if (e) e.preventDefault();
    const content = customContent || adminDraft;
    if (!content.trim() || isSending || !activeConversation?.id) return false;

    setIsSending(true);

    const tempId = `temp_${Date.now()}`;
    const optimisticMsg: IChatMessage = {
      id: tempId,
      conversationId: activeConversation.id,
      sender: "ADMIN",
      senderName: user?.name || "Atelier Curator Gemologist",
      senderEmail: user?.email || "curator@darkgems.luxury",
      senderAvatar: user?.avatarUrl,
      content: content.trim(),
      status: "SENT",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setAdminDraft("");

    try {
      const res = await fetch(`/api/chat/conversations/${activeConversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          sender: "ADMIN",
          senderName: user?.name || "Atelier Curator Gemologist",
          senderEmail: user?.email || "curator@darkgems.luxury",
          senderAvatar: user?.avatarUrl,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? (data.message as IChatMessage) : m))
        );
        if (data.conversation) {
          setActiveConversation(data.conversation);
          setConversations((prev) =>
            prev.map((c) =>
              c.id === data.conversation.id ? (data.conversation as IChatConversation) : c
            )
          );
        }

        // Lively update: Broadcast real-time message event to all client windows
        broadcastChatEvent(
          CHAT_EVENTS.MESSAGE_SENT,
          activeConversation.id,
          "ADMIN",
          data.message.id,
          user?.name || "Atelier Curator Gemologist",
          content.trim()
        );

        return true;
      } else {
        throw new Error(data.error || "Failed to send reply");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error sending reply";
      toast.error("Reply Failed", { description: msg });
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setAdminDraft(content);
      return false;
    } finally {
      setIsSending(false);
    }
  };

  // Filter & Search setters that automatically reset pagination to page 1
  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleSetFilterUnreadOnly = useCallback((unreadOnly: boolean) => {
    setFilterUnreadOnly(unreadOnly);
    setCurrentPage(1);
  }, []);

  const handleSetRoleFilter = useCallback((role: ChatRoleFilter) => {
    setRoleFilter(role);
    setCurrentPage(1);
  }, []);

  const handleSetSortBy = useCallback((sort: ChatSortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
  }, []);

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  // Comprehensive conversation filtering & sorting (latest activity on top by default)
  const filteredConversations = useMemo(() => {
    return [...conversations]
      .filter((c) => {
        // 1. Unread filter
        if (filterUnreadOnly && c.unreadCountAdmin === 0) return false;

        // 2. Role filter
        if (roleFilter === "CUSTOMER" && c.participant.role !== "CUSTOMER") return false;
        if (roleFilter === "GUEST" && c.participant.role !== "GUEST") return false;

        // 3. Search query filter across name, email, and message preview
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = c.participant.name.toLowerCase().includes(q);
          const matchEmail = c.participant.email.toLowerCase().includes(q);
          const matchMsg = c.lastMessage?.content.toLowerCase().includes(q) ?? false;
          if (!matchName && !matchEmail && !matchMsg) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "UNREAD") {
          if (b.unreadCountAdmin !== a.unreadCountAdmin) {
            return b.unreadCountAdmin - a.unreadCountAdmin;
          }
        }
        if (sortBy === "NAME") {
          return a.participant.name.localeCompare(b.participant.name);
        }
        // Default: RECENT
        const timeA = new Date(a.lastMessage?.createdAt || a.updatedAt).getTime();
        const timeB = new Date(b.lastMessage?.createdAt || b.updatedAt).getTime();
        return timeB - timeA;
      });
  }, [conversations, filterUnreadOnly, roleFilter, searchQuery, sortBy]);

  // Pagination calculation
  const totalItems = filteredConversations.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedConversations = useMemo(() => {
    return filteredConversations.slice(startIndex, endIndex);
  }, [filteredConversations, startIndex, endIndex]);

  const paginationState: IChatPaginationState = useMemo(() => {
    return {
      currentPage: safePage,
      pageSize,
      totalPages,
      totalItems,
      startIndex,
      endIndex,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    };
  }, [safePage, pageSize, totalPages, totalItems, startIndex, endIndex]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  // Filter messages in active conversation by search keyword
  const filteredMessages = useMemo(() => {
    if (!inChatSearch.trim()) return messages;
    const q = inChatSearch.toLowerCase().trim();
    return messages.filter(
      (m) =>
        m.content.toLowerCase().includes(q) ||
        m.senderName.toLowerCase().includes(q)
    );
  }, [messages, inChatSearch]);

  return {
    conversations,
    filteredConversations,
    paginatedConversations,
    paginationState,
    activeConversation,
    messages,
    filteredMessages,
    hasMoreMessages,
    isLoadingEarlier,
    loadEarlierMessages,
    totalMessageCount,
    isLoading,
    isLoadingMessages,
    isSending,
    totalUnread,
    searchQuery,
    setSearchQuery: handleSetSearchQuery,
    filterUnreadOnly,
    setFilterUnreadOnly: handleSetFilterUnreadOnly,
    roleFilter,
    setRoleFilter: handleSetRoleFilter,
    sortBy,
    setSortBy: handleSetSortBy,
    viewMode,
    setViewMode,
    currentPage: safePage,
    setCurrentPage,
    pageSize,
    setPageSize: handleSetPageSize,
    goToPage,
    nextPage,
    prevPage,
    inChatSearch,
    setInChatSearch,
    adminDraft,
    setAdminDraft,
    selectConversation,
    selectConversationById,
    handleSendReply,
    refreshConversations: () => loadConversations(false),
    messagesContainerRef,
    isSoundEnabled,
    setIsSoundEnabled,
  };
}
