import { Accessibility } from "lucide-react";
import {
  MapContainer,
  CircleMarker,
  Popup,
  TileLayer,
  ZoomControl,
} from "react-leaflet";
import { useEffect, useState } from "react";
import { useTheme } from "@shared/hooks/useTheme";
import { GlassCard } from "@shared/ui/GlassCard";
import { api } from "@shared/api/http-client";
import type { Station } from "@shared/types";
import "leaflet/dist/leaflet.css";

const tiles = {
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
};

// Closeness proxy: low degree = poorly connected
function getAccessibilityScore(station: Station): number {
  return Math.min(1, station.degree / 12);
}

function getAccessColor(score: number): string {
  if (score > 0.7) return "#22c55e"; // well connected
  if (score > 0.4) return "#eab308";
  return "#ef4444"; // poorly connected
}

/**
 * Módulo ACCESIBILIDAD — Closeness centrality.
 * Resalta estaciones mal conectadas (baja accesibilidad).
 */
export function AccesibilidadPage() {
  const { theme } = useTheme();
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    api
      .get<Station[]>("/graph/stations?limit=500")
      .then(setStations)
      .catch(() => {});
  }, []);

  const worstAccess = [...stations]
    .sort((a, b) => getAccessibilityScore(a) - getAccessibilityScore(b))
    .slice(0, 10);

  return (
    <div className="flex h-full">
      {/* Panel lateral */}
      <div className="w-[300px] h-full overflow-y-auto border-r border-white/10 p-4">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Accessibility size={18} className="text-primary" /> Accesibilidad
        </h2>
        <p className="text-xs text-default-400 mb-4">
          Estaciones con peor conectividad — zonas que necesitan más rutas.
        </p>
        <div className="space-y-2">
          {worstAccess.map((s, i) => {
            const score = getAccessibilityScore(s);
            return (
              <GlassCard
                key={s.id}
                className="flex items-center justify-between py-2 px-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-default-400">
                    #{i + 1}
                  </span>
                  <span className="text-xs truncate max-w-[140px]">
                    {s.name || s.id}
                  </span>
                </div>
                <span
                  className="text-xs font-mono font-bold"
                  style={{ color: getAccessColor(score) }}
                >
                  {s.degree} conn
                </span>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Mapa */}
      <div className="flex-1 h-full">
        <MapContainer
          center={[4.65, -74.08]}
          zoom={12}
          zoomControl={false}
          className="w-full h-full z-0"
          attributionControl={false}
        >
          <TileLayer key={theme} url={tiles[theme]} />
          <ZoomControl position="topright" />

          {stations.map((station) => {
            const score = getAccessibilityScore(station);
            return (
              <CircleMarker
                key={station.id}
                center={[station.lat, station.lon]}
                radius={Math.max(3, (1 - score) * 8 + 2)}
                pathOptions={{
                  color: getAccessColor(score),
                  fillColor: getAccessColor(score),
                  fillOpacity: 0.6,
                  weight: 1,
                }}
              >
                <Popup>
                  <div className="text-xs">
                    <strong>{station.name || station.id}</strong>
                    <br />
                    Accesibilidad: {Math.round(score * 100)}%
                    <br />
                    Conexiones: {station.degree}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
