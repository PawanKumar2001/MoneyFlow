import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Cache TTLs in seconds
export const TTL = {
  EXPENSES: 300,        // 5 minutes
  INCOME: 1800,         // 30 minutes
  SUBSCRIPTIONS: 900,   // 15 minutes
  SUMMARY: 600,         // 10 minutes
  USER: 1800,           // 30 minutes
};

// Cache key generators
export const cacheKeys = {
  expenses: (userId: string, month: number, year: number) =>
    `expenses:${userId}:${month}:${year}`,
  income: (userId: string) =>
    `income:${userId}`,
  freelanceIncome: (userId: string, month: number, year: number) =>
    `freelance-income:${userId}:${month}:${year}`,
  subscriptions: (userId: string) =>
    `subscriptions:${userId}`,
  summary: (userId: string, month: number, year: number) =>
    `summary:${userId}:${month}:${year}`,
  trend: (userId: string, month: number, year: number) =>
    `trend:${userId}:${month}:${year}`,
  user: (userId: string) =>
    `user:${userId}`,
};

// Generic get with type
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get<T>(key);
    return data ?? null;
  } catch {
    return null;
  }
}

// Generic set with TTL
export async function setCache<T>(
  key: string,
  data: T,
  ttl: number
): Promise<void> {
  try {
    await redis.set(key, data, { ex: ttl });
  } catch {
    // Silently fail — app works without cache
  }
}

// Delete single key
export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch {}
}

// Delete multiple keys by pattern
export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {}
}