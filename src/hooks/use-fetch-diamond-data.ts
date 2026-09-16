"use client";

import { useEffect, useCallback, useRef } from "react";
import { useDiamondStore } from "@/store/diamond.store";
import { fetchDiamondsAction } from "@/actions/diamond.action";
import { apiHandler } from "@/utils/api-handler";
import { IDiamondFilterQuery, IDiamondSearchParams, DiamondShape } from "@/types/diamond.types";
import { subscribeToDiamondEvents } from "@/lib/diamond-events";
import { subscribeToOrderEvents } from "@/lib/order-events";

export function useFetchDiamondData(initialParams?: IDiamondSearchParams) {
  const {
    page,
    limit,
    search,
    shapeFilter,
    sortBy,
    setItems,
    setLoading,
    setError,
    setPage,
    setSearch,
  } = useDiamondStore();

  const isInitialized = useRef<boolean>(false);

  useEffect(() => {
    if (!isInitialized.current && initialParams) {
      if (initialParams.page) {
        setPage(Number(initialParams.page));
      }
      if (initialParams.search) {
        setSearch(initialParams.search);
      }
      isInitialized.current = true;
    }
  }, [initialParams, setPage, setSearch]);

  const loadDiamonds = useCallback(async () => {
    setLoading(true);
    setError(null);

    const filterQuery: IDiamondFilterQuery = {
      page,
      limit,
      search: search.trim() || undefined,
      sortBy,
    };

    if (shapeFilter && shapeFilter !== "ALL") {
      filterQuery.shapes = [shapeFilter as DiamondShape];
    }

    const result = await apiHandler(() => fetchDiamondsAction(filterQuery), {
      showErrorToast: true,
      errorMessage: "Could not load gemstone inventory lots",
    });

    if (result.success && result.data) {
      setItems(result.data.items, result.data.total, result.data.pageCount);
    } else if (result.error) {
      setError(result.error.message);
    }

    setLoading(false);
  }, [page, limit, search, shapeFilter, sortBy, setItems, setLoading, setError]);

  useEffect(() => {
    loadDiamonds();
  }, [loadDiamonds]);

  // Silent background revalidation for real-time inventory updates without spinner flash
  const silentRevalidate = useCallback(async () => {
    const filterQuery: IDiamondFilterQuery = {
      page,
      limit,
      search: search.trim() || undefined,
      sortBy,
    };

    if (shapeFilter && shapeFilter !== "ALL") {
      filterQuery.shapes = [shapeFilter as DiamondShape];
    }

    const result = await apiHandler(() => fetchDiamondsAction(filterQuery), {
      showErrorToast: false,
    });

    if (result.success && result.data) {
      setItems(result.data.items, result.data.total, result.data.pageCount);
    }
  }, [page, limit, search, shapeFilter, sortBy, setItems]);

  // Real-time synchronization bus + order events + focus + heartbeat
  useEffect(() => {
    // 1. Subscribe to diamond events (mutations from other tabs or actions)
    const unsubDiamonds = subscribeToDiamondEvents(() => {
      silentRevalidate();
    });

    // 2. Subscribe to order events (when an order is placed/cancelled, stock changes live!)
    const unsubOrders = subscribeToOrderEvents(() => {
      silentRevalidate();
    });

    // 3. Focus / visibility revalidation
    const handleFocus = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        silentRevalidate();
      }
    };
    window.addEventListener("focus", handleFocus);
    window.addEventListener("visibilitychange", handleFocus);

    // 4. Background heartbeat (every 3.5s when visible)
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        silentRevalidate();
      }
    }, 3500);

    return () => {
      unsubDiamonds();
      unsubOrders();
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("visibilitychange", handleFocus);
      clearInterval(interval);
    };
  }, [silentRevalidate]);

  return {
    refetch: loadDiamonds,
  };
}
