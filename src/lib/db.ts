import mongoose from "mongoose";
import dns from "node:dns";

// Fix Node.js on Windows querySrv ECONNREFUSED for mongodb+srv URIs
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch {
  // Ignore in restricted environments
}

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

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  if (!MONGODB_URI) {
    // Graceful fallback mode if MongoDB URI is not yet configured
    return null;
  }

  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: "diamond_luxury",
      serverSelectionTimeoutMS: 6000,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    console.error("⚠️ [MongoDB Connection Warning]:", e instanceof Error ? e.message : e);
    return null;
  }
}
