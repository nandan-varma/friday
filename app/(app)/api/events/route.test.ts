import assert from "node:assert/strict";
import test, { before, mock } from "node:test";
import type {
  GoogleCalendar,
  GoogleEvent,
} from "@/lib/integrations/google/google-calendar";

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
let eventsByCalendar: Record<string, GoogleEvent[]> = {};
let createdEvent: GoogleEvent | null = null;
let updatedEvent: GoogleEvent | null = null;
let deleteCalls: Array<{ calendarId: string; eventId: string }> = [];
let createCalls: Array<{ calendarId: string; event: unknown }> = [];
let updateCalls: Array<{
  calendarId: string;
  eventId: string;
  updates: unknown;
}> = [];
let fetchCalendarsShouldThrow = false;

mock.module("@/lib/integrations/google/google-calendar", {
  exports: {
    isGoogleCalendarConnected: async () => connected,
    fetchGoogleCalendars: async () => {
      if (fetchCalendarsShouldThrow) throw new Error("boom");
      return calendars;
    },
    getGoogleCalendar: async (_userId: string, calendarId: string) =>
      calendars.find((c) => c.id === calendarId) ?? null,
    fetchGoogleEvents: async (_userId: string, calendarId: string) =>
      eventsByCalendar[calendarId] ?? [],
    fetchAllSelectedCalendarEvents: async () =>
      Object.entries(eventsByCalendar).flatMap(([calendarId, events]) =>
        events.map((event) => ({ ...event, calendarId })),
      ),
    createGoogleEvent: async (
      _userId: string,
      calendarId: string,
      event: unknown,
    ) => {
      createCalls.push({ calendarId, event });
      if (!createdEvent) throw new Error("createdEvent fixture not set");
      return createdEvent;
    },
    updateGoogleEvent: async (
      _userId: string,
      calendarId: string,
      eventId: string,
      updates: unknown,
    ) => {
      updateCalls.push({ calendarId, eventId, updates });
      if (!updatedEvent) throw new Error("updatedEvent fixture not set");
      return updatedEvent;
    },
    deleteGoogleEvent: async (
      _userId: string,
      calendarId: string,
      eventId: string,
    ) => {
      deleteCalls.push({ calendarId, eventId });
    },
    transformGoogleEventToCalendarEvent: (
      event: GoogleEvent & { calendarId: string },
    ) => ({
      id: event.id,
      title: event.summary ?? "Untitled Event",
      start: event.start?.dateTime,
      end: event.end?.dateTime,
      calendarId: event.calendarId,
      color: "blue",
    }),
  },
});

let GET: typeof import("./route")["GET"];
let POST: typeof import("./route")["POST"];
let PATCH: typeof import("./route")["PATCH"];
let DELETE: typeof import("./route")["DELETE"];

before(async () => {
  ({ GET, POST, PATCH, DELETE } = await import("./route"));
});

test.beforeEach(() => {
  currentSession = { user: { id: "user-1" } };
  connected = true;
  calendars = [{ id: "primary", accessRole: "owner" } as GoogleCalendar];
  eventsByCalendar = {};
  createdEvent = null;
  updatedEvent = null;
  deleteCalls = [];
  createCalls = [];
  updateCalls = [];
  fetchCalendarsShouldThrow = false;
});

function getRequest(query = "") {
  return new Request(`http://localhost/api/events${query}`);
}

test("GET returns 401 when there is no authenticated user", async () => {
  currentSession = null;
  const response = await GET(getRequest());
  assert.equal(response.status, 401);
});

test("GET returns 400 when Google Calendar isn't connected", async () => {
  connected = false;
  const response = await GET(getRequest());
  assert.equal(response.status, 400);
});

test("GET returns 400 for an invalid query (end before start)", async () => {
  const response = await GET(
    getRequest("?start=2026-01-01T10:00:00Z&end=2026-01-01T09:00:00Z"),
  );
  assert.equal(response.status, 400);
});

test("GET returns 400 when filtering by a calendar the user can't access", async () => {
  const response = await GET(getRequest("?calendarId=unknown"));
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.error, "Calendar is unavailable");
});

