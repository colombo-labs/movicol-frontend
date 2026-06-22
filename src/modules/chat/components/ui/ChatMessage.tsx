interface ChatMessageProps {
  readonly role: "user" | "assistant";
  readonly content: string;
}

/**
 * UI: Burbuja de mensaje individual del chat.
 * Soporta saltos de línea y bullets (•) del bot.
 */
export function ChatMessage({ role, content }: ChatMessageProps) {
  if (role === "user") {
    return (
      <div className="text-xs text-right">
        <span className="inline-block px-3 py-1.5 rounded-xl rounded-br-sm max-w-[85%] bg-primary/20 text-foreground">
          {content}
        </span>
      </div>
    );
  }

  // Renderizar respuesta del asistente con formato
  const lines = content.split("\n").filter((l) => l.trim() !== "");

  return (
    <div className="text-xs text-left">
      <span className="inline-block px-3 py-2 rounded-xl rounded-bl-sm max-w-[90%] bg-white/5 text-foreground space-y-1">
        {lines.map((line, i) => {
          const isBullet =
            line.trim().startsWith("•") || line.trim().startsWith("-");
          const isLabel = line.includes(":") && !isBullet && lines.length > 1;

          if (isBullet) {
            return (
              <p
                key={`bullet-${line.slice(0, 20)}`}
                className="pl-2 text-default-300"
              >
                {line.trim()}
              </p>
            );
          }

          if (isLabel) {
            const [label, ...rest] = line.split(":");
            return (
              <p key={`label-${label}`}>
                <span className="text-primary/80 font-medium">{label}:</span>
                <span className="text-default-300">{rest.join(":")}</span>
              </p>
            );
          }

          return (
            <p
              key={`line-${line.slice(0, 20)}-${i}`}
              className="text-default-300"
            >
              {line}
            </p>
          );
        })}
      </span>
    </div>
  );
}
