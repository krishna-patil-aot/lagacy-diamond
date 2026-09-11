import { useState, useEffect, useCallback } from "react";
import { IDiamond } from "@/types/diamond.types";
import { IFilterMeta } from "@/types/filter.types";
import { useFilterStore } from "@/store/useFilterStore";
import { useDebounce } from "./useDebounce";

export interface IUseDiamondsReturn {
  diamonds: IDiamond[];
  meta: IFilterMeta | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDiamonds(): IUseDiamondsReturn {
  const [diamonds, setDiamonds] = useState<IDiamond[]>([]);
  const [meta, setMeta] = useState<IFilterMeta | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const {
    searchQuery,
    shapes,
    minPrice,
    maxPrice,
    minCarat,
    maxCarat,
    colors,
    cuts,
    clarities,
    minDiscount,
    inStockOnly,
    sortBy,
    page,
    limit,
  } = useFilterStore();

  const debouncedSearch = useDebounce(searchQuery, 350);
  const debouncedMinPrice = useDebounce(minPrice, 200);
  const debouncedMaxPrice = useDebounce(maxPrice, 200);
  const debouncedMinCarat = useDebounce(minCarat, 200);
  const debouncedMaxCarat = useDebounce(maxCarat, 200);

  const fetchDiamonds = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (debouncedSearch) params.set("search", debouncedSearch);
      if (shapes.length > 0) shapes.forEach((s) => params.append("shape", s));
      if (colors.length > 0) colors.forEach((c) => params.append("color", c));
      if (cuts.length > 0) cuts.forEach((c) => params.append("cut", c));
      if (clarities.length > 0) clarities.forEach((c) => params.append("clarity", c));

      params.set("minPrice", String(debouncedMinPrice));
      params.set("maxPrice", String(debouncedMaxPrice));
      params.set("minCarat", String(debouncedMinCarat));
      params.set("maxCarat", String(debouncedMaxCarat));

      if (minDiscount > 0) params.set("minDiscount", String(minDiscount));
      if (inStockOnly) params.set("inStockOnly", "true");

      params.set("sortBy", sortBy);
      params.set("page", String(page));
      params.set("limit", String(limit));

      const res = await fetch(`/api/diamonds?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to fetch diamond catalog");
      }

      setDiamonds(json.data);
      setMeta(json.meta);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [
    debouncedSearch,
    shapes,
    colors,
    cuts,
    clarities,
    debouncedMinPrice,
    debouncedMaxPrice,
    debouncedMinCarat,
    debouncedMaxCarat,
    minDiscount,
    inStockOnly,
    sortBy,
    page,
    limit,
  ]);

  useEffect(() => {
    let ignore = false;

    async function execute() {
      try {
        const params = new URLSearchParams();

        if (debouncedSearch) params.set("search", debouncedSearch);
        if (shapes.length > 0) shapes.forEach((s) => params.append("shape", s));
        if (colors.length > 0) colors.forEach((c) => params.append("color", c));
        if (cuts.length > 0) cuts.forEach((c) => params.append("cut", c));
        if (clarities.length > 0) clarities.forEach((c) => params.append("clarity", c));

        params.set("minPrice", String(debouncedMinPrice));
        params.set("maxPrice", String(debouncedMaxPrice));
        params.set("minCarat", String(debouncedMinCarat));
        params.set("maxCarat", String(debouncedMaxCarat));

        if (minDiscount > 0) params.set("minDiscount", String(minDiscount));
        if (inStockOnly) params.set("inStockOnly", "true");

        params.set("sortBy", sortBy);
        params.set("page", String(page));
        params.set("limit", String(limit));

        const res = await fetch(`/api/diamonds?${params.toString()}`);
        const json = await res.json();

        if (!ignore) {
          if (!res.ok || !json.success) {
            throw new Error(json.error || "Failed to fetch diamond catalog");
          }
          setDiamonds(json.data);
          setMeta(json.meta);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "An unexpected error occurred";
          setError(msg);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    execute();

    return () => {
      ignore = true;
    };
  }, [
    debouncedSearch,
    shapes,
    colors,
    cuts,
    clarities,
    debouncedMinPrice,
    debouncedMaxPrice,
    debouncedMinCarat,
    debouncedMaxCarat,
    minDiscount,
    inStockOnly,
    sortBy,
    page,
    limit,
  ]);

  return {
    diamonds,
    meta,
    isLoading,
    error,
    refetch: fetchDiamonds,
  };
}
