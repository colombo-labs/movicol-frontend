/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useRoutePredictMulti } from "../useRoutePredictMulti";

vi.mock("@modules/predicciones/api", () => ({
  routePredictionApi: {
    predict: vi.fn(),
    predictAlternatives: vi.fn(),
  },
}));

vi.mock("../api/planificarApi", () => ({
  fetchRutasCercanas: vi.fn().mockResolvedValue([]),
  calcDistance: vi.fn().mockReturnValue(5),
}));

import { routePredictionApi } from "@modules/predicciones/api";

describe("useRoutePredictMulti", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should start with null options and no loading", () => {
    const { result } = renderHook(() => useRoutePredictMulti());
    expect(result.current.options).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should call predictAlternatives for vehiculo mode", async () => {
    const mockResult = [
      {
        route_id: "v1",
        total_time_minutes: 15,
        total_distance_km: 10,
        cost: "$20.000",
        mode: "vehiculo",
        risk_segments: [],
        overall_risk: "low",
        safety_score: 80,
        explanation: "",
        stations: ["Calle 72"],
        departure_time: "2026-06-21T15:00:00",
        navigation_steps: [],
      },
    ];
    (routePredictionApi.predictAlternatives as any).mockResolvedValue(
      mockResult,
    );

    const { result } = renderHook(() => useRoutePredictMulti());

    await act(async () => {
      result.current.predictMulti({
        origin: { lat: 4.65, lng: -74.11 },
        destination: { lat: 4.72, lng: -74.06 },
        departureTime: "2026-06-21T15:00:00",
        mode: "vehiculo",
      });
    });

    await waitFor(() => {
      expect(result.current.options).not.toBeNull();
      expect(result.current.options!.length).toBe(1);
      expect(result.current.options![0].id).toBe("vehiculo-0");
    });
  });

  it("should call predict for transporte publico", async () => {
    const mockTm = {
      route_id: "tm-1",
      total_time_minutes: 25,
      total_distance_km: 12,
      cost: "$3,550",
      mode: "transmilenio",
      risk_segments: [],
      overall_risk: "medium",
      safety_score: 70,
      explanation: "",
      stations: ["Portal Norte", "Calle 72"],
      departure_time: "2026-06-21T15:00:00",
      route_code: "B5",
    };
    (routePredictionApi.predict as any).mockResolvedValue(mockTm);

    const { result } = renderHook(() => useRoutePredictMulti());

    await act(async () => {
      result.current.predictMulti({
        origin: { lat: 4.65, lng: -74.11 },
        destination: { lat: 4.72, lng: -74.06 },
        departureTime: "2026-06-21T15:00:00",
        mode: "publico",
      });
    });

    await waitFor(() => {
      expect(result.current.options).not.toBeNull();
      expect(result.current.options!.length).toBeGreaterThan(0);
    });
  });

  it("should clear options", () => {
    const { result } = renderHook(() => useRoutePredictMulti());
    act(() => result.current.clear());
    expect(result.current.options).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
