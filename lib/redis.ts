import Redis from "ioredis";
import { createLogger } from "@/lib/logger";

const log = createLogger("redis");

// lazyConnect defers the actual TCP connection until first command, so
// importing this module (e.g. during `next build`'s route collection)
// doesn't try to open a network connection.
let client: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (client !== undefined) return client;

  const url = process.env.UPSTASH_REDIS_TCP_URL;
  if (!url) {
    log.warn("UPSTASH_REDIS_TCP_URL not set - redis-backed features disabled");
    client = null;
    return client;
  }

  client = new Redis(url, { lazyConnect: true });
  return client;
}
