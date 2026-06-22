import { Users } from "lucide-react";
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

// Urban mobility: inverse of vehicular — low connectivity = pedestrian zones
function getUrbanScore(station: Station): number {
  return Math.max(0, 1 - station.degree / 14);
}

function getUrbanColor(score: number): string {
  if (score > 0.6) return "#22c55e"; // pedestrian-friendly
  if (score > 0.3) return "#3b82f6";
  return "#6b7280"; // transit-heavy
}

export function UrbanoPage() {
  const { theme } = useTheme();
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    api
      .get<Station[]>("/graph/stations?limit=300")
      .then(setStations)
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-full">
      <div className="w-[300px] h-full overflow-y-auto border-r border-white/10 p-4">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Users size={18} className="text-primary" /> Movilidad Urbana
        </h2>
        <p className="text-xs text-default-400 mb-4">
          Zonas con mayor potencial peatonal y ciclista. Verde = baja
          dependencia de transporte motorizado.
        </p>
        <div className="space-y-3">
          <GlassCard>
            <p className="text-sm text-default-500">Zonas peatonales</p>
            <p className="text-3xl font-bold">
              {stations.filter((s) => getUrbanScore(s) > 0.6).length}
            </p>
            <p className="text-xs text-success">Alta caminabilidad</p>
          </GlassCard>
          <GlassCard>
            <p className="text-sm text-default-500">Zonas mixtas</p>
            <p className="text-3xl font-bold">
              {
                stations.filter(
                  (s) => getUrbanScore(s) > 0.3 && getUrbanScore(s) <= 0.6,
                ).length
              }
            </p>
            <p className="text-xs text-blue-400">Transporte + peatón</p>
          </GlassCard>
          <GlassCard>
            <p className="text-sm text-default-500">Zonas de tránsito</p>
            <p className="text-3xl font-bold">
              {stations.filter((s) => getUrbanScore(s) <= 0.3).length}
            </p>
            <p className="text-xs text-default-400">
              Alta dependencia motorizada
            </p>
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
            const score = getUrbanScore(station);
            return (
              <CircleMarker
                key={station.id}
                center={[station.lat, station.lon]}
                radius={Math.max(3, score * 8)}
                pathOptions={{
                  color: getUrbanColor(score),
                  fillColor: getUrbanColor(score),
                  fillOpacity: 0.6,
                  weight: 1,
                }}
              >
                <Popup>
                  <div className="text-xs">
                    <strong>{station.name || station.id}</strong>
                    <br />
                    Caminabilidad: {Math.round(score * 100)}%
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
