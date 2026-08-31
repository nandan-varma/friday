import assert from "node:assert/strict";
import test, { before, mock } from "node:test";

let currentSession: { user: { id: string } } | null = {
  user: { id: "user-1" },
};
mock.module("@/lib/auth", {
  exports: { auth: { api: { getSession: async () => currentSession } } },
});
mock.module("next/headers", {
  exports: { headers: async () => new Headers() },
});

let chatRow: { activeStreamId: string | null } | null = null;
mock.module("@/lib/chat-store", {
  exports: { readChat: async () => chatRow },
});

let streamContext: {
  resumeExistingStream: (id: string) => Promise<ReadableStream>;
} | null = null;
mock.module("@/lib/resumable-stream-context", {
  exports: { getStreamContext: () => streamContext },
});

let GET: typeof import("./route")["GET"];

before(async () => {
  ({ GET } = await import("./route"));
});

test.beforeEach(() => {
  currentSession = { user: { id: "user-1" } };
  chatRow = null;
  streamContext = null;
});

function params(id: string) {
  return { params: Promise.resolve({ id }) };
}

test("GET returns 401 when there is no authenticated user", async () => {
  currentSession = null;
  const response = await GET(new Request("http://localhost"), params("chat-1"));
  assert.equal(response.status, 401);
});

test("GET returns 204 when resumable streams aren't configured", async () => {
  const response = await GET(new Request("http://localhost"), params("chat-1"));
  assert.equal(response.status, 204);
});

test("GET returns 204 when the chat has no active stream", async () => {
  streamContext = { resumeExistingStream: async () => new ReadableStream() };
  chatRow = { activeStreamId: null };
  const response = await GET(new Request("http://localhost"), params("chat-1"));
  assert.equal(response.status, 204);
});

test("GET resumes the active stream", async () => {
  streamContext = {
    resumeExistingStream: async (id: string) => {
      assert.equal(id, "stream-1");
      return new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("chunk"));
          controller.close();
        },
      });
    },
  };
  chatRow = { activeStreamId: "stream-1" };
  const response = await GET(new Request("http://localhost"), params("chat-1"));
  assert.equal(response.status, 200);
  const text = await response.text();
  assert.equal(text, "chunk");
});
