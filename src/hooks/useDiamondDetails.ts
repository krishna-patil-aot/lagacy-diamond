import { useState, useEffect, useCallback } from "react";
import { IDiamond } from "@/types/diamond.types";
import { subscribeToDiamondEvents, DIAMOND_EVENTS } from "@/lib/diamond-events";

export interface IUseDiamondDetailsReturn {
  diamond: IDiamond | null;
  isLoading: boolean;
  error: string | null;
  selectedImage: string | null;
  setSelectedImage: (url: string) => void;
  refetch: () => void;
}

export function useDiamondDetails(id: string): IUseDiamondDetailsReturn {
  const [diamond, setDiamond] = useState<IDiamond | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/diamonds/${id}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Diamond details not found");
      }

      setDiamond(json.data);
      if (json.data.images && json.data.images.length > 0) {
        setSelectedImage(json.data.images[0]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error loading diamond details";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let ignore = false;

    async function load() {
      try {
        const res = await fetch(`/api/diamonds/${id}`);
        const json = await res.json();

        if (!ignore) {
          if (!res.ok || !json.success) {
            throw new Error(json.error || "Diamond details not found");
          }
          setDiamond(json.data);
          if (json.data.images && json.data.images.length > 0) {
            setSelectedImage(json.data.images[0]);
          }
        }
      } catch (err) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "Error loading diamond details";
          setError(msg);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [id]);

  // Silent background revalidation on real-time stock/specimen change
  const silentRevalidate = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/diamonds/${id}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setDiamond(json.data);
      }
    } catch {
      // Ignore background sync errors
    }
  }, [id]);

  // Real-time synchronization bus + focus + heartbeat
  useEffect(() => {
    if (!id) return;

    // 1. Subscribe to real-time events for this diamond or inventory changes
    const unsubscribe = subscribeToDiamondEvents((payload) => {
      if (
        !payload ||
        !payload.diamondId ||
        payload.diamondId === id ||
        payload.type === DIAMOND_EVENTS.STOCK_CHANGED
      ) {
        silentRevalidate();
      }
    });

    // 2. Focus / visibility revalidation
    const handleFocus = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        silentRevalidate();
      }
    };
    window.addEventListener("focus", handleFocus);
    window.addEventListener("visibilitychange", handleFocus);

    // 3. Heartbeat (every 3s when visible)
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        silentRevalidate();
      }
    }, 3000);

    return () => {
      unsubscribe();
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("visibilitychange", handleFocus);
      clearInterval(interval);
    };
  }, [id, silentRevalidate]);

  return {
    diamond,
    isLoading,
    error,
    selectedImage,
    setSelectedImage,
    refetch: fetchDetails,
  };
}
