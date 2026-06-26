import { useTranslation } from "react-i18next";
import {
  Navigation,
  Route,
  Accessibility,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import type { PanelId } from "./Sidebar";
import { useAuth } from "@/shared/hooks/useAuth";

interface MobileNavProps {
  activePanel: PanelId;
  onTogglePanel: (id: PanelId) => void;
}

const items: {
  id: Exclude<PanelId, null>;
  icon: typeof Navigation;
  label: string;
}[] = [
  { id: "planificar", icon: Navigation, label: "nav.viaje" },
  { id: "rutas", icon: Route, label: "nav.rutas" },
  { id: "accesibilidad", icon: Accessibility, label: "nav.acceso" },
  { id: "metricas", icon: BarChart3, label: "nav.datos" },
];

export function MobileNav({ activePanel, onTogglePanel }: MobileNavProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role?.name === "admin";

  const visibleItems = isAdmin
    ? [
        ...items,
        { id: "admin" as const, icon: ShieldCheck, label: "nav.admin" },
      ]
    : items;

  return (
    <nav className="md:hidden h-14 flex items-center justify-around border-t border-divider bg-background shrink-0 px-1 safe-area-bottom">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePanel === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTogglePanel(isActive ? null : item.id)}
            className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
              isActive
                ? "bg-primary/15 text-primary"
                : "text-default-400 active:scale-95 active:bg-default-100"
            }`}
          >
            <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
            <span
              className={`text-[9px] leading-tight ${isActive ? "font-bold" : "font-medium"}`}
            >
              {t(item.label)}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
