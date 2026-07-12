import { useTranslation } from "react-i18next";
import { Button, Input, Tooltip } from "@heroui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  X,
  SendHorizontal,
  Minus,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";

import { useChatWs } from "../../hooks/useChatWs";
import { useVoice } from "../../hooks/useVoice";
import { ChatMessage } from "../ui/ChatMessage";
import type { AppContext, ChatAction } from "../../hooks/useChatWs";
import type { ChatMessage as ChatMessageType } from "../../models";

type ModuleId = "planificar" | "rutas" | "accesibilidad" | "metricas" | null;

interface TripPoint {
  lat: number;
  lon: number;
  label: string;
}

interface ChatWidgetProps {
  readonly activeModule?: ModuleId;
  readonly tripPoints?: TripPoint[];
  readonly transportMode?: string;
  readonly onAction?: (action: ChatAction) => void;
}

function getSuggestions(
  module: ModuleId,
  tripPoints?: TripPoint[],
  hour?: number,
): string[] {
  const isPeak =
    hour !== undefined &&
    ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19));
  const hasOrigin = tripPoints && tripPoints.length >= 1;
  const hasRoute = tripPoints && tripPoints.length >= 2;

  if (hasRoute) {
    return [
      "¿Hay congestión en mi ruta?",
      "¿Es segura esta zona a esta hora?",
      "¿Hay alternativas más rápidas?",
      "¿Cuánto cuesta el viaje?",
    ];
  }

  if (hasOrigin && !hasRoute) {
    return [
      "¿A dónde me recomiendas ir?",
      "Estaciones cercanas a mi origen",
      "¿Cómo está el tráfico ahora?",
      "Quiero ir al centro",
    ];
  }

  if (isPeak) {
    return [
      "¿Cómo evitar la congestión ahora?",
      "Mejor hora para viajar al norte",
      "Rutas menos congestionadas",
      "¿Cuándo baja el tráfico?",
    ];
  }

  switch (module) {
    case "planificar":
      return [
        "Ir de Usaquén al Centro",
        "Mejor hora para viajar",
        "¿Cómo evitar congestión?",
        "Alternativas en hora pico",
      ];
    case "rutas":
      return [
        "¿Qué rutas pasan por Calle 72?",
        "Info estación Héroes",
        "Ruta J74",
        "Troncales con más estaciones",
      ];
    case "accesibilidad":
      return [
        "Estaciones accesibles cerca",
        "Rutas con rampa",
        "Cobertura de accesibilidad",
        "Estaciones adaptadas",
      ];
    case "metricas":
      return [
        "Congestión a las 7am",
        "Hora con más tráfico",
        "Estaciones en nivel crítico",
        "Comparar 7am vs 5pm",
      ];
    default:
      return [
        "¿Cómo está el tráfico ahora?",
        "Ir de Suba a Chapinero",
        "Estaciones TransMilenio",
        "Zonas de riesgo vial",
      ];
  }
}

function ChatClosed({ onOpen }: { readonly onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="fixed bottom-20 md:bottom-6 right-4 md:right-[10px] w-12 h-12 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center hover:scale-110 transition-transform z-[450] md:z-[600] shadow-lg shadow-primary/20"
      title="Chat con MoviBot"
    >
      <Bot size={22} className="text-primary" />
    </button>
  );
}

function ChatMinimized({
  messages,
  isStreaming,
  onOpen,
  onClose,
  t,
}: {
  readonly messages: ChatMessageType[];
  readonly isStreaming: boolean;
  readonly onOpen: () => void;
  readonly onClose: () => void;
  readonly t: (key: string) => string;
}) {
  const lastMsg = [...messages].reverse().find((m) => m.role === "assistant");
  const truncated = lastMsg?.content.slice(0, 40) ?? "MoviBot";
  const suffix = lastMsg && lastMsg.content.length > 40 ? "..." : "";
  const preview = isStreaming ? t("chat.thinking") : truncated + suffix;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="fixed bottom-20 md:bottom-6 right-4 md:right-[10px] z-[450] md:z-[600] flex items-center gap-2 px-3 py-2 rounded-xl bg-background border border-divider shadow-xl cursor-pointer hover:border-primary/50 transition-all max-w-[240px]"
    >
      <Bot size={16} className="text-primary shrink-0" />
      <span className="text-[10px] text-default-400 truncate">{preview}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="text-default-400 hover:text-foreground shrink-0 cursor-pointer bg-transparent border-none p-0"
        aria-label="Close chat"
      >
        <X size={12} />
      </button>
    </button>
  );
}

