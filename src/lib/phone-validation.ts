import validator from "validator";
import { z } from "zod";
import {
  SupportedCountryCode,
  ICountryInfo,
  IPhoneValidationResult,
} from "@/types/phone.types";

export const POPULAR_COUNTRIES: ICountryInfo[] = [
  {
    code: "IN",
    name: "India",
    dialCode: "+91",
    flag: "🇮🇳",
    formatPlaceholder: "98765 43210",
    nationalLength: 10,
    mobilePrefixRegex: /^[6-9]/,
    formatPattern: (d) =>
      d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5, 10)}` : d,
  },
  {
    code: "US",
    name: "United States",
    dialCode: "+1",
    flag: "🇺🇸",
    formatPlaceholder: "(555) 123-4567",
    nationalLength: 10,
    mobilePrefixRegex: /^[2-9]/,
    formatPattern: (d) => {
      if (d.length > 6) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
      if (d.length > 3) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
      if (d.length > 0) return `(${d}`;
      return d;
    },
  },
  {
    code: "GB",
    name: "United Kingdom",
    dialCode: "+44",
    flag: "🇬🇧",
    formatPlaceholder: "7911 123456",
    nationalLength: 10,
    mobilePrefixRegex: /^7/,
    formatPattern: (d) =>
      d.length > 4 ? `${d.slice(0, 4)} ${d.slice(4, 10)}` : d,
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    dialCode: "+971",
    flag: "🇦🇪",
    formatPlaceholder: "50 123 4567",
    nationalLength: 9,
    mobilePrefixRegex: /^5/,
    formatPattern: (d) => {
      if (d.length > 5) return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 9)}`;
      if (d.length > 2) return `${d.slice(0, 2)} ${d.slice(2)}`;
      return d;
    },
  },
  {
    code: "CH",
    name: "Switzerland",
    dialCode: "+41",
    flag: "🇨🇭",
    formatPlaceholder: "79 123 45 67",
    nationalLength: 9,
    mobilePrefixRegex: /^7/,
    formatPattern: (d) => {
      if (d.length > 7) return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7, 9)}`;
      if (d.length > 5) return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`;
      if (d.length > 2) return `${d.slice(0, 2)} ${d.slice(2)}`;
      return d;
    },
  },
  {
    code: "CA",
    name: "Canada",
    dialCode: "+1",
    flag: "🇨🇦",
    formatPlaceholder: "(555) 123-4567",
    nationalLength: 10,
    mobilePrefixRegex: /^[2-9]/,
    formatPattern: (d) => {
      if (d.length > 6) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
      if (d.length > 3) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
      return d;
    },
  },
  {
    code: "AU",
    name: "Australia",
    dialCode: "+61",
    flag: "🇦🇺",
    formatPlaceholder: "412 345 678",
    nationalLength: 9,
    mobilePrefixRegex: /^4/,
    formatPattern: (d) => {
      if (d.length > 6) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 9)}`;
      if (d.length > 3) return `${d.slice(0, 3)} ${d.slice(3)}`;
      return d;
    },
  },
  {
    code: "SG",
    name: "Singapore",
    dialCode: "+65",
    flag: "🇸🇬",
    formatPlaceholder: "8123 4567",
    nationalLength: 8,
    mobilePrefixRegex: /^[89]/,
    formatPattern: (d) =>
      d.length > 4 ? `${d.slice(0, 4)} ${d.slice(4, 8)}` : d,
  },
  {
    code: "DE",
    name: "Germany",
    dialCode: "+49",
    flag: "🇩🇪",
    formatPlaceholder: "151 12345678",
    nationalLength: 11,
    mobilePrefixRegex: /^1[567]/,
    formatPattern: (d) =>
      d.length > 3 ? `${d.slice(0, 3)} ${d.slice(3, 11)}` : d,
  },
  {
    code: "FR",
    name: "France",
    dialCode: "+33",
    flag: "🇫🇷",
    formatPlaceholder: "6 12 34 56 78",
    nationalLength: 9,
    mobilePrefixRegex: /^[67]/,
    formatPattern: (d) => {
      const parts: string[] = [];
      if (d.length > 0) parts.push(d.slice(0, 1));
      for (let i = 1; i < d.length && i < 9; i += 2) {
        parts.push(d.slice(i, i + 2));
      }
      return parts.join(" ");
    },
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    dialCode: "+966",
    flag: "🇸🇦",
    formatPlaceholder: "50 123 4567",
    nationalLength: 9,
    mobilePrefixRegex: /^5/,
    formatPattern: (d) =>
      d.length > 2 ? `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 9)}` : d,
  },
  {
    code: "QA",
    name: "Qatar",
    dialCode: "+974",
    flag: "🇶🇦",
    formatPlaceholder: "3312 3456",
    nationalLength: 8,
    mobilePrefixRegex: /^[3567]/,
    formatPattern: (d) =>
      d.length > 4 ? `${d.slice(0, 4)} ${d.slice(4, 8)}` : d,
  },
  {
    code: "HK",
    name: "Hong Kong",
    dialCode: "+852",
    flag: "🇭🇰",
    formatPlaceholder: "9123 4567",
    nationalLength: 8,
    mobilePrefixRegex: /^[569]/,
    formatPattern: (d) =>
      d.length > 4 ? `${d.slice(0, 4)} ${d.slice(4, 8)}` : d,
  },
  {
    code: "JP",
    name: "Japan",
    dialCode: "+81",
    flag: "🇯🇵",
    formatPlaceholder: "90 1234 5678",
    nationalLength: 10,
    mobilePrefixRegex: /^[789]0/,
    formatPattern: (d) =>
      d.length > 2 ? `${d.slice(0, 2)} ${d.slice(2, 6)} ${d.slice(6, 10)}` : d,
  },
  {
    code: "IT",
    name: "Italy",
    dialCode: "+39",
    flag: "🇮🇹",
    formatPlaceholder: "312 345 6789",
    nationalLength: 10,
    mobilePrefixRegex: /^3/,
    formatPattern: (d) =>
      d.length > 3 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 10)}` : d,
  },
];

