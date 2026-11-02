"use client";

import { useState, useEffect, useCallback } from "react";
import { subscribeToChatEvents, CHAT_EVENTS } from "@/lib/chat-events";

export function useChatUnreadCount(isAdmin: boolean = false, email?: string): number {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchCount = useCallback(async () => {
    try {
      const url = isAdmin
        ? "/api/chat/unread"
        : email
          ? `/api/chat/unread?email=${encodeURIComponent(email)}`
          : null;

      if (!url) return;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && typeof data.unreadCount === "number") {
        setUnreadCount(data.unreadCount);
      }
    } catch {
      // Ignore background poll errors
    }
  }, [isAdmin, email]);

  useEffect(() => {
    let isMounted = true;
    const runAsync = async () => {
      await Promise.resolve();
      if (isMounted) {
        void fetchCount();
      }
    };
    void runAsync();

    const handleFocus = () => {
      void fetchCount();
    };

    window.addEventListener("focus", handleFocus);

    // 10s background heartbeat when tab is active
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        void fetchCount();
      }
    }, 10000);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [fetchCount]);

  useEffect(() => {
    const unsub = subscribeToChatEvents((event) => {
      if (
        event.type === CHAT_EVENTS.MESSAGE_SENT ||
        event.type === CHAT_EVENTS.MESSAGES_READ
      ) {
        void fetchCount();
      }
    });
    return unsub;
  }, [fetchCount]);

  return unreadCount;
}
