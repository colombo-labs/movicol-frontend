import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { NearbyRoutes } from "../NearbyRoutes";

describe("NearbyRoutes", () => {
  it("should render without crashing", () => {
    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: vi.fn() },
      writable: true,
    });
    const { container } = render(<NearbyRoutes />);
    expect(container).toBeDefined();
  });

  it("should show loading text initially", () => {
    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: vi.fn() },
      writable: true,
    });
    const { container } = render(<NearbyRoutes />);
    expect(container.textContent).toContain("Buscando paradas cercanas");
  });

  it("should render nothing on error", () => {
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: (_: any, err: any) => err({ code: 1 }),
      },
      writable: true,
    });
    const { container } = render(<NearbyRoutes />);
    // After error, no content (returns null)
    expect(container.children.length).toBeLessThanOrEqual(1);
  });
});
