import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStationSearch } from "../hooks/useStationSearch";

describe("useStationSearch", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ features: [] }),
    });
  });

  it("should start with empty stations", () => {
    const { result } = renderHook(() => useStationSearch());
    expect(result.current.stations).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.query).toBe("");
  });

  it("should not search with less than 2 chars", async () => {
    const { result } = renderHook(() => useStationSearch());
    act(() => result.current.setQuery("P"));
    await new Promise((r) => setTimeout(r, 300));
    expect(result.current.stations).toEqual([]);
  });

  it("should update query", () => {
    const { result } = renderHook(() => useStationSearch());
    act(() => result.current.setQuery("Portal"));
    expect(result.current.query).toBe("Portal");
  });
});
