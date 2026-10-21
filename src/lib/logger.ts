import {
  LogLevel,
  LogMetadata,
  IStructuredLogEntry,
  ILogSerializedError,
} from "@/types/observability.types";

const SERVICE_NAME = "diamond-enterprise-platform";
const SENSITIVE_KEY_PATTERNS = [
  /pass/i,
  /secret/i,
  /token/i,
  /auth/i,
  /bearer/i,
  /key/i,
  /cred/i,
  /cookie/i,
];

/**
 * Redacts confidential credentials, tokens, and keys from telemetry payloads
 */
function sanitizeTelemetryMetadata(metadata?: LogMetadata): LogMetadata | undefined {
  if (!metadata) return undefined;

  const sanitized: LogMetadata = {};
  for (const [key, value] of Object.entries(metadata)) {
    const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
    if (isSensitive) {
      if (typeof value === "string") {
        sanitized[key] = value.length > 8 ? `${value.slice(0, 3)}***${value.slice(-3)}` : "[REDACTED]";
      } else {
        sanitized[key] = "[REDACTED]";
      }
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Safely serializes JavaScript Error instances into structured log objects
 */
function serializeError(err: unknown): ILogSerializedError | undefined {
  if (!err) return undefined;

  if (err instanceof Error) {
    const serialized: ILogSerializedError = {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    };

    if ("code" in err && (typeof err.code === "string" || typeof err.code === "number")) {
      serialized.code = err.code;
    }

    return serialized;
  }

  return {
    name: "UnknownError",
    message: typeof err === "string" ? err : String(err),
  };
}

class EnterpriseLogger {
  private contextName?: string;
  private defaultMeta?: LogMetadata;

  constructor(contextName?: string, defaultMeta?: LogMetadata) {
    this.contextName = contextName;
    this.defaultMeta = defaultMeta;
  }

  public child(contextName: string, defaultMeta?: LogMetadata): EnterpriseLogger {
    const mergedMeta: LogMetadata = {
      ...(this.defaultMeta || {}),
      ...(defaultMeta || {}),
    };
    return new EnterpriseLogger(
      this.contextName ? `${this.contextName}:${contextName}` : contextName,
      mergedMeta
    );
  }

  private write(
    level: LogLevel,
    message: string,
    metadata?: LogMetadata,
    error?: unknown,
    latencyMs?: number
  ): void {
    const isProd = process.env.NODE_ENV === "production";
    const mergedMeta: LogMetadata = {
      ...(this.defaultMeta || {}),
      ...(metadata || {}),
    };

    const entry: IStructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: SERVICE_NAME,
      environment: process.env.NODE_ENV || "development",
      message,
      context: this.contextName,
      latencyMs,
      metadata: sanitizeTelemetryMetadata(mergedMeta),
      error: serializeError(error),
    };

    if (isProd) {
      // Production 12-factor NDJSON format for Datadog / CloudWatch / GCP Stackdriver
      const jsonLine = JSON.stringify(entry);
      if (level === "error" || level === "fatal") {
        process.stderr.write(`${jsonLine}\n`);
      } else {
        process.stdout.write(`${jsonLine}\n`);
      }
    } else {
      // Development high-readability terminal output
      const prefix = `[${entry.timestamp.slice(11, 19)}] [${level.toUpperCase()}]${entry.context ? ` [${entry.context}]` : ""}`;
      const latencyStr = latencyMs !== undefined ? ` (${latencyMs.toFixed(1)}ms)` : "";

      if (level === "error" || level === "fatal") {
        console.error(`${prefix} ❌ ${message}${latencyStr}`, entry.metadata || "", entry.error || "");
      } else if (level === "warn") {
        console.warn(`${prefix} ⚠️ ${message}${latencyStr}`, entry.metadata || "");
      } else {
        console.log(`${prefix} ℹ️ ${message}${latencyStr}`, entry.metadata || "");
      }
    }
  }

  public debug(message: string, metadata?: LogMetadata): void {
    if (process.env.NODE_ENV === "production" && process.env.LOG_LEVEL !== "debug") return;
    this.write("debug", message, metadata);
  }

  public info(message: string, metadata?: LogMetadata): void {
    this.write("info", message, metadata);
  }

  public warn(message: string, metadata?: LogMetadata): void {
    this.write("warn", message, metadata);
  }

  public error(message: string, error?: unknown, metadata?: LogMetadata): void {
    this.write("error", message, metadata, error);
  }

  public fatal(message: string, error?: unknown, metadata?: LogMetadata): void {
    this.write("fatal", message, metadata, error);
  }

  /**
   * APM Performance Tracer: measures execution duration of an async or synchronous block.
   *
   * @example
   * const stopTimer = logger.time("mongo:querySolitaires", { carat: 1.5 });
   * const diamonds = await fetchDiamonds();
   * stopTimer({ count: diamonds.length });
   */
  public time(
    label: string,
    initialMeta?: LogMetadata
  ): (extraMeta?: LogMetadata) => number {
    const startTime = performance.now();
    return (extraMeta?: LogMetadata): number => {
      const durationMs = performance.now() - startTime;
      const combinedMeta: LogMetadata = {
        ...(initialMeta || {}),
        ...(extraMeta || {}),
      };
      this.write("info", `[APM] ${label}`, combinedMeta, undefined, durationMs);
      return durationMs;
    };
  }
}

export const logger = new EnterpriseLogger();
export { EnterpriseLogger };
