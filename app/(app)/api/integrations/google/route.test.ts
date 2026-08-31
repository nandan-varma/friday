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

let connected = true;
let selectedCalendarIds: string[] | null = null;

mock.module("@/lib/integrations/google/google-calendar", {
  exports: {
    isGoogleCalendarConnected: async () => connected,
    getSelectedCalendarIds: async () => selectedCalendarIds,
  },
});

let GET: typeof import("./route")["GET"];

before(async () => {
  ({ GET } = await import("./route"));
});

test.beforeEach(() => {
  currentSession = { user: { id: "user-1" } };
  connected = true;
  selectedCalendarIds = null;
});

test("GET returns 401 when there is no authenticated user", async () => {
  currentSession = null;
  const response = await GET();
  assert.equal(response.status, 401);
});

test("GET reports not connected without querying calendar selection", async () => {
  connected = false;
  const response = await GET();
  const body = await response.json();
  assert.deepEqual(body, { connected: false });
});

test("GET reports connection status and selected calendars", async () => {
  selectedCalendarIds = ["primary", "work"];
  const response = await GET();
  const body = await response.json();
  assert.deepEqual(body, {
    connected: true,
    selectedCalendarIds: ["primary", "work"],
  });
});
