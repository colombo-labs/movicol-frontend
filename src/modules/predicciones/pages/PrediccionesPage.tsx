import { Activity } from 'lucide-react';
import { RoutePredictFeature } from '../features/RoutePredictFeature';

/**
 * Módulo PREDICCIONES — Página.
 * Usa RoutePredictFeature como bloque funcional en el panel lateral.
 * El mapa ocupa el área principal.
 */
export function PrediccionesPage() {
  return (
    <div className="flex h-full">
      {/* Panel de controles (feature integrada) */}
      <div className="w-[360px] h-full overflow-y-auto border-r border-white/10 p-4">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Activity size={18} className="text-primary" /> Predicción de Rutas</h2>
        <RoutePredictFeature />
      </div>

      {/* Mapa con ruta */}
      <div className="flex-1 h-full bg-[#0d1117] flex items-center justify-center">
        <p className="text-default-500">Mapa con ruta predicha dibujada</p>
      </div>
    </div>
  );
}
