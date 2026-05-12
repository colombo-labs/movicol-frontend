import { Users } from 'lucide-react';
import { useModal } from '@shared/hooks/useModal';
import { AppModal } from '@shared/ui/AppModal';

export function UrbanoPage() {
  const zoneModal = useModal<{ id: string; flujo: number }>();

  return (
    <div className="flex h-full">
      <div className="w-[300px] h-full overflow-y-auto border-r border-white/10 p-4">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Users size={18} className="text-primary" /> Transporte Urbano</h2>
        <p className="text-sm text-default-400">Flujos peatonales, ciclistas y movilidad activa en Bogotá.</p>
      </div>

      <div className="flex-1 h-full bg-[#0d1117] flex items-center justify-center">
        <p className="text-default-500">Mapa de flujos urbanos (peatones, bicicletas, patinetas)</p>
      </div>

      <AppModal isOpen={zoneModal.isOpen} onClose={zoneModal.close} title="Detalle de Zona Urbana">
        <p>Flujo: {zoneModal.data?.flujo} personas/hora</p>
      </AppModal>
    </div>
  );
}
