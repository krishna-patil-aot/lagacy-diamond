"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { IOrder, OrderStatus } from "@/types/order.types";
import { useAuthStore } from "@/store/useAuthStore";

export interface IUseUserOrdersReturn {
  orders: IOrder[];
  filteredOrders: IOrder[];
  activeOrders: IOrder[];
  deliveredOrders: IOrder[];
  cancelledOrders: IOrder[];
  isLoading: boolean;
  isAdmin: boolean;
  error: string | null;
  statusFilter: OrderStatus | "ALL";
  setStatusFilter: (status: OrderStatus | "ALL") => void;
  refetch: () => Promise<void>;
}

export function useUserOrders(): IUseUserOrdersReturn {
  const router = useRouter();
  const { token, isAuthenticated, user } = useAuthStore();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");

  const isAdmin = isAuthenticated && user?.role === "ADMIN";

  // Redirect admin users immediately to the Curator Portal
  useEffect(() => {
    if (isAdmin) {
      router.replace("/admin");
    }
  }, [isAdmin, router]);

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated || isAdmin) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/orders", {
        headers,
        cache: "no-store",
      });

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setOrders(json.data);
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
  }, [token, isAuthenticated, isAdmin]);

  useEffect(() => {
    let isCancelled = false;

    async function loadUserOrders() {
      if (!isAuthenticated || isAdmin) {
        setOrders([]);
        setIsLoading(false);
        return;
      }

      try {
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch("/api/orders", {
          headers,
          cache: "no-store",
        });

        const json = await res.json();
        if (!isCancelled) {
          if (json.success && Array.isArray(json.data)) {
            setOrders(json.data);
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

    void loadUserOrders();

    // Auto-poll every 12 seconds to catch live curator status advances
    const interval = setInterval(() => {
      void loadUserOrders();
    }, 12000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [token, isAuthenticated, isAdmin]);

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

  const filteredOrders = useMemo(() => {
    if (statusFilter === "ALL") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  return {
    orders,
    filteredOrders,
    activeOrders,
    deliveredOrders,
    cancelledOrders,
    isLoading,
    isAdmin,
    error,
    statusFilter,
    setStatusFilter,
    refetch: fetchOrders,
  };
}
