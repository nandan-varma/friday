import assert from "node:assert/strict";
import test from "node:test";
import {
  calendarEventInputSchema,
  calendarEventResponseSchema,
  calendarEventsQuerySchema,
  calendarEventUpdateSchema,
  calendarSelectionSchema,
  eventMutationSchema,
  googleCalendarSchema,
  googleIntegrationSchema,
  isoDateTimeSchema,
} from "./calendar";

const validEvent = {
  calendarId: "primary",
  summary: "Standup",
  start: "2026-01-01T09:00:00-08:00",
  end: "2026-01-01T09:30:00-08:00",
};

test("ISO datetime schema requires an explicit offset", () => {
  assert.equal(isoDateTimeSchema.safeParse("2026-01-01").success, false);
  assert.equal(
    isoDateTimeSchema.safeParse("2026-01-01T09:00:00").success,
    false,
  );
  assert.equal(
    isoDateTimeSchema.safeParse("2026-01-01T09:00:00-08:00").success,
    true,
  );
});

test("calendar event queries require an ordered time range", () => {
  const result = calendarEventsQuerySchema.safeParse({
    start: "2026-01-01T10:00:00Z",
    end: "2026-01-01T09:00:00Z",
  });

  assert.equal(result.success, false);
});

test("calendar event queries accept an empty/partial range", () => {
  assert.equal(calendarEventsQuerySchema.safeParse({}).success, true);
  assert.equal(
    calendarEventsQuerySchema.safeParse({
      start: "2026-01-01T09:00:00Z",
    }).success,
    true,
  );
});

test("calendar selections reject duplicate IDs", () => {
  assert.equal(
    calendarSelectionSchema.safeParse({ calendarIds: ["primary", "primary"] })
      .success,
    false,
  );
});

test("calendar selections accept unique IDs, including an empty list", () => {
  assert.equal(
    calendarSelectionSchema.safeParse({ calendarIds: ["a", "b"] }).success,
    true,
  );
  assert.equal(
    calendarSelectionSchema.safeParse({ calendarIds: [] }).success,
    true,
  );
});

test("calendarEventInputSchema accepts a well-formed event", () => {
  const result = calendarEventInputSchema.safeParse(validEvent);
  assert.equal(result.success, true);
});

test("calendarEventInputSchema rejects end before or equal to start", () => {
  assert.equal(
    calendarEventInputSchema.safeParse({
      ...validEvent,
      end: validEvent.start,
    }).success,
    false,
  );
  assert.equal(
    calendarEventInputSchema.safeParse({
      ...validEvent,
      end: "2026-01-01T08:00:00-08:00",
    }).success,
    false,
  );
});

test("calendarEventInputSchema rejects blank summary and invalid attendee emails", () => {
  assert.equal(
    calendarEventInputSchema.safeParse({ ...validEvent, summary: "  " })
      .success,
    false,
  );
  assert.equal(
    calendarEventInputSchema.safeParse({
      ...validEvent,
      attendees: ["not-an-email"],
    }).success,
    false,
  );
});

test("calendarEventInputSchema defaults attendees to an empty list", () => {
  const result = calendarEventInputSchema.parse(validEvent);
  assert.deepEqual(result.attendees, []);
});

test("calendarEventUpdateSchema requires at least one field", () => {
  assert.equal(calendarEventUpdateSchema.safeParse({}).success, false);
});

test("calendarEventUpdateSchema requires start and end together", () => {
  assert.equal(
    calendarEventUpdateSchema.safeParse({ start: validEvent.start }).success,
    false,
  );
  assert.equal(
    calendarEventUpdateSchema.safeParse({
      start: validEvent.start,
      end: validEvent.end,
    }).success,
    true,
  );
});

test("calendarEventUpdateSchema rejects end before start when both are present", () => {
  assert.equal(
    calendarEventUpdateSchema.safeParse({
      start: validEvent.end,
      end: validEvent.start,
    }).success,
    false,
  );
});

test("calendarEventUpdateSchema accepts a single partial field", () => {
  assert.equal(
    calendarEventUpdateSchema.safeParse({ summary: "New title" }).success,
    true,
  );
  assert.equal(
    calendarEventUpdateSchema.safeParse({ location: "Room 2" }).success,
    true,
  );
});

test("eventMutationSchema requires non-empty eventId and calendarId", () => {
  assert.equal(
    eventMutationSchema.safeParse({ eventId: "e1", calendarId: "c1" }).success,
    true,
  );
  assert.equal(
    eventMutationSchema.safeParse({ eventId: "", calendarId: "c1" }).success,
    false,
  );
});

test("googleCalendarSchema requires id and summary", () => {
  assert.equal(
    googleCalendarSchema.safeParse({ id: "primary", summary: "Main" }).success,
    true,
  );
  assert.equal(
    googleCalendarSchema.safeParse({ summary: "Main" }).success,
    false,
  );
});

test("googleIntegrationSchema allows a null or omitted calendar selection", () => {
  assert.equal(
    googleIntegrationSchema.safeParse({ connected: true }).success,
    true,
  );
  assert.equal(
    googleIntegrationSchema.safeParse({
      connected: true,
      selectedCalendarIds: null,
    }).success,
    true,
  );
  assert.equal(
    googleIntegrationSchema.safeParse({
      connected: false,
      selectedCalendarIds: ["primary"],
    }).success,
    true,
  );
});

test("calendarEventResponseSchema requires the core display fields", () => {
  const result = calendarEventResponseSchema.safeParse({
    id: "evt1",
    title: "Standup",
    start: validEvent.start,
    end: validEvent.end,
    calendarId: "primary",
    color: "blue",
  });
  assert.equal(result.success, true);
  assert.equal(
    calendarEventResponseSchema.safeParse({
      title: "Standup",
      start: validEvent.start,
      end: validEvent.end,
      calendarId: "primary",
      color: "blue",
    }).success,
    false,
  );
});
