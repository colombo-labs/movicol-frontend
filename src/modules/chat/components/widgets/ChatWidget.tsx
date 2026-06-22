import { Button, Input } from "@heroui/react";
import { useState } from "react";
import { Bot, X, SendHorizontal, Wifi, WifiOff } from "lucide-react";

import { useChatWs } from "../../hooks/useChatWs";
import { ChatMessage } from "../ui/ChatMessage";

export function ChatWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, isStreaming, isConnected, clearMessages } =
    useChatWs();

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input.trim());
      setInput("");
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center hover:scale-110 transition-transform z-50"
        title="Chat con IA"
      >
        <Bot size={22} className="text-primary" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 h-[28rem] z-50 flex flex-col rounded-xl overflow-hidden border border-divider bg-background/95 backdrop-blur-xl shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-divider">
        <span className="text-sm font-semibold flex items-center gap-1.5">
          <Bot size={14} className="text-primary" /> MoviBot
          {isConnected ? (
            <Wifi size={10} className="text-success" />
          ) : (
            <WifiOff size={10} className="text-default-400" />
          )}
        </span>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="text-[10px] text-default-400 hover:text-foreground px-1"
            >
              Limpiar
            </button>
          )}
          <button
            onClick={() => setIsExpanded(false)}
            className="text-default-400 hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-default-400 text-center py-2">
              Pregúntame sobre movilidad en Bogotá
            </p>
            <div className="flex flex-wrap gap-1">
              {[
                "¿Cómo está el tráfico a las 8am?",
                "¿Cuántas estaciones hay?",
                "Info de Calle 72",
                "¿Mejor hora para viajar?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-[10px] px-2 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
        ))}
        {isStreaming && (
          <div className="text-xs text-default-400 animate-pulse">
            Pensando...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-2 border-t border-divider flex gap-1">
        <Input
          size="sm"
          placeholder="Pregunta algo..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button
          size="sm"
          color="primary"
          isIconOnly
          onPress={handleSend}
          isDisabled={isStreaming}
        >
          <SendHorizontal size={14} />
        </Button>
      </div>
    </div>
  );
}
