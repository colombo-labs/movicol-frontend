import { describe, it, expect, vi, beforeEach } from "vitest";
import { geocodeAddress } from "@shared/utils/geocode";

describe("geocodeAddress", () => {
  beforeEach(() => {
    vi.mocked(global.fetch).mockReset();
  });

  it.each([
    ["usaquen", "Usaquén", 4.6957],
    ["centro", "Centro", 4.598],
    ["soacha", "Soacha", 4.58],
  ])(
    "should return local zone for '%s'",
    async (query, expectedLabel, expectedLat) => {
      const results = await geocodeAddress(query);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].label).toContain(expectedLabel);
      expect(results[0].lat).toBeCloseTo(expectedLat, 1);
    },
  );

  it("should return local zone for 'adl'", async () => {
    const results = await geocodeAddress("adl");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].label).toContain("ADL");
  });

  it("should handle accent-insensitive queries", async () => {
    const results = await geocodeAddress("usaquen");
    expect(results[0].label).toContain("Usaquén");
  });

  it("should strip 'bogota' from query for zone matching", async () => {
    const results = await geocodeAddress("centro bogota");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].label).toContain("Centro");
  });

  it("should fallback to Photon for unknown locations", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          {
            geometry: { coordinates: [-74.07, 4.65] },
            properties: {
              name: "Test Place",
              city: "Bogotá",
              osm_value: "suburb",
            },
          },
        ],
      }),
    } as Response);

    // Query that's not in local zones
    const results = await geocodeAddress("barrio random xyz");
    expect(global.fetch).toHaveBeenCalled();
  });

  it("should return max 6 results", async () => {
    const results = await geocodeAddress("portal");
    expect(results.length).toBeLessThanOrEqual(6);
  });
});
