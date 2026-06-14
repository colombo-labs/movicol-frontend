import { useCallback, useState } from "react";
import { api } from "@shared/api/http-client";
import type { RoutePrediction } from "@/modules/predicciones/models";

interface PlanRouteParams {
  stops: string[];
  departureTime?: string;
}

interface NearbyStation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distance_km: number;
}

export function usePlanRoute() {
  const [prediction, setPrediction] = useState<RoutePrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const planRoute = useCallback(async (params: PlanRouteParams) => {
    if (params.stops.length < 2) return;
    setIsLoading(true);

    try {
      // Find nearest stations for origin and destination text
      const originStations = await api.get<NearbyStation[]>(
        `/graph/nearby?lat=4.65&lon=-74.08&radius_km=5&limit=1`,
      );
      const destStations = await api.get<NearbyStation[]>(
        `/graph/nearby?lat=4.60&lon=-74.07&radius_km=5&limit=1`,
      );

      if (originStations.length && destStations.length) {
        const result = await api.post<RoutePrediction>("/route-prediction", {
          origin: { lat: originStations[0].lat, lng: originStations[0].lon },
          destination: { lat: destStations[0].lat, lng: destStations[0].lon },
          departure_time: params.departureTime ?? new Date().toISOString(),
        });
        setPrediction(result);
      }
    } catch {
      setPrediction(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { planRoute, prediction, isLoading };
}
