"use client";

import { useState, useCallback } from "react";
import { IDiamond } from "@/types/diamond.types";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

export interface IUseStockNotificationReturn {
  isOpen: boolean;
  diamond: IDiamond | null;
  isSubmitting: boolean;
  isSubscribed: boolean;
  defaultEmail: string;
  defaultName: string;
  openNotificationModal: (diamond: IDiamond) => void;
  closeNotificationModal: () => void;
  submitNotification: (email: string, clientName?: string) => Promise<boolean>;
}

export function useStockNotification(): IUseStockNotificationReturn {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [diamond, setDiamond] = useState<IDiamond | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  const defaultEmail = user?.email || "";
  const defaultName = user?.name || "";

  const openNotificationModal = useCallback((targetDiamond: IDiamond) => {
    setDiamond(targetDiamond);
    setIsSubscribed(false);
    setIsOpen(true);
  }, []);

  const closeNotificationModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const submitNotification = useCallback(
    async (email: string, clientName?: string): Promise<boolean> => {
      if (!diamond) return false;

      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail || !trimmedEmail.includes("@")) {
        toast.error("Invalid Email Address", {
          description: "Please enter a valid email address to receive vault stock alerts.",
        });
        return false;
      }

      setIsSubmitting(true);
      try {
        const res = await fetch("/api/stock-notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            diamondId: diamond._id,
            email: trimmedEmail,
            clientName: clientName?.trim() || defaultName || "Valued Client",
          }),
        });

        const json = await res.json();
        if (res.ok && json.success) {
          setIsSubscribed(true);
          toast.success("Stock Alert Established", {
            description: `We will notify you at ${trimmedEmail} the moment ${diamond.sku} returns to vault stock.`,
          });
          return true;
        } else {
          toast.error("Subscription Notice", {
            description: json.error || "Unable to establish stock alert. Please try again.",
          });
          return false;
        }
      } catch (err) {
        console.error("[Stock Notification Hook Error]:", err);
        toast.error("Network Error", {
          description: "Could not connect to the vault registry. Please check your connection.",
        });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [diamond, defaultName]
  );

  return {
    isOpen,
    diamond,
    isSubmitting,
    isSubscribed,
    defaultEmail,
    defaultName,
    openNotificationModal,
    closeNotificationModal,
    submitNotification,
  };
}
