/**
 * Enterprise Zero-Trust & Security Hardening Types
 * Strict typing for security headers, CORS policies, NoSQL injection defense, and audit logging.
 */

export const SECURITY_EVENT_TYPES = {
  AUTH_SUCCESS: "AUTH_SUCCESS",
  AUTH_FAILURE: "AUTH_FAILURE",
  BRUTE_FORCE_ATTEMPT: "BRUTE_FORCE_ATTEMPT",
  TOKEN_REUSE_DETECTED: "TOKEN_REUSE_DETECTED",
  SUSPICIOUS_PAYLOAD: "SUSPICIOUS_PAYLOAD",
  UNAUTHORIZED_ACCESS: "UNAUTHORIZED_ACCESS",
  RATE_LIMIT_TRIGGERED: "RATE_LIMIT_TRIGGERED",
  ADMIN_MUTATION: "ADMIN_MUTATION",
  CORS_VIOLATION: "CORS_VIOLATION",
} as const;

export type SecurityEventType = (typeof SECURITY_EVENT_TYPES)[keyof typeof SECURITY_EVENT_TYPES];

export const SECURITY_SEVERITIES = {
  INFO: "INFO",
  WARN: "WARN",
  CRITICAL: "CRITICAL",
} as const;

export type SecuritySeverity = (typeof SECURITY_SEVERITIES)[keyof typeof SECURITY_SEVERITIES];

export interface ISecurityAuditRecord {
  auditId: string;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  ipAddress: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  userId?: string;
  userEmail?: string;
  details?: Record<string, string | number | boolean | null>;
  timestamp: string;
}

export interface ISecurityAuditSummary {
  auditId: string;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  ipAddress: string;
  endpoint?: string;
  userEmail?: string;
  detailsSnippet?: string;
  timestamp: string;
}

export interface ISecurityHeaderStatus {
  name: string;
  directive: string;
  description: string;
  status: "ACTIVE" | "PENDING" | "WARNING";
}

export interface ISecurityTelemetry {
  securityScore: number;
  grade: "A+" | "A" | "B" | "C";
  zeroTrustStatus: "ENFORCED" | "DEGRADED";
  threatStats: {
    totalEvents24h: number;
    blockedNoSqlInjections: number;
    authFailures24h: number;
    rateLimitTriggers24h: number;
    suspiciousAlerts: number;
  };
  headers: ISecurityHeaderStatus[];
  recentEvents: ISecurityAuditSummary[];
  timestamp: string;
}

export interface ISanitizeResult<T> {
  sanitized: T;
  hasModifications: boolean;
  detectedThreats: string[];
}
