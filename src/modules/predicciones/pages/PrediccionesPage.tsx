import { Activity } from "lucide-react";
import { useCallback, useState } from "react";

import { RoutePredictFeature } from "../features/RoutePredictFeature";
import { RouteMap } from "../components/widgets/RouteMap";
import { useRoutePredict } from "../hooks/useRoutePredict";
import type { Coordinates } from "../models";

/**
 * Módulo PREDICCIONES — Página principal.
 * Panel lateral: controles + resultado.
 * Área principal: mapa con polilíneas coloreadas por riesgo.
 */
export function PrediccionesPage() {
  const [origin, setOrigin] = useState<Coordinates | null>(null);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const { predict, prediction, isLoading, error, clear } = useRoutePredict();

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (!origin) {
        setOrigin({ lat, lng });
      } else if (!destination) {
        setDestination({ lat, lng });
      }
    },
    [origin, destination],
  );

  const handleClearMarkers = useCallback(() => {
    setOrigin(null);
    setDestination(null);
    clear();
  }, [clear]);

  const handlePredict = useCallback(
    (departureTime: string) => {
      if (origin && destination) {
        predict({ origin, destination, departureTime });
      }
    },
    [origin, destination, predict],
  );

  return (
    <div className="flex h-full">
      {/* Panel de controles */}
      <div className="w-[360px] h-full overflow-y-auto border-r border-white/10 p-4">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Activity size={18} className="text-primary" /> Predicción de Rutas
        </h2>
        <RoutePredictFeature
          origin={origin}
          destination={destination}
          prediction={prediction}
          isLoading={isLoading}
          error={error}
          onPredict={handlePredict}
          onClear={handleClearMarkers}
        />
      </div>

      {/* Mapa con ruta */}
      <div className="flex-1 h-full">
        <RouteMap
          prediction={prediction}
          onMapClick={handleMapClick}
          originMarker={origin ? [origin.lat, origin.lng] : null}
          destMarker={destination ? [destination.lat, destination.lng] : null}
        />
      </div>
    </div>
  );
}
