import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RutasList } from "../RutasList";

const baseProps = {
  tab: "sitp" as const,
  tmTroncales: [],
  tmRutas: [],
  sitpRutas: [
    { ruta: "674", cenefa: "297A13", paraderos: [{ nombre: "A", lat: 4.6, lon: -74.1, orden: "1" }] },
    { ruta: "112B", cenefa: "122B04", paraderos: [{ nombre: "B", lat: 4.65, lon: -74.08, orden: "1" }, { nombre: "C", lat: 4.7, lon: -74.05, orden: "2" }] },
  ],
  search: "",
  setSearch: vi.fn(),
  filter: "todas",
  setFilter: vi.fn(),
  sitpPage: 0,
  setSitpPage: vi.fn(),
  onSelectRuta: vi.fn(),
  onSelectTm: vi.fn(),
  onSelectTmRuta: vi.fn(),
  handleTab: vi.fn(),
  onFilterChange: vi.fn(),
  showTroncales: false,
  onToggleTroncales: vi.fn(),
  showEstaciones: false,
  onToggleEstaciones: vi.fn(),
  showSitpOnMap: false,
  onToggleSitp: vi.fn(),
};

describe("RutasList", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ operating: 120, delayed: 3, suspended: 1, alerts: [] }) });
    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: vi.fn() },
      writable: true,
    });
  });

  it("should render SITP routes", () => {
    render(<RutasList {...baseProps} />);
    expect(screen.getByText("674")).toBeDefined();
    expect(screen.getByText("112B")).toBeDefined();
  });

  it("should render filter buttons", () => {
    render(<RutasList {...baseProps} />);
    expect(screen.getByText("cercanas")).toBeDefined();
    expect(screen.getByText("demora")).toBeDefined();
    expect(screen.getByText("favoritas")).toBeDefined();
  });

  it("should show route count", () => {
    render(<RutasList {...baseProps} />);
    expect(screen.getByText(/2 rutas encontradas/)).toBeDefined();
  });

  it("should call onSelectRuta when route clicked", () => {
    render(<RutasList {...baseProps} />);
    fireEvent.click(screen.getByText("674"));
    expect(baseProps.onSelectRuta).toHaveBeenCalled();
  });

  it("should show alerts data after fetch", async () => {
    render(<RutasList {...baseProps} />);
    await waitFor(() => {
      expect(screen.getByText("120")).toBeDefined(); // operating
      expect(screen.getByText("3")).toBeDefined(); // delayed
    });
  });

  it("should show TM and SITP tabs", () => {
    render(<RutasList {...baseProps} />);
    expect(screen.getByText("TM")).toBeDefined();
    expect(screen.getByText("SITP")).toBeDefined();
  });
});
