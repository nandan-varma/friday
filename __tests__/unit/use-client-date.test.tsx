import { renderHook } from "@testing-library/react";
import { useClientDate, useIsClient } from "../../src/hooks/use-client-date";

describe("useClientDate", () => {
  it("returns a date after hydration", () => {
    const { result } = renderHook(() => useClientDate());
    expect(result.current).toBeInstanceOf(Date);
  });
});

describe("useIsClient", () => {
  it("returns true after hydration", () => {
    const { result } = renderHook(() => useIsClient());
    expect(result.current).toBe(true);
  });
});
