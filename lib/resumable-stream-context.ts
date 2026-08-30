import { after } from "next/server";
import { createResumableStreamContext } from "resumable-stream/ioredis";
import Redis from "ioredis";

if (!process.env.UPSTASH_REDIS_TCP_URL) {
  throw new Error("UPSTASH_REDIS_TCP_URL is not set in environment variables");
}

// Pub/sub needs two separate TCP connections: a subscribed connection can't
// also run other commands. Upstash's REST client can't do push-based
// subscribe at all, so this uses Upstash's ioredis-compatible TCP endpoint.
// lazyConnect defers the actual TCP connection until first command, so
// importing this module (e.g. during `next build`'s route collection)
// doesn't try to open a network connection.
const connection = () => new Redis(process.env.UPSTASH_REDIS_TCP_URL!, { lazyConnect: true });

export const streamContext = createResumableStreamContext({
  waitUntil: after,
  publisher: connection(),
  subscriber: connection(),
});
