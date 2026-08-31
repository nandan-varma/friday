import assert from "node:assert/strict";
import test, { before, mock } from "node:test";
import type { UIMessage } from "ai";
import * as realAi from "ai";

// `@/lib/api`'s auth path, `@/lib/chat-store` and `@/agents/chat-agent` all
// touch the database or an external model provider at module load / call
// time. Mocking them isolates the route's own request handling (auth,
// rate limiting, validation, and how it wires the chat history together)
// from those integrations.
let currentSession: { user: { id: string } } | null = {
  user: { id: "user-1" },
};
mock.module("@/lib/auth", {
  exports: { auth: { api: { getSession: async () => currentSession } } },
});
mock.module("next/headers", {
  exports: { headers: async () => new Headers() },
});

let rateLimitBehavior: "allow" | "block" | "throw" = "allow";
mock.module("@/lib/ratelimit", {
  exports: {
    chatRatelimit: {
      limit: async () => {
        if (rateLimitBehavior === "throw") throw new Error("redis down");
        return {
          success: rateLimitBehavior === "allow",
          remaining: rateLimitBehavior === "allow" ? 19 : 0,
        };
      },
    },
  },
});

let existingChat: { messages: UIMessage[] } | null = null;
let saveChatCalls: Array<{
  id: string;
  userId: string;
  messages: UIMessage[];
}> = [];
mock.module("@/lib/chat-store", {
  exports: {
    readChat: async () => existingChat,
    saveChat: async (args: {
      id: string;
      userId: string;
      messages: UIMessage[];
    }) => {
      saveChatCalls.push(args);
    },
  },
});

mock.module("@/agents/chat-agent", { exports: { chatAgent: {} } });
mock.module("@/lib/resumable-stream-context", {
  exports: { getStreamContext: () => null },
});

let createAgentUIStreamResponseCalls: Array<{ uiMessages: UIMessage[] }> = [];
mock.module("ai", {
  exports: {
    ...realAi,
    createAgentUIStreamResponse: (options: { uiMessages: UIMessage[] }) => {
      createAgentUIStreamResponseCalls.push({ uiMessages: options.uiMessages });
      return new Response("ok");
    },
  },
});

let POST: typeof import("./route")["POST"];

before(async () => {
  ({ POST } = await import("./route"));
});

test.beforeEach(() => {
  currentSession = { user: { id: "user-1" } };
  rateLimitBehavior = "allow";
  existingChat = null;
  saveChatCalls = [];
  createAgentUIStreamResponseCalls = [];
});

const validMessage: UIMessage = {
  id: "msg-1",
  role: "user",
  parts: [{ type: "text", text: "What's on my calendar today?" }],
};

function chatRequest(body: unknown) {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

test("POST returns 401 when there is no authenticated user", async () => {
  currentSession = null;
  const response = await POST(
    chatRequest({ id: crypto.randomUUID(), message: validMessage }),
  );
  assert.equal(response.status, 401);
});

test("POST returns 429 when the user is rate limited", async () => {
  rateLimitBehavior = "block";
  const response = await POST(
    chatRequest({ id: crypto.randomUUID(), message: validMessage }),
  );
  assert.equal(response.status, 429);
});

test("POST proceeds when the rate limiter itself fails (fail-open)", async () => {
  rateLimitBehavior = "throw";
  const response = await POST(
    chatRequest({ id: crypto.randomUUID(), message: validMessage }),
  );
  assert.equal(response.status, 200);
});

test("POST returns 400 for invalid JSON", async () => {
  const response = await POST(
    new Request("http://localhost/api/chat", {
      method: "POST",
      body: "not json",
    }),
  );
  assert.equal(response.status, 400);
});

test("POST returns 400 when the request body doesn't match the schema", async () => {
  const response = await POST(
    chatRequest({ id: "not-a-uuid", message: validMessage }),
  );
  assert.equal(response.status, 400);
});

test("POST returns 400 for a malformed chat message", async () => {
  const response = await POST(
    chatRequest({ id: crypto.randomUUID(), message: { role: "user" } }),
  );
  assert.equal(response.status, 400);
});

test("POST returns 409 when persisted chat history is corrupted", async () => {
  existingChat = { messages: [{ role: "user" } as unknown as UIMessage] };
  const response = await POST(
    chatRequest({ id: crypto.randomUUID(), message: validMessage }),
  );
  assert.equal(response.status, 409);
});

test("POST saves the chat and streams a response for a valid request", async () => {
  const chatId = crypto.randomUUID();
  const response = await POST(
    chatRequest({ id: chatId, message: validMessage }),
  );

  assert.equal(response.status, 200);
  assert.equal(saveChatCalls.length, 1);
  assert.equal(saveChatCalls[0]?.id, chatId);
  assert.equal(saveChatCalls[0]?.userId, "user-1");
  assert.deepEqual(saveChatCalls[0]?.messages, [validMessage]);
  assert.equal(createAgentUIStreamResponseCalls.length, 1);
  assert.deepEqual(createAgentUIStreamResponseCalls[0]?.uiMessages, [
    validMessage,
  ]);
});

test("POST appends the new message to existing chat history", async () => {
  const priorMessage: UIMessage = {
    id: "msg-0",
    role: "assistant",
    parts: [{ type: "text", text: "Hi! How can I help?" }],
  };
  existingChat = { messages: [priorMessage] };
  const response = await POST(
    chatRequest({ id: crypto.randomUUID(), message: validMessage }),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(saveChatCalls[0]?.messages, [priorMessage, validMessage]);
});
