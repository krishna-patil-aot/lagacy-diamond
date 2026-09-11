import { useState, useEffect, useCallback } from "react";
import { IDiamond } from "@/types/diamond.types";

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

  return {
    diamond,
    isLoading,
    error,
    selectedImage,
    setSelectedImage,
    refetch: fetchDetails,
  };
}
