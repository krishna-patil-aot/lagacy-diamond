import { IPostalLookupResult } from "@/types/postal.types";

// In-memory cache to prevent duplicate network calls
const postalMemoryCache = new Map<string, IPostalLookupResult>();

// Instant offline dictionary of major Indian trade, metropolitan, and gem hubs (3-digit prefix)
const INDIA_PREFIX_HUBS: Record<string, { city: string; state: string }> = {
  "400": { city: "Mumbai", state: "Maharashtra" },
  "401": { city: "Thane", state: "Maharashtra" },
  "411": { city: "Pune", state: "Maharashtra" },
  "410": { city: "Navi Mumbai", state: "Maharashtra" },
  "110": { city: "New Delhi", state: "Delhi" },
  "122": { city: "Gurugram", state: "Haryana" },
  "201": { city: "Noida", state: "Uttar Pradesh" },
  "395": { city: "Surat", state: "Gujarat" }, // Diamond Hub
  "380": { city: "Ahmedabad", state: "Gujarat" },
  "390": { city: "Vadodara", state: "Gujarat" },
  "360": { city: "Rajkot", state: "Gujarat" },
  "560": { city: "Bengaluru", state: "Karnataka" },
  "500": { city: "Hyderabad", state: "Telangana" },
  "600": { city: "Chennai", state: "Tamil Nadu" },
  "700": { city: "Kolkata", state: "West Bengal" },
  "302": { city: "Jaipur", state: "Rajasthan" }, // Gemstone Hub
  "682": { city: "Kochi", state: "Kerala" },
  "452": { city: "Indore", state: "Madhya Pradesh" },
  "226": { city: "Lucknow", state: "Uttar Pradesh" },
  "160": { city: "Chandigarh", state: "Chandigarh" },
};

// Instant offline dictionary of major US hubs (3-digit prefix)
const US_PREFIX_HUBS: Record<string, { city: string; state: string }> = {
  "100": { city: "New York", state: "New York" },
  "101": { city: "New York", state: "New York" },
  "900": { city: "Los Angeles", state: "California" },
  "902": { city: "Beverly Hills", state: "California" },
  "941": { city: "San Francisco", state: "California" },
  "606": { city: "Chicago", state: "Illinois" },
  "331": { city: "Miami", state: "Florida" },
  "750": { city: "Dallas", state: "Texas" },
  "770": { city: "Houston", state: "Texas" },
  "981": { city: "Seattle", state: "Washington" },
  "021": { city: "Boston", state: "Massachusetts" },
  "891": { city: "Las Vegas", state: "Nevada" },
};

interface IIndiaPostOffice {
  Name?: string;
  District?: string;
  State?: string;
}

interface IIndiaPostResponse {
  Status: string;
  PostOffice?: IIndiaPostOffice[];
}

interface IZippopotamPlace {
  "place name"?: string;
  state?: string;
}

interface IZippopotamResponse {
  places?: IZippopotamPlace[];
}

/**
 * Looks up city and state for a postal code.
 * Uses 3-tier cascade: In-memory cache -> Instant offline hub dictionary -> Public open Postal API.
 */
export async function lookupPostalCodeDetails(
  postalCode: string,
  country: string = "India"
): Promise<IPostalLookupResult | null> {
  const cleanCode = postalCode.replace(/[^\w]/g, "").toUpperCase();
  if (!cleanCode) return null;

  const normalizedCountry = country.trim().toLowerCase();
  const isIndia = normalizedCountry === "india" || normalizedCountry === "in";
  const isUS =
    normalizedCountry === "united states" ||
    normalizedCountry === "usa" ||
    normalizedCountry === "us";

  const cacheKey = `${isIndia ? "IN" : isUS ? "US" : "OTHER"}:${cleanCode}`;

  // 1. Check in-memory cache
  if (postalMemoryCache.has(cacheKey)) {
    return postalMemoryCache.get(cacheKey) || null;
  }

  // 2. Fast-path offline dictionary
  if (isIndia && cleanCode.length === 6 && /^\d{6}$/.test(cleanCode)) {
    const prefix = cleanCode.slice(0, 3);
    const hub = INDIA_PREFIX_HUBS[prefix];
    if (hub) {
      const result: IPostalLookupResult = {
        city: hub.city,
        state: hub.state,
        country: "India",
        postalCode: cleanCode,
        source: "CACHE",
      };
      postalMemoryCache.set(cacheKey, result);
      // Run background full query to enrich district if needed, return hub immediately
      void enrichIndiaPostAsync(cleanCode, cacheKey);
      return result;
    }
  } else if (isUS && cleanCode.length === 5 && /^\d{5}$/.test(cleanCode)) {
    const prefix = cleanCode.slice(0, 3);
    const hub = US_PREFIX_HUBS[prefix];
    if (hub) {
      const result: IPostalLookupResult = {
        city: hub.city,
        state: hub.state,
        country: "United States",
        postalCode: cleanCode,
        source: "CACHE",
      };
      postalMemoryCache.set(cacheKey, result);
      return result;
    }
  }

  // 3. Network lookup via free open APIs
  if (isIndia && cleanCode.length === 6 && /^\d{6}$/.test(cleanCode)) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`https://api.postalpincode.in/pincode/${cleanCode}`, {
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = (await res.json()) as IIndiaPostResponse[];
        if (
          Array.isArray(data) &&
          data.length > 0 &&
          data[0].Status === "Success" &&
          Array.isArray(data[0].PostOffice) &&
          data[0].PostOffice.length > 0
        ) {
          const firstOffice = data[0].PostOffice[0];
          const district = firstOffice.District || firstOffice.Name || "";
          const state = firstOffice.State || "";

          if (district && state) {
            const result: IPostalLookupResult = {
              city: district,
              state,
              district,
              country: "India",
              postalCode: cleanCode,
              source: "INDIA_POST",
            };
            postalMemoryCache.set(cacheKey, result);
            return result;
          }
        }
      }
    } catch {
      // Ignore network timeout
    }
  } else if (isUS && cleanCode.length === 5 && /^\d{5}$/.test(cleanCode)) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`https://api.zippopotam.us/us/${cleanCode}`, {
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = (await res.json()) as IZippopotamResponse;
        if (data.places && data.places.length > 0) {
          const place = data.places[0];
          const city = place["place name"] || "";
          const state = place.state || "";

          if (city && state) {
            const result: IPostalLookupResult = {
              city,
              state,
              country: "United States",
              postalCode: cleanCode,
              source: "ZIPPOPOTAM",
            };
            postalMemoryCache.set(cacheKey, result);
            return result;
          }
        }
      }
    } catch {
      // Ignore
    }
  }

  return null;
}

async function enrichIndiaPostAsync(cleanCode: string, cacheKey: string): Promise<void> {
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanCode}`);
    if (res.ok) {
      const data = (await res.json()) as IIndiaPostResponse[];
      if (
        Array.isArray(data) &&
        data.length > 0 &&
        data[0].Status === "Success" &&
        Array.isArray(data[0].PostOffice) &&
        data[0].PostOffice.length > 0
      ) {
        const office = data[0].PostOffice[0];
        if (office.District && office.State) {
          postalMemoryCache.set(cacheKey, {
            city: office.District,
            state: office.State,
            district: office.District,
            country: "India",
            postalCode: cleanCode,
            source: "INDIA_POST",
          });
        }
      }
    }
  } catch {
    // Ignore background enrichment error
  }
}

