import assert from "node:assert/strict";
import test from "node:test";
import { shiftDate } from "./calendar-date-utils";

const date = new Date(2026, 0, 31, 9, 30);

test("shiftDate follows the selected calendar view", () => {
  assert.deepEqual(shiftDate(date, "day", 1), new Date(2026, 1, 1, 9, 30));
  assert.deepEqual(shiftDate(date, "week", 1), new Date(2026, 1, 7, 9, 30));
  assert.deepEqual(shiftDate(date, "month", 1), new Date(2026, 1, 28, 9, 30));
  assert.deepEqual(shiftDate(date, "agenda", -1), new Date(2026, 0, 1, 9, 30));
});
