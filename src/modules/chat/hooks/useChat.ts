import { useCallback, useRef, useState } from "react";
import { api } from "@shared/api/http-client";
import type { ChatMessage } from "../models";

interface ChatApiResponse {
  response: string;
  sources: string[];
  sessionId: string;
}

const uid = () => crypto.randomUUID();

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const sessionId = useRef(`session-${Date.now()}`);

  const sendMessage = useCallback(async (message: string) => {
    setMessages((prev) => [
      ...prev,
      { id: uid(), role: "user", content: message },
    ]);
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
          content: "[Error] Error al conectar con el agente. Intenta de nuevo.",
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, sendMessage, isStreaming, clearMessages };
}
