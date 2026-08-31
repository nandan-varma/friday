import assert from "node:assert/strict";
import test from "node:test";
import { getDeviceTimeZone } from "./timezone";

test("getDeviceTimeZone returns a non-empty IANA-parseable zone name", () => {
  const timeZone = getDeviceTimeZone();
  assert.equal(typeof timeZone, "string");
  assert.ok(timeZone.length > 0);
  assert.doesNotThrow(() => Intl.DateTimeFormat(undefined, { timeZone }));
});
