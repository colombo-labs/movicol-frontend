import { useCallback, useRef, useState } from "react";
import { createWsClient } from "@shared/api/ws-client";
import { api } from "@shared/api/http-client";
import type { ChatMessage } from "../models";
import type { Socket } from "socket.io-client";

interface ChatApiResponse {
  response: string;
  sources: string[];
  sessionId: string;
}

const uid = () => crypto.randomUUID();

/**
 * Chat hook — HTTP-first with optional WebSocket upgrade.
 * WS connects lazily on first message. Falls back to HTTP if WS fails.
 */
export function useChatWs() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const sessionId = useRef(`session-${Date.now()}`);
  const wsAttempted = useRef(false);

  const connectWs = useCallback(() => {
    if (wsAttempted.current) return;
    wsAttempted.current = true;

    try {
      const socket = createWsClient("chat");
      socketRef.current = socket;

      socket.on("connect", () => setIsConnected(true));
      socket.on("disconnect", () => setIsConnected(false));
      socket.on("connect_error", () => {
        // WS failed — will use HTTP fallback
        socket.disconnect();
        socketRef.current = null;
      });

      socket.on("chat:stream:start", () => setIsStreaming(true));
      socket.on("chat:stream:token", (data: { token: string }) => {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              { ...last, content: last.content + data.token },
            ];
          }
          return [
            ...prev,
            { id: uid(), role: "assistant", content: data.token },
          ];
        });
      });
      socket.on("chat:stream:end", () => setIsStreaming(false));
      socket.on("error", () => {
        setIsStreaming(false);
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            content: "[Error] Error del agente.",
          },
        ]);
      });
    } catch {
      // WS not available
    }
  }, []);

  const sendMessage = useCallback(
    async (message: string) => {
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "user", content: message },
      ]);

      // Try WS connect on first message
      if (!wsAttempted.current) connectWs();

      // If WS connected, use it
      if (isConnected && socketRef.current?.connected) {
        socketRef.current.emit("chat:message", {
          message,
          sessionId: sessionId.current,
        });
        return;
      }

      // HTTP fallback
      setIsStreaming(true);
      try {
        const result = await api.post<ChatApiResponse>("/chat", {
          message,
          sessionId: sessionId.current,
        });
        setMessages((prev) => [
          ...prev,
          { id: uid(), role: "assistant", content: result.response },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            content: "[Error] Error al conectar.",
          },
        ]);
      } finally {
        setIsStreaming(false);
      }
    },
    [isConnected, connectWs],
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, sendMessage, isStreaming, isConnected, clearMessages };
}
