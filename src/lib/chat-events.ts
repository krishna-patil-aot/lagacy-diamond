/**
 * Real-Time Chat Event Synchronization Bus
 * Cross-device (Server-Sent Events), cross-tab (BroadcastChannel), and local event bus
 * for instant, scalable WhatsApp-like messaging.
 */

export const CHAT_EVENTS = {
  MESSAGE_SENT: "CHAT_MESSAGE_SENT",
  MESSAGE_RECEIVED: "CHAT_MESSAGE_RECEIVED",
  MESSAGES_READ: "CHAT_MESSAGES_READ",
  CONVERSATION_UPDATED: "CHAT_CONVERSATION_UPDATED",
} as const;

export type ChatEventType = (typeof CHAT_EVENTS)[keyof typeof CHAT_EVENTS];

export interface IChatEventPayload {
  type: ChatEventType;
  conversationId: string;
  sender: "USER" | "ADMIN";
  messageId?: string;
  senderName?: string;
  content?: string;
  timestamp: number;
}

const CHAT_BROADCAST_CHANNEL_NAME = "darkgems_chat_broadcast_channel";
const CHAT_STORAGE_SYNC_KEY = "darkgems_chat_last_sync";

// Shared SSE singleton to stream real-time events across different physical devices
let sharedEventSource: EventSource | null = null;
let sseSubscriberCount = 0;
const sseListeners = new Set<(payload: IChatEventPayload) => void>();

function ensureSharedEventSource(): void {
  if (typeof window === "undefined" || typeof EventSource === "undefined") return;
  if (sharedEventSource) return;

  try {
    sharedEventSource = new EventSource("/api/chat/stream");

    sharedEventSource.onmessage = (e: MessageEvent<string>) => {
      try {
        if (!e.data) return;
        const payload = JSON.parse(e.data) as IChatEventPayload;
        if (payload && payload.type) {
          for (const listener of sseListeners) {
            listener(payload);
          }
        }
      } catch {
        // Keep-alive or non-JSON chunk ignored
      }
    };

    sharedEventSource.onerror = () => {
      // EventSource automatically attempts reconnection
    };
  } catch {
    sharedEventSource = null;
  }
}

function closeSharedEventSourceIfOrphaned(): void {
  if (sseSubscriberCount <= 0 && sharedEventSource) {
    try {
      sharedEventSource.close();
    } catch {
      // Ignore
    }
    sharedEventSource = null;
  }
}

export function broadcastChatEvent(
  type: ChatEventType,
  conversationId: string,
  sender: "USER" | "ADMIN",
  messageId?: string,
  senderName?: string,
  content?: string
): void {
  if (typeof window === "undefined") return;

  const payload: IChatEventPayload = {
    type,
    conversationId,
    sender,
    messageId,
    senderName,
    content,
    timestamp: Date.now(),
  };

  // 1. BroadcastChannel (fastest inter-tab messaging on same device)
  try {
    const bc = new BroadcastChannel(CHAT_BROADCAST_CHANNEL_NAME);
    bc.postMessage(payload);
    bc.close();
  } catch {
    // BroadcastChannel unsupported or restricted
  }

  // 2. localStorage sync for cross-window notifications
  try {
    localStorage.setItem(CHAT_STORAGE_SYNC_KEY, JSON.stringify(payload));
  } catch {
    // LocalStorage quota or access exception
  }

  // 3. Local custom event for current window components
  try {
    window.dispatchEvent(new CustomEvent("darkgems_chat_event", { detail: payload }));
  } catch {
    // CustomEvent dispatch error
  }
}

export function subscribeToChatEvents(
  callback: (payload: IChatEventPayload) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  // 1. Register with shared Server-Sent Events stream (for cross-device real-time sync)
  sseListeners.add(callback);
  sseSubscriberCount++;
  ensureSharedEventSource();

  // 2. Register BroadcastChannel for inter-tab instant sync
  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel(CHAT_BROADCAST_CHANNEL_NAME);
    bc.onmessage = (event: MessageEvent<IChatEventPayload>) => {
      if (event.data && event.data.type) {
        callback(event.data);
      }
    };
  } catch {
    bc = null;
  }

  // 3. Register local window event
  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<IChatEventPayload>;
    if (custom.detail) {
      callback(custom.detail);
    }
  };

  // 4. Register cross-window storage event
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === CHAT_STORAGE_SYNC_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue) as IChatEventPayload;
        callback(parsed);
      } catch {
        // Parse error ignored
      }
    }
  };

  window.addEventListener("darkgems_chat_event", handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    sseListeners.delete(callback);
    sseSubscriberCount--;
    closeSharedEventSourceIfOrphaned();

    if (bc) {
      bc.close();
    }
    window.removeEventListener("darkgems_chat_event", handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}