/**
 * Normalizes input by removing non-digits (preserves leading +)
 */
export function extractDigits(input: string): string {
  return input.replace(/[^\d]/g, "");
}

/**
 * Detect country from phone string if it starts with + dial code
 */
export function detectCountryFromPhone(
  input: string,
  fallback: SupportedCountryCode = "IN"
): { country: SupportedCountryCode; nationalDigits: string } {
  const trimmed = input.trim();
  if (trimmed.startsWith("+")) {
    const rawDigits = extractDigits(trimmed);
    // Sort by longest dialCode first to match +971 before +9
    const sorted = [...POPULAR_COUNTRIES].sort(
      (a, b) => b.dialCode.length - a.dialCode.length
    );
    for (const c of sorted) {
      const dialDigits = extractDigits(c.dialCode);
      if (rawDigits.startsWith(dialDigits)) {
        return {
          country: c.code,
          nationalDigits: rawDigits.slice(dialDigits.length),
        };
      }
    }
  }

  return {
    country: fallback,
    nationalDigits: extractDigits(trimmed),
  };
}

/**
 * Validates any mobile number against standard international and national rules
 */
export function validateMobileNumber(
  input: string,
  defaultCountry: SupportedCountryCode = "IN"
): IPhoneValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      isValid: false,
      isMobile: false,
      e164: "",
      formattedInternational: "",
      formattedNational: "",
      error: "Phone number is required",
    };
  }

  const { country, nationalDigits } = detectCountryFromPhone(trimmed, defaultCountry);
  const countryConfig =
    POPULAR_COUNTRIES.find((c) => c.code === country) || POPULAR_COUNTRIES[0];

  const fullInternational = `${countryConfig.dialCode}${nationalDigits}`;
  const fullE164 = `${countryConfig.dialCode}${nationalDigits}`;

  // 1. Length validation according to standard numbering plan
  const expectedLen = countryConfig.nationalLength;
  if (nationalDigits.length < expectedLen) {
    return {
      isValid: false,
      isMobile: false,
      e164: fullE164,
      formattedInternational: `${countryConfig.dialCode} ${countryConfig.formatPattern(nationalDigits)}`,
      formattedNational: countryConfig.formatPattern(nationalDigits),
      country,
      countryCallingCode: countryConfig.dialCode,
      error: `${countryConfig.name} mobile numbers require ${expectedLen} digits (entered ${nationalDigits.length})`,
    };
  }

  if (nationalDigits.length > expectedLen + 1) {
    return {
      isValid: false,
      isMobile: false,
      e164: fullE164,
      formattedInternational: `${countryConfig.dialCode} ${countryConfig.formatPattern(nationalDigits)}`,
      formattedNational: countryConfig.formatPattern(nationalDigits),
      country,
      countryCallingCode: countryConfig.dialCode,
      error: `Number too long for ${countryConfig.name} (${nationalDigits.length} digits, expected ${expectedLen})`,
    };
  }

  // 2. Mobile prefix verification
  const isPrefixValid = countryConfig.mobilePrefixRegex.test(nationalDigits);
  if (!isPrefixValid) {
    return {
      isValid: false,
      isMobile: false,
      e164: fullE164,
      formattedInternational: `${countryConfig.dialCode} ${countryConfig.formatPattern(nationalDigits)}`,
      formattedNational: countryConfig.formatPattern(nationalDigits),
      country,
      countryCallingCode: countryConfig.dialCode,
      error: `Invalid mobile prefix for ${countryConfig.name} (e.g. ${countryConfig.formatPlaceholder})`,
    };
  }

  // 3. Reject all identical repetitive digits (e.g., 0000000000, 1111111111)
  const isRepetitive = /^(\d)\1+$/.test(nationalDigits);
  if (isRepetitive) {
    return {
      isValid: false,
      isMobile: false,
      e164: fullE164,
      formattedInternational: `${countryConfig.dialCode} ${countryConfig.formatPattern(nationalDigits)}`,
      formattedNational: countryConfig.formatPattern(nationalDigits),
      country,
      countryCallingCode: countryConfig.dialCode,
      error: "Please enter a valid active mobile number",
    };
  }

  // 4. International standard validator cross-check
  const isValidatorPassed =
    validator.isMobilePhone(fullInternational, "any", { strictMode: false }) ||
    validator.isMobilePhone(nationalDigits, "any", { strictMode: false });

  if (!isValidatorPassed && nationalDigits.length !== expectedLen) {
    return {
      isValid: false,
      isMobile: false,
      e164: fullE164,
      formattedInternational: `${countryConfig.dialCode} ${countryConfig.formatPattern(nationalDigits)}`,
      formattedNational: countryConfig.formatPattern(nationalDigits),
      country,
      countryCallingCode: countryConfig.dialCode,
      error: `Invalid international mobile number for ${countryConfig.name}`,
    };
  }

  const formattedNational = countryConfig.formatPattern(nationalDigits);
  const formattedInternational = `${countryConfig.dialCode} ${formattedNational}`;

  return {
    isValid: true,
    isMobile: true,
    e164: fullE164,
    formattedInternational,
    formattedNational,
    country,
    countryCallingCode: countryConfig.dialCode,
  };
}

