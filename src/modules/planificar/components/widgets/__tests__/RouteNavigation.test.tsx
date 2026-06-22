import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VehicleNavSteps } from "../RouteNavigation";

describe("VehicleNavSteps", () => {
  const mockSteps = [
    {
      instruction: "Inicia el recorrido en Calle 23",
      street: "Calle 23",
      distance_m: 121,
      duration_s: 23,
      maneuver: "depart",
    },
    {
      instruction: "Gira a la izquierda en Carrera 68A",
      street: "Carrera 68A",
      distance_m: 345,
      duration_s: 52,
      maneuver: "left",
    },
    {
      instruction: "Gira a la derecha en Av. Calle 72",
      street: "Av. Calle 72",
      distance_m: 2300,
      duration_s: 180,
      maneuver: "right",
    },
    {
      instruction: "Has llegado a tu destino",
      street: "",
      distance_m: 0,
      duration_s: 0,
      maneuver: "arrive",
    },
  ];

  it("should render all steps", () => {
    render(<VehicleNavSteps steps={mockSteps} getETA={() => "3:30 p. m."} />);
    expect(screen.getByText(/Indicaciones de ruta/)).toBeDefined();
    expect(screen.getByText(/Inicia el recorrido en Calle 23/)).toBeDefined();
    expect(
      screen.getByText(/Gira a la izquierda en Carrera 68A/),
    ).toBeDefined();
  });

  it("should show distance in km for long steps", () => {
    render(<VehicleNavSteps steps={mockSteps} getETA={() => "3:30 p. m."} />);
    expect(screen.getByText(/2.3 km/)).toBeDefined();
  });

  it("should show ETA", () => {
    render(<VehicleNavSteps steps={mockSteps} getETA={() => "3:30 p. m."} />);
    expect(screen.getByText("3:30 p. m.")).toBeDefined();
  });

  it("should show step count", () => {
    render(<VehicleNavSteps steps={mockSteps} getETA={() => null} />);
    expect(screen.getByText(/4 pasos/)).toBeDefined();
  });
});
