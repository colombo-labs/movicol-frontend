import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TripPointsList } from "../TripPointsList";

describe("TripPointsList", () => {
  const defaultProps = {
    tripPoints: [],
    mode: "publico" as const,
    onRemovePoint: vi.fn(),
    onUseMyLocation: vi.fn(),
    onSwapPoints: vi.fn(),
    onClear: vi.fn(),
    onAddPoint: vi.fn(),
    onUpdatePoint: vi.fn(),
    onRequestAddPoint: vi.fn(),
  };

  it("should render origin input when empty", () => {
    render(<TripPointsList {...defaultProps} />);
    expect(screen.getByPlaceholderText(/Origen/)).toBeDefined();
  });

  it("should show 'Usar mi ubicación' button when no points", () => {
    render(<TripPointsList {...defaultProps} />);
    expect(screen.getByText("Usar mi ubicación")).toBeDefined();
  });

  it("should call onUseMyLocation when button clicked", () => {
    render(<TripPointsList {...defaultProps} />);
    fireEvent.click(screen.getByText("Usar mi ubicación"));
    expect(defaultProps.onUseMyLocation).toHaveBeenCalled();
  });

  it("should show filled inputs with trip point labels", () => {
    render(
      <TripPointsList
        {...defaultProps}
        tripPoints={[
          { lat: 4.65, lng: -74.11, label: "Portal Norte" },
          { lat: 4.72, lng: -74.06, label: "Centro" },
        ]}
      />,
    );
    expect(screen.getByDisplayValue("Portal Norte")).toBeDefined();
    expect(screen.getByDisplayValue("Centro")).toBeDefined();
  });

  it("should show Limpiar button when has points", () => {
    render(
      <TripPointsList
        {...defaultProps}
        tripPoints={[{ lat: 4.65, lng: -74.11, label: "Test" }]}
      />,
    );
    expect(screen.getByText("Limpiar")).toBeDefined();
  });

  it("should not show 'Agregar un destino' in publico mode", () => {
    render(
      <TripPointsList
        {...defaultProps}
        tripPoints={[
          { lat: 4.65, lng: -74.11, label: "A" },
          { lat: 4.72, lng: -74.06, label: "B" },
        ]}
      />,
    );
    expect(screen.queryByText("Agregar un destino")).toBeNull();
  });

  it("should show 'Agregar un destino' in vehiculo mode with 2 points", () => {
    render(
      <TripPointsList
        {...defaultProps}
        mode="vehiculo"
        tripPoints={[
          { lat: 4.65, lng: -74.11, label: "A" },
          { lat: 4.72, lng: -74.06, label: "B" },
        ]}
      />,
    );
    expect(screen.getByText("Agregar un destino")).toBeDefined();
  });

  it("should call onClear when Limpiar clicked", () => {
    render(
      <TripPointsList
        {...defaultProps}
        tripPoints={[{ lat: 4.65, lng: -74.11, label: "Test" }]}
      />,
    );
    fireEvent.click(screen.getByText("Limpiar"));
    expect(defaultProps.onClear).toHaveBeenCalled();
  });
});
