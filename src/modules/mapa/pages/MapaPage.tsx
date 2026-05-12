import { useModal } from '@shared/hooks/useModal';
import { AppModal } from '@shared/ui/AppModal';
import { StationAutocomplete } from '@shared/ui/StationAutocomplete';
import type { Station } from '@shared/types';

/**
 * Módulo MAPA — Página principal.
 * - Mapa interactivo (Leaflet) ocupa toda el área
 * - Barra de búsqueda arriba (autocompletado de estaciones)
 * - Click en estación → Modal con detalles
 */
export function MapaPage() {
  const stationModal = useModal<Station>();

  return (
    <div className="relative w-full h-full">
      {/* Search bar overlay */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <StationAutocomplete
          label=""
          placeholder="Buscar estación o paradero..."
          icon="origin"
          value=""
          onChange={(id) => stationModal.open({ id } as Station)}
        />
      </div>

      {/* Map placeholder */}
      <div className="w-full h-full bg-[#0d1117] flex items-center justify-center">
        <p className="text-default-500">Mapa Leaflet — estaciones coloreadas por congestión</p>
      </div>

      {/* Station detail modal */}
      <AppModal
        isOpen={stationModal.isOpen}
        onClose={stationModal.close}
        title="Detalle de Estación"
      >
        <div className="space-y-2">
          <p className="text-sm text-default-400">ID: {stationModal.data?.id}</p>
          <p className="text-sm">Aquí van: vecinos, congestión, riesgo, centralidad...</p>
        </div>
      </AppModal>
    </div>
  );
}
