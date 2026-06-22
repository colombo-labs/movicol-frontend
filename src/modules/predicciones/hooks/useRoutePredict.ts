import { useCallback, useState } from "react";
import type { Coordinates, RoutePrediction } from "../models";
import { routePredictionApi } from "../api";

interface PredictParams {
  origin: Coordinates;
  destination: Coordinates;
  departureTime?: string;
  mode?: "transmilenio" | "sitp" | "vehiculo";
}

export function useRoutePredict() {
  const [prediction, setPrediction] = useState<RoutePrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = useCallback(async (params: PredictParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await routePredictionApi.predict({
        origin: params.origin,
        destination: params.destination,
        departure_time: params.departureTime ?? new Date().toISOString(),
        mode: params.mode ?? "transmilenio",
      });
      setPrediction(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al predecir ruta");
      setPrediction(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setPrediction(null);
    setError(null);
  }, []);

  return { predict, prediction, isLoading, error, clear };
}
