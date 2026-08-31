import assert from "node:assert/strict";
import test, { before, mock } from "node:test";

function fakeRedis(initialCount: number) {
  let count = initialCount;
  const pexpireCalls: Array<[string, number]> = [];
  return {
    async incr(_key: string) {
      count += 1;
      return count;
    },
    async pexpire(key: string, ms: number) {
      pexpireCalls.push([key, ms]);
      return 1;
    },
    pexpireCalls,
  };
}

// `@/lib/ratelimit` reads the redis client lazily (inside `.limit()`), so a
// single mock that reads a mutable `currentRedis` lets each test swap the
// backing client without re-registering the module mock (which would fail:
// "./ratelimit" is only ever loaded/linked once per test file).
let currentRedis: ReturnType<typeof fakeRedis> | null = null;
mock.module("@/lib/redis", { exports: { getRedis: () => currentRedis } });

let chatRatelimit: typeof import("./ratelimit")["chatRatelimit"];

before(async () => {
  ({ chatRatelimit } = await import("./ratelimit"));
});

test("chatRatelimit allows requests under the limit and sets a window on the first hit", async () => {
  currentRedis = fakeRedis(0);
  const result = await chatRatelimit.limit("user-1");

  assert.equal(result.success, true);
  assert.equal(result.remaining, 19);
  assert.equal(currentRedis.pexpireCalls.length, 1);
  assert.equal(currentRedis.pexpireCalls[0]?.[1], 60_000);
});

test("chatRatelimit blocks once the request count exceeds the max", async () => {
  currentRedis = fakeRedis(20);
  const result = await chatRatelimit.limit("user-1");

  assert.equal(result.success, false);
  assert.equal(result.remaining, 0);
});

test("chatRatelimit fails open when redis is unavailable", async () => {
  currentRedis = null;
  const result = await chatRatelimit.limit("user-1");

  assert.equal(result.success, true);
  assert.equal(result.remaining, 20);
});
