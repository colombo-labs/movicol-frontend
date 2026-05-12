import { useState, useCallback } from 'react';

import { Sidebar, type PanelId } from '@shared/ui/Sidebar';
import { MobileNav } from '@shared/ui/MobileNav';
import { Header } from '@shared/ui/Header';
import { SidePanel } from '@shared/ui/SidePanel';
import { MapView } from '@shared/ui/MapView';
import { ChatWidget } from '@modules/chat/components/widgets/ChatWidget';
import { PlanificarViajePanel } from '@modules/planificar/features/PlanificarViajePanel';
import { RutasPanel } from '@modules/rutas/features/RutasPanel';
import { AccesibilidadPanel } from '@modules/accesibilidad/features/AccesibilidadPanel';
import { MetricasPanel } from '@modules/metricas/features/MetricasPanel';

export function Layout() {
  const [activePanel, setActivePanel] = useState<PanelId>(null);

  const togglePanel = useCallback((id: PanelId) => {
    setActivePanel(id);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <div className="hidden md:block">
        <Sidebar activePanel={activePanel} onTogglePanel={togglePanel} />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden relative">
          <SidePanel isOpen={activePanel === 'planificar'} onClose={() => setActivePanel(null)} title="Planificar viaje">
            <PlanificarViajePanel />
          </SidePanel>
          <SidePanel isOpen={activePanel === 'rutas'} onClose={() => setActivePanel(null)} title="Rutas del sistema">
            <RutasPanel />
          </SidePanel>
          <SidePanel isOpen={activePanel === 'accesibilidad'} onClose={() => setActivePanel(null)} title="Accesibilidad">
            <AccesibilidadPanel />
          </SidePanel>
          <SidePanel isOpen={activePanel === 'metricas'} onClose={() => setActivePanel(null)} title="Métricas del Grafo">
            <MetricasPanel />
          </SidePanel>

          <MapView />
        </main>

        <MobileNav activePanel={activePanel} onTogglePanel={togglePanel} />
      </div>
      <ChatWidget />
    </div>
  );
}
