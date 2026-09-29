import { redis } from '@/lib/redis';

const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX_REQUESTS = 60;

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
}

export class RateLimitError extends Error {
  constructor(public retryAfter: number) {
    super('Too many requests');
    this.name = 'RateLimitError';
  }
}

/**
 * Distributed rate limiter using Redis (with in-memory fallback).
 *
 * Uses a fixed-window counter strategy. In production, Redis provides
 * a shared view across all instances and serverless invocations.
 * When Redis is unavailable, falls back to an in-memory Map (per-process only).
 */
const memoryLimits = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  key: string,
  options: RateLimitOptions = {},
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const max = options.max ?? DEFAULT_MAX_REQUESTS;
  const now = Date.now();
  const resetAt = now + windowMs;

  const r = redis.raw();
  if (r) {
    try {
      const script = `
        local current = redis.call('GET', KEYS[1])
        if current == false then
          redis.call('SETEX', KEYS[1], ARGV[1], ARGV[2])
          return {ARGV[2], ARGV[3]}
        end
        if tonumber(current) < tonumber(ARGV[2]) then
          redis.call('INCR', KEYS[1])
          return {ARGV[2] - current - 1, ARGV[3]}
        end
        return {0, ARGV[3]}
      `;
      const ttl = Math.floor(windowMs / 1000);
      const result = await r.eval(script, 1, key, ttl, max, resetAt);
      const arr = Array.isArray(result) ? result : [result];
      const remaining = typeof arr[0] === 'number' ? Math.max(0, arr[0]) : max;
      return { success: remaining > 0, remaining: typeof remaining === 'number' ? remaining : 0, resetAt };
    } catch {
      // Fall through to memory fallback
    }
  }

  // In-memory fallback (per-process, dev only)
  const entry = memoryLimits.get(key);
  if (!entry || now > entry.resetAt) {
    memoryLimits.set(key, { count: 1, resetAt });
    return { success: max > 0, remaining: max - 1, resetAt };
  }

  if (entry.count >= max) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: max - entry.count, resetAt: entry.resetAt };
}

export async function checkRateLimit(
  key: string,
  options: RateLimitOptions = {},
): Promise<boolean> {
  const result = await rateLimit(key, options);
  return result.success;
}

export function getClientIdentifier(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return headers.get('x-real-ip') ?? 'unknown';
}
