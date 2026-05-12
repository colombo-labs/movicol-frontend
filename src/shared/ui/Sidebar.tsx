import { MapPin, Navigation, Route, Accessibility, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';

export type PanelId = 'planificar' | 'rutas' | 'accesibilidad' | 'metricas' | null;

interface PanelItem {
  id: Exclude<PanelId, null>;
  icon: LucideIcon;
  label: string;
}

const panels: PanelItem[] = [
  { id: 'planificar', icon: Navigation, label: 'Planificar viaje' },
  { id: 'rutas', icon: Route, label: 'Rutas' },
  { id: 'accesibilidad', icon: Accessibility, label: 'Accesibilidad' },
  { id: 'metricas', icon: BarChart3, label: 'Métricas' },
];

interface SidebarProps {
  activePanel: PanelId;
  onTogglePanel: (id: PanelId) => void;
}

export function Sidebar({ activePanel, onTogglePanel }: SidebarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`${expanded ? 'w-52' : 'w-16'} h-full flex flex-col border-r border-divider bg-background backdrop-blur-xl transition-all duration-200 z-20`}
    >
      <div className="h-14 flex items-center justify-center border-b border-divider px-3 shrink-0">
        <div className={`flex items-center gap-2 ${expanded ? 'w-full' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <MapPin size={22} className="text-primary" />
          </div>
          {expanded && <span className="text-sm font-bold text-foreground truncate">MoviCol</span>}
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
              aria-label={`${isActive ? 'Cerrar' : 'Abrir'}: ${p.label}`}
              className={`${expanded ? 'w-[calc(100%-1rem)] px-3' : 'w-10'} h-10 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                isActive
                  ? 'bg-primary/20 ring-1 ring-primary/50 text-primary'
                  : 'text-default-500 hover:bg-default-100 hover:text-foreground active:scale-95'
              } ${expanded ? '' : 'justify-center'}`}
            >
              <Icon size={18} className="shrink-0" />
              {expanded && <span className="text-sm truncate">{p.label}</span>}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
