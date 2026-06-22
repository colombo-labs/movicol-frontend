import { Navigation, Route, Accessibility, BarChart3 } from "lucide-react";
import type { PanelId } from "./Sidebar";

interface MobileNavProps {
  activePanel: PanelId;
  onTogglePanel: (id: PanelId) => void;
}

const items: { id: Exclude<PanelId, null>; icon: typeof Navigation }[] = [
  { id: "planificar", icon: Navigation },
  { id: "rutas", icon: Route },
  { id: "accesibilidad", icon: Accessibility },
  { id: "metricas", icon: BarChart3 },
];

export function MobileNav({ activePanel, onTogglePanel }: MobileNavProps) {
  return (
    <nav className="md:hidden h-12 flex items-center justify-around border-t border-divider bg-background/90 backdrop-blur-xl shrink-0">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activePanel === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTogglePanel(isActive ? null : item.id)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${
              isActive ? "text-primary" : "text-default-400 active:scale-90"
            }`}
          >
            <Icon size={18} />
          </button>
        );
      })}
    </nav>
  );
}
