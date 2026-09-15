/**
 * Real-Time Inquiry Event Synchronization Bus
 * Cross-tab, cross-window, and same-window reactivity for diamond inquiries.
 */

export const INQUIRY_EVENTS = {
  INQUIRY_CREATED: "INQUIRY_CREATED",
  INQUIRY_REPLIED: "INQUIRY_REPLIED",
  INQUIRY_STATUS_CHANGED: "INQUIRY_STATUS_CHANGED",
} as const;

export type InquiryEventType = typeof INQUIRY_EVENTS[keyof typeof INQUIRY_EVENTS];

export interface IInquiryEventPayload {
  type: InquiryEventType | string;
  inquiryId?: string;
  inquiryNumber?: string;
  timestamp: number;
}

const BROADCAST_CHANNEL_NAME = "diamond_inquiries_channel";
const STORAGE_SYNC_KEY = "diamond_inquiries_last_sync";

/**
 * Broadcast an inquiry mutation to all tabs, windows, and local subscribers.
 */
export function broadcastInquiryEvent(
  type: InquiryEventType | string,
  inquiryId?: string,
  inquiryNumber?: string
): void {
  if (typeof window === "undefined") return;

  const payload: IInquiryEventPayload = {
    type,
    inquiryId,
    inquiryNumber,
    timestamp: Date.now(),
  };

  // 1. BroadcastChannel (fastest inter-tab messaging)
  try {
    const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    bc.postMessage(payload);
    bc.close();
  } catch {
    // BroadcastChannel unsupported or restricted
  }

  // 2. localStorage update (fires window "storage" event across all other tabs/windows)
  try {
    localStorage.setItem(STORAGE_SYNC_KEY, JSON.stringify(payload));
  } catch {
    // Storage quota or disabled
  }

  // 3. CustomEvent for same-tab / same-window reactivity
  try {
    window.dispatchEvent(new CustomEvent("diamond_inquiry_sync", { detail: payload }));
  } catch {
    // Event dispatch fallback
  }
}

/**
 * Subscribe to real-time inquiry events from any source.
 * Returns an unsubscription cleanup function.
 */
export function subscribeToInquiryEvents(
  onSync: (payload?: IInquiryEventPayload) => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  // 1. BroadcastChannel listener
  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    bc.onmessage = (event: MessageEvent<IInquiryEventPayload>) => {
      onSync(event.data);
    };
  } catch {
    // BroadcastChannel unsupported
  }

  // 2. Cross-tab storage listener
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_SYNC_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue) as IOrderEventPayload;
        onSync(parsed);
      } catch {
        onSync();
      }
    }
  };
  window.addEventListener("storage", handleStorage);

  // 3. Same-tab custom event listener
  const handleCustomEvent = (event: Event) => {
    const custom = event as CustomEvent<IInquiryEventPayload>;
    onSync(custom.detail);
  };
  window.addEventListener("diamond_inquiry_sync", handleCustomEvent);

  // 4. Window focus & tab visibility change listener
  const handleVisibility = () => {
    if (document.visibilityState === "visible") {
      onSync();
    }
  };
  window.addEventListener("focus", handleVisibility);
  document.addEventListener("visibilitychange", handleVisibility);

  // Cleanup all listeners
  return () => {
    if (bc) {
      bc.close();
    }
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("diamond_inquiry_sync", handleCustomEvent);
    window.removeEventListener("focus", handleVisibility);
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}

interface IOrderEventPayload {
  type: string;
  inquiryId?: string;
  inquiryNumber?: string;
  timestamp: number;
}
