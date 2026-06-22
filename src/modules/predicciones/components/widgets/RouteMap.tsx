import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
import { useTheme } from "@shared/hooks/useTheme";
import type { RoutePrediction } from "../../models";
import "leaflet/dist/leaflet.css";

const tiles = {
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
};

const RISK_COLORS: Record<string, string> = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
};

interface RouteMapProps {
  prediction: RoutePrediction | null;
  onMapClick?: (lat: number, lng: number) => void;
  originMarker?: [number, number] | null;
  destMarker?: [number, number] | null;
}

/** Auto-fit map bounds when prediction changes */
function FitBounds({ prediction }: { prediction: RoutePrediction | null }) {
  const map = useMap();

  useEffect(() => {
    if (!prediction || prediction.risk_segments.length === 0) return;
    const allCoords = prediction.risk_segments.flatMap((s) => s.coordinates);
    if (allCoords.length > 0) {
      const bounds = allCoords.map((c) => [c[0], c[1]] as [number, number]);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [prediction, map]);

  return null;
}

/** Click handler component */
function MapClickHandler({
  onClick,
}: {
  onClick?: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!onClick) return;
    const handler = (e: L.LeafletMouseEvent) =>
      onClick(e.latlng.lat, e.latlng.lng);
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [map, onClick]);

  return null;
}

export function RouteMap({
  prediction,
  onMapClick,
  originMarker,
  destMarker,
}: RouteMapProps) {
  const { theme } = useTheme();

  return (
    <MapContainer
      center={[4.68, -74.06]}
      zoom={12}
      zoomControl={false}
      className="w-full h-full z-0"
      attributionControl={false}
    >
      <TileLayer key={theme} url={tiles[theme]} />
      <ZoomControl position="topright" />
      <FitBounds prediction={prediction} />
      <MapClickHandler onClick={onMapClick} />

      {/* Origin marker */}
      {originMarker && (
        <Marker position={originMarker}>
          <Popup>Origen</Popup>
        </Marker>
      )}

      {/* Destination marker */}
      {destMarker && (
        <Marker position={destMarker}>
          <Popup>🏁 Destino</Popup>
        </Marker>
      )}

      {/* Route polylines colored by risk */}
      {prediction?.risk_segments.map((segment) => (
        <Polyline
          key={`seg-${segment.from_station}-${segment.to_station}`}
          positions={segment.coordinates.map(
            (c) => [c[0], c[1]] as [number, number],
          )}
          pathOptions={{
            color: RISK_COLORS[segment.risk_label] ?? "#6b7280",
            weight: 5,
            opacity: 0.9,
          }}
        >
          <Popup>
            <div className="text-xs">
              <strong>
                {segment.from_station} → {segment.to_station}
              </strong>
              <br />
              Congestión: {Math.round(segment.congestion_level * 100)}%
              <br />
              Riesgo: {segment.risk_label}
            </div>
          </Popup>
        </Polyline>
      ))}
    </MapContainer>
  );
}
