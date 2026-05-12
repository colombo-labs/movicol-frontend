import { AlertTriangle } from 'lucide-react';
import { useModal } from '@shared/hooks/useModal';
import { AppModal } from '@shared/ui/AppModal';

/**
 * Módulo SINIESTRALIDAD — Página principal.
 * - Mapa con zonas de riesgo coloreadas (heatmap)
 * - Click en zona → Modal con detalles del sector crítico
 * - Panel lateral con top zonas peligrosas
 */
export function SiniestroPage() {
  const zoneModal = useModal<{ id: string; score: number }>();

  return (
    <div className="flex h-full">
      {/* Panel lateral: top zonas */}
      <div className="w-[300px] h-full overflow-y-auto border-r border-white/10 p-4">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-primary" /> Zonas de Riesgo</h2>
        <p className="text-sm text-default-400">Top sectores críticos por siniestralidad.</p>
        {/* TODO: Lista de zonas peligrosas con score */}
      </div>

      {/* Mapa heatmap */}
      <div className="flex-1 h-full bg-[#0d1117] flex items-center justify-center">
        <p className="text-default-500">Mapa heatmap de siniestralidad</p>
      </div>

      {/* Modal detalle de zona */}
      <AppModal isOpen={zoneModal.isOpen} onClose={zoneModal.close} title="Detalle de Zona">
        <p>Score: {zoneModal.data?.score}</p>
      </AppModal>
    </div>
  );
}
