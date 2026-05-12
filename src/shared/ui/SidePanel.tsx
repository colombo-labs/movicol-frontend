import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function SidePanel({ isOpen, onClose, title, children }: SidePanelProps) {
  return (
    <div
      className={`absolute top-0 left-0 h-full w-full md:w-[360px] z-10 border-r border-divider bg-background/95 backdrop-blur-xl flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      aria-hidden={!isOpen}
    >
      <div className="h-12 flex items-center justify-between px-4 border-b border-divider shrink-0">
        <span className="text-sm font-semibold">{title}</span>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground hover:bg-default-100 transition-colors"
          aria-label="Cerrar panel"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {children}
      </div>
    </div>
  );
}
