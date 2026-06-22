/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ModeTabs, RouteOptionsList } from "../ModeComparison";

describe("ModeTabs", () => {
  it("should render both tabs", () => {
    render(<ModeTabs mode="publico" onModeChange={vi.fn()} />);
    expect(screen.getByText("Transporte público")).toBeDefined();
    expect(screen.getByText("Vehículo")).toBeDefined();
  });

  it("should call onModeChange when tab clicked", () => {
    const onChange = vi.fn();
    render(<ModeTabs mode="publico" onModeChange={onChange} />);
    fireEvent.click(screen.getByText("Vehículo"));
    expect(onChange).toHaveBeenCalledWith("vehiculo");
  });

  it("should show options count", () => {
    render(<ModeTabs mode="publico" onModeChange={vi.fn()} optionsCount={3} />);
    expect(screen.getByText("3")).toBeDefined();
  });
});

describe("RouteOptionsList", () => {
  const mockOptions = [
    {
      id: "tm-direct",
      label: "TM B5",
      total_time_minutes: 24,
      total_distance_km: 12,
      cost: "$3,550",
      transfers: 0,
      legs: [{ type: "walk" as const, from: "A", to: "B", duration_minutes: 5, distance_km: 0.4 }],
      prediction: {} as any,
      tag: "fastest" as const,
    },
    {
      id: "sitp-direct",
      label: "SITP 112B",
      total_time_minutes: 35,
      total_distance_km: 13,
      cost: "$3,550",
      transfers: 0,
      legs: [{ type: "sitp" as const, from: "C", to: "D", duration_minutes: 30, distance_km: 12 }],
      prediction: {} as any,
    },
  ];

  it("should render all options", () => {
    render(<RouteOptionsList options={mockOptions} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByText("TM B5")).toBeDefined();
    expect(screen.getByText("SITP 112B")).toBeDefined();
  });

  it("should show time for each option", () => {
    render(<RouteOptionsList options={mockOptions} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByText("24 min")).toBeDefined();
    expect(screen.getByText("35 min")).toBeDefined();
  });

  it("should show tag label", () => {
    render(<RouteOptionsList options={mockOptions} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByText("Más rápida")).toBeDefined();
  });

  it("should call onSelect when option clicked", () => {
    const onSelect = vi.fn();
    render(<RouteOptionsList options={mockOptions} selectedId={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("SITP 112B"));
    expect(onSelect).toHaveBeenCalledWith(mockOptions[1]);
  });

  it("should show count text", () => {
    render(<RouteOptionsList options={mockOptions} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByText(/2 opci/)).toBeDefined();
  });
});
