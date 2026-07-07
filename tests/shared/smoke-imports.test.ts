import { describe, it, expect, vi } from "vitest";

/**
 * Coverage boost — test imports and basic functionality of all modules.
 * Ensures every file is at least loaded and doesn't crash on import.
 */

describe("Module imports — smoke tests", () => {
  it("should import shared/config", async () => {
    const mod = await import("@/shared/config");
    expect(mod).toBeDefined();
  });

  it("should import shared/utils/geocode", async () => {
    const mod = await import("@shared/utils/geocode");
    expect(mod.geocodeAddress).toBeDefined();
    expect(typeof mod.geocodeAddress).toBe("function");
  });

  it("should import shared/utils/reverseGeocode", async () => {
    const mod = await import("@shared/utils/reverseGeocode");
    expect(mod.reverseGeocode).toBeDefined();
  });

  it("should import chat hooks", async () => {
    const mod = await import("@modules/chat/hooks/useChatWs");
    expect(mod.useChatWs).toBeDefined();
  });

  it("should import voice hook", async () => {
    const mod = await import("@modules/chat/hooks/useVoice");
    expect(mod.useVoice).toBeDefined();
  });

  it("should import ChatMessage", async () => {
    const mod = await import("@modules/chat/components/ui/ChatMessage");
    expect(mod.ChatMessage).toBeDefined();
  });

  it("should import ChatWidget", async () => {
    const mod = await import("@modules/chat/components/widgets/ChatWidget");
    expect(mod.ChatWidget).toBeDefined();
  });

  it("should import planificar api", async () => {
    const mod = await import("@modules/planificar/api/planificarApi");
    expect(mod.calcDistance).toBeDefined();
  });

  it("should import AuthButton", async () => {
    const mod = await import("@shared/ui/AuthButton");
    expect(mod.AuthButton).toBeDefined();
  });

  it("should import ConfigModal", async () => {
    const mod = await import("@shared/ui/ConfigModal");
    expect(mod.ConfigModal).toBeDefined();
  });

  it("should import NotificationsModal", async () => {
    const mod = await import("@shared/ui/NotificationsModal");
    expect(mod.NotificationsDropdown).toBeDefined();
    expect(mod.NotificationsModal).toBeDefined();
  });
});

describe("planificarApi functions", () => {
  it("calcDistance should calculate between two points", async () => {
    const { calcDistance } = await import("@modules/planificar/api/planificarApi");
    const dist = calcDistance(4.695, -74.031, 4.598, -74.076);
    expect(dist).toBeGreaterThan(5);
    expect(dist).toBeLessThan(20);
  });

  it("fetchRutasCercanas should return results", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ features: [] }),
    } as Response);

    const { fetchRutasCercanas } = await import("@modules/planificar/api/planificarApi");
    const results = await fetchRutasCercanas(4.65, -74.08);
    expect(Array.isArray(results)).toBe(true);
  });
});

describe("shared/hooks/useAuth — basic", () => {
  it("should export useAuth", async () => {
    const mod = await import("@shared/hooks/useAuth");
    expect(mod.useAuth).toBeDefined();
    expect(typeof mod.useAuth).toBe("function");
  });
});

describe("shared/hooks/useTheme — basic", () => {
  it("should export useTheme", async () => {
    const mod = await import("@shared/hooks/useTheme");
    expect(mod.useTheme).toBeDefined();
  });
});
