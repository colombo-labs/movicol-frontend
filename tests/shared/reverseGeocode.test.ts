import { describe, it, expect, vi, beforeEach } from "vitest";
import { reverseGeocode } from "@shared/utils/reverseGeocode";

describe("reverseGeocode", () => {
  beforeEach(() => {
    vi.mocked(global.fetch).mockReset();
  });

  it("should return formatted address on success", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        display_name: "Calle 72, Chapinero, Bogotá, Colombia",
      }),
    } as Response);

    const result = await reverseGeocode(4.659, -74.056);
    expect(result).toBe("Calle 72, Chapinero, Bogotá");
  });

  it("should return coords as fallback on error", async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error("Network"));

    const result = await reverseGeocode(4.659, -74.056);
    expect(result).toContain("4.6590");
    expect(result).toContain("-74.0560");
  });

  it("should return coords when API returns non-ok", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    const result = await reverseGeocode(4.65, -74.08);
    expect(result).toContain("4.6500");
  });

  it("should trim to 3 parts of display_name", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        display_name: "Part1, Part2, Part3, Part4, Part5",
      }),
    } as Response);

    const result = await reverseGeocode(4.65, -74.08);
    expect(result.split(",").length).toBe(3);
  });

  it("should call nominatim proxy endpoint", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ display_name: "Test, Bogotá, Colombia" }),
    } as Response);

    await reverseGeocode(4.65, -74.08);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/nominatim/reverse"),
      expect.any(Object),
    );
  });
});
