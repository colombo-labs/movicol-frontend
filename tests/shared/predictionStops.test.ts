import { describe, expect, it } from "vitest";
import type { RoutePrediction } from "@modules/predicciones/models";
import {
  getPredictionStationNames,
  getPredictionStops,
  withPredictionStations,
} from "@modules/predicciones/models/routeStops";

const prediction: RoutePrediction = {
  route_id: "tm-route",
  total_time_minutes: 20,
  total_distance_km: 8,
  cost: "$3.550",
  mode: "transmilenio",
  risk_segments: [
    {
      from_station: "Origen",
      to_station: "Intermedia",
      congestion_level: 0.2,
      risk_label: "low",
      coordinates: [
        [4.6, -74.1],
        [4.61, -74.09],
      ],
    },
    {
      from_station: "Intermedia",
      to_station: "Destino",
      congestion_level: 0.3,
      risk_label: "medium",
      coordinates: [
        [4.61, -74.09],
        [4.62, -74.08],
      ],
    },
  ],
  overall_risk: "low",
  safety_score: 90,
  explanation: "",
  stations: [],
  departure_time: "2026-07-12T08:00:00",
  transfers: 0,
  estimated_wait_minutes: 4,
  alternatives: [],
};

describe("prediction route stops", () => {
  it("derives map markers in origin-to-destination order", () => {
    expect(getPredictionStops(prediction)).toEqual([
      { name: "Origen", lat: 4.6, lon: -74.1 },
      { name: "Intermedia", lat: 4.61, lon: -74.09 },
      { name: "Destino", lat: 4.62, lon: -74.08 },
    ]);
  });

  it("fills an empty station list from risk segments", () => {
    expect(getPredictionStationNames(prediction)).toEqual([
      "Origen",
      "Intermedia",
      "Destino",
    ]);
    expect(withPredictionStations(prediction).stations).toEqual([
      "Origen",
      "Intermedia",
      "Destino",
    ]);
  });

  it("does not create station markers for vehicle routes", () => {
    expect(getPredictionStops({ ...prediction, mode: "vehiculo" })).toEqual([]);
  });
});
