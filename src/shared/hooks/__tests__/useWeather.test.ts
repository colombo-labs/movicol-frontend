import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useWeather } from "../useWeather";

describe("useWeather", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return temperature from API", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ current_weather: { temperature: 18.5 } }),
    });

    const { result } = renderHook(() => useWeather());

    await waitFor(() => expect(result.current).toBe(19));
  });

  it("should return 14 as fallback on error", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useWeather());

    await waitFor(() => expect(result.current).toBe(14));
  });
});
