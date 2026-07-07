import { useCallback, useState } from "react";
import { api } from "@shared/api/http-client";
import type { ChatMessage } from "../models";

/**
 * Chat hook with context awareness and action handling.
 */

export interface AppContext {
  module?: string | null;
  origin?: string | null;
  destination?: string | null;
  originCoords?: [number, number] | null;
  destinationCoords?: [number, number] | null;
  activeRoute?: string | null;
  selectedHour?: number | null;
  transportMode?: string | null;
}

export interface ChatAction {
  type: string;
  data: Record<string, unknown>;
}

interface ChatApiResponse {
  response: string;
  sources: string[];
  sessionId: string;
  actions?: ChatAction[];
}

const uid = () => crypto.randomUUID();

export function useChatWs(onAction?: (action: ChatAction) => void) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId] = useState(`session-${Date.now()}`);

  const sendMessage = useCallback(
    async (message: string, context?: AppContext) => {
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "user", content: message },
      ]);

      setIsStreaming(true);
      try {
        const result = await api.post<ChatApiResponse>("/chat", {
          message,
          sessionId,
          context: context ?? undefined,
        });

        setMessages((prev) => [
          ...prev,
          { id: uid(), role: "assistant", content: result.response },
        ]);

        // Execute any actions returned by the bot
        if (result.actions && result.actions.length > 0 && onAction) {
          for (const action of result.actions) {
            onAction(action);
          }
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            content: "⚠️ No pude conectar con el servidor. Intenta de nuevo.",
          },
        ]);
      } finally {
        setIsStreaming(false);
      }
    },
    [sessionId, onAction],
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  return {
    messages,
    sendMessage,
    isStreaming,
    isConnected: true,
    clearMessages,
  };
}
