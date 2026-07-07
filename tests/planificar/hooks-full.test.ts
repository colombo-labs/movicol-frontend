import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the planificarApi module
vi.mock("@modules/planificar/api/planificarApi", () => ({
  calcDistance: vi.fn().mockReturnValue(10),
  fetchRutasCercanas: vi.fn(),
}));

// Mock the predictions API
vi.mock("@modules/predicciones/api", () => ({
  routePredictionApi: {
    predict: vi.fn(),
  },
}));

describe("useRutasCercanas", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return empty when no origin", async () => {
    const { useRutasCercanas } =
      await import("@modules/planificar/hooks/useRutasCercanas");
    const { result } = renderHook(() =>
      useRutasCercanas(null, null, "transmilenio"),
    );
    expect(result.current).toEqual([]);
  });

  it("should return empty for vehiculo mode", async () => {
    const { useRutasCercanas } =
      await import("@modules/planificar/hooks/useRutasCercanas");
    const { result } = renderHook(() =>
      useRutasCercanas(
        { lat: 4.65, lng: -74.08 },
        { lat: 4.59, lng: -74.07 },
        "vehiculo",
      ),
    );
    expect(result.current).toEqual([]);
  });

  it("should fetch and find common rutas", async () => {
    const { fetchRutasCercanas } =
      await import("@modules/planificar/api/planificarApi");
    (fetchRutasCercanas as any)
      .mockResolvedValueOnce([
        { ruta: "J74", nombre: "Portal Norte" },
        { ruta: "F51", nombre: "Suba" },
      ])
      .mockResolvedValueOnce([
        { ruta: "J74", nombre: "Centro" },
        { ruta: "G43", nombre: "Kennedy" },
      ]);

    const { useRutasCercanas } =
      await import("@modules/planificar/hooks/useRutasCercanas");
    const { result } = renderHook(() =>
      useRutasCercanas(
        { lat: 4.65, lng: -74.08 },
        { lat: 4.59, lng: -74.07 },
        "transmilenio",
      ),
    );

    await waitFor(() => {
      expect(result.current).toHaveLength(1);
      expect(result.current[0].ruta).toBe("J74");
    });
  });

  it("should handle fetch error", async () => {
    const { fetchRutasCercanas } =
      await import("@modules/planificar/api/planificarApi");
    (fetchRutasCercanas as any).mockRejectedValue(new Error("network"));

    const { useRutasCercanas } =
      await import("@modules/planificar/hooks/useRutasCercanas");
    const { result } = renderHook(() =>
      useRutasCercanas(
        { lat: 4.65, lng: -74.08 },
        { lat: 4.59, lng: -74.07 },
        "transmilenio",
      ),
    );

    await waitFor(() => {
      expect(result.current).toEqual([]);
    });
  });

  it("should return empty when no common rutas", async () => {
    const { fetchRutasCercanas } =
      await import("@modules/planificar/api/planificarApi");
    (fetchRutasCercanas as any)
      .mockResolvedValueOnce([{ ruta: "A1", nombre: "R1" }])
      .mockResolvedValueOnce([{ ruta: "B2", nombre: "R2" }]);

    const { useRutasCercanas } =
      await import("@modules/planificar/hooks/useRutasCercanas");
    const { result } = renderHook(() =>
      useRutasCercanas(
        { lat: 4.65, lng: -74.08 },
        { lat: 4.59, lng: -74.07 },
        "sitp",
      ),
    );

    await waitFor(() => {
      expect(result.current).toEqual([]);
    });
  });
});

describe("useRoutePredictMulti — more branches", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should handle TM + SITP mode", async () => {
    const { routePredictionApi } = await import("@modules/predicciones/api");
    (routePredictionApi.predict as any).mockResolvedValue({
      route_id: "multi-1",
      total_time_minutes: 30,
      total_distance_km: 14,
      cost: "$3.550",
      mode: "transmilenio",
      risk_segments: [],
      overall_risk: "low",
      safety_score: 85,
      explanation: "",
      stations: ["A", "B", "C"],
      departure_time: "2026-07-06T08:00:00",
      route_code: "TM-J74",
      navigation_steps: [],
      transfers: 1,
      estimated_wait_minutes: 5,
    });

    const { useRoutePredictMulti } =
      await import("@modules/planificar/hooks/useRoutePredictMulti");
    const { result } = renderHook(() => useRoutePredictMulti());

    await result.current.predictMulti(
      { lat: 4.695, lng: -74.031 },
      { lat: 4.598, lng: -74.076 },
      "transmilenio",
      "2026-07-06T08:00:00",
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("should handle no routes found", async () => {
    const { routePredictionApi } = await import("@modules/predicciones/api");
    (routePredictionApi.predict as any).mockRejectedValue(
      new Error("No routes"),
    );

    const { useRoutePredictMulti } =
      await import("@modules/planificar/hooks/useRoutePredictMulti");
    const { result } = renderHook(() => useRoutePredictMulti());

    await result.current.predictMulti(
      { lat: 4.695, lng: -74.031 },
      { lat: 4.598, lng: -74.076 },
      "transmilenio",
      "2026-07-06T08:00:00",
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeDefined();
    });
  });

  it("should handle vehiculo mode with OSRM", async () => {
    const { routePredictionApi } = await import("@modules/predicciones/api");
    (routePredictionApi.predict as any).mockResolvedValue({
      route_id: "v1",
      total_time_minutes: 35,
      total_distance_km: 18,
      cost: "$36.000",
      mode: "vehiculo",
      risk_segments: [
        { name: "Av Boyacá", congestion_level: 0.7, risk_label: "high" },
      ],
      overall_risk: "medium",
      safety_score: 70,
      explanation: "",
      stations: [],
      departure_time: "2026-07-06T08:00:00",
      navigation_steps: [
        {
          instruction: "Gira derecha en Calle 80",
          distance: 500,
          duration: 60,
        },
      ],
    });

    const { useRoutePredictMulti } =
      await import("@modules/planificar/hooks/useRoutePredictMulti");
    const { result } = renderHook(() => useRoutePredictMulti());

    await result.current.predictMulti(
      { lat: 4.695, lng: -74.031 },
      { lat: 4.598, lng: -74.076 },
      "vehiculo",
      "2026-07-06T08:00:00",
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
