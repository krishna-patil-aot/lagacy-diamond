import { NextRequest } from "next/server";
import { subscribeServerChatEvents } from "@/lib/sse-broker";
import { IChatEventPayload } from "@/lib/chat-events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Initial handshake
      const initialPayload = JSON.stringify({
        status: "connected",
        timestamp: Date.now(),
      });
      controller.enqueue(encoder.encode(`event: connected\ndata: ${initialPayload}\n\n`));

      // 2. Keep-alive heartbeat every 20 seconds to prevent proxy / LB timeout
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`:keepalive\n\n`));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 20000);

      // 3. Forward server-emitted events to this client
      const unsubscribe = subscribeServerChatEvents((payload: IChatEventPayload) => {
        try {
          const chunk = encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);
          controller.enqueue(chunk);
        } catch {
          // Client disconnected
        }
      });

      // 4. Cleanup when client disconnects or aborts
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Stream already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Encoding": "none",
      "X-Accel-Buffering": "no", // Prevents Nginx/Vercel buffering
    },
  });
}

