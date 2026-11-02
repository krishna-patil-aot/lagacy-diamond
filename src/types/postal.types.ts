export interface IPostalLookupResult {
  city: string;
  state: string;
  district?: string;
  country: string;
  postalCode: string;
  source: "CACHE" | "INDIA_POST" | "ZIPPOPOTAM" | "FALLBACK";
}

export interface IUsePostalLookupReturn {
  isLoading: boolean;
  detectedInfo: IPostalLookupResult | null;
  lookupPostalCode: (
    postalCode: string,
    country: string
  ) => Promise<IPostalLookupResult | null>;
}

