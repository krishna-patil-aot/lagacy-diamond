/**
 * Real-Time Order Event Synchronization Bus
 * Cross-tab, cross-window, and same-window reactivity for diamond order actions.
 */

export const ORDER_EVENTS = {
  ORDER_PLACED: "ORDER_PLACED",
  ORDER_UPDATED: "ORDER_UPDATED",
  ORDER_CANCELLED: "ORDER_CANCELLED",
  ORDER_STATUS_CHANGED: "ORDER_STATUS_CHANGED",
} as const;

export type OrderEventType = typeof ORDER_EVENTS[keyof typeof ORDER_EVENTS];

export interface IOrderEventPayload {
  type: OrderEventType | string;
  orderId?: string;
  orderNumber?: string;
  timestamp: number;
}

const BROADCAST_CHANNEL_NAME = "diamond_orders_channel";
const STORAGE_SYNC_KEY = "diamond_orders_last_sync";

/**
 * Broadcast an order mutation to all tabs, windows, and local subscribers.
 */
export function broadcastOrderEvent(type: OrderEventType | string, orderId?: string, orderNumber?: string): void {
  if (typeof window === "undefined") return;

  const payload: IOrderEventPayload = {
    type,
    orderId,
    orderNumber,
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
    window.dispatchEvent(new CustomEvent("diamond_order_sync", { detail: payload }));
  } catch {
    // Event dispatch fallback
  }
}

/**
 * Subscribe to real-time order events from any source.
 * Returns an unsubscription cleanup function.
 */
export function subscribeToOrderEvents(onSync: (payload?: IOrderEventPayload) => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  // 1. BroadcastChannel listener
  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    bc.onmessage = (event: MessageEvent<IOrderEventPayload>) => {
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
    const custom = event as CustomEvent<IOrderEventPayload>;
    onSync(custom.detail);
  };
  window.addEventListener("diamond_order_sync", handleCustomEvent);
  window.addEventListener("diamond_order_placed", handleCustomEvent);

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
    window.removeEventListener("diamond_order_sync", handleCustomEvent);
    window.removeEventListener("diamond_order_placed", handleCustomEvent);
    window.removeEventListener("focus", handleVisibility);
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}
