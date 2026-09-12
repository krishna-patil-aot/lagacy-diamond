"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useOrderStore } from "@/store/useOrderStore";
import { useAuthStore } from "@/store/useAuthStore";
import { IOrder, OrderStatus } from "@/types/order.types";
import { toast } from "sonner";

export interface IUseAdminOrdersReturn {
  orders: IOrder[];
  filteredOrders: IOrder[];
  paginatedOrders: IOrder[];
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
  pendingCount: number;
  approvedCount: number;
  dispatchedCount: number;
  deliveredCount: number;
  cancelledCount: number;
  totalOrderRevenue: number;
  handleApproveOrder: (orderId: string) => Promise<void>;
  handleDispatchOrder: (orderId: string, carrier?: string, trackingNumber?: string) => Promise<void>;
  handleAdvanceStatus: (orderId: string, nextStatus: OrderStatus, note?: string) => Promise<void>;
  handleRejectOrder: (orderId: string) => Promise<void>;
  refetch: () => Promise<void>;
  isUpdating: boolean;
}

import { subscribeToOrderEvents, broadcastOrderEvent, ORDER_EVENTS } from "@/lib/order-events";

export function useAdminOrders(): IUseAdminOrdersReturn {
  const { token, user } = useAuthStore();
  const { approveOrder, rejectOrder, updateOrderStatus } = useOrderStore();
  const [dbOrders, setDbOrders] = useState<IOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const getEffectiveAuth = useCallback(() => {
    const activeToken =
      token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("diamond_auth_token")
        : null);

    let activeUser = user;
    if (!activeUser && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("diamond_auth_user");
        if (stored) activeUser = JSON.parse(stored);
      } catch {
        // Fallback
      }
    }
    return { activeToken, activeUser };
  }, [token, user]);

  const fetchOrders = useCallback(async () => {
    const { activeToken, activeUser } = getEffectiveAuth();
    if (!activeToken || activeUser?.role !== "ADMIN") return;

    try {
      const res = await fetch("/api/admin/orders", {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDbOrders(json.data);
      }
    } catch {
      // Fallback to storeOrders
    }
  }, [getEffectiveAuth]);

  useEffect(() => {
    let isSubscribed = true;

    async function loadAdminOrders() {
      const { activeToken, activeUser } = getEffectiveAuth();
      if (!activeToken || activeUser?.role !== "ADMIN") return;
      try {
        const res = await fetch("/api/admin/orders", {
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
          cache: "no-store",
        });
        const json = await res.json();
        if (isSubscribed && json.success && Array.isArray(json.data)) {
          setDbOrders(json.data);
        }
      } catch {
        // Fallback to storeOrders
      }
    }

    void loadAdminOrders();

    // 1. Unified Real-Time Event Subscription (BroadcastChannel, Storage, CustomEvents, Focus)
    const unsubscribe = subscribeToOrderEvents(() => {
      void loadAdminOrders();
    });

    // 2. Live heartbeat polling every 2.5 seconds when admin tab is visible
    const pollInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadAdminOrders();
      }
    }, 2500);

    return () => {
      isSubscribed = false;
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [getEffectiveAuth]);

  // Authoritative admin orders directly from MongoDB Database (no local storage ghost orders)
  const orders = useMemo(() => {
    return [...dbOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [dbOrders]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (statusFilter !== "ALL") {
      result = result.filter((o) => o.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((o) => {
        const orderNum = (o.orderNumber || o.id).toLowerCase();
        const clientName = o.shippingAddress?.fullName?.toLowerCase() || "";
        const clientEmail = o.shippingAddress?.email?.toLowerCase() || "";
        const clientCity = o.shippingAddress?.city?.toLowerCase() || "";
        const clientPhone = o.shippingAddress?.phone?.toLowerCase() || "";
        const diamondNames = o.items.map((i) => i.name.toLowerCase()).join(" ");
        const diamondSkus = o.items.map((i) => i.sku.toLowerCase()).join(" ");
        return (
          orderNum.includes(q) ||
          clientName.includes(q) ||
          clientEmail.includes(q) ||
          clientCity.includes(q) ||
          clientPhone.includes(q) ||
          diamondNames.includes(q) ||
          diamondSkus.includes(q)
        );
      });
    }
    return result;
  }, [orders, statusFilter, searchQuery]);

  const totalFilteredCount = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));

  // Reset to page 1 on filter or search change
  const handleStatusFilterChange = (status: OrderStatus | "ALL") => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const pendingCount = useMemo(() => {
    return orders.filter((o) => o.status === "PENDING_APPROVAL").length;
  }, [orders]);

  const approvedCount = useMemo(() => {
    return orders.filter((o) => o.status === "APPROVED").length;
  }, [orders]);

  const dispatchedCount = useMemo(() => {
    return orders.filter((o) => ["DISPATCHED", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(o.status)).length;
  }, [orders]);

  const deliveredCount = useMemo(() => {
    return orders.filter((o) => o.status === "DELIVERED").length;
  }, [orders]);

  const cancelledCount = useMemo(() => {
    return orders.filter((o) => o.status === "CANCELLED").length;
  }, [orders]);

  const totalOrderRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status === "APPROVED" || o.status === "DELIVERED" || o.status === "DISPATCHED")
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders]);

  const handleAdvanceStatus = async (orderId: string, nextStatus: OrderStatus, note?: string) => {
    setIsUpdating(true);
    try {
      if (token) {
        await fetch(`/api/admin/orders/${orderId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: nextStatus, note }),
        });
      }

      // Update local state immediately
      setDbOrders((prev) =>
        prev.map((o) => (o.id === orderId || o.orderNumber === orderId ? { ...o, status: nextStatus } : o))
      );

      // Update zustand store
      updateOrderStatus(orderId, nextStatus, { note });

      if (nextStatus === "APPROVED") {
        approveOrder(orderId);
      } else if (nextStatus === "CANCELLED") {
        rejectOrder(orderId);
      } else {
        toast.success(`Order #${orderId} Updated`, {
          description: `Status advanced to ${nextStatus}`,
        });
      }

      broadcastOrderEvent(ORDER_EVENTS.ORDER_STATUS_CHANGED, orderId);
      await fetchOrders();
    } catch {
      toast.error("Status update error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    await handleAdvanceStatus(orderId, "APPROVED", "Curator verified physical lot & lab inscription");
  };

  const handleDispatchOrder = async (orderId: string, carrier?: string, trackingNumber?: string) => {
    setIsUpdating(true);
    const resolvedCarrier = carrier || "Brink's Global Armored Services";
    const resolvedTracking = trackingNumber || `BRK-${Date.now().toString().slice(-6)}`;
    const note = "Vault sealed and handed to armed courier convoy";

    try {
      if (token) {
        await fetch(`/api/admin/orders/${orderId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "DISPATCHED",
            carrier: resolvedCarrier,
            trackingNumber: resolvedTracking,
            note,
          }),
        });
      }

      setDbOrders((prev) =>
        prev.map((o) =>
          o.id === orderId || o.orderNumber === orderId
            ? {
                ...o,
                status: "DISPATCHED",
                trackingInfo: {
                  ...(o.trackingInfo || {
                    vaultOrigin: "Geneva Central Foundry Vault",
                    transitType: "ARMORED_GROUND",
                    biometricSignatureRequired: true,
                  }),
                  carrier: resolvedCarrier,
                  trackingNumber: resolvedTracking,
                },
              }
            : o
        )
      );

      updateOrderStatus(orderId, "DISPATCHED", {
        carrier: resolvedCarrier,
        trackingNumber: resolvedTracking,
        note,
      });

      broadcastOrderEvent(ORDER_EVENTS.ORDER_STATUS_CHANGED, orderId);

      toast.success("Order Dispatched via Armored Carrier!", {
        description: "Brink's security escort tracking active.",
      });
      await fetchOrders();
    } catch {
      toast.error("Dispatch update error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    await handleAdvanceStatus(orderId, "CANCELLED", "Order cancelled by curator review");
  };

  return {
    orders,
    filteredOrders,
    paginatedOrders,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    searchQuery,
    setSearchQuery: handleSearchChange,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalFilteredCount,
    pendingCount,
    approvedCount,
    dispatchedCount,
    deliveredCount,
    cancelledCount,
    totalOrderRevenue,
    handleApproveOrder,
    handleDispatchOrder,
    handleAdvanceStatus,
    handleRejectOrder,
    refetch: fetchOrders,
    isUpdating,
  };
}
