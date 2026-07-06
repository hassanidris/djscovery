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

function memoryCheck(
  key: string,
  limit: number,
  windowSeconds: number,
): boolean {
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
  if (!identifier || limit <= 0 || windowSeconds <= 0) {
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

  // Fixed-window counter using INCR + EXPIRE (race-safe for this use case)
  const [count, _] = await redis
    .multi()
    .incr(key)
    .expire(key, windowSeconds)
    .exec<[number, number]>();

  const success = count <= limit;
  const remaining = Math.max(0, limit - count);

  return { success, limit, windowSeconds, remaining, resetAt };
}

export function rateLimitMessage(action: string, resetAt: number): string {
  const minutes = Math.ceil((resetAt - Date.now()) / 60000);
  return `Too many ${action} attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}
