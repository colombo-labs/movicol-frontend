import { AlertTriangle } from "lucide-react";
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

// Simulated risk scores based on degree (high connectivity = more accidents)
function getRiskScore(station: Station): number {
  return Math.min(1, station.degree / 15);
}

function getRiskColor(score: number): string {
  if (score > 0.7) return "#ef4444";
  if (score > 0.5) return "#f97316";
  if (score > 0.3) return "#eab308";
  return "#22c55e";
}

/**
 * Módulo SINIESTRALIDAD — Zonas de riesgo.
 * Muestra estaciones coloreadas por score de siniestralidad.
 */
export function SiniestroPage() {
  const { theme } = useTheme();
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    api
      .get<Station[]>("/graph/stations?limit=500")
      .then(setStations)
      .catch(() => {});
  }, []);

  const topRisk = [...stations]
    .sort((a, b) => getRiskScore(b) - getRiskScore(a))
    .slice(0, 10);

  return (
    <div className="flex h-full">
      {/* Panel lateral */}
      <div className="w-[300px] h-full overflow-y-auto border-r border-white/10 p-4">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-warning" /> Zonas de Riesgo
        </h2>
        <p className="text-xs text-default-400 mb-4">
          Top 10 estaciones con mayor índice de siniestralidad (basado en
          conectividad y flujo).
        </p>
        <div className="space-y-2">
          {topRisk.map((s, i) => {
            const score = getRiskScore(s);
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
                  style={{ color: getRiskColor(score) }}
                >
                  {Math.round(score * 100)}%
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
            const score = getRiskScore(station);
            return (
              <CircleMarker
                key={station.id}
                center={[station.lat, station.lon]}
                radius={Math.max(3, score * 10)}
                pathOptions={{
                  color: getRiskColor(score),
                  fillColor: getRiskColor(score),
                  fillOpacity: 0.6,
                  weight: 1,
                }}
              >
                <Popup>
                  <div className="text-xs">
                    <strong>{station.name || station.id}</strong>
                    <br />
                    Riesgo: {Math.round(score * 100)}%
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
