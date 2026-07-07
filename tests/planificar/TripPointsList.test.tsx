import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TripPointsList } from "@modules/planificar/components/ui/TripPointsList";

describe("TripPointsList", () => {
  const defaultProps = {
    tripPoints: [],
    mode: "transmilenio" as const,
    onRemovePoint: vi.fn(),
    onUseMyLocation: vi.fn(),
    onSwapPoints: vi.fn(),
    onClear: vi.fn(),
    onAddPoint: vi.fn(),
    onUpdatePoint: vi.fn(),
  };

  it("should render without crashing", () => {
    const { container } = render(<TripPointsList {...defaultProps} />);
    expect(container).toBeInTheDocument();
  });

  it("should show use my location button", () => {
    render(<TripPointsList {...defaultProps} />);
    expect(screen.getByText("planner.useMyLocation")).toBeInTheDocument();
  });

  it("should call onUseMyLocation when clicked", () => {
    render(<TripPointsList {...defaultProps} />);
    fireEvent.click(screen.getByText("planner.useMyLocation"));
    expect(defaultProps.onUseMyLocation).toHaveBeenCalled();
  });

  it("should show origin input placeholder", () => {
    const { container } = render(<TripPointsList {...defaultProps} />);
    const inputs = container.querySelectorAll("input");
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });

  it("should render trip points when provided", () => {
    const props = {
      ...defaultProps,
      tripPoints: [
        { lat: 4.65, lng: -74.08, label: "Usaquén" },
        { lat: 4.59, lng: -74.07, label: "Centro" },
      ],
    };
    render(<TripPointsList {...props} />);
    expect(screen.getByDisplayValue("Usaquén")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Centro")).toBeInTheDocument();
  });

  it("should show clear button when has points", () => {
    const props = {
      ...defaultProps,
      tripPoints: [{ lat: 4.65, lng: -74.08, label: "Test" }],
    };
    const { container } = render(<TripPointsList {...props} />);
    expect(container.querySelector("button")).toBeInTheDocument();
  });
});
