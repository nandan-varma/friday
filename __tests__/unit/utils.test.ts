import { cn } from "../../src/lib/utils";

describe("cn", () => {
  it("merges class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
    expect(cn("foo", { bar: true })).toBe("foo bar");
    expect(cn("foo", { bar: false })).toBe("foo");
  });
});
