import { useState, useCallback } from "react";
import { RoutePredictFeature } from "./RoutePredictFeature";
import { useRoutePredict } from "../hooks/useRoutePredict";
import type { Coordinates } from "../models";

/**
 * Panel standalone de predicciones (para uso en sidebar sin mapa).
 * Maneja su propio estado de coordenadas.
 */
export function PrediccionesPanel() {
  const [origin] = useState<Coordinates | null>(null);
  const [destination] = useState<Coordinates | null>(null);
  const { predict, prediction, isLoading, error, clear } = useRoutePredict();

  const handlePredict = useCallback(
    (departureTime: string) => {
      if (origin && destination) {
        predict({ origin, destination, departureTime });
      }
    },
    [origin, destination, predict],
  );

  return (
    <RoutePredictFeature
      origin={origin}
      destination={destination}
      prediction={prediction}
      isLoading={isLoading}
      error={error}
      onPredict={handlePredict}
      onClear={clear}
    />
  );
}
