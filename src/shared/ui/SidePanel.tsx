import { X, ChevronUp, ChevronDown, Minus } from "lucide-react";
import { type ReactNode, useRef, useCallback, useState, useEffect } from "react";

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

type SnapPoint = "peek" | "half" | "full";

const SNAP_HEIGHTS: Record<SnapPoint, string> = {
  peek: "h-[18vh]",
  half: "h-[50vh]",
  full: "h-[82vh]",
};

export function SidePanel({
  isOpen,
  onClose,
  title,
  children,
}: SidePanelProps) {
  const startY = useRef(0);
  const [snap, setSnap] = useState<SnapPoint>("half");

  // Reset snap al abrir
  useEffect(() => {
    if (isOpen) setSnap("half");
  }, [isOpen]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const deltaY = e.changedTouches[0].clientY - startY.current;

      if (deltaY > 50) {
        if (snap === "full") setSnap("half");
        else if (snap === "half") setSnap("peek");
        else onClose();
      } else if (deltaY < -50) {
        if (snap === "peek") setSnap("half");
        else if (snap === "half") setSnap("full");
      }
    },
    [snap, onClose],
  );

  return (
    <>
      {/* Backdrop — solo cuando está en full */}
      {isOpen && snap === "full" && (
        <button
          type="button"
          className="md:hidden absolute inset-0 z-[499] bg-black/20 transition-opacity duration-300 border-none cursor-default"
          onClick={() => setSnap("half")}
          aria-label="Close panel"
        />
      )}

      <div
        className={`absolute z-[500] border-divider bg-background flex flex-col transition-all duration-300 ease-out
          md:top-0 md:left-0 md:h-full md:w-[360px] md:border-r md:translate-y-0 md:rounded-none md:shadow-none
          ${isOpen ? "md:translate-x-0" : "md:-translate-x-full"}
          top-auto bottom-0 left-0 right-0 ${SNAP_HEIGHTS[snap]} rounded-t-2xl border-t shadow-[0_-4px_20px_rgba(0,0,0,0.3)]
          ${isOpen ? "translate-y-0" : "translate-y-full"}
        `}
        inert={!isOpen ? true : undefined}
      >
        {/* Mobile drag handle + status */}
        <div
          className="md:hidden flex flex-col items-center pt-2 pb-0.5 cursor-grab active:cursor-grabbing touch-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 rounded-full bg-default-300 mb-1.5" />
          <div className="flex items-center gap-2 text-[8px] text-default-400">
            <span>Bogotá D.C.</span>
            <span className="w-px h-2.5 bg-divider" />
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Conectado
            </span>
            <span className="w-px h-2.5 bg-divider" />
            <span>
              {new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="h-11 flex items-center justify-between px-4 border-b border-divider shrink-0 relative">
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-primary/50 to-transparent" />
          <span className="text-sm font-semibold">{title}</span>
          <div className="flex items-center gap-0.5">
            {/* Snap controls (mobile only) */}
            {snap !== "peek" && (
              <button
                onClick={() => setSnap("peek")}
                className="md:hidden w-7 h-7 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground transition-colors"
                aria-label="Minimizar"
              >
                <Minus size={14} />
              </button>
            )}
            {snap !== "full" && (
              <button
                onClick={() => setSnap(snap === "peek" ? "half" : "full")}
                className="md:hidden w-7 h-7 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground transition-colors"
                aria-label="Expandir"
              >
                <ChevronUp size={14} />
              </button>
            )}
            {snap === "full" && (
              <button
                onClick={() => setSnap("half")}
                className="md:hidden w-7 h-7 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground transition-colors"
                aria-label="Reducir"
              >
                <ChevronDown size={14} />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground hover:bg-default-100 transition-colors active:scale-90"
              aria-label="Cerrar panel"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className={`flex-1 overflow-y-auto overflow-x-hidden p-4 custom-scrollbar overscroll-contain transition-opacity duration-200 ${
            snap === "peek" ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          {children}
        </div>
      </div>
    </>
  );
}
