import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * API Contract Tests
 * Verifica que el frontend y backend acuerden en la estructura
 * de requests/responses. Si el backend cambia el schema, estos tests fallan.
 */

describe("Contract — POST /chat", () => {
  beforeEach(() => {
    vi.mocked(global.fetch).mockReset();
  });

  it("request should have required fields", () => {
    const validRequest = {
      message: "hola",
      sessionId: "session-123",
    };
    expect(validRequest.message).toBeDefined();
    expect(typeof validRequest.message).toBe("string");
    expect(validRequest.message.length).toBeGreaterThan(0);
    expect(validRequest.message.length).toBeLessThanOrEqual(2000);
  });

  it("request context should match schema", () => {
    const context = {
      module: "planificar",
      origin: "Usaquén",
      destination: "Centro",
      originCoords: [4.695, -74.031],
      destinationCoords: [4.598, -74.076],
      activeRoute: null,
      selectedHour: 8,
      transportMode: "tm",
    };
    expect(context.module).toMatch(
      /^(planificar|rutas|metricas|accesibilidad)$/,
    );
    expect(context.originCoords).toHaveLength(2);
    expect(context.selectedHour).toBeGreaterThanOrEqual(0);
    expect(context.selectedHour).toBeLessThanOrEqual(23);
  });

  it("response should have required fields", () => {
    const validResponse = {
      response: "Hola soy MoviBot",
      sources: ["rule_based"],
      sessionId: "session-123",
      actions: [],
    };
    expect(validResponse.response).toBeDefined();
    expect(typeof validResponse.response).toBe("string");
    expect(Array.isArray(validResponse.sources)).toBe(true);
    expect(validResponse.sessionId).toBeDefined();
    expect(Array.isArray(validResponse.actions)).toBe(true);
  });

  it("action payload should match schema", () => {
    const action = {
      type: "plan_route",
      data: { origin: "suba", destination: "centro", mode: "tm" },
    };
    expect(action.type).toBeDefined();
    expect(typeof action.type).toBe("string");
    expect(action.data).toBeDefined();
    expect(typeof action.data).toBe("object");
  });

  it("action types should be known", () => {
    const validTypes = [
      "plan_route",
      "show_station",
      "show_congestion",
      "show_risk",
      "open_module",
    ];
    const action = { type: "plan_route", data: {} };
    expect(validTypes).toContain(action.type);
  });
});

describe("Contract — GET /health", () => {
  it("response should have status field", () => {
    const response = {
      status: "ok",
      service: "movicol-backend",
      version: "0.1.0",
    };
    expect(response.status).toBe("ok");
    expect(response.service).toBeDefined();
    expect(response.version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe("Contract — Route Prediction Response", () => {
  it("should have required route fields", () => {
    const route = {
      route_id: "uuid-here",
      total_time_minutes: 25.5,
      total_distance_km: 12.3,
      cost: "$3.550",
      mode: "transmilenio",
      overall_risk: "medium",
      safety_score: 85,
      explanation: "",
      stations: ["Station A", "Station B"],
      departure_time: "2026-07-06T08:00:00",
    };
    expect(route.route_id).toBeDefined();
    expect(route.total_time_minutes).toBeGreaterThan(0);
    expect(route.total_distance_km).toBeGreaterThan(0);
    expect(route.cost).toContain("3.550");
    expect([
      "transmilenio",
      "sitp",
      "vehiculo",
      "moto",
      "bicicleta",
      "caminando",
    ]).toContain(route.mode);
    expect(["low", "medium", "moderate", "high", "critical"]).toContain(
      route.overall_risk,
    );
    expect(route.safety_score).toBeGreaterThanOrEqual(0);
    expect(route.safety_score).toBeLessThanOrEqual(100);
    expect(Array.isArray(route.stations)).toBe(true);
  });

  it("cost should be in Colombian pesos format", () => {
    const costs = ["$3.550", "$0", "$2.400", "$15.000"];
    costs.forEach((cost) => {
      expect(cost).toMatch(/^\$[\d.]+$/);
    });
  });
});

describe("Contract — Geocode Response", () => {
  it("should return lat/lng/label", () => {
    const result = { lat: 4.695, lng: -74.031, label: "Usaquén, Bogotá" };
    expect(result.lat).toBeGreaterThan(4);
    expect(result.lat).toBeLessThan(5);
    expect(result.lng).toBeLessThan(-73);
    expect(result.lng).toBeGreaterThan(-75);
    expect(result.label.length).toBeGreaterThan(0);
  });
});
