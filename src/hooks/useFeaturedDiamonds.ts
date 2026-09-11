import { useState, useEffect } from "react";
import { IDiamond } from "@/types/diamond.types";

export interface IUseFeaturedDiamondsReturn {
  featuredDiamonds: IDiamond[];
  isLoading: boolean;
  error: string | null;
}

export function useFeaturedDiamonds(): IUseFeaturedDiamondsReturn {
  const [featuredDiamonds, setFeaturedDiamonds] = useState<IDiamond[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadFeatured() {
      try {
        const res = await fetch("/api/diamonds?limit=6&sortBy=featured");
        const json = await res.json();
        if (json.success && isMounted) {
          setFeaturedDiamonds(json.data);
        }
      } catch (err) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : "Failed to load featured diamonds";
          setError(msg);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadFeatured();

    return () => {
      isMounted = false;
    };
  }, []);

  return { featuredDiamonds, isLoading, error };
}
