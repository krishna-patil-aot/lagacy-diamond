"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { OrderStatus } from "@/types/order.types";

export function useOrderInvoice() {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const downloadInvoice = useCallback(
    async (orderId: string, orderNumber?: string, status?: OrderStatus) => {
      if (status === "CANCELLED") {
        toast.error("Invoice Unavailable", {
          description: "Invoices cannot be issued or downloaded for cancelled orders.",
        });
        return;
      }

      try {
        setIsDownloading(true);
        toast.loading("Generating official vault invoice PDF...", { id: "order-invoice" });

        const res = await fetch(`/api/pdf/invoice/${orderId}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || "Failed to generate order invoice");
        }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Diamond_Vault_Invoice_${orderNumber || orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Invoice PDF downloaded successfully", { id: "order-invoice" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error generating invoice";
      toast.error(msg, { id: "order-invoice" });
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return {
    downloadInvoice,
    isDownloading,
  };
}
