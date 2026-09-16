/**
 * Real-Time Diamond & Inventory Event Synchronization Bus
 * Cross-tab, cross-window, and same-window reactivity for diamond catalog and stock changes.
 */

export const DIAMOND_EVENTS = {
  DIAMOND_CREATED: "DIAMOND_CREATED",
  DIAMOND_UPDATED: "DIAMOND_UPDATED",
  DIAMOND_DELETED: "DIAMOND_DELETED",
  STOCK_CHANGED: "STOCK_CHANGED",
  FEATURED_TOGGLED: "FEATURED_TOGGLED",
} as const;

export type DiamondEventType = typeof DIAMOND_EVENTS[keyof typeof DIAMOND_EVENTS];

export interface IDiamondEventPayload {
  type: DiamondEventType | string;
  diamondId?: string;
  stockQuantity?: number;
  timestamp: number;
}

const BROADCAST_CHANNEL_NAME = "diamond_events_channel";
const STORAGE_SYNC_KEY = "diamond_last_sync";

/**
 * Broadcast an inventory or specimen mutation to all tabs, windows, and local subscribers.
 */
export function broadcastDiamondEvent(
  type: DiamondEventType | string,
  diamondId?: string,
  stockQuantity?: number
): void {
  if (typeof window === "undefined") return;

  const payload: IDiamondEventPayload = {
    type,
    diamondId,
    stockQuantity,
    timestamp: Date.now(),
  };

  // 1. BroadcastChannel (inter-tab messaging)
  try {
    const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    bc.postMessage(payload);
    bc.close();
  } catch {
    // BroadcastChannel unsupported or restricted in environment
  }

  // 2. localStorage update (fires window "storage" event across other tabs/windows)
  try {
    localStorage.setItem(STORAGE_SYNC_KEY, JSON.stringify(payload));
  } catch {
    // Storage quota exceeded or disabled
  }

  // 3. CustomEvent for same-tab / same-window reactivity
  try {
    window.dispatchEvent(new CustomEvent("diamond_sync", { detail: payload }));
  } catch {
    // Event dispatch fallback
  }
}

/**
 * Subscribe to real-time diamond inventory events from any source.
 * Returns an unsubscription cleanup function.
 */
export function subscribeToDiamondEvents(
  onSync: (payload?: IDiamondEventPayload) => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  // 1. BroadcastChannel listener
  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    bc.onmessage = (event: MessageEvent<IDiamondEventPayload>) => {
      onSync(event.data);
    };
  } catch {
    // BroadcastChannel unsupported
  }

  // 2. Cross-tab storage listener
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_SYNC_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue) as IDiamondEventPayload;
        onSync(parsed);
      } catch {
        onSync();
      }
    }
  };
  window.addEventListener("storage", handleStorage);

  // 3. Same-tab custom event listener
  const handleCustomEvent = (event: Event) => {
    const custom = event as CustomEvent<IDiamondEventPayload>;
    onSync(custom.detail);
  };
  window.addEventListener("diamond_sync", handleCustomEvent);

  // Return unsubscribe cleanup function
  return () => {
    if (bc) {
      try {
        bc.close();
      } catch {
        // Ignore close error
      }
    }
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("diamond_sync", handleCustomEvent);
  };
}
