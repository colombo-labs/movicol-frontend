import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useChatWs } from "@modules/chat/hooks/useChatWs";

// Mock the api module
vi.mock("@shared/api/http-client", () => ({
  api: {
    post: vi.fn(),
  },
}));

import { api } from "@shared/api/http-client";
const mockPost = api.post as ReturnType<typeof vi.fn>;

describe("useChatWs", () => {
  beforeEach(() => {
    mockPost.mockReset();
  });

  it("should initialize with empty messages", () => {
    const { result } = renderHook(() => useChatWs());
    expect(result.current.messages).toHaveLength(0);
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.isConnected).toBe(true);
  });

  it("should add user message and bot response on sendMessage", async () => {
    mockPost.mockResolvedValue({
      response: "Hola, soy MoviBot",
      sources: ["rule_based"],
      sessionId: "test",
      actions: [],
    });

    const { result } = renderHook(() => useChatWs());

    await act(async () => {
      await result.current.sendMessage("hola");
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].role).toBe("user");
      expect(result.current.messages[0].content).toBe("hola");
      expect(result.current.messages[1].role).toBe("assistant");
      expect(result.current.messages[1].content).toBe("Hola, soy MoviBot");
    });
  });

  it("should handle API errors gracefully", async () => {
    mockPost.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useChatWs());

    await act(async () => {
      await result.current.sendMessage("test");
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[1].content).toContain("No pude conectar");
    });
  });

  it("should call onAction when actions are returned", async () => {
    const onAction = vi.fn();
    mockPost.mockResolvedValue({
      response: "Planificando ruta",
      sources: [],
      sessionId: "test",
      actions: [
        { type: "plan_route", data: { origin: "a", destination: "b" } },
      ],
    });

    const { result } = renderHook(() => useChatWs(onAction));

    await act(async () => {
      await result.current.sendMessage("ir de a a b");
    });

    await waitFor(() => {
      expect(onAction).toHaveBeenCalledWith({
        type: "plan_route",
        data: { origin: "a", destination: "b" },
      });
    });
  });

  it("should clear messages", async () => {
    mockPost.mockResolvedValue({
      response: "resp",
      sources: [],
      sessionId: "t",
      actions: [],
    });

    const { result } = renderHook(() => useChatWs());

    await act(async () => {
      await result.current.sendMessage("msg");
    });

    await waitFor(() => expect(result.current.messages).toHaveLength(2));

    act(() => {
      result.current.clearMessages();
    });

    expect(result.current.messages).toHaveLength(0);
  });

  it("should pass context to API", async () => {
    mockPost.mockResolvedValue({
      response: "ok",
      sources: [],
      sessionId: "t",
      actions: [],
    });

    const { result } = renderHook(() => useChatWs());
    const context = { module: "planificar", origin: "Usaquén" };

    await act(async () => {
      await result.current.sendMessage("hola", context);
    });

    expect(mockPost).toHaveBeenCalledWith(
      "/chat",
      expect.objectContaining({
        message: "hola",
        context: { module: "planificar", origin: "Usaquén" },
      }),
    );
  });
});
