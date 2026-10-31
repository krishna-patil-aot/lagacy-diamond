import { EventEmitter } from "events";
import { IChatEventPayload } from "@/lib/chat-events";

declare global {
  var __darkgems_chat_sse_emitter: EventEmitter | undefined;
}

const sseEmitter: EventEmitter =
  globalThis.__darkgems_chat_sse_emitter ||
  (globalThis.__darkgems_chat_sse_emitter = new EventEmitter());

// Allow high concurrency for active client streams
sseEmitter.setMaxListeners(2500);

/**
 * Publish real-time chat event to all active Server-Sent Events (SSE) connections
 */
export function publishServerChatEvent(payload: IChatEventPayload): void {
  try {
    sseEmitter.emit("chat_event", payload);
  } catch (err) {
    console.error("SSE Broadcast error:", err);
  }
}

/**
 * Subscribe to server chat events
 */
export function subscribeServerChatEvents(
  callback: (payload: IChatEventPayload) => void
): () => void {
  sseEmitter.on("chat_event", callback);
  return () => {
    sseEmitter.off("chat_event", callback);
  };
}
