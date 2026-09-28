"use client";

import { useState } from "react";
import { IOrder } from "@/types/order.types";
import { toast } from "sonner";

interface IUseDeliveryCourierVerificationProps {
  order: IOrder;
  onSuccess?: (updatedOrder: IOrder) => void;
}

export interface IUseDeliveryCourierVerificationReturn {
  otpInput: string;
  setOtpInput: (otp: string) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
  submitOtpVerification: () => Promise<boolean>;
  reset: () => void;
}

/**
 * Custom Hook: useDeliveryCourierVerification
 * Manages doorstep handover OTP verification by the delivery courier.
 * Submits the customer's 4-digit token to transition consignment status to DELIVERED.
 */
export function useDeliveryCourierVerification({
  order,
  onSuccess,
}: IUseDeliveryCourierVerificationProps): IUseDeliveryCourierVerificationReturn {
  const [otpInput, setOtpInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submitOtpVerification = async (): Promise<boolean> => {
    const cleanOtp = otpInput.trim();
    if (cleanOtp.length !== 4) {
      setErrorMessage("Please enter exactly 4 digits.");
      toast.error("Please enter the complete 4-digit handover OTP.");
      return false;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/orders/${order.id || order.orderNumber}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp: cleanOtp }),
      });

      const json: { success: boolean; message?: string; error?: string; data?: IOrder } =
        await res.json();

      if (json.success && json.data) {
        toast.success("Handover Verified & Completed!", {
          description: "Parcel marked as DELIVERED in the central vault registry.",
        });
        if (onSuccess) {
          onSuccess(json.data);
        }
        return true;
      } else {
        const errorText = json.error || "OTP verification failed. Handover rejected.";
        setErrorMessage(errorText);
        toast.error("Handover Denied", { description: errorText });
        return false;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error during verification";
      setErrorMessage(msg);
      toast.error("Verification Error", { description: msg });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setOtpInput("");
    setErrorMessage(null);
    setIsSubmitting(false);
  };

  return {
    otpInput,
    setOtpInput,
    isSubmitting,
    errorMessage,
    submitOtpVerification,
    reset,
  };
}
