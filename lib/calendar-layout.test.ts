import assert from "node:assert/strict";
import test from "node:test";
import { layoutOverlappingEvents, packAllDaySpans } from "./calendar-layout";

const at = (hour: number, minute = 0) => new Date(2026, 0, 1, hour, minute);

test("packAllDaySpans puts overlapping spans on separate rows", () => {
  const rows = packAllDaySpans([
    { item: "first", startIdx: 0, endIdx: 2 },
    { item: "second", startIdx: 1, endIdx: 3 },
    { item: "third", startIdx: 4, endIdx: 5 },
  ]);

  assert.deepEqual(rows, [
    [
      { item: "first", startIdx: 0, endIdx: 2 },
      { item: "third", startIdx: 4, endIdx: 5 },
    ],
    [{ item: "second", startIdx: 1, endIdx: 3 }],
  ]);
});

test("layoutOverlappingEvents expands events into adjacent free columns", () => {
  const layout = layoutOverlappingEvents([
    { id: "a", start: at(9), end: at(10) },
    { id: "b", start: at(9, 30), end: at(11) },
    { id: "c", start: at(10), end: at(10, 30) },
  ]);

  assert.deepEqual(layout.get("a"), { left: 0, width: 50 });
  assert.deepEqual(layout.get("b"), { left: 50, width: 50 });
  assert.deepEqual(layout.get("c"), { left: 0, width: 50 });
});

test("layoutOverlappingEvents keeps non-overlapping events full width", () => {
  const layout = layoutOverlappingEvents([
    { id: "a", start: at(9), end: at(10) },
    { id: "b", start: at(10), end: at(11) },
  ]);

  assert.deepEqual(layout.get("a"), { left: 0, width: 100 });
  assert.deepEqual(layout.get("b"), { left: 0, width: 100 });
});
