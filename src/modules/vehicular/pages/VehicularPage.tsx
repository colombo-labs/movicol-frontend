import { Car } from 'lucide-react';
import { useModal } from '@shared/hooks/useModal';
import { AppModal } from '@shared/ui/AppModal';

export function VehicularPage() {
  const zoneModal = useModal<{ id: string; vehiculos: number }>();

  return (
    <div className="flex h-full">
      <div className="w-[300px] h-full overflow-y-auto border-r border-white/10 p-4">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Car size={18} className="text-primary" /> Vehicular</h2>
        <p className="text-sm text-default-400">Flujo vehicular: carros, motos, tráfico en tiempo real.</p>
      </div>

      <div className="flex-1 h-full bg-[#0d1117] flex items-center justify-center">
        <p className="text-default-500">Mapa de tráfico vehicular (carros, motos)</p>
      </div>

      <AppModal isOpen={zoneModal.isOpen} onClose={zoneModal.close} title="Detalle Vehicular">
        <p>Vehículos/hora: {zoneModal.data?.vehiculos}</p>
      </AppModal>
    </div>
  );
}
