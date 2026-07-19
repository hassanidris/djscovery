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
 * In-memory fallback used when Upstash Redis is not configured.
 * Not suitable for production serverless deployments (state is per-instance),
 * but works in development and single-instance staging.
 */
const memoryStore = new Map<string, { count: number; expiresAt: number }>();
const MEMORY_STORE_MAX_SIZE = 10000;
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

  // Max-size eviction: remove oldest entries if over limit
  if (memoryStore.size > MEMORY_STORE_MAX_SIZE) {
    const entries = Array.from(memoryStore.entries());
    entries.sort((a, b) => a[1].expiresAt - b[1].expiresAt);
    const toDelete = entries.slice(0, memoryStore.size - MEMORY_STORE_MAX_SIZE);
    for (const [key] of toDelete) {
      memoryStore.delete(key);
    }
  }
}

function memoryCheck(
  key: string,
  limit: number,
  windowSeconds: number,
): boolean {
  cleanupMemoryStore();

  const now = Date.now();
  const record = memoryStore.get(key);
  if (!record || record.expiresAt <= now) {
    memoryStore.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 });
    return true;
  }
  if (record.count >= limit) return false;
  record.count += 1;
  return true;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  windowSeconds: number;
  remaining: number;
  resetAt: number;
}

export async function rateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  // Disable rate limiting in test environment
  if (process.env.NEXT_PUBLIC_APP_ENV === "test") {
    return {
      success: true,
      limit,
      windowSeconds,
      remaining: limit,
      resetAt: Date.now(),
    };
  }

  if (!identifier) {
    throw new Error("rateLimit: identifier is required for rate limiting");
  }
  if (limit <= 0 || windowSeconds <= 0) {
    return {
      success: true,
      limit,
      windowSeconds,
      remaining: limit,
      resetAt: Date.now(),
    };
  }

  const key = `rate-limit:${identifier}`;
  const now = Date.now();
  const resetAt = now + windowSeconds * 1000;

  if (!redis) {
    const success = memoryCheck(key, limit, windowSeconds);
    const remaining = success ? limit - 1 : 0;
    return { success, limit, windowSeconds, remaining, resetAt };
  }

  try {
    // Fixed-window counter using INCR; only (re)arm expiry on the first hit of a window.
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    const success = count <= limit;
    const remaining = Math.max(0, limit - count);

    return { success, limit, windowSeconds, remaining, resetAt };
  } catch (err) {
    // Redis failed, fall back to in-memory rate limiting
    console.warn("rateLimit: Redis error, falling back to in-memory", err);
    const success = memoryCheck(key, limit, windowSeconds);
    const remaining = success ? limit - 1 : 0;
    return { success, limit, windowSeconds, remaining, resetAt };
  }
}

export function rateLimitMessage(action: string, resetAt: number): string {
  const minutes = Math.ceil((resetAt - Date.now()) / 60000);
  return `Too many ${action} attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}
