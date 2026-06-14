import {
  MapContainer,
  CircleMarker,
  Popup,
  TileLayer,
  ZoomControl,
} from "react-leaflet";
import { useTheme } from "@shared/hooks/useTheme";
import { useModal } from "@shared/hooks/useModal";
import { AppModal } from "@shared/ui/AppModal";
import { GlassCard } from "@shared/ui/GlassCard";
import { UserLocationMarker } from "@shared/ui/UserLocationMarker";
import { useStations } from "../hooks/useStations";
import type { Station } from "@shared/types";
import "leaflet/dist/leaflet.css";

const tiles = {
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
};

function getStationColor(degree: number): string {
  if (degree >= 10) return "#ef4444"; // high connectivity = red
  if (degree >= 6) return "#f97316";
  if (degree >= 3) return "#eab308";
  return "#22c55e";
}

/**
 * Módulo MAPA — Página principal.
 * Muestra todas las estaciones del grafo como CircleMarkers coloreados por grado.
 */
export function MapaPage() {
  const { theme } = useTheme();
  const { stations, isLoading } = useStations();
  const stationModal = useModal<Station>();

  return (
    <div className="relative w-full h-full">
      {/* Stats overlay */}
      <div className="absolute top-4 left-4 z-10">
        <GlassCard className="px-3 py-2">
          <p className="text-xs text-default-400">
            {isLoading ? "Cargando..." : `${stations.length} estaciones`}
          </p>
        </GlassCard>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10">
        <GlassCard className="px-3 py-2 space-y-1">
          <p className="text-[10px] font-semibold text-default-400">
            Conectividad
          </p>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Baja (1-2)
            <span className="w-2 h-2 rounded-full bg-yellow-500" /> Media (3-5)
            <span className="w-2 h-2 rounded-full bg-orange-500" /> Alta (6-9)
            <span className="w-2 h-2 rounded-full bg-red-500" /> Muy alta (10+)
          </div>
        </GlassCard>
      </div>

      {/* Map */}
      <MapContainer
        center={[4.65, -74.08]}
        zoom={12}
        zoomControl={false}
        className="w-full h-full z-0"
        attributionControl={false}
      >
        <TileLayer key={theme} url={tiles[theme]} />
        <ZoomControl position="topright" />
        <UserLocationMarker followUser />

        {stations.map((station) => (
          <CircleMarker
            key={station.id}
            center={[station.lat, station.lon]}
            radius={Math.max(3, Math.min(8, station.degree))}
            pathOptions={{
              color: getStationColor(station.degree),
              fillColor: getStationColor(station.degree),
              fillOpacity: 0.7,
              weight: 1,
            }}
            eventHandlers={{
              click: () => stationModal.open(station),
            }}
          >
            <Popup>
              <div className="text-xs">
                <strong>{station.name || station.id}</strong>
                <br />
                Conexiones: {station.degree}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Station detail modal */}
      <AppModal
        isOpen={stationModal.isOpen}
        onClose={stationModal.close}
        title={stationModal.data?.name || "Estación"}
      >
        {stationModal.data && (
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-default-400">ID:</span>{" "}
              {stationModal.data.id}
            </p>
            <p>
              <span className="text-default-400">Coordenadas:</span>{" "}
              {stationModal.data.lat.toFixed(4)},{" "}
              {stationModal.data.lon.toFixed(4)}
            </p>
            <p>
              <span className="text-default-400">Conexiones:</span>{" "}
              {stationModal.data.degree}
            </p>
            {stationModal.data.route && (
              <p>
                <span className="text-default-400">Ruta:</span>{" "}
                {stationModal.data.route}
              </p>
            )}
          </div>
        )}
      </AppModal>
    </div>
  );
}
