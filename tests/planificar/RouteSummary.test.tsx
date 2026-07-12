import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { RoutePrediction } from "@modules/predicciones/models";
import { RouteSummaryCard } from "@modules/planificar/components/widgets/RouteSummary";

const prediction: RoutePrediction = {
  route_id: "tm-f23b",
  total_time_minutes: 25,
  total_distance_km: 10,
  cost: "$3.550",
  mode: "transmilenio",
  risk_segments: [],
  overall_risk: "low",
  safety_score: 90,
  explanation: "",
  stations: ["Las Aguas", "Banderas"],
  departure_time: "2026-07-12T08:00:00",
  route_code: "F23B",
  transfers: 0,
  estimated_wait_minutes: 4,
  alternatives: [],
};

describe("RouteSummaryCard", () => {
  it("uses the validated prediction code for TransMilenio", () => {
    render(
      <RouteSummaryCard
        prediction={prediction}
        mode="transmilenio"
        rutasDisponibles={[{ ruta: "ZP-C66" }]}
        getETA={() => "09:30"}
      />,
    );

    expect(screen.getByText("F23B")).toBeInTheDocument();
    expect(screen.queryByText("ZP-C66")).not.toBeInTheDocument();
  });
});
