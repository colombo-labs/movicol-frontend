import { Accessibility } from 'lucide-react';
import { useModal } from '@shared/hooks/useModal';
import { AppModal } from '@shared/ui/AppModal';

/**
 * Módulo ACCESIBILIDAD — Página principal.
 * - Mapa con zonas coloreadas por closeness centrality
 * - Zonas mal conectadas resaltadas
 * - Click en zona → Modal con métricas de accesibilidad
 */
export function AccesibilidadPage() {
  const zoneModal = useModal<{ id: string; closeness: number }>();

  return (
    <div className="flex h-full">
      {/* Panel lateral */}
      <div className="w-[300px] h-full overflow-y-auto border-r border-white/10 p-4">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Accessibility size={18} className="text-primary" /> Accesibilidad</h2>
        <p className="text-sm text-default-400">Zonas mal conectadas (baja closeness centrality).</p>
        {/* TODO: Lista de zonas con peor accesibilidad */}
      </div>

      {/* Mapa de accesibilidad */}
      <div className="flex-1 h-full bg-[#0d1117] flex items-center justify-center">
        <p className="text-default-500">Mapa de accesibilidad (closeness centrality)</p>
      </div>

      {/* Modal detalle */}
      <AppModal isOpen={zoneModal.isOpen} onClose={zoneModal.close} title="Accesibilidad de Zona">
        <p>Closeness: {zoneModal.data?.closeness}</p>
      </AppModal>
    </div>
  );
}
