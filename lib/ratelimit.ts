import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";

// 20 chat messages per minute per user - generous for normal use, blocks abuse/loops.
export const chatRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  prefix: "ratelimit:chat",
});
