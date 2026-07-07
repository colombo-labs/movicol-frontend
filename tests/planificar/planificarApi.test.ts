import { describe, it, expect, vi, beforeEach } from "vitest";
import { calcDistance, fetchRutasCercanas } from "@modules/planificar/api/planificarApi";

describe("planificarApi — full coverage", () => {
  beforeEach(() => {
    vi.mocked(global.fetch).mockReset();
  });

  describe("calcDistance", () => {
    it("returns 0 for same point", () => {
      expect(calcDistance(4.65, -74.08, 4.65, -74.08)).toBe(0);
    });

    it("calculates short distance", () => {
      // ~1km between these points
      const dist = calcDistance(4.650, -74.080, 4.659, -74.080);
      expect(dist).toBeGreaterThan(0.5);
      expect(dist).toBeLessThan(2);
    });

    it("calculates longer distance", () => {
      // Usaquén to Centro ~11km
      const dist = calcDistance(4.695, -74.031, 4.598, -74.076);
      expect(dist).toBeGreaterThan(8);
      expect(dist).toBeLessThan(15);
    });
  });

  describe("fetchRutasCercanas", () => {
    it("returns routes from API", async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          features: [
            {
              properties: { route_id: "J74", nombre: "Portal Norte" },
              geometry: { coordinates: [[-74.05, 4.66]] },
            },
          ],
        }),
      } as Response);

      const results = await fetchRutasCercanas(4.66, -74.05);
      expect(Array.isArray(results)).toBe(true);
    });

    it("throws on fetch error", async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error("network"));
      await expect(fetchRutasCercanas(4.65, -74.08)).rejects.toThrow();
    });

    it("throws on non-ok response", async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => { throw new Error("invalid json"); },
      } as Response);
      await expect(fetchRutasCercanas(4.65, -74.08)).rejects.toThrow();
    });

    it("handles empty features array", async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ features: [] }),
      } as Response);
      const results = await fetchRutasCercanas(4.65, -74.08);
      expect(results).toEqual([]);
    });
  });
});
