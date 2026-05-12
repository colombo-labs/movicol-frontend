import { Button, Input } from '@heroui/react';
import { useState } from 'react';
import { Bot, X, SendHorizontal } from 'lucide-react';

import { useChat } from '../../hooks/useChat';
import { ChatMessage } from '../ui/ChatMessage';

export function ChatWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const { messages, sendMessage, isStreaming } = useChat();

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input.trim());
      setInput('');
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
    <div className="fixed bottom-6 right-6 w-80 h-96 z-50 flex flex-col rounded-xl overflow-hidden border border-divider bg-background/95 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between px-3 py-2 border-b border-divider">
        <span className="text-sm font-semibold flex items-center gap-1.5">
          <Bot size={14} className="text-primary" /> Agente MoviCol
        </span>
        <button onClick={() => setIsExpanded(false)} className="text-default-400 hover:text-foreground">
          <X size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg, i) => <ChatMessage key={i} role={msg.role} content={msg.content} />)}
        {isStreaming && <div className="text-xs text-default-400 animate-pulse">Pensando...</div>}
      </div>
      <div className="p-2 border-t border-divider flex gap-1">
        <Input size="sm" placeholder="Pregunta algo..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
        <Button size="sm" color="primary" isIconOnly onPress={handleSend}>
          <SendHorizontal size={14} />
        </Button>
      </div>
    </div>
  );
}
