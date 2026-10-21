import { ISanitizeResult } from "@/types/security.types";

const DANGEROUS_MONGO_KEY_REGEX = /^\$|\./;
const DANGEROUS_HTML_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|javascript:|onerror\s*=|onload\s*=|onclick\s*=|onmouseover\s*=/gi;

/**
 * Deeply sanitizes an input against NoSQL injection (strips $ operators and . paths)
 */
export function sanitizeMongoInput<T>(input: T): ISanitizeResult<T> {
  const detectedThreats: string[] = [];
  let hasModifications = false;

  function recursiveSanitize(val: unknown): unknown {
    if (val === null || val === undefined) {
      return val;
    }

    if (typeof val === "string") {
      // Remove null bytes
      if (val.includes("\0")) {
        hasModifications = true;
        detectedThreats.push("Null byte injection detected");
        val = val.replace(/\0/g, "");
      }
      return val;
    }

    if (Array.isArray(val)) {
      return val.map((item) => recursiveSanitize(item));
    }

    if (typeof val === "object") {
      const sanitizedObj: Record<string, unknown> = {};
      const obj = val as Record<string, unknown>;

      for (const [key, value] of Object.entries(obj)) {
        if (DANGEROUS_MONGO_KEY_REGEX.test(key)) {
          hasModifications = true;
          detectedThreats.push(`Prohibited MongoDB operator key: ${key}`);
          // Prefix with safe underscore to disarm operator
          const disarmedKey = `_${key.replace(/^\$/, "").replace(/\./g, "_")}`;
          sanitizedObj[disarmedKey] = recursiveSanitize(value);
        } else {
          sanitizedObj[key] = recursiveSanitize(value);
        }
      }

      return sanitizedObj;
    }

    return val;
  }

  const sanitized = recursiveSanitize(input) as T;

  return {
    sanitized,
    hasModifications,
    detectedThreats,
  };
}

/**
 * Disarms dangerous cross-site scripting (XSS) patterns from text
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== "string") return "";

  return dirty
    .replace(DANGEROUS_HTML_REGEX, "")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validates whether an ID matches a genuine 24-character hexadecimal MongoDB ObjectId
 */
export function isSafeObjectId(id: string): boolean {
  if (!id || typeof id !== "string") return false;
  return /^[0-9a-fA-F]{24}$/.test(id.trim());
}

/**
 * Truncates and sanitizes a plain text string within allowed bounds
 */
export function cleanString(val: string, maxLength: number = 1000): string {
  if (!val || typeof val !== "string") return "";
  return val.trim().slice(0, maxLength);
}
