import Redis from "ioredis";
import { after } from "next/server";
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from "resumable-stream/ioredis";
import { createLogger } from "@/lib/logger";

const log = createLogger("resumable-stream");

// Pub/sub needs two separate TCP connections: a subscribed connection can't
// also run other commands. Upstash's REST client can't do push-based
// subscribe at all, so this uses Upstash's ioredis-compatible TCP endpoint.
// lazyConnect defers the actual TCP connection until first command, so
// importing this module (e.g. during `next build`'s route collection)
// doesn't try to open a network connection.
let context: ResumableStreamContext | null | undefined;

// Resumable streams are an enhancement, not core functionality - if Redis
// isn't configured, chat still works, it just can't survive a page reload
// mid-stream. Missing config degrades gracefully instead of 500ing chat.
export function getStreamContext(): ResumableStreamContext | null {
  if (context !== undefined) return context;

  const url = process.env.UPSTASH_REDIS_TCP_URL;
  if (!url) {
    log.warn("UPSTASH_REDIS_TCP_URL not set - resumable streams disabled");
    context = null;
    return context;
  }

  const connection = () => new Redis(url, { lazyConnect: true });
  context = createResumableStreamContext({
    waitUntil: after,
    publisher: connection(),
    subscriber: connection(),
  });
  log.info("resumable stream context initialized");
  return context;
}
