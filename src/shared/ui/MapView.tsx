/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import "leaflet/dist/leaflet.css";
import { useTheme } from "@shared/hooks/useTheme";
import type { TripPoint } from "../../app/Layout";
import type { RoutePrediction } from "../../modules/predicciones/models";
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  Polyline,
  CircleMarker,
  Popup,
} from "react-leaflet";
import { TroncalesLayer } from "./TroncalesLayer";
import { SitpLayer, CongestionLayer } from "./map-components/layers";
import { SelectedTroncalLayer } from "./map-components/troncal-layer";
import {
  makeIcon,
  DraggableMarker,
  FitRouteBounds,
  InvalidateSize,
  MapClickHandler,
} from "./map-components/helpers";

interface MapViewProps {
  onMapClick?: (lat: number, lng: number) => void;
  predictionMode?: boolean;
  prediction?: RoutePrediction | null;
  tripPoints?: TripPoint[];
  onMovePoint?: (index: number, lat: number, lng: number) => void;
  showCongestion?: boolean;
  showSitpOnMap?: boolean;
  selectedTroncal?: string | null;
  showTroncalesOnMap?: boolean;
  showEstacionesOnMap?: boolean;
  sitpRouteCoords?: {
    coords: [number, number][];
    stops: { lat: number; lon: number; nombre: string }[];
  } | null;
}

const RISK_COLORS: Record<string, string> = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
};

const originIcon = makeIcon("#22c55e", 36, "A");
const destIcon = makeIcon("#ef4444", 36, "B");
const waypointIcon = makeIcon("#3b82f6", 28);

export function MapView({
  onMapClick,
  predictionMode,
  prediction,
  tripPoints = [],
  onMovePoint,
  showCongestion,
  showSitpOnMap,
  selectedTroncal,
  showTroncalesOnMap,
  showEstacionesOnMap,
  sitpRouteCoords,
}: MapViewProps) {
  const center: [number, number] = [4.65, -74.1];
  const [showTroncalesLocal] = useState(false);
  const showTroncales = showTroncalesOnMap ?? showTroncalesLocal;
  const { theme } = useTheme();
  const darkMap = theme === "dark";
  const [showEstacionesLocal] = useState(false);
  const showEstaciones = showEstacionesOnMap ?? showEstacionesLocal;
  const [showSitp] = useState(false);

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          key={darkMap ? "dark" : "light"}
          url={
            darkMap
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          attribution={darkMap ? "&copy; CartoDB" : "&copy; OpenStreetMap"}
        />
        <ZoomControl position="topright" />
        <InvalidateSize />
        <MapClickHandler
          onClick={(lat, lng) => onMapClick?.(lat, lng)}
          active={!!predictionMode}
        />

        {/* Troncales & Estaciones */}
        {true && (
          <TroncalesLayer
            showTroncales={showTroncales}
            showEstaciones={showEstaciones}
          />
        )}

        {/* SITP paraderos */}
        {(showSitp || showSitpOnMap) && <SitpLayer />}
        {selectedTroncal && (
          <SelectedTroncalLayer troncalName={selectedTroncal} />
        )}
        {sitpRouteCoords && sitpRouteCoords.coords.length > 1 && (
          <>
            <Polyline
              positions={sitpRouteCoords.coords}
              pathOptions={{ color: "#3b82f6", weight: 4, opacity: 0.8 }}
            />
            {sitpRouteCoords.stops.map((s, i) => (
              <CircleMarker
                key={`sr-${i}`}
                center={[s.lat, s.lon]}
                radius={4}
                pathOptions={{
                  color: "#3b82f6",
                  fillColor:
                    i === 0
                      ? "#22c55e"
                      : i === sitpRouteCoords.stops.length - 1
                        ? "#ef4444"
                        : "#fff",
                  fillOpacity: 1,
                  weight: 2,
                }}
              >
                <Popup>
                  <b>{i + 1}.</b> {s.nombre || "Parada"}
                </Popup>
              </CircleMarker>
            ))}
          </>
        )}

        {/* Congestion overlay */}
        {showCongestion && <CongestionLayer />}

        {/* Trip point markers */}
        {tripPoints.map((pt, i) => {
          const icon =
            i === 0
              ? originIcon
              : i === tripPoints.length - 1
                ? destIcon
                : waypointIcon;
          return (
            <DraggableMarker
              key={`tp-${i}`}
              position={[pt.lat, pt.lng]}
              icon={icon}
              onDragEnd={(lat, lng) => onMovePoint?.(i, lat, lng)}
            />
          );
        })}

        {/* Dashed connecting line */}
        {tripPoints.length >= 2 && !prediction && (
          <Polyline
            positions={tripPoints.map(
              (p) => [p.lat, p.lng] as [number, number],
            )}
            pathOptions={{
              color: "#a855f7",
              weight: 3,
              dashArray: "8 12",
              opacity: 0.7,
              lineCap: "round",
            }}
          />
        )}

        <FitRouteBounds prediction={prediction} tripPoints={tripPoints} />

        {/* Prediction route segments */}
        {prediction?.risk_segments.map((segment) => (
          <Polyline
            key={`${segment.from_station}-${segment.to_station}`}
            positions={segment.coordinates.map(
              (c) => [c[0], c[1]] as [number, number],
            )}
            pathOptions={{
              color: RISK_COLORS[segment.risk_label] ?? "#6b7280",
              weight: 6,
              opacity: 0.9,
              lineCap: "round",
              lineJoin: "round",
            }}
          >
            <Popup>
              <div style={{ fontSize: 11, minWidth: 140 }}>
                <strong>{segment.from_station}</strong>
                <br />
                <span style={{ color: "#888" }}>→ {segment.to_station}</span>
                <br />
                <span
                  style={{
                    fontWeight: 600,
                    color:
                      segment.risk_label === "high" ||
                      segment.risk_label === "critical"
                        ? "#ef4444"
                        : segment.risk_label === "medium"
                          ? "#eab308"
                          : "#22c55e",
                  }}
                >
                  {Math.round(segment.congestion_level * 100)}% congestión
                </span>
              </div>
            </Popup>
          </Polyline>
        ))}
      </MapContainer>

      {/* Tap hint when prediction mode */}
      {predictionMode && tripPoints.length < 2 && (
        <div className="absolute top-12 md:top-3 left-1/2 -translate-x-1/2 z-[400] px-3 py-1.5 rounded-full bg-primary/90 text-primary-foreground text-[10px] md:text-[11px] font-medium shadow-lg shadow-primary/30 animate-bounce pointer-events-none">
          Toca el mapa para{" "}
          {tripPoints.length === 0 ? "elegir origen" : "elegir destino"}
        </div>
      )}

      {/* Map info bar */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[400] hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-divider/50 text-[9px] text-default-400">
        <span>Bogotá D.C.</span>
        <span className="w-px h-3 bg-divider" />
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />{" "}
          Conectado
        </span>
        <span className="w-px h-3 bg-divider" />
        <span>
          {new Date().toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
