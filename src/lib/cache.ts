import { Redis } from "@upstash/redis";

const upstashUrl =
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;

const upstashToken =
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;

const redis =
  upstashUrl && upstashToken
    ? new Redis({
        url: upstashUrl,
        token: upstashToken,
      })
    : null;

/**
 * In-memory fallback when Upstash Redis is not configured.
 * Not suitable for production serverless deployments, but works in development.
 */
const memoryStore = new Map<string, { value: string; expiresAt: number }>();
const MEMORY_STORE_MAX_SIZE = 1000;
let lastCleanup = 0;
const CLEANUP_INTERVAL = 60000; // 1 minute

function cleanupMemoryStore(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const expiredThreshold = now;
  for (const [key, record] of memoryStore.entries()) {
    if (record.expiresAt <= expiredThreshold) {
      memoryStore.delete(key);
    }
  }

  // Max-size eviction
  if (memoryStore.size > MEMORY_STORE_MAX_SIZE) {
    const entries = Array.from(memoryStore.entries());
    entries.sort((a, b) => a[1].expiresAt - b[1].expiresAt);
    const toDelete = entries.slice(0, memoryStore.size - MEMORY_STORE_MAX_SIZE);
    for (const [key] of toDelete) {
      memoryStore.delete(key);
    }
  }
}

/**
 * Get a value from cache
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) {
    cleanupMemoryStore();
    const record = memoryStore.get(key);
    if (!record || record.expiresAt <= Date.now()) {
      memoryStore.delete(key);
      return null;
    }
    try {
      return JSON.parse(record.value) as T;
    } catch {
      return null;
    }
  }

  try {
    const value = await redis.get(key);
    if (!value) return null;
    // Handle case where value might be an object instead of string
    if (typeof value === "string") {
      return JSON.parse(value) as T;
    }
    // If value is already an object, return it directly
    return value as T;
  } catch (err) {
    console.warn("cacheGet: Redis error, falling back to null", err);
    return null;
  }
}

/**
 * Set a value in cache with TTL in seconds
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number,
): Promise<void> {
  const serialized = JSON.stringify(value);

  if (!redis) {
    cleanupMemoryStore();
    memoryStore.set(key, {
      value: serialized,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
    return;
  }

  try {
    await redis.set(key, serialized, { ex: ttlSeconds });
  } catch (err) {
    console.warn("cacheSet: Redis error, falling back to memory", err);
    cleanupMemoryStore();
    memoryStore.set(key, {
      value: serialized,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }
}

/**
 * Delete a value from cache
 */
export async function cacheDelete(key: string): Promise<void> {
  if (!redis) {
    memoryStore.delete(key);
    return;
  }

  try {
    await redis.del(key);
  } catch (err) {
    console.warn("cacheDelete: Redis error, falling back to memory", err);
    memoryStore.delete(key);
  }
}

/**
 * Invalidate cache by pattern (e.g., "dj_analytics:*")
 * Note: This requires Redis SCAN, which may not be available in all Redis configurations
 */
export async function cacheInvalidatePattern(pattern: string): Promise<void> {
  if (!redis) {
    // For in-memory, handle * wildcard: extract prefix before * for startsWith matching
    cleanupMemoryStore();
    const prefix = pattern.endsWith("*") ? pattern.slice(0, -1) : pattern;
    for (const key of memoryStore.keys()) {
      if (key.startsWith(prefix)) {
        memoryStore.delete(key);
      }
    }
    return;
  }

  // Upstash Redis doesn't support SCAN for pattern invalidation
  // Explicitly reject unsupported pattern invalidation instead of silently doing nothing
  throw new Error(
    "cacheInvalidatePattern: Pattern invalidation not supported in Upstash Redis - requires key tracking or SCAN support",
  );
}
