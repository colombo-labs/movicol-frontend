import { Button } from "@heroui/react";
import { useState } from "react";

import { GlassCard } from "@shared/ui/GlassCard";
import { RouteInsightCard } from "../components/widgets/RouteInsightCard";
import type { Coordinates, RoutePrediction } from "../models";

interface RoutePredictFeatureProps {
  origin: Coordinates | null;
  destination: Coordinates | null;
  prediction: RoutePrediction | null;
  isLoading: boolean;
  error: string | null;
  onPredict: (departureTime: string) => void;
  onClear: () => void;
}

/**
 * FEATURE: Panel de predicción de rutas.
 * Recibe coordenadas del mapa (click) y dispara predicción.
 */
export function RoutePredictFeature({
  origin,
  destination,
  prediction,
  isLoading,
  error,
  onPredict,
  onClear,
}: RoutePredictFeatureProps) {
  const originLng = origin?.lng ?? origin?.lon;
  const destinationLng = destination?.lng ?? destination?.lon;
  const [departureTime, setDepartureTime] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });

  const handlePredict = () => {
    onPredict(new Date(departureTime).toISOString());
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <GlassCard>
        <p className="text-xs text-default-400 leading-relaxed">
          <span className="text-foreground font-medium">1.</span> Clic en el
          mapa → <span className="text-green-400">origen</span>
          <br />
          <span className="text-foreground font-medium">2.</span> Clic de nuevo
          → <span className="text-red-400">destino</span>
          <br />
          <span className="text-foreground font-medium">3.</span> Presiona
          "Predecir Ruta"
        </p>
      </GlassCard>

      {/* Markers status */}
      <GlassCard className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${origin ? "bg-green-400" : "bg-default-600"}`}
          />
          <span>
            Origen:{" "}
            {origin && typeof originLng === "number"
              ? `${origin.lat.toFixed(4)}, ${originLng.toFixed(4)}`
              : "Sin seleccionar"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${destination ? "bg-red-400" : "bg-default-600"}`}
          />
          <span>
            Destino:{" "}
            {destination && typeof destinationLng === "number"
              ? `${destination.lat.toFixed(4)}, ${destinationLng.toFixed(4)}`
              : "Sin seleccionar"}
          </span>
        </div>
      </GlassCard>

      {/* Departure time */}
      <GlassCard>
        <label className="text-xs text-default-400 block mb-1">
          Hora de salida
        </label>
        <input
          type="datetime-local"
          value={departureTime}
          onChange={(e) => setDepartureTime(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
        />
      </GlassCard>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          color="primary"
          size="lg"
          className="flex-1"
          isLoading={isLoading}
          isDisabled={!origin || !destination}
          onPress={handlePredict}
          startContent={!isLoading ? <span>✨</span> : undefined}
        >
          Predecir Ruta
        </Button>
        <Button variant="flat" size="lg" onPress={onClear}>
          Limpiar
        </Button>
      </div>

      {/* Error */}
      {error && (
        <GlassCard>
          <p className="text-xs text-danger">{error}</p>
        </GlassCard>
      )}

      {/* Result */}
      {prediction && <RouteInsightCard prediction={prediction} />}
    </div>
  );
}
