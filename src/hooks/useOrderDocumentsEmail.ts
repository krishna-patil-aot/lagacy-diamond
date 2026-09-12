"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { IOrder, ISendOrderDocumentsResponse } from "@/types/order.types";

export interface IUseOrderDocumentsEmailReturn {
  sendingOrderId: string | null;
  isSending: (orderId: string) => boolean;
  sendOrderDocuments: (order: IOrder) => Promise<boolean>;
}

export function useOrderDocumentsEmail(): IUseOrderDocumentsEmailReturn {
  const [sendingOrderId, setSendingOrderId] = useState<string | null>(null);

  const isSending = useCallback(
    (orderId: string) => sendingOrderId === orderId,
    [sendingOrderId]
  );

  const sendOrderDocuments = useCallback(
    async (order: IOrder): Promise<boolean> => {
      if (order.status === "PENDING_APPROVAL") {
        toast.info("Awaiting Curator Approval", {
          description: "Official invoice and certificates are issued after the curator reviews and accepts the order.",
        });
        return false;
      }

      if (order.status === "CANCELLED") {
        toast.error("Documents Unavailable", {
          description: "Official documents cannot be issued for cancelled orders.",
        });
        return false;
      }

      const recipientEmail = order.shippingAddress?.email;
      if (!recipientEmail) {
        toast.error("Missing Email Address", {
          description: "No registered client email address found for this order.",
        });
        return false;
      }

      const toastId = `email-docs-${order.id}`;
      try {
        setSendingOrderId(order.id);
        toast.loading(`Sending official invoice & certificates to ${recipientEmail}...`, {
          id: toastId,
        });

        const res = await fetch(`/api/orders/${order.id}/email-documents`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data: ISendOrderDocumentsResponse = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to dispatch order documents via email.");
        }

        toast.success("Documents Sent to Email", {
          id: toastId,
          description: `Official purchase invoice & lab certificate(s) sent to ${recipientEmail}.`,
        });
        return true;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Error sending documents via email";
        toast.error("Email Dispatch Error", {
          id: toastId,
          description: msg,
        });
        return false;
      } finally {
        setSendingOrderId(null);
      }
    },
    []
  );

  return {
    sendingOrderId,
    isSending,
    sendOrderDocuments,
  };
}