export function ChatWidget({
  activeModule,
  tripPoints,
  transportMode,
  onAction,
}: ChatWidgetProps) {
  const { t } = useTranslation();
  const [state, setState] = useState<"closed" | "minimized" | "open">("closed");
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Build app context for the AI
  const appContext: AppContext = useMemo(() => {
    const origin = tripPoints?.[0];
    const hasMultiplePoints = (tripPoints?.length ?? 0) >= 2;
    const destination = hasMultiplePoints
      ? tripPoints?.[tripPoints!.length - 1]
      : undefined;
    return {
      module: activeModule,
      origin: origin?.label ?? null,
      destination: destination?.label ?? null,
      originCoords: origin ? [origin.lat, origin.lon] : null,
      destinationCoords: destination
        ? [destination.lat, destination.lon]
        : null,
      transportMode: transportMode ?? null,
    };
  }, [activeModule, tripPoints, transportMode]);

  // Action handler
  const handleAction = useCallback(
    (action: ChatAction) => onAction?.(action),
    [onAction],
  );

  const { messages, sendMessage, isStreaming, clearMessages } =
    useChatWs(handleAction);

  // Voice hooks
  const handleVoiceResult = useCallback(
    (transcript: string) => {
      const trimmed = transcript.trim();
      if (trimmed) sendMessage(trimmed, appContext);
    },
    [sendMessage, appContext],
  );

  const {
    isListening,
    ttsEnabled,
    error: voiceError,
    startListening,
    stopListening,
    speak,
    toggleTts,
    isSupported: voiceSupported,
  } = useVoice({ onResult: handleVoiceResult });

  // Auto-TTS on new assistant messages
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    const shouldSpeak =
      ttsEnabled && lastMsg?.role === "assistant" && !isStreaming;
    if (shouldSpeak) speak(lastMsg.content);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, isStreaming]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleSend = useCallback(
    (text?: string) => {
      const msg = (text ?? input).trim();
      if (!msg || isStreaming) return;
      sendMessage(msg, appContext);
      if (!text) setInput("");
    },
    [input, isStreaming, sendMessage, appContext],
  );

  const currentHour = new Date().getHours();
  const suggestions = getSuggestions(
    activeModule ?? null,
    tripPoints,
    currentHour,
  );

  if (state === "closed") {
    return <ChatClosed onOpen={() => setState("open")} />;
  }

  if (state === "minimized") {
    return (
      <ChatMinimized
        messages={messages}
        isStreaming={isStreaming}
        onOpen={() => setState("open")}
        onClose={() => setState("closed")}
        t={t}
      />
    );
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-[10px] w-80 h-[28rem] z-[450] md:z-[600] flex flex-col rounded-xl overflow-hidden border border-divider bg-background/95 backdrop-blur-xl shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-divider">
        <span className="text-sm font-semibold flex items-center gap-1.5">
          <Bot size={14} className="text-primary" /> MoviBot
          {isListening && (
            <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
          )}
        </span>
        <div className="flex items-center gap-1">
          {voiceSupported && (
            <Tooltip content={ttsEnabled ? "Silenciar" : "Activar voz"}>
              <button
                onClick={toggleTts}
                className="text-default-400 hover:text-foreground p-0.5"
              >
                {ttsEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
              </button>
            </Tooltip>
          )}
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
                ? `Pregúntame sobre ${activeModule} 🚌`
                : "Pregúntame sobre movilidad en Bogotá 🚌"}
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
          <div className="text-xs text-default-400 animate-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
            <span
              className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            />
            <span
              className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <span className="ml-1">Pensando...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-2 border-t border-divider">
        {voiceError && (
          <p className="text-[10px] text-danger mb-1 px-1">{voiceError}</p>
        )}
        {isListening && (
          <p className="text-[10px] text-success mb-1 px-1 animate-pulse">
            Escuchando... habla ahora. Toca el micrófono para parar.
          </p>
        )}
        <div className="flex gap-1">
          {voiceSupported && (
            <Button
              size="sm"
              variant={isListening ? "solid" : "light"}
              color={isListening ? "danger" : "default"}
              isIconOnly
              onPress={isListening ? stopListening : startListening}
              title={isListening ? "Detener" : "Hablar"}
            >
              {isListening ? <MicOff size={14} /> : <Mic size={14} />}
            </Button>
          )}
          <Input
            id="chat-input"
            name="chat-input"
            size="sm"
            autoComplete="off"
            placeholder={
              isListening ? t("chat.listening") : t("chat.placeholder")
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            isDisabled={isListening}
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
    </div>
  );
}
