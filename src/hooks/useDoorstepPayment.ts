"use client";

import { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import { IOrder, PaymentStatus } from "@/types/order.types";
import { toast } from "sonner";

interface IUseDoorstepPaymentProps {
  order: IOrder;
  onPaymentSuccess?: () => void;
}

export interface IUseDoorstepPaymentReturn {
  qrCodeDataUrl: string | null;
  upiPayloadString: string;
  paymentStatus: PaymentStatus;
  handoverOtp: string | null;
  isPolling: boolean;
  isSimulating: boolean;
  timeRemainingSec: number;
  triggerSimulatedPayment: () => Promise<void>;
  checkPaymentStatus: () => Promise<void>;
}

/**
 * Custom Hook: useDoorstepPayment
 * Encapsulates dynamic QR code generation, real-time polling, and OTP reveal.
 * Eliminates fraud by verifying bank gateway webhook before revealing release OTP.
 */
export function useDoorstepPayment({
  order,
  onPaymentSuccess,
}: IUseDoorstepPaymentProps): IUseDoorstepPaymentReturn {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    order.paymentInfo?.paymentStatus || "UNPAID"
  );
  const [handoverOtp, setHandoverOtp] = useState<string | null>(
    order.paymentInfo?.deliveryHandoverOtp || null
  );
  const isPolling = paymentStatus !== "PAID";
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [timeRemainingSec, setTimeRemainingSec] = useState<number>(300); // 5 min dynamic window

  const resolvedOrderNumber = order.orderNumber || order.id;
  // Official Merchant VPA with locked amount and reference
  const merchantVpa = process.env.NEXT_PUBLIC_MERCHANT_UPI_ID || "darkgems.vault@icici";
  const merchantName = "DarkGems Luxury Vault";
  const upiPayloadString = `upi://pay?pa=${encodeURIComponent(merchantVpa)}&pn=${encodeURIComponent(merchantName)}&tr=${encodeURIComponent(resolvedOrderNumber)}&am=${order.totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Diamond Consignment ${resolvedOrderNumber}`)}`;

  // 1. Generate crisp high-resolution QR code
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(upiPayloadString, {
      width: 320,
      margin: 2,
      color: {
        dark: "#1c1917", // stone-900
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    })
      .then((url: string) => {
        if (isMounted) setQrCodeDataUrl(url);
      })
      .catch((err: Error) => {
        console.error("[QR Generation Error]:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [upiPayloadString]);

  // 2. Status verification against the database
  const checkPaymentStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${order.id || order.orderNumber}`);
      if (!res.ok) return;

      const json: { success: boolean; data?: IOrder } = await res.json();
      if (json.success && json.data) {
        const currentPayment = json.data.paymentInfo;
        if (currentPayment?.paymentStatus === "PAID") {
          setPaymentStatus("PAID");
          setHandoverOtp(currentPayment.deliveryHandoverOtp || null);
          if (onPaymentSuccess) {
            onPaymentSuccess();
          }
          toast.success("Payment Received & Confirmed by Central Vault!", {
            description: "Your 4-digit Delivery Handover OTP is now available.",
          });
        }
      }
    } catch (err) {
      console.error("[Doorstep Polling Error]:", err);
    }
  }, [order.id, order.orderNumber, onPaymentSuccess]);

  // 3. Dynamic countdown and polling loop
  useEffect(() => {
    if (paymentStatus === "PAID") {
      return;
    }

    const pollInterval = setInterval(() => {
      void checkPaymentStatus();
    }, 3000);

    const countdownInterval = setInterval(() => {
      setTimeRemainingSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(countdownInterval);
    };
  }, [paymentStatus, checkPaymentStatus]);

  // 4. Developer & Demo simulator (Emulates Gateway Webhook Callback)
  const triggerSimulatedPayment = async () => {
    setIsSimulating(true);
    try {
      const simulatedTxnId = `UPI-SIM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const res = await fetch("/api/webhooks/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-simulate-payment": "true",
        },
        body: JSON.stringify({
          orderNumber: resolvedOrderNumber,
          transactionId: simulatedTxnId,
          amount: order.totalAmount,
          status: "SUCCESS",
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.info("Simulated Gateway Webhook Received!", {
          description: `Transaction ${simulatedTxnId} confirmed. Refreshing state...`,
        });
        await checkPaymentStatus();
      } else {
        toast.error("Simulation failed", { description: json.error });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      toast.error("Simulation failed", { description: msg });
    } finally {
      setIsSimulating(false);
    }
  };

  return {
    qrCodeDataUrl,
    upiPayloadString,
    paymentStatus,
    handoverOtp,
    isPolling,
    isSimulating,
    timeRemainingSec,
    triggerSimulatedPayment,
    checkPaymentStatus,
  };
}
