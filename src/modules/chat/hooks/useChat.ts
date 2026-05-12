import { useCallback, useState } from 'react';
import type { ChatMessage } from '../models';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming] = useState(false);

  const sendMessage = useCallback((message: string) => {
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    // TODO: connect to WS agent
  }, []);

  return { messages, sendMessage, isStreaming };
}
