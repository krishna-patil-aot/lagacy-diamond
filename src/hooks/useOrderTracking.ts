"use client";

import { useMemo, useState } from "react";
import { IOrder, OrderStatus } from "@/types/order.types";
import { toast } from "sonner";

export interface ITrackingStage {
  status: OrderStatus;
  label: string;
  sublabel: string;
  iconName: "Clock" | "CheckCircle2" | "Truck" | "Navigation" | "ShieldCheck" | "Award";
}

export const TRACKING_STAGES: ITrackingStage[] = [
  {
    status: "PENDING_APPROVAL",
    label: "Order Transmitted",
    sublabel: "Awaiting Gemologist Review",
    iconName: "Clock",
  },
  {
    status: "APPROVED",
    label: "Curator Approved",
    sublabel: "GIA Inscription Confirmed",
    iconName: "Award",
  },
  {
    status: "DISPATCHED",
    label: "Armored Dispatch",
    sublabel: "Sealed for Brink's Courier",
    iconName: "Truck",
  },
  {
    status: "IN_TRANSIT",
    label: "In Armed Transit",
    sublabel: "Satellite-Monitored Route",
    iconName: "Navigation",
  },
  {
    status: "OUT_FOR_DELIVERY",
    label: "Out for Handover",
    sublabel: "Private Courier En Route",
    iconName: "Truck",
  },
  {
    status: "DELIVERED",
    label: "Delivered & Signed",
    sublabel: "Biometric Identity Confirmed",
    iconName: "ShieldCheck",
  },
];

export function useOrderTracking(order: IOrder | null) {
  const [copied, setCopied] = useState<boolean>(false);

  const currentStageIndex = useMemo(() => {
    if (!order) return 0;
    if (order.status === "CANCELLED") return -1;
    const idx = TRACKING_STAGES.findIndex((s) => s.status === order.status);
    return idx !== -1 ? idx : 0;
  }, [order]);

  const progressPercentage = useMemo(() => {
    if (!order || order.status === "CANCELLED") return 0;
    if (order.status === "DELIVERED") return 100;
    return Math.round((currentStageIndex / (TRACKING_STAGES.length - 1)) * 100);
  }, [order, currentStageIndex]);

  const copyTrackingNumber = () => {
    if (!order?.trackingInfo?.trackingNumber) return;
    navigator.clipboard.writeText(order.trackingInfo.trackingNumber);
    setCopied(true);
    toast.success("Armored Tracking Code Copied", {
      description: order.trackingInfo.trackingNumber,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return {
    currentStageIndex,
    progressPercentage,
    stages: TRACKING_STAGES,
    copyTrackingNumber,
    copied,
  };
}
