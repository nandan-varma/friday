import assert from "node:assert/strict";
import test from "node:test";
import {
  calendarEventsQuerySchema,
  calendarSelectionSchema,
  isoDateTimeSchema,
} from "./calendar";

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

test("calendar selections reject duplicate IDs", () => {
  assert.equal(
    calendarSelectionSchema.safeParse({ calendarIds: ["primary", "primary"] })
      .success,
    false,
  );
});
