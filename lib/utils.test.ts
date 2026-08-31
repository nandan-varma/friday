import assert from "node:assert/strict";
import test from "node:test";
import { cn } from "./utils";

test("cn joins truthy class values", () => {
  assert.equal(cn("a", "b"), "a b");
});

test("cn drops falsy values", () => {
  assert.equal(cn("a", false && "b", undefined, null, "c"), "a c");
});

test("cn merges conflicting Tailwind utilities, keeping the last one", () => {
  assert.equal(cn("px-2", "px-4"), "px-4");
});
