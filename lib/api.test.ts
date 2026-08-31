import assert from "node:assert/strict";
import test, { before, mock } from "node:test";
import { z } from "zod";

// `@/lib/api` imports `@/lib/auth`, which validates env vars and connects to
// the database at module load time. Mocking it here keeps these as pure unit
// tests that don't need a real database or auth configuration.
let currentSession: { user: { id: string } } | null = null;
mock.module("@/lib/auth", {
  exports: {
    auth: { api: { getSession: async () => currentSession } },
  },
});
mock.module("next/headers", {
  exports: { headers: async () => new Headers() },
});

const schema = z.object({ name: z.string().min(1) });

let parseJsonBody: typeof import("./api")["parseJsonBody"];
let getAuthenticatedUserId: typeof import("./api")["getAuthenticatedUserId"];

before(async () => {
  ({ parseJsonBody, getAuthenticatedUserId } = await import("./api"));
});

test("parseJsonBody returns parsed data for a valid body", async () => {
  const request = new Request("http://localhost/api/test", {
    method: "POST",
    body: JSON.stringify({ name: "friday" }),
  });
  const result = await parseJsonBody(request, schema);
  assert.equal(result.error, null);
  assert.deepEqual(result.data, { name: "friday" });
});

test("parseJsonBody returns a 400 response for a schema mismatch", async () => {
  const request = new Request("http://localhost/api/test", {
    method: "POST",
    body: JSON.stringify({ name: "" }),
  });
  const result = await parseJsonBody(request, schema);
  assert.equal(result.data, null);
  assert.equal(result.error?.status, 400);
  const body = await result.error?.json();
  assert.equal(body.error, "Validation failed");
});

test("parseJsonBody returns a 400 response for invalid JSON", async () => {
  const request = new Request("http://localhost/api/test", {
    method: "POST",
    body: "not json",
  });
  const result = await parseJsonBody(request, schema);
  assert.equal(result.data, null);
  assert.equal(result.error?.status, 400);
  const body = await result.error?.json();
  assert.equal(body.error, "Request body must be valid JSON");
});

test("getAuthenticatedUserId returns the session user's id", async () => {
  currentSession = { user: { id: "user-1" } };
  assert.equal(await getAuthenticatedUserId(), "user-1");
});

test("getAuthenticatedUserId returns null when there is no session", async () => {
  currentSession = null;
  assert.equal(await getAuthenticatedUserId(), null);
});
