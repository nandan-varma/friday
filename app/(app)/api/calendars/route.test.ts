import assert from "node:assert/strict";
import test, { before, mock } from "node:test";
import type { GoogleCalendar } from "@/lib/integrations/google/google-calendar";

// `@/lib/api`'s `getAuthenticatedUserId` goes through `@/lib/auth`, which
// validates env vars and opens a database connection at module load time.
// Mocking `@/lib/auth` (not `@/lib/api`) keeps the route's real
// `parseJsonBody`/auth-gating logic under test while avoiding a real DB.
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
let calendars: GoogleCalendar[] = [];
let updateSelectedCalendarsCalls: Array<{ userId: string; ids: string[] }> = [];

mock.module("@/lib/integrations/google/google-calendar", {
  exports: {
    isGoogleCalendarConnected: async () => connected,
    fetchGoogleCalendars: async () => calendars,
    updateSelectedCalendars: async (userId: string, ids: string[]) => {
      updateSelectedCalendarsCalls.push({ userId, ids });
    },
  },
});

let GET: typeof import("./route")["GET"];
let PATCH: typeof import("./route")["PATCH"];

before(async () => {
  ({ GET, PATCH } = await import("./route"));
});

test.beforeEach(() => {
  currentSession = { user: { id: "user-1" } };
  connected = true;
  calendars = [];
  updateSelectedCalendarsCalls = [];
});

test("GET returns 401 when there is no authenticated user", async () => {
  currentSession = null;
  const response = await GET();
  assert.equal(response.status, 401);
});

test("GET returns 400 when Google Calendar isn't connected", async () => {
  connected = false;
  const response = await GET();
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.error, "Google Calendar not connected");
});

test("GET returns calendars shaped from the Google response, dropping ones without an id", async () => {
  calendars = [
    {
      id: "primary",
      summary: "Main",
      description: "desc",
      primary: true,
      accessRole: "owner",
      backgroundColor: "#fff",
    },
    { summary: "No id" } as GoogleCalendar,
  ];
  const response = await GET();
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body, [
    {
      id: "primary",
      summary: "Main",
      description: "desc",
      primary: true,
      accessRole: "owner",
      backgroundColor: "#fff",
    },
  ]);
});

test("GET defaults an untitled calendar's summary", async () => {
  calendars = [{ id: "cal-2" } as GoogleCalendar];
  const response = await GET();
  const body = await response.json();
  assert.equal(body[0].summary, "Untitled Calendar");
});

function patchRequest(body: unknown) {
  return new Request("http://localhost/api/calendars", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

test("PATCH returns 401 when there is no authenticated user", async () => {
  currentSession = null;
  const response = await PATCH(patchRequest({ calendarIds: ["primary"] }));
  assert.equal(response.status, 401);
});

test("PATCH returns 400 for a malformed body", async () => {
  const response = await PATCH(
    patchRequest({ calendarIds: ["primary", "primary"] }),
  );
  assert.equal(response.status, 400);
});

test("PATCH rejects calendar IDs the user doesn't have access to", async () => {
  calendars = [{ id: "primary" } as GoogleCalendar];
  const response = await PATCH(patchRequest({ calendarIds: ["unknown"] }));
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.error, "One or more calendar IDs are unavailable");
  assert.equal(updateSelectedCalendarsCalls.length, 0);
});

test("PATCH persists the selection when every ID is available", async () => {
  calendars = [
    { id: "primary" } as GoogleCalendar,
    { id: "work" } as GoogleCalendar,
  ];
  const response = await PATCH(patchRequest({ calendarIds: ["work"] }));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body, { success: true, selectedCalendarIds: ["work"] });
  assert.deepEqual(updateSelectedCalendarsCalls, [
    { userId: "user-1", ids: ["work"] },
  ]);
});
