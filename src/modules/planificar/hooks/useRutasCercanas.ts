import { useEffect, useState } from "react";
import { fetchRutasCercanas } from "../api/planificarApi";
import type { RutaCercana, TransportMode } from "../models/types";

export function useRutasCercanas(
  origin: { lat: number; lng: number } | null,
  destination: { lat: number; lng: number } | null,
  mode: TransportMode,
) {
  const [rutasDisponibles, setRutasDisponibles] = useState<RutaCercana[]>([]);

  useEffect(() => {
    if (!origin || !destination || mode === "vehiculo") {
      setRutasDisponibles([]);
      return;
    }
    const fetchRutas = async () => {
      try {
        const [rutasO, rutasD] = await Promise.all([
          fetchRutasCercanas(origin.lat, origin.lng),
          fetchRutasCercanas(destination.lat, destination.lng),
        ]);
        const rutasOrigen = new Set(rutasO.map((r) => r.ruta));
        const comunes = rutasD.filter((r) => rutasOrigen.has(r.ruta));
        setRutasDisponibles(comunes.slice(0, 5));
      } catch {
        setRutasDisponibles([]);
      }
    };
    fetchRutas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin?.lat, origin?.lng, destination?.lat, destination?.lng, mode]);

  return rutasDisponibles;
}
