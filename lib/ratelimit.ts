import { getRedis } from "@/lib/redis";

// Fixed-window rate limit backed by the shared ioredis (TCP) connection.
// 20 chat messages per minute per user - generous for normal use, blocks
// abuse/loops. Fails open (allows the request) if Redis is unavailable -
// the caller already treats rate limiting as best-effort.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

export const chatRatelimit = {
  async limit(identifier: string): Promise<{ success: boolean; remaining: number }> {
    const redis = getRedis();
    if (!redis) {
      return { success: true, remaining: MAX_REQUESTS };
    }

    const key = `ratelimit:chat:${identifier}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.pexpire(key, WINDOW_MS);
    }

    return {
      success: count <= MAX_REQUESTS,
      remaining: Math.max(0, MAX_REQUESTS - count),
    };
  },
};
