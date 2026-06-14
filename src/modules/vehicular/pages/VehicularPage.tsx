import { Car } from "lucide-react";
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

// Simulated vehicular flow based on connectivity
function getFlowLevel(station: Station): number {
  return Math.min(1, station.degree / 14);
}

function getFlowColor(level: number): string {
  if (level > 0.7) return "#ef4444";
  if (level > 0.4) return "#f97316";
  return "#22c55e";
}

export function VehicularPage() {
  const { theme } = useTheme();
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    api
      .get<Station[]>("/graph/stations?limit=300")
      .then(setStations)
      .catch(() => {});
  }, []);

  const avgFlow =
    stations.length > 0
      ? Math.round(
          (stations.reduce((s, st) => s + getFlowLevel(st), 0) /
            stations.length) *
            100,
        )
      : 0;

  return (
    <div className="flex h-full">
      <div className="w-[300px] h-full overflow-y-auto border-r border-white/10 p-4">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Car size={18} className="text-primary" /> Flujo Vehicular
        </h2>
        <div className="space-y-3">
          <GlassCard>
            <p className="text-sm text-default-500">Velocidad promedio</p>
            <p className="text-3xl font-bold">24 km/h</p>
            <p className="text-xs text-default-400">Hora pico actual</p>
          </GlassCard>
          <GlassCard>
            <p className="text-sm text-default-500">Flujo promedio</p>
            <p className="text-3xl font-bold">{avgFlow}%</p>
            <p className="text-xs text-default-400">Capacidad utilizada</p>
          </GlassCard>
          <GlassCard>
            <p className="text-sm text-default-500">Puntos monitoreados</p>
            <p className="text-3xl font-bold">{stations.length}</p>
          </GlassCard>
        </div>
      </div>

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
            const level = getFlowLevel(station);
            return (
              <CircleMarker
                key={station.id}
                center={[station.lat, station.lon]}
                radius={Math.max(2, level * 7)}
                pathOptions={{
                  color: getFlowColor(level),
                  fillColor: getFlowColor(level),
                  fillOpacity: 0.5,
                  weight: 1,
                }}
              >
                <Popup>
                  <div className="text-xs">
                    <strong>{station.name || station.id}</strong>
                    <br />
                    Flujo: {Math.round(level * 100)}%
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
