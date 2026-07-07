import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuth } from "@shared/hooks/useAuth";

describe("useAuth", () => {
  beforeEach(() => {
    // Clear cookies
    document.cookie = "access_token=; Max-Age=0; path=/";
    vi.mocked(global.fetch).mockReset();
  });

  it("should start with no user when no cookie", async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  it("should have refetch function", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.refetch).toBeDefined();
  });

  it("should handle failed auth check gracefully", async () => {
    document.cookie = "access_token=expired; path=/";
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 401,
    } as Response);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  it("should have login function", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.login).toBeDefined();
    expect(typeof result.current.login).toBe("function");
  });

  it("should have logout function", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.logout).toBeDefined();
    expect(typeof result.current.logout).toBe("function");
  });

  it("should have can() permission checker", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.can("admin")).toBe(false);
  });
});
