import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

/**
 * Render tests — ensure every component renders without crashing.
 * This significantly boosts coverage by exercising component code paths.
 */

// Mock leaflet (not available in jsdom)
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: any) => <div data-testid="map">{children}</div>,
  TileLayer: () => <div />,
  Marker: () => <div />,
  Popup: () => <div />,
  Polyline: () => <div />,
  useMap: () => ({ setView: vi.fn(), fitBounds: vi.fn() }),
  useMapEvents: () => null,
}));

vi.mock("leaflet", () => ({
  icon: () => ({}),
  divIcon: () => ({}),
  latLngBounds: () => ({}),
  default: { icon: () => ({}), divIcon: () => ({}) },
}));

// Mock socket.io
vi.mock("socket.io-client", () => ({
  io: () => ({ on: vi.fn(), emit: vi.fn(), disconnect: vi.fn() }),
}));

describe("Components render — Chat", () => {
  it("ChatMessage user", async () => {
    const { ChatMessage } = await import("@modules/chat/components/ui/ChatMessage");
    const { container } = render(<ChatMessage role="user" content="test" />);
    expect(container).toBeInTheDocument();
  });

  it("ChatMessage assistant", async () => {
    const { ChatMessage } = await import("@modules/chat/components/ui/ChatMessage");
    const { container } = render(<ChatMessage role="assistant" content="line1\nline2\n• bullet" />);
    expect(container).toBeInTheDocument();
  });
});

describe("Components render — Shared UI", () => {
  it("Skeleton", async () => {
    const { Skeleton } = await import("@shared/ui/Skeleton");
    const { container } = render(<Skeleton className="w-10 h-10" />);
    expect(container).toBeInTheDocument();
  });

  it("AuthButton", async () => {
    const { AuthButton } = await import("@shared/ui/AuthButton");
    const { container } = render(<AuthButton />);
    expect(container).toBeInTheDocument();
  });

  it("ConfigModal closed", async () => {
    const { ConfigModal } = await import("@shared/ui/ConfigModal");
    const { container } = render(<ConfigModal isOpen={false} onClose={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });

  it("ConfigModal open", async () => {
    const { ConfigModal } = await import("@shared/ui/ConfigModal");
    const { container } = render(<ConfigModal isOpen={true} onClose={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});

describe("Components render — Planificar", () => {
  it("TripPointsList empty", async () => {
    const { TripPointsList } = await import("@modules/planificar/components/ui/TripPointsList");
    const { container } = render(
      <TripPointsList
        tripPoints={[]}
        mode="transmilenio"
        onRemovePoint={vi.fn()}
        onUseMyLocation={vi.fn()}
        onSwapPoints={vi.fn()}
        onClear={vi.fn()}
        onAddPoint={vi.fn()}
        onUpdatePoint={vi.fn()}
      />,
    );
    expect(container).toBeInTheDocument();
  });

  it("TripPointsList with points", async () => {
    const { TripPointsList } = await import("@modules/planificar/components/ui/TripPointsList");
    const { container } = render(
      <TripPointsList
        tripPoints={[
          { lat: 4.65, lng: -74.08, label: "Origin" },
          { lat: 4.59, lng: -74.07, label: "Dest" },
        ]}
        mode="transmilenio"
        onRemovePoint={vi.fn()}
        onUseMyLocation={vi.fn()}
        onSwapPoints={vi.fn()}
        onClear={vi.fn()}
        onAddPoint={vi.fn()}
        onUpdatePoint={vi.fn()}
      />,
    );
    expect(container).toBeInTheDocument();
  });
});

describe("Hooks — basic invocation", () => {
  it("useWeather", async () => {
    const { renderHook } = await import("@testing-library/react");
    const { useWeather } = await import("@shared/hooks/useWeather");
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ current: { temperature_2m: 15 } }),
    } as Response);
    const { result } = renderHook(() => useWeather(4.65, -74.08));
    expect(result.current).toBeDefined();
  });

  it("useAuth", async () => {
    const { renderHook } = await import("@testing-library/react");
    const { useAuth } = await import("@shared/hooks/useAuth");
    const { result } = renderHook(() => useAuth());
    expect(result.current.login).toBeDefined();
    expect(result.current.logout).toBeDefined();
  });

  it("useTheme", async () => {
    const { renderHook } = await import("@testing-library/react");
    const { useTheme } = await import("@shared/hooks/useTheme");
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBeDefined();
    expect(result.current.toggle).toBeDefined();
  });
});

describe("Utils — all functions", () => {
  it("geocodeAddress known zone", async () => {
    const { geocodeAddress } = await import("@shared/utils/geocode");
    const results = await geocodeAddress("kennedy");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].label).toContain("Kennedy");
  });

  it("geocodeAddress portal", async () => {
    const { geocodeAddress } = await import("@shared/utils/geocode");
    const results = await geocodeAddress("portal norte");
    expect(results.length).toBeGreaterThan(0);
  });

  it("geocodeAddress aeropuerto", async () => {
    const { geocodeAddress } = await import("@shared/utils/geocode");
    const results = await geocodeAddress("aeropuerto");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].label).toContain("Dorado");
  });

  it("geocodeAddress terminal", async () => {
    const { geocodeAddress } = await import("@shared/utils/geocode");
    const results = await geocodeAddress("terminal");
    expect(results.length).toBeGreaterThan(0);
  });

  it("reverseGeocode success", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ display_name: "Calle 1, Barrio, Bogotá, Colombia" }),
    } as Response);
    const { reverseGeocode } = await import("@shared/utils/reverseGeocode");
    const result = await reverseGeocode(4.6, -74.07);
    expect(result).toContain("Calle 1");
  });
});