test("GET returns events transformed from Google's response", async () => {
  eventsByCalendar.primary = [
    {
      id: "evt-1",
      summary: "Standup",
      start: { dateTime: "2026-01-01T09:00:00Z" },
      end: { dateTime: "2026-01-01T09:30:00Z" },
    },
  ];
  const response = await GET(getRequest());
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.length, 1);
  assert.equal(body[0].id, "evt-1");
  assert.equal(body[0].title, "Standup");
});

test("GET returns 500 when fetching events fails unexpectedly", async () => {
  fetchCalendarsShouldThrow = true;
  const response = await GET(getRequest());
  assert.equal(response.status, 500);
});

function postRequest(body: unknown) {
  return new Request("http://localhost/api/events", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

const validCreateBody = {
  calendarId: "primary",
  summary: "New event",
  start: "2026-01-01T09:00:00-08:00",
  end: "2026-01-01T09:30:00-08:00",
};

test("POST returns 401 when there is no authenticated user", async () => {
  currentSession = null;
  const response = await POST(postRequest(validCreateBody));
  assert.equal(response.status, 401);
});

test("POST returns 400 for an invalid body", async () => {
  const response = await POST(postRequest({ ...validCreateBody, summary: "" }));
  assert.equal(response.status, 400);
});

test("POST returns 400 when the calendar is unavailable", async () => {
  const response = await POST(
    postRequest({ ...validCreateBody, calendarId: "unknown" }),
  );
  assert.equal(response.status, 400);
  assert.equal(createCalls.length, 0);
});

test("POST creates the event and returns it transformed", async () => {
  createdEvent = {
    id: "evt-new",
    summary: "New event",
    start: { dateTime: "2026-01-01T09:00:00-08:00" },
    end: { dateTime: "2026-01-01T09:30:00-08:00" },
  };
  const response = await POST(postRequest(validCreateBody));
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.id, "evt-new");
  assert.equal(createCalls.length, 1);
  assert.equal(createCalls[0]?.calendarId, "primary");
});

function patchRequest(body: unknown) {
  return new Request("http://localhost/api/events", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

const validUpdateBody = {
  eventId: "evt-1",
  calendarId: "primary",
  summary: "Updated",
};

test("PATCH returns 401 when there is no authenticated user", async () => {
  currentSession = null;
  const response = await PATCH(patchRequest(validUpdateBody));
  assert.equal(response.status, 401);
});

test("PATCH returns 400 for a malformed body (no fields to update)", async () => {
  const response = await PATCH(
    patchRequest({ eventId: "evt-1", calendarId: "primary" }),
  );
  assert.equal(response.status, 400);
});

test("PATCH returns 400 when the calendar is unavailable", async () => {
  const response = await PATCH(
    patchRequest({ ...validUpdateBody, calendarId: "unknown" }),
  );
  assert.equal(response.status, 400);
  assert.equal(updateCalls.length, 0);
});

test("PATCH updates the event and returns it transformed", async () => {
  updatedEvent = {
    id: "evt-1",
    summary: "Updated",
    start: { dateTime: "2026-01-01T09:00:00-08:00" },
    end: { dateTime: "2026-01-01T09:30:00-08:00" },
  };
  const response = await PATCH(patchRequest(validUpdateBody));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.title, "Updated");
  assert.equal(updateCalls.length, 1);
});

test("DELETE returns 401 when there is no authenticated user", async () => {
  currentSession = null;
  const response = await DELETE(getRequest("?id=evt-1&calendarId=primary"));
  assert.equal(response.status, 401);
});

test("DELETE returns 400 when the event ID is missing", async () => {
  const response = await DELETE(getRequest("?calendarId=primary"));
  assert.equal(response.status, 400);
});

test("DELETE returns 400 when the calendar ID is missing", async () => {
  const response = await DELETE(getRequest("?id=evt-1"));
  assert.equal(response.status, 400);
});

test("DELETE returns 400 when the calendar is unavailable", async () => {
  const response = await DELETE(getRequest("?id=evt-1&calendarId=unknown"));
  assert.equal(response.status, 400);
  assert.equal(deleteCalls.length, 0);
});

test("DELETE removes the event", async () => {
  const response = await DELETE(getRequest("?id=evt-1&calendarId=primary"));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body, { success: true });
  assert.deepEqual(deleteCalls, [{ calendarId: "primary", eventId: "evt-1" }]);
});
