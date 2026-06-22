import { Bus, Navigation, Route, Accessibility, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";

export type PanelId =
  | "planificar"
  | "rutas"
  | "accesibilidad"
  | "metricas"
  | null;

interface PanelItem {
  id: Exclude<PanelId, null>;
  icon: LucideIcon;
  label: string;
}

const panels: PanelItem[] = [
  { id: "planificar", icon: Navigation, label: "Planificar viaje" },
  { id: "rutas", icon: Route, label: "Rutas" },
  { id: "accesibilidad", icon: Accessibility, label: "Accesibilidad" },
  { id: "metricas", icon: BarChart3, label: "Métricas" },
];

interface SidebarProps {
  activePanel: PanelId;
  onTogglePanel: (id: PanelId) => void;
}

export function Sidebar({ activePanel, onTogglePanel }: SidebarProps) {
  const [expanded, setExpanded] = useState(false);
  const [time, setTime] = useState(
    new Date().toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  );
  useEffect(() => {
    const t = setInterval(
      () =>
        setTime(
          new Date().toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        ),
      30000,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={`
        ${expanded ? "w-52" : "w-16"} h-full flex-col border-r border-divider bg-background backdrop-blur-xl transition-all duration-200 z-20
        hidden md:flex
      `}
      >
        <div className="h-14 flex items-center justify-center border-b border-divider px-3 shrink-0">
          <div
            className={`flex items-center gap-2 ${expanded ? "w-full" : ""}`}
          >
            <div className="w-11 h-11 rounded-xl bg-[#2d8a5e] flex items-center justify-center shrink-0 shadow-sm">
              <Bus size={20} className="dark:text-black text-white" />
            </div>
            {expanded && (
              <div className="flex flex-col leading-tight">
                <span className="text-base font-bold text-foreground">
                  Movi<span className="text-[#2d8a5e]">Col</span>
                </span>
                <span className="text-[10px] text-default-400">
                  Transporte inteligente
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center gap-1.5 py-4">
          {panels.map((p) => {
            const isActive = activePanel === p.id;
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => onTogglePanel(isActive ? null : p.id)}
                title={p.label}
                aria-label={`${isActive ? "Cerrar" : "Abrir"}: ${p.label}`}
                className={`${expanded ? "w-[calc(100%-1rem)] px-3" : "w-10"} h-10 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                  isActive
                    ? "bg-primary/20 ring-1 ring-primary/50 text-primary"
                    : "text-default-500 hover:bg-default-100 hover:text-foreground active:scale-95"
                } ${expanded ? "" : "justify-center"}`}
              >
                <div className="relative shrink-0">
                  <Icon size={18} />
                  {p.id === "rutas" && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-warning animate-pulse" />
                  )}
                </div>
                {expanded && (
                  <span className="text-sm truncate">{p.label}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom - status & version */}
        <div className="border-t border-divider px-3 py-3 shrink-0">
          <div
            className={`flex items-center gap-2 ${expanded ? "" : "justify-center"}`}
          >
            <div className="w-2 h-2 rounded-full bg-success animate-pulse shrink-0" />
            {expanded && (
              <div>
                <p className="text-[9px] text-success font-medium">
                  Sistema operativo
                </p>
                <p className="text-[8px] text-default-400">{time} • v1.0</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[600] bg-background/95 backdrop-blur-xl border-t border-divider px-2 py-1.5 flex items-center justify-around safe-bottom">
        {panels.map((p) => {
          const isActive = activePanel === p.id;
          const Icon = p.icon;
          return (
            <button
              key={`mobile-${p.id}`}
              onClick={() => onTogglePanel(isActive ? null : p.id)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all active:scale-90 ${
                isActive ? "text-primary bg-primary/10" : "text-default-400"
              }`}
            >
              <div className="relative">
                <Icon size={20} />
                {p.id === "rutas" && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                )}
              </div>
              <span className="text-[9px] font-medium">
                {p.label.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
