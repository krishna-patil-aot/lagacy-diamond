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

// Client-wide unified listener registry
const chatListeners = new Set<(payload: IChatEventPayload) => void>();

// Persistent BroadcastChannel singleton (never closed synchronously to avoid dropping queued IPC packets)
let sharedBroadcastChannel: BroadcastChannel | null = null;

function getSharedBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  if (!sharedBroadcastChannel) {
    try {
      sharedBroadcastChannel = new BroadcastChannel(CHAT_BROADCAST_CHANNEL_NAME);
      sharedBroadcastChannel.onmessage = (event: MessageEvent<IChatEventPayload>) => {
        if (event.data && event.data.type) {
          dispatchToLocalListeners(event.data);
        }
      };
    } catch {
      sharedBroadcastChannel = null;
    }
  }
  return sharedBroadcastChannel;
}

// Persistent SSE connection singleton with self-healing auto-reconnect
let sharedEventSource: EventSource | null = null;
let sseReconnectTimer: ReturnType<typeof setTimeout> | null = null;

function dispatchToLocalListeners(payload: IChatEventPayload): void {
  for (const listener of Array.from(chatListeners)) {
    try {
      listener(payload);
    } catch (err) {
      console.warn("[ChatBus] Listener exception:", err);
    }
  }
}

function ensureSharedEventSource(): void {
  if (typeof window === "undefined" || typeof EventSource === "undefined") return;
  if (
    sharedEventSource &&
    (sharedEventSource.readyState === EventSource.OPEN ||
      sharedEventSource.readyState === EventSource.CONNECTING)
  ) {
    return;
  }

  try {
    if (sharedEventSource) {
      try {
        sharedEventSource.close();
      } catch {
        // Ignore
      }
      sharedEventSource = null;
    }

    sharedEventSource = new EventSource("/api/chat/stream");

    sharedEventSource.onmessage = (e: MessageEvent<string>) => {
      try {
        if (!e.data) return;
        const payload = JSON.parse(e.data) as IChatEventPayload;
        if (payload && payload.type) {
          dispatchToLocalListeners(payload);
        }
      } catch {
        // Non-JSON or keepalive packet ignored
      }
    };

    sharedEventSource.onerror = () => {
      try {
        sharedEventSource?.close();
      } catch {
        // Ignore
      }
      sharedEventSource = null;

      if (!sseReconnectTimer) {
        sseReconnectTimer = setTimeout(() => {
          sseReconnectTimer = null;
          ensureSharedEventSource();
        }, 3000);
      }
    };
  } catch {
    sharedEventSource = null;
  }
}

let isStorageListenerAttached = false;

function ensureGlobalListeners(): void {
  if (typeof window === "undefined") return;

  getSharedBroadcastChannel();
  ensureSharedEventSource();

  if (!isStorageListenerAttached) {
    isStorageListenerAttached = true;

    // Cross-window storage fallback
    window.addEventListener("storage", (e: StorageEvent) => {
      if (e.key === CHAT_STORAGE_SYNC_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as IChatEventPayload;
          if (parsed && parsed.type) {
            dispatchToLocalListeners(parsed);
          }
        } catch {
          // Ignore parse failure
        }
      }
    });

    // Custom local window events
    window.addEventListener("darkgems_chat_event", (e: Event) => {
      const custom = e as CustomEvent<IChatEventPayload>;
      if (custom.detail && custom.detail.type) {
        dispatchToLocalListeners(custom.detail);
      }
    });
  }
}

/**
 * Broadcasts an event immediately across all browser tabs, windows, and local UI components.
 */
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

  // 1. Dispatch instantly to current window components
  dispatchToLocalListeners(payload);

  // 2. BroadcastChannel for zero-latency inter-tab messaging on the same device
  const bc = getSharedBroadcastChannel();
  if (bc) {
    try {
      bc.postMessage(payload);
    } catch {
      // Ignore
    }
  }

  // 3. localStorage for cross-window / iframe storage sync
  try {
    localStorage.setItem(CHAT_STORAGE_SYNC_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota limits
  }

  // 4. Window custom event
  try {
    window.dispatchEvent(new CustomEvent("darkgems_chat_event", { detail: payload }));
  } catch {
    // Ignore
  }
}

/**
 * Subscribes a React component or hook to real-time chat events.
 */
export function subscribeToChatEvents(
  callback: (payload: IChatEventPayload) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  ensureGlobalListeners();
  chatListeners.add(callback);

  return () => {
    chatListeners.delete(callback);
  };
}
