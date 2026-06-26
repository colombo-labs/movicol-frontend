import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useRoutePredict } from "../useRoutePredict";

const mockResponse = {
  route_id: "test-uuid",
  total_time_minutes: 30,
  total_distance_km: 10,
  risk_segments: [
    {
      from_station: "A",
      to_station: "B",
      congestion_level: 0.5,
      risk_label: "medium",
      coordinates: [
        [4.7, -74],
        [4.6, -74.1],
      ],
    },
  ],
  overall_risk: "medium" as const,
  explanation: "Test explanation",
  stations: ["A", "B"],
  departure_time: "2026-05-20T08:00:00Z",
};

beforeEach(() => {
  globalThis.fetch = vi.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve(mockResponse) }),
  ) as unknown as typeof fetch;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useRoutePredict", () => {
  it("starts with null prediction", () => {
    const { result } = renderHook(() => useRoutePredict());
    expect(result.current.prediction).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("fetches prediction on predict()", async () => {
    const { result } = renderHook(() => useRoutePredict());

    act(() => {
      result.current.predict({
        origin: { lat: 4.7, lng: -74 },
        destination: { lat: 4.6, lng: -74.1 },
        departureTime: "2026-05-20T08:00:00Z",
      });
    });

    await waitFor(() => expect(result.current.prediction).not.toBeNull());
    expect(result.current.prediction?.route_id).toBe("test-uuid");
  });

  it("handles errors", async () => {
    vi.mocked(globalThis.fetch).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: "Error",
      } as Response),
    );

    const { result } = renderHook(() => useRoutePredict());

    act(() => {
      result.current.predict({
        origin: { lat: 4.7, lng: -74 },
        destination: { lat: 4.6, lng: -74.1 },
      });
    });

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.prediction).toBeNull();
  });

  it("clears state", async () => {
    const { result } = renderHook(() => useRoutePredict());

    act(() => {
      result.current.predict({
        origin: { lat: 4.7, lng: -74 },
        destination: { lat: 4.6, lng: -74.1 },
      });
    });
    await waitFor(() => expect(result.current.prediction).not.toBeNull());

    act(() => {
      result.current.clear();
    });
    expect(result.current.prediction).toBeNull();
  });
});
