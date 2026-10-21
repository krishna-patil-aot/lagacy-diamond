export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export type LogMetadataValue = string | number | boolean | null | undefined;

export type LogMetadata = Record<string, LogMetadataValue>;

export interface ILogSerializedError {
  name: string;
  message: string;
  stack?: string;
  code?: string | number;
}

export interface IStructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  environment: string;
  requestId?: string;
  message: string;
  context?: string;
  latencyMs?: number;
  metadata?: LogMetadata;
  error?: ILogSerializedError;
}

export type HealthStatus = "healthy" | "degraded" | "unhealthy";

export interface ISubsystemHealth {
  name: string;
  status: HealthStatus;
  latencyMs: number;
  message: string;
  lastChecked: string;
  details?: Record<string, string | number | boolean | null>;
}

export interface ISystemMemoryStats {
  heapUsedMB: number;
  heapTotalMB: number;
  rssMB: number;
  externalMB: number;
  heapUsagePercent: number;
}

export interface ISystemHealthReport {
  status: HealthStatus;
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  version: string;
  subsystems: {
    database: ISubsystemHealth;
    redisCache: ISubsystemHealth;
    queueEngine: ISubsystemHealth;
    memory: ISubsystemHealth;
    cloudinaryStorage: ISubsystemHealth;
    emailService: ISubsystemHealth;
    aiConcierge: ISubsystemHealth;
  };
  system: {
    nodeVersion: string;
    platform: string;
    memory: ISystemMemoryStats;
  };
}

export interface IHealthProbeResponse {
  success: boolean;
  status: HealthStatus;
  data: ISystemHealthReport;
}

export interface ILatencyHistoryPoint {
  timestamp: string;
  timeLabel: string;
  dbLatencyMs: number;
  redisLatencyMs: number;
}
