import assert from "node:assert/strict";
import test from "node:test";
import {
  formatEventTime,
  formatFullDate,
  formatHourLabel,
  formatMonthYear,
  formatWeekdayLong,
  formatWeekdayShort,
} from "./calendar-format";

test("formatEventTime renders a compact 12-hour time", () => {
  assert.equal(formatEventTime(new Date(2026, 0, 1, 9, 5)), "9:05AM");
  assert.equal(formatEventTime(new Date(2026, 0, 1, 13, 0)), "1:00PM");
  assert.equal(formatEventTime(new Date(2026, 0, 1, 0, 0)), "12:00AM");
});

test("formatHourLabel renders hour-only labels", () => {
  assert.equal(formatHourLabel(9), "9AM");
  assert.equal(formatHourLabel(12), "12PM");
  assert.equal(formatHourLabel(0), "12AM");
});

test("formatWeekdayShort and formatWeekdayLong render weekday names", () => {
  const monday = new Date(2026, 0, 5); // 2026-01-05 is a Monday
  assert.equal(formatWeekdayShort(monday), "Mon");
  assert.equal(formatWeekdayLong(monday), "Monday");
});

test("formatMonthYear renders month and year", () => {
  assert.equal(formatMonthYear(new Date(2026, 7, 15)), "August 2026");
});

test("formatFullDate renders weekday, month, day, and year", () => {
  assert.equal(
    formatFullDate(new Date(2026, 7, 29)),
    "Saturday, August 29, 2026",
  );
});
