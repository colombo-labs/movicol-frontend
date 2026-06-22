import { useCallback, useState } from "react";
import { api } from "@shared/api/http-client";
import type { ChatMessage } from "../models";

// HTTP-only chat hook (no WebSocket)

interface ChatApiResponse {
  response: string;
  sources: string[];
  sessionId: string;
}

const uid = () => crypto.randomUUID();

export function useChatWs() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId] = useState(`session-${Date.now()}`);

  const sendMessage = useCallback(
    async (message: string, context?: string) => {
      // Mostrar solo el mensaje limpio al usuario
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "user", content: message },
      ]);

      // Enviar mensaje + contexto interno al backend
      const fullMessage = (context ?? "") + message;

      setIsStreaming(true);
      try {
        const result = await api.post<ChatApiResponse>("/chat", {
          message: fullMessage,
          sessionId,
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
            content: "[Error] No pude conectar con el servidor.",
          },
        ]);
      } finally {
        setIsStreaming(false);
      }
    },
    [sessionId],
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, sendMessage, isStreaming, isConnected: true, clearMessages };
}
