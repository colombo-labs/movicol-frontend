import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useChat } from "../useChat";

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          response: "Hola, soy MoviBot",
          sources: ["grafo"],
          sessionId: "test",
        }),
    }),
  ) as unknown as typeof fetch;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useChat", () => {
  it("starts with empty messages", () => {
    const { result } = renderHook(() => useChat());
    expect(result.current.messages).toHaveLength(0);
  });

  it("adds user message and gets response", async () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.sendMessage("Hola");
    });
    expect(result.current.messages[0].role).toBe("user");

    await waitFor(() => expect(result.current.messages).toHaveLength(2));
    expect(result.current.messages[1].role).toBe("assistant");
    expect(result.current.messages[1].content).toBe("Hola, soy MoviBot");
  });

  it("handles errors gracefully", async () => {
    vi.mocked(global.fetch).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: "Error",
      } as Response),
    );

    const { result } = renderHook(() => useChat());
    act(() => {
      result.current.sendMessage("test");
    });

    await waitFor(() => expect(result.current.messages).toHaveLength(2));
    expect(result.current.messages[1].content).toContain("Error");
  });

  it("clears messages", async () => {
    const { result } = renderHook(() => useChat());
    act(() => {
      result.current.sendMessage("Hola");
    });
    await waitFor(() => expect(result.current.messages).toHaveLength(2));

    act(() => {
      result.current.clearMessages();
    });
    expect(result.current.messages).toHaveLength(0);
  });
});