/**
 * Formats a phone number as the user types
 */
export function formatPhoneAsYouType(
  input: string,
  country: SupportedCountryCode = "IN"
): string {
  if (!input) return "";
  const { country: detectedCountry, nationalDigits } = detectCountryFromPhone(input, country);
  const countryConfig =
    POPULAR_COUNTRIES.find((c) => c.code === detectedCountry) || POPULAR_COUNTRIES[0];

  return countryConfig.formatPattern(nationalDigits);
}

/**
 * Resolve Country Name from Country Code (e.g. "IN" -> "India")
 */
export function getCountryNameByCode(code: SupportedCountryCode): string {
  const match = POPULAR_COUNTRIES.find((c) => c.code === code);
  return match?.name || "India";
}

/**
 * Resolve Country Code from Country Name (e.g. "India" -> "IN")
 */
export function getCountryCodeByName(name: string): SupportedCountryCode | undefined {
  if (!name) return undefined;
  const normalized = name.trim().toLowerCase();
  const match = POPULAR_COUNTRIES.find(
    (c) => c.name.toLowerCase() === normalized || c.code.toLowerCase() === normalized
  );
  return match?.code;
}

/**
 * Reusable Zod schema for international standard mobile numbers
 */
export const phoneZodSchema = z
  .string()
  .min(7, "Phone number is required")
  .refine(
    (val) => {
      if (!val) return false;
      const res = validateMobileNumber(val);
      return res.isValid;
    },
    {
      message: "Please enter a valid standard mobile number (e.g. +91 98765 43210)",
    }
  );
