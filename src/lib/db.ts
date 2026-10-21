import mongoose from "mongoose";
import dns from "node:dns";

function configureDns() {
  try {
    dns.setDefaultResultOrder?.("ipv4first");
    dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
  } catch {
    // Ignore in restricted environments
  }
}

configureDns();

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export interface IDatabaseHealth {
  status: "CONNECTED" | "DISCONNECTED" | "CONNECTING" | "UNCONFIGURED";
  readyState: number;
  dbName: string;
  pingMs?: number;
  pool: {
    maxPoolSize: number;
    minPoolSize: number;
    maxIdleTimeMS: number;
  };
}

/**
 * Resilient Connection Attempt with Automated Transient DNS Retry
 * Catches cold-start SRV lookup timeouts or ECONNREFUSED before surfacing warnings.
 */
async function attemptMongooseConnect(
  uri: string,
  opts: mongoose.ConnectOptions,
  maxAttempts: number = 2
): Promise<typeof mongoose> {
  let lastError: Error | unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      configureDns();
      return await mongoose.connect(uri, opts);
    } catch (err: unknown) {
      lastError = err;
      const errorMsg = err instanceof Error ? err.message : String(err);
      const isTransientDns =
        errorMsg.includes("querySrv") ||
        errorMsg.includes("ECONNREFUSED") ||
        errorMsg.includes("ETIMEDOUT") ||
        errorMsg.includes("ENOTFOUND");

      if (isTransientDns && attempt < maxAttempts) {
        // Switch to Cloudflare / Google alternate DNS and wait 250ms for Windows network socket to settle
        try {
          dns.setServers(["1.1.1.1", "8.8.8.8", "8.8.4.4"]);
        } catch {
          // ignore
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  if (!MONGODB_URI) {
    // Graceful fallback mode if MongoDB URI is not yet configured
    return null;
  }

  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    /**
     * Tier-1 Enterprise Connection Pool Options:
     * - maxPoolSize: 10 prevents serverless autoscaling from overwhelming MongoDB Atlas limits.
     * - minPoolSize: 2 retains warm sockets across lambdas to eliminate cold-start latencies.
     * - w: 'majority' & retryWrites: true ensures zero data-loss on financial/order updates.
     */
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      dbName: "diamond_luxury",
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      writeConcern: {
        w: "majority",
      },
    };

    cached.promise = attemptMongooseConnect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    console.error("⚠️ [MongoDB Connection Warning]:", e instanceof Error ? e.message : e);
    return null;
  }
}

/**
 * Diagnostic Health Check for MongoDB Connection Pool & Latency.
 */
export async function getDatabaseHealth(): Promise<IDatabaseHealth> {
  if (!MONGODB_URI) {
    return {
      status: "UNCONFIGURED",
      readyState: 0,
      dbName: "none",
      pool: { maxPoolSize: 10, minPoolSize: 2, maxIdleTimeMS: 30000 },
    };
  }

  const conn = await connectToDatabase();
  const readyState = conn?.connection.readyState ?? 0;
  const statusMap: Record<number, IDatabaseHealth["status"]> = {
    0: "DISCONNECTED",
    1: "CONNECTED",
    2: "CONNECTING",
    3: "DISCONNECTED",
  };

  let pingMs: number | undefined;
  if (conn && readyState === 1 && conn.connection.db) {
    const start = Date.now();
    try {
      await conn.connection.db.admin().ping();
      pingMs = Date.now() - start;
    } catch {
      pingMs = undefined;
    }
  }

  return {
    status: statusMap[readyState] || "DISCONNECTED",
    readyState,
    dbName: conn?.connection.name || "diamond_luxury",
    pingMs,
    pool: {
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
    },
  };
}
