"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { IOrder, OrderStatus } from "@/types/order.types";
import { useAuthStore } from "@/store/useAuthStore";
import { useOrderStore } from "@/store/useOrderStore";
import { subscribeToOrderEvents, broadcastOrderEvent, ORDER_EVENTS } from "@/lib/order-events";
import { toast } from "sonner";

export interface IUseUserOrdersReturn {
  orders: IOrder[];
  filteredOrders: IOrder[];
  paginatedOrders: IOrder[];
  activeOrders: IOrder[];
  deliveredOrders: IOrder[];
  cancelledOrders: IOrder[];
  isLoading: boolean;
  isAdmin: boolean;
  error: string | null;
  statusFilter: OrderStatus | "ALL";
  setStatusFilter: (status: OrderStatus | "ALL") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
  totalFilteredCount: number;
  inspectOrder: IOrder | null;
  setInspectOrder: (order: IOrder | null) => void;
  handleCancelOrder: (orderId: string) => Promise<boolean>;
  isCancelling: boolean;
  statusCounts: {
    all: number;
    pending: number;
    approved: number;
    inTransit: number;
    delivered: number;
    cancelled: number;
  };
  insuredTotal: number;
  refetch: () => Promise<void>;
}

export function useUserOrders(): IUseUserOrdersReturn {
  const { token, isAuthenticated, user } = useAuthStore();
  const { rejectOrder } = useOrderStore();
  const [dbOrders, setDbOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [inspectOrderId, setInspectOrderId] = useState<string | null>(null);

  const isAdmin = Boolean(isAuthenticated && user?.role === "ADMIN");

  const getEffectiveToken = useCallback(() => {
    return (
      token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("diamond_auth_token")
        : null)
    );
  }, [token]);

  // Load orders silently without triggering a global loading spinner
  const silentFetchOrders = useCallback(async () => {
    const activeToken = getEffectiveToken();
    if (!activeToken && !isAuthenticated) {
      setDbOrders([]);
      return;
    }

    try {
      const headers: Record<string, string> = {};
      if (activeToken) {
        headers["Authorization"] = `Bearer ${activeToken}`;
      }

      const res = await fetch("/api/orders", {
        headers,
        cache: "no-store",
      });

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDbOrders(json.data);
      }
    } catch {
      // Fallback silently to existing state and store
    }
  }, [getEffectiveToken, isAuthenticated]);

  const fetchOrders = useCallback(async () => {
    const activeToken = getEffectiveToken();
    if (!activeToken && !isAuthenticated) {
      setDbOrders([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const headers: Record<string, string> = {};
      if (activeToken) {
        headers["Authorization"] = `Bearer ${activeToken}`;
      }

      const res = await fetch("/api/orders", {
        headers,
        cache: "no-store",
      });

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDbOrders(json.data);
      } else {
        setError(json.error || "Failed to load orders");
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error connecting to server";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [getEffectiveToken, isAuthenticated]);

  useEffect(() => {
    let isCancelled = false;

    async function initialLoad() {
      const activeToken = getEffectiveToken();
      if (!activeToken && !isAuthenticated) {
        setDbOrders([]);
        setIsLoading(false);
        return;
      }

      try {
        const headers: Record<string, string> = {};
        if (activeToken) {
          headers["Authorization"] = `Bearer ${activeToken}`;
        }

        const res = await fetch("/api/orders", {
          headers,
          cache: "no-store",
        });

        const json = await res.json();
        if (!isCancelled) {
          if (json.success && Array.isArray(json.data)) {
            setDbOrders(json.data);
          } else {
            setError(json.error || "Failed to load orders");
          }
        }
      } catch (err) {
        if (!isCancelled) {
          const msg =
            err instanceof Error ? err.message : "Error connecting to server";
          setError(msg);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void initialLoad();

    // 1. Unified Real-Time Event Subscription (BroadcastChannel, Storage, CustomEvents, Focus)
    const unsubscribe = subscribeToOrderEvents(() => {
      void silentFetchOrders();
    });

    // 2. Silent Heartbeat Poll every 2.5 seconds when user is viewing the page
    const heartbeat = setInterval(() => {
      if (document.visibilityState === "visible") {
        void silentFetchOrders();
      }
    }, 2500);

    return () => {
      isCancelled = true;
      unsubscribe();
      clearInterval(heartbeat);
    };
  }, [getEffectiveToken, isAuthenticated, silentFetchOrders]);

  // Authoritative user orders directly from MongoDB Database (no local storage ghost orders)
  const orders = useMemo(() => {
    return [...dbOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [dbOrders]);

  // Dynamically derive inspectOrder from active orders so modal reflects real-time status changes
  const inspectOrder = useMemo(() => {
    if (!inspectOrderId) return null;
    const target = inspectOrderId.toUpperCase().trim();
    return (
      orders.find(
        (o) =>
          (o.id && o.id.toUpperCase() === target) ||
          (o.orderNumber && o.orderNumber.toUpperCase() === target)
      ) || null
    );
  }, [inspectOrderId, orders]);

  const setInspectOrder = useCallback((order: IOrder | null) => {
    setInspectOrderId(order ? order.orderNumber || order.id : null);
  }, []);

  const handleCancelOrder = useCallback(
    async (orderId: string): Promise<boolean> => {
      setIsCancelling(true);
      try {
        const activeToken = getEffectiveToken();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (activeToken) {
          headers["Authorization"] = `Bearer ${activeToken}`;
        }

        const res = await fetch(`/api/orders/${orderId}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            action: "CANCEL",
            reason: "Cancelled by client before vault dispatch",
          }),
        });

        const json = await res.json();
        if (json.success) {
          // Update local state and zustand
          setDbOrders((prev) =>
            prev.map((o) =>
              o.id === orderId || o.orderNumber === orderId
                ? { ...o, status: "CANCELLED" }
                : o
            )
          );
          rejectOrder(orderId);
          broadcastOrderEvent(ORDER_EVENTS.ORDER_CANCELLED, orderId);

          toast.success("Order Cancelled", {
            description: "Your diamond reservation has been successfully cancelled.",
          });
          await silentFetchOrders();
          return true;
        } else {
          toast.error("Cancellation Error", {
            description: json.error || "Unable to cancel order.",
          });
          return false;
        }
      } catch {
        toast.error("Network error during order cancellation.");
        return false;
      } finally {
        setIsCancelling(false);
      }
    },
    [getEffectiveToken, rejectOrder, silentFetchOrders]
  );

  const activeOrders = useMemo(() => {
    return orders.filter((o) =>
      [
        "PENDING_APPROVAL",
        "APPROVED",
        "DISPATCHED",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
      ].includes(o.status),
    );
  }, [orders]);

  const deliveredOrders = useMemo(() => {
    return orders.filter((o) => o.status === "DELIVERED");
  }, [orders]);

  const cancelledOrders = useMemo(() => {
    return orders.filter((o) => o.status === "CANCELLED");
  }, [orders]);

  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === "PENDING_APPROVAL").length,
      approved: orders.filter((o) => o.status === "APPROVED").length,
      inTransit: orders.filter((o) =>
        ["DISPATCHED", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(o.status),
      ).length,
      delivered: orders.filter((o) => o.status === "DELIVERED").length,
      cancelled: orders.filter((o) => o.status === "CANCELLED").length,
    };
  }, [orders]);

  const insuredTotal = useMemo(() => {
    return orders.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (statusFilter !== "ALL") {
      if (statusFilter === "IN_TRANSIT") {
        result = result.filter((o) =>
          ["DISPATCHED", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(o.status),
        );
      } else {
        result = result.filter((o) => o.status === statusFilter);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((o) => {
        const orderNum = (o.orderNumber || o.id || "").toLowerCase();
        const city = (o.shippingAddress?.city || "").toLowerCase();
        const state = (o.shippingAddress?.state || "").toLowerCase();
        const carrier = (o.trackingInfo?.carrier || "").toLowerCase();
        const trackingNum = (
          o.trackingInfo?.trackingNumber || ""
        ).toLowerCase();
        const matchItem = o.items.some(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.sku.toLowerCase().includes(q) ||
            item.shape.toLowerCase().includes(q) ||
            item.certificateNumber.toLowerCase().includes(q) ||
            (item.lab && item.lab.toLowerCase().includes(q)),
        );

        return (
          orderNum.includes(q) ||
          city.includes(q) ||
          state.includes(q) ||
          carrier.includes(q) ||
          trackingNum.includes(q) ||
          matchItem
        );
      });
    }

    return result;
  }, [orders, statusFilter, searchQuery]);

  const totalFilteredCount = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedOrders = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, safeCurrentPage, pageSize]);

  const handleStatusFilterChange = useCallback((status: OrderStatus | "ALL") => {
    setStatusFilter(status);
    setCurrentPage(1);
  }, []);

  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  return {
    orders,
    filteredOrders,
    paginatedOrders,
    activeOrders,
    deliveredOrders,
    cancelledOrders,
    isLoading,
    isAdmin,
    error,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    searchQuery,
    setSearchQuery: handleSearchQueryChange,
    currentPage: safeCurrentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalFilteredCount,
    inspectOrder,
    setInspectOrder,
    handleCancelOrder,
    isCancelling,
    statusCounts,
    insuredTotal,
    refetch: fetchOrders,
  };
}
