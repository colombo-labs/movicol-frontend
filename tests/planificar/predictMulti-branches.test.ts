import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock both APIs used by the hook
vi.mock("@modules/predicciones/api", () => ({
  routePredictionApi: {
    predict: vi.fn(),
    predictAlternatives: vi.fn(),
  },
}));

vi.mock("@modules/planificar/api/planificarApi", () => ({
  calcDistance: vi.fn().mockReturnValue(10),
  fetchRutasCercanas: vi.fn().mockResolvedValue([]),
}));

const basePrediction = {
  route_id: "test-1",
  total_time_minutes: 25,
  total_distance_km: 12,
  cost: "$3.550",
  risk_segments: [],
  overall_risk: "low",
  safety_score: 85,
  explanation: "",
  stations: ["Héroes", "Calle 72"],
  departure_time: "2026-07-06T08:00:00",
  route_code: "TM-1",
  navigation_steps: [],
  transfers: 0,
  estimated_wait_minutes: 5,
  alternatives: [],
};

describe("useRoutePredictMulti — transit paths", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should call fetchTransitRoute for transmilenio mode", async () => {
    const { routePredictionApi } = await import("@modules/predicciones/api");
    (routePredictionApi.predict as any).mockResolvedValue({
      ...basePrediction,
      mode: "transmilenio",
    });

    const { useRoutePredictMulti } = await import(
      "@modules/planificar/hooks/useRoutePredictMulti"
    );
    const { result } = renderHook(() => useRoutePredictMulti());

    await act(async () => {
      await result.current.predictMulti({
        origin: { lat: 4.695, lng: -74.031 },
        destination: { lat: 4.598, lng: -74.076 },
        mode: "transmilenio",
        departureTime: "2026-07-06T08:00:00",
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(routePredictionApi.predict).toHaveBeenCalled();
    });
  });

  it("should handle TM success + SITP success", async () => {
    const { routePredictionApi } = await import("@modules/predicciones/api");
    (routePredictionApi.predict as any)
      .mockResolvedValueOnce({ ...basePrediction, mode: "transmilenio", route_code: "J74" })
      .mockResolvedValueOnce({ ...basePrediction, mode: "sitp", route_code: "C26" });

    const { useRoutePredictMulti } = await import(
      "@modules/planificar/hooks/useRoutePredictMulti"
    );
    const { result } = renderHook(() => useRoutePredictMulti());

    await act(async () => {
      await result.current.predictMulti({
        origin: { lat: 4.695, lng: -74.031 },
        destination: { lat: 4.598, lng: -74.076 },
        mode: "transmilenio",
        departureTime: "2026-07-06T08:00:00",
      });
    });

    await waitFor(() => {
      expect(result.current.options).not.toBeNull();
      expect(result.current.options!.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("should handle SITP without route_code — uses cercanas", async () => {
    const { routePredictionApi } = await import("@modules/predicciones/api");
    const { fetchRutasCercanas } = await import("@modules/planificar/api/planificarApi");

    (routePredictionApi.predict as any)
      .mockResolvedValueOnce({ ...basePrediction, mode: "transmilenio", route_code: "J74" })
      .mockResolvedValueOnce({ ...basePrediction, mode: "sitp", route_code: "" });
    (fetchRutasCercanas as any).mockResolvedValue([{ ruta: "C26" }]);

    const { useRoutePredictMulti } = await import(
      "@modules/planificar/hooks/useRoutePredictMulti"
    );
    const { result } = renderHook(() => useRoutePredictMulti());

    await act(async () => {
      await result.current.predictMulti({
        origin: { lat: 4.695, lng: -74.031 },
        destination: { lat: 4.598, lng: -74.076 },
        mode: "sitp",
        departureTime: "2026-07-06T08:00:00",
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("should throw when both TM and SITP fail", async () => {
    const { routePredictionApi } = await import("@modules/predicciones/api");
    (routePredictionApi.predict as any).mockRejectedValue(new Error("fail"));

    const { useRoutePredictMulti } = await import(
      "@modules/planificar/hooks/useRoutePredictMulti"
    );
    const { result } = renderHook(() => useRoutePredictMulti());

    await act(async () => {
      await result.current.predictMulti({
        origin: { lat: 4.695, lng: -74.031 },
        destination: { lat: 4.598, lng: -74.076 },
        mode: "transmilenio",
        departureTime: "2026-07-06T08:00:00",
      });
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
      expect(result.current.options).toBeNull();
    });
  });
});

describe("useRoutePredictMulti — vehicle paths", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should call fetchVehicleRoute for vehiculo", async () => {
    const { routePredictionApi } = await import("@modules/predicciones/api");
    (routePredictionApi.predictAlternatives as any).mockResolvedValue([
      { ...basePrediction, mode: "vehiculo", cost: "$20.000" },
    ]);

    const { useRoutePredictMulti } = await import(
      "@modules/planificar/hooks/useRoutePredictMulti"
    );
    const { result } = renderHook(() => useRoutePredictMulti());

    await act(async () => {
      await result.current.predictMulti({
        origin: { lat: 4.695, lng: -74.031 },
        destination: { lat: 4.598, lng: -74.076 },
        mode: "vehiculo",
        departureTime: "2026-07-06T08:00:00",
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(routePredictionApi.predictAlternatives).toHaveBeenCalled();
    });
  });

  it("should handle vehicle with waypoints", async () => {
    const { routePredictionApi } = await import("@modules/predicciones/api");
    (routePredictionApi.predict as any).mockResolvedValue({
      ...basePrediction,
      mode: "vehiculo",
      cost: "$15.000",
    });

    const { useRoutePredictMulti } = await import(
      "@modules/planificar/hooks/useRoutePredictMulti"
    );
    const { result } = renderHook(() => useRoutePredictMulti());

    await act(async () => {
      await result.current.predictMulti({
        origin: { lat: 4.695, lng: -74.031 },
        destination: { lat: 4.598, lng: -74.076 },
        waypoints: [{ lat: 4.65, lng: -74.06 }],
        mode: "vehiculo",
        departureTime: "2026-07-06T08:00:00",
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      // With waypoints, calls predict per leg
      expect(routePredictionApi.predict).toHaveBeenCalledTimes(2);
    });
  });

  it("should handle moto mode", async () => {
    const { routePredictionApi } = await import("@modules/predicciones/api");
    (routePredictionApi.predictAlternatives as any).mockResolvedValue([
      { ...basePrediction, mode: "moto", cost: "$8.000" },
    ]);

    const { useRoutePredictMulti } = await import(
      "@modules/planificar/hooks/useRoutePredictMulti"
    );
    const { result } = renderHook(() => useRoutePredictMulti());

    await act(async () => {
      await result.current.predictMulti({
        origin: { lat: 4.695, lng: -74.031 },
        destination: { lat: 4.598, lng: -74.076 },
        mode: "moto",
        departureTime: "2026-07-06T08:00:00",
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
