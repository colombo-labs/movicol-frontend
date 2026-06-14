interface ChatMessageProps {
  readonly role: "user" | "assistant";
  readonly content: string;
}

/**
 * UI: Burbuja de mensaje individual del chat.
 */
export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div className={`text-xs ${role === "user" ? "text-right" : "text-left"}`}>
      <span
        className={`inline-block px-2 py-1 rounded-lg max-w-[90%] ${
          role === "user" ? "bg-primary/20" : "bg-white/5"
        }`}
      >
        {content}
      </span>
    </div>
  );
}
