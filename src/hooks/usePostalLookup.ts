"use client";

import { useState, useCallback, useRef } from "react";
import { lookupPostalCodeDetails } from "@/lib/postal-service";
import { IPostalLookupResult, IUsePostalLookupReturn } from "@/types/postal.types";

export interface IUsePostalLookupOptions {
  onAutoFill?: (result: IPostalLookupResult) => void;
}

export function usePostalLookup(
  options: IUsePostalLookupOptions = {}
): IUsePostalLookupReturn {
  const { onAutoFill } = options;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detectedInfo, setDetectedInfo] = useState<IPostalLookupResult | null>(null);
  const lastQueriedRef = useRef<string>("");

  const lookupPostalCode = useCallback(
    async (postalCode: string, country: string = "India"): Promise<IPostalLookupResult | null> => {
      const cleanCode = postalCode.replace(/[^\w]/g, "");
      const normalizedCountry = country.trim().toLowerCase();

      // Check whether length meets standard requirements before triggering API
      const isIndia = normalizedCountry === "india" || normalizedCountry === "in";
      const isUS =
        normalizedCountry === "united states" ||
        normalizedCountry === "usa" ||
        normalizedCountry === "us";

      if (isIndia && cleanCode.length !== 6) {
        setDetectedInfo(null);
        return null;
      }

      if (isUS && cleanCode.length !== 5) {
        setDetectedInfo(null);
        return null;
      }

      const lookupKey = `${country}:${cleanCode}`;
      if (lastQueriedRef.current === lookupKey && detectedInfo) {
        return detectedInfo;
      }

      setIsLoading(true);
      lastQueriedRef.current = lookupKey;

      try {
        const result = await lookupPostalCodeDetails(cleanCode, country);
        setDetectedInfo(result);

        if (result && onAutoFill) {
          onAutoFill(result);
        }

        return result;
      } catch {
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [onAutoFill, detectedInfo]
  );

  return {
    isLoading,
    detectedInfo,
    lookupPostalCode,
  };
}

