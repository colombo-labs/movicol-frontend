import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@shared/api/http-client", () => ({
  api: {
    post: vi.fn(),
  },
}));

describe("useRoutePredictMulti — full coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with no options", async () => {
    const { useRoutePredictMulti } = await import(
      "@modules/planificar/hooks/useRoutePredictMulti"
    );
    const { result } = renderHook(() => useRoutePredictMulti());
    expect(result.current.options).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("should have predictMulti function", async () => {
    const { useRoutePredictMulti } = await import(
      "@modules/planificar/hooks/useRoutePredictMulti"
    );
    const { result } = renderHook(() => useRoutePredictMulti());
    expect(result.current.predictMulti).toBeDefined();
    expect(typeof result.current.predictMulti).toBe("function");
  });

  it("should set loading when predicting", async () => {
    const { api } = await import("@shared/api/http-client");
    (api.post as any).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    const { useRoutePredictMulti } = await import(
      "@modules/planificar/hooks/useRoutePredictMulti"
    );
    const { result } = renderHook(() => useRoutePredictMulti());

    act(() => {
      result.current.predictMulti(
        { lat: 4.695, lng: -74.031 },
        { lat: 4.598, lng: -74.076 },
        "transmilenio",
        new Date().toISOString(),
      );
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("should handle prediction response", async () => {
    const { api } = await import("@shared/api/http-client");
    (api.post as any).mockResolvedValue({
      route_id: "test-1",
      total_time_minutes: 25,
      total_distance_km: 12,
      cost: "$3.550",
      mode: "transmilenio",
      risk_segments: [],
      overall_risk: "low",
      safety_score: 90,
      explanation: "",
      stations: ["Station A", "Station B"],
      departure_time: "2026-07-06T08:00:00",
      route_code: "TM-1",
      navigation_steps: [],
      transfers: 0,
      estimated_wait_minutes: 5,
    });

    const { useRoutePredictMulti } = await import(
      "@modules/planificar/hooks/useRoutePredictMulti"
    );
    const { result } = renderHook(() => useRoutePredictMulti());

    await act(async () => {
      await result.current.predictMulti(
        { lat: 4.695, lng: -74.031 },
        { lat: 4.598, lng: -74.076 },
        "transmilenio",
        new Date().toISOString(),
      );
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("should handle prediction error", async () => {
    const { api } = await import("@shared/api/http-client");
    (api.post as any).mockRejectedValue(new Error("Network error"));

    const { useRoutePredictMulti } = await import(
      "@modules/planificar/hooks/useRoutePredictMulti"
    );
    const { result } = renderHook(() => useRoutePredictMulti());

    await act(async () => {
      await result.current.predictMulti(
        { lat: 4.695, lng: -74.031 },
        { lat: 4.598, lng: -74.076 },
        "transmilenio",
        new Date().toISOString(),
      );
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("should handle vehiculo mode", async () => {
    const { api } = await import("@shared/api/http-client");
    (api.post as any).mockResolvedValue({
      route_id: "v1",
      total_time_minutes: 30,
      total_distance_km: 15,
      cost: "$30.000",
      mode: "vehiculo",
      risk_segments: [],
      overall_risk: "medium",
      safety_score: 75,
      explanation: "",
      stations: [],
      departure_time: "2026-07-06T08:00:00",
      navigation_steps: [
        { instruction: "Gira a la derecha", distance: 200, duration: 30 },
      ],
    });

    const { useRoutePredictMulti } = await import(
      "@modules/planificar/hooks/useRoutePredictMulti"
    );
    const { result } = renderHook(() => useRoutePredictMulti());

    await act(async () => {
      await result.current.predictMulti(
        { lat: 4.695, lng: -74.031 },
        { lat: 4.598, lng: -74.076 },
        "vehiculo",
        new Date().toISOString(),
      );
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
