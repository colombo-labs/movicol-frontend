import { useCallback, useRef, useState } from "react";
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
  const cancelledRef = useRef(false);

  const predict = useCallback(async (params: PredictParams) => {
    cancelledRef.current = false;
    setIsLoading(true);
    setError(null);
    try {
      const result = await routePredictionApi.predict({
        origin: params.origin,
        destination: params.destination,
        departure_time: params.departureTime ?? new Date().toISOString(),
        mode: params.mode ?? "transmilenio",
      });
      if (!cancelledRef.current) {
        setPrediction(result);
        setIsLoading(false);
      }
    } catch (err) {
      if (!cancelledRef.current) {
        setError(err instanceof Error ? err.message : "Error al predecir ruta");
        setPrediction(null);
        setIsLoading(false);
      }
    }
  }, []);

  const clear = useCallback(() => {
    cancelledRef.current = true;
    setPrediction(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { predict, prediction, isLoading, error, clear };
}
