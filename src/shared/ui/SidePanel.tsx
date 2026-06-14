import { X } from "lucide-react";
import type { ReactNode } from "react";

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function SidePanel({
  isOpen,
  onClose,
  title,
  children,
}: SidePanelProps) {
  return (
    <div
      className={`absolute top-0 left-0 z-[500] border-r border-divider bg-background/95 backdrop-blur-xl flex flex-col transition-transform duration-300 ease-in-out
        w-full h-[calc(100%-56px)] md:h-full md:w-[360px]
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      aria-hidden={!isOpen}
    >
      {/* Mobile drag indicator */}
      <div className="md:hidden flex justify-center pt-2 pb-0">
        <div className="w-10 h-1 rounded-full bg-default-300" />
      </div>
      <div className="h-12 flex items-center justify-between px-4 border-b border-divider shrink-0 relative">
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-primary/50 to-transparent" />
        <span className="text-sm font-semibold">{title}</span>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground hover:bg-default-100 transition-colors active:scale-90"
          aria-label="Cerrar panel"
        >
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {children}
      </div>
    </div>
  );
}
