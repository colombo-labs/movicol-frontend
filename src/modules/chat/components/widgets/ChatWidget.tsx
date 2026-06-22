import { Button, Input } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import { Bot, X, SendHorizontal, Wifi, WifiOff, Minus } from "lucide-react";


import { useChatWs } from "../../hooks/useChatWs";
import { ChatMessage } from "../ui/ChatMessage";

type ModuleId = "planificar" | "rutas" | "accesibilidad" | "metricas" | null;

interface ChatWidgetProps {
  activeModule?: ModuleId;
}

const SUGGESTIONS: Record<string, string[]> = {
  default: [
    "¿Cómo está el tráfico ahora?",
    "¿Cuántas estaciones hay?",
    "Mejor hora para viajar",
    "Zonas de riesgo vial",
  ],
  planificar: [
    "¿Mejor hora para ir al norte?",
    "¿Cómo evitar congestión?",
    "Ruta más rápida de Usaquén a Centro",
    "Alternativas en hora pico",
  ],
  rutas: [
    "¿Qué rutas pasan por Calle 72?",
    "Info estación Héroes",
    "Conexiones de la Troncal Caracas",
    "Estaciones con más demanda",
  ],
  accesibilidad: [
    "¿Qué estaciones son accesibles?",
    "Rutas con acceso para sillas de ruedas",
    "Cobertura de accesibilidad",
    "Estaciones adaptadas cerca",
  ],
  metricas: [
    "Congestión promedio hoy",
    "Hora con más tráfico",
    "Estaciones en nivel crítico",
    "Comparar tráfico 7am vs 5pm",
  ],
};

export function ChatWidget({ activeModule }: ChatWidgetProps) {
  const [state, setState] = useState<"closed" | "minimized" | "open">("closed");
  const [input, setInput] = useState("");
  const { messages, sendMessage, isStreaming, isConnected, clearMessages } =
    useChatWs();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleSend = (text?: string) => {
    const msg = (text ?? input).trim();
    if (msg && !isStreaming) {
      const context = activeModule ? `[módulo: ${activeModule}] ` : "";
      sendMessage(msg, context);
      if (!text) setInput("");
    }
  };

  const suggestions = SUGGESTIONS[activeModule ?? "default"] ?? SUGGESTIONS.default;

  // Closed: solo botón flotante
  if (state === "closed") {
    return (
      <button
        onClick={() => setState("open")}
        className="fixed bottom-28 md:bottom-6 right-4 md:right-[10px] w-12 h-12 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center hover:scale-110 transition-transform z-[600] shadow-lg shadow-primary/20"
        title="Chat con IA"
      >
        <Bot size={22} className="text-primary" />
      </button>
    );
  }

  // Minimized: barra compacta con último mensaje
  if (state === "minimized") {
    const lastMsg = messages.filter((m) => m.role === "assistant").pop();
    return (
      <div
        onClick={() => setState("open")}
        className="fixed bottom-28 md:bottom-6 right-4 md:right-[10px] z-[600] flex items-center gap-2 px-3 py-2 rounded-xl bg-background border border-divider shadow-xl cursor-pointer hover:border-primary/50 transition-all max-w-[240px]"
      >
        <Bot size={16} className="text-primary shrink-0" />
        <span className="text-[10px] text-default-400 truncate">
          {isStreaming ? "Pensando..." : lastMsg?.content.slice(0, 40) || "MoviBot"}
          {lastMsg && lastMsg.content.length > 40 ? "..." : ""}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); setState("closed"); }}
          className="text-default-400 hover:text-foreground shrink-0"
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-28 md:bottom-6 right-4 md:right-[10px] w-80 h-[28rem] z-[600] flex flex-col rounded-xl overflow-hidden border border-divider bg-background/95 backdrop-blur-xl shadow-xl">
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
            onClick={() => setState("minimized")}
            className="text-default-400 hover:text-foreground"
            title="Minimizar"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={() => setState("closed")}
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
            <p className="text-xs text-default-400 text-center py-1">
              {activeModule
                ? `Pregúntame sobre ${activeModule}`
                : "Pregúntame sobre movilidad en Bogotá"}
            </p>
            <div className="flex flex-wrap gap-1">
              {suggestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
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
        <div ref={messagesEndRef} />
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
          onPress={() => handleSend()}
          isDisabled={isStreaming || !input.trim()}
        >
          <SendHorizontal size={14} />
        </Button>
      </div>
    </div>
  );
}
