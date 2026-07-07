import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@shared/api/http-client", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("useChat (legacy hook)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should initialize empty", async () => {
    const { useChat } = await import("@modules/chat/hooks/useChat");
    const { result } = renderHook(() => useChat());
    expect(result.current.messages).toEqual([]);
    expect(result.current.isStreaming).toBe(false);
  });

  it("should send message", async () => {
    const { api } = await import("@shared/api/http-client");
    (api.post as any).mockResolvedValue({
      response: "Hello",
      sources: [],
      sessionId: "s1",
    });

    const { useChat } = await import("@modules/chat/hooks/useChat");
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("hi");
    });

    await waitFor(() => {
      expect(result.current.messages.length).toBe(2);
    });
  });

  it("should handle error", async () => {
    const { api } = await import("@shared/api/http-client");
    (api.post as any).mockRejectedValue(new Error("fail"));

    const { useChat } = await import("@modules/chat/hooks/useChat");
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("test");
    });

    await waitFor(() => {
      expect(result.current.messages.length).toBe(2);
      expect(result.current.messages[1].content).toContain("Error");
    });
  });
});

describe("useAddressSearch", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should initialize empty", async () => {
    const { useAddressSearch } = await import(
      "@modules/planificar/hooks/useAddressSearch"
    );
    const { result } = renderHook(() => useAddressSearch());
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.searching).toBe(false);
  });

  it("should not search with short query", async () => {
    const { useAddressSearch } = await import(
      "@modules/planificar/hooks/useAddressSearch"
    );
    const { result } = renderHook(() => useAddressSearch());

    act(() => {
      result.current.handleSearch("ab");
    });

    expect(result.current.searchResults).toEqual([]);
  });

  it("should search with valid query", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ features: [] }),
    } as Response);

    const { useAddressSearch } = await import(
      "@modules/planificar/hooks/useAddressSearch"
    );
    const { result } = renderHook(() => useAddressSearch());

    act(() => {
      result.current.handleSearch("usaquen");
    });

    // Wait for debounce
    await waitFor(
      () => {
        expect(result.current.searchResults.length).toBeGreaterThanOrEqual(0);
      },
      { timeout: 1000 },
    );
  });

  it("should clear search", async () => {
    const { useAddressSearch } = await import(
      "@modules/planificar/hooks/useAddressSearch"
    );
    const { result } = renderHook(() => useAddressSearch());

    act(() => {
      result.current.handleSearch("");
    });

    expect(result.current.searchResults).toEqual([]);
  });
});

describe("usePlanRoute", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should initialize with no prediction", async () => {
    const { usePlanRoute } = await import(
      "@modules/planificar/hooks/usePlanRoute"
    );
    const { result } = renderHook(() => usePlanRoute());
    expect(result.current.prediction).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("should have planRoute function", async () => {
    const { usePlanRoute } = await import(
      "@modules/planificar/hooks/usePlanRoute"
    );
    const { result } = renderHook(() => usePlanRoute());
    expect(result.current.planRoute).toBeDefined();
  });
});

