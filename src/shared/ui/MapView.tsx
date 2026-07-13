import { useTranslation } from "react-i18next";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import "leaflet/dist/leaflet.css";
import { useTheme } from "@shared/hooks/useTheme";
import type { TripPoint } from "../../app/Layout";
import type { RoutePrediction } from "../../modules/predicciones/models";
import { getPredictionStops } from "../../modules/predicciones/models/routeStops";
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  Polyline,
  CircleMarker,
  Marker,
  Popup,
} from "react-leaflet";
import { TroncalesLayer } from "./TroncalesLayer";
import { SitpLayer, CongestionLayer } from "./map-components/layers";
import { SelectedTroncalLayer } from "./map-components/troncal-layer";
import { SiniestroLayer } from "./map-components/siniestro-layer";
import { CarrilPreferencialLayer } from "./CarrilPreferencialLayer";
import {
  makeIcon,
  makeTransitEndpointIcon,
  makeArrowIcon,
} from "./map-components/make-icon";
import {
  DraggableMarker,
  FitRouteBounds,
  InvalidateSize,
  UserLocationLayer,
  MapClickHandler,
} from "./map-components/helpers";

interface MapViewProps {
  readonly onMapClick?: (lat: number, lng: number) => void;
  readonly predictionMode?: boolean;
  readonly prediction?: RoutePrediction | null;
  readonly altPredictions?: RoutePrediction[];
  readonly onSelectAltRoute?: (index: number) => void;
  readonly tripPoints?: TripPoint[];
  readonly onMovePoint?: (index: number, lat: number, lng: number) => void;
  readonly showCongestion?: boolean;
  readonly showRoutesOnMap?: boolean;
  readonly showSitpOnMap?: boolean;
  readonly selectedTroncal?: string | null;
  readonly showTroncalesOnMap?: boolean;
  readonly showEstacionesOnMap?: boolean;
  readonly sitpRouteCoords?: {
    coords: [number, number][];
    stops: { lat: number; lon: number; nombre: string }[];
  } | null;
  readonly showSiniestros?: boolean;
}

/** Mode-based route colors matching Bogotá's transit system */
const MODE_COLORS: Record<string, string> = {
  transmilenio: "#ef4444", // Red — TM institutional
  sitp: "#3b82f6", // Blue — SITP zonal
  walk: "#9ca3af", // Gray — walking
  vehiculo: "#22c55e", // Green — vehicle
  moto: "#22c55e",
  bicicleta: "#06b6d4",
  caminando: "#9ca3af",
};

const originIcon = makeIcon("#22c55e", 36, "A");
const destIcon = makeIcon("#ef4444", 36, "B");
const waypointIcon = makeIcon("#3b82f6", 28);

function getStopFillColor(i: number, total: number) {
  if (i === 0) return "#22c55e";
  if (i === total - 1) return "#ef4444";
  return "#fff";
}

function getPointIcon(i: number, total: number) {
  if (i === 0) return originIcon;
  if (i === total - 1) return destIcon;
  return waypointIcon;
}

export function MapView({
  onMapClick,
  predictionMode,
  prediction,
  altPredictions = [],
  onSelectAltRoute,
  tripPoints = [],
  onMovePoint,
  showCongestion,
  showSitpOnMap,
  selectedTroncal,
  showTroncalesOnMap,
  showEstacionesOnMap,
  sitpRouteCoords,
  showRoutesOnMap,
  showSiniestros,
}: MapViewProps) {
  const { t } = useTranslation();
  const center: [number, number] = [4.65, -74.1];
  const [showTroncalesLocal] = useState(false);
  const showTroncales = showTroncalesOnMap ?? showTroncalesLocal;
  const { theme } = useTheme();
  const darkMap = theme === "dark";
  const [showEstacionesLocal] = useState(false);
  const showEstaciones = showEstacionesOnMap ?? showEstacionesLocal;
  const [showSitp] = useState(false);
  const predictionStops = getPredictionStops(prediction);

  return (
    <div
      className="h-full w-full relative"
      data-routes-visible={showRoutesOnMap}
    >
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
              : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          }
          attribution={darkMap ? "&copy; CartoDB" : "&copy; OpenStreetMap"}
        />
        <ZoomControl position="topright" />
        <InvalidateSize />
        <UserLocationLayer />
        <MapClickHandler
          onClick={(lat, lng) => onMapClick?.(lat, lng)}
          active={!!predictionMode}
        />

        {/* Troncales & Estaciones */}
        <TroncalesLayer
          showTroncales={showTroncales}
          showEstaciones={showEstaciones}
        />
        <CarrilPreferencialLayer show={showTroncales} />

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
                key={`sr-${s.lat}-${s.lon}`}
                center={[s.lat, s.lon]}
                radius={4}
                pathOptions={{
                  color: "#3b82f6",
                  fillColor: getStopFillColor(i, sitpRouteCoords.stops.length),
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

        {/* Siniestralidad heatmap */}
        {showSiniestros && <SiniestroLayer />}

        {/* Trip point markers */}
        {tripPoints.map((pt, i) => {
          const icon = getPointIcon(i, tripPoints.length);
          return (
            <DraggableMarker
              key={`tp-${pt.lat}-${pt.lng}`}
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

        {/* Alternative route polylines (subtle gray, clickable) */}
        {altPredictions.map((alt, ai) =>
          alt.risk_segments.map((segment, si) => (
            <Polyline
              key={`alt-${ai}-${si}`}
              positions={segment.coordinates.map(
                (c) => [c[0], c[1]] as [number, number],
              )}
              pathOptions={{
                color: "#6b7280",
                weight: 4,
                opacity: 0.4,
                lineCap: "round",
                lineJoin: "round",
              }}
              eventHandlers={{ click: () => onSelectAltRoute?.(ai) }}
            />
          )),
        )}

        {/* Prediction route segments (selected — mode-colored) */}
        {prediction?.risk_segments.map((segment, i) => (
          <Polyline
            key={`pred-seg-${i}-${segment.from_station}-${segment.to_station}`}
            positions={segment.coordinates.map(
              (c) => [c[0], c[1]] as [number, number],
            )}
            pathOptions={{
              color: MODE_COLORS[segment.mode || prediction.mode] ?? "#22c55e",
              weight: segment.mode === "walk" ? 4 : 6,
              opacity: 0.9,
              lineCap: "round",
              lineJoin: "round",
              dashArray: segment.mode === "walk" ? "8, 12" : undefined,
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
                      MODE_COLORS[segment.mode || prediction.mode] ?? "#22c55e",
                  }}
                >
                  {segment.mode === "walk"
                    ? "🚶 Caminando"
                    : segment.mode === "transmilenio"
                      ? "🚇 TransMilenio"
                      : segment.mode === "sitp"
                        ? "🚌 SITP"
                        : "🚗 Vehículo"}
                </span>
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* Direction arrows along route */}
        {prediction?.risk_segments.map((segment, segIdx) => {
          if (segment.mode === "walk") return null;
          const coords = segment.coordinates;
          if (coords.length < 4) return null;
          // Place an arrow at ~40% of each segment
          const midIdx = Math.floor(coords.length * 0.4);
          const p1 = coords[midIdx];
          const p2 = coords[Math.min(midIdx + 1, coords.length - 1)];
          if (!p1 || !p2) return null;
          const angle =
            (Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180) / Math.PI + 90;
          const color =
            MODE_COLORS[segment.mode || prediction.mode] ?? "#22c55e";
          return (
            <Marker
              key={`arrow-${segIdx}`}
              position={[p1[0], p1[1]] as [number, number]}
              icon={makeArrowIcon(angle, color)}
              interactive={false}
            />
          );
        })}

        {predictionStops.map((stop, i) => {
          const isFirst = i === 0;
          const isLast = i === predictionStops.length - 1;
          const popup = (
            <Popup>
              <b>{i + 1}.</b> {stop.name}
            </Popup>
          );

          // First/last stops get large TM/SITP endpoint icons with logo
          if (stop.mode && (isFirst || isLast)) {
            return (
              <Marker
                key={`prediction-stop-${i}-${stop.lat}-${stop.lon}`}
                position={[stop.lat, stop.lon]}
                icon={makeTransitEndpointIcon(stop.mode, isFirst)}
              >
                {popup}
              </Marker>
            );
          }

          // Intermediate stops: small dots colored by mode (Moovit style)
          const modeColors: Record<string, string> = {
            transmilenio: "#ef4444",
            sitp: "#3b82f6",
          };
          const dotColor = modeColors[stop.mode || ""] || "#9ca3af";
          return (
            <CircleMarker
              key={`prediction-stop-${i}-${stop.lat}-${stop.lon}`}
              center={[stop.lat, stop.lon]}
              radius={4}
              pathOptions={{
                color: "#fff",
                fillColor: dotColor,
                fillOpacity: 1,
                weight: 2,
              }}
            >
              {popup}
            </CircleMarker>
          );
        })}

        {/* Walking lines — dashed from origin to first segment and last segment to destination */}
        {prediction &&
          prediction.risk_segments.length > 0 &&
          tripPoints.length >= 2 &&
          (() => {
            const firstSeg = prediction.risk_segments[0];
            const lastSeg =
              prediction.risk_segments[prediction.risk_segments.length - 1];
            const firstCoord = firstSeg.coordinates[0];
            const lastCoord =
              lastSeg.coordinates[lastSeg.coordinates.length - 1];
            const origin = tripPoints[0];
            const dest = tripPoints[tripPoints.length - 1];
            return (
              <>
                <Polyline
                  positions={[
                    [origin.lat, origin.lng],
                    [firstCoord[0], firstCoord[1]],
                  ]}
                  pathOptions={{
                    color: "#a855f7",
                    weight: 3,
                    dashArray: "6 10",
                    opacity: 0.7,
                    lineCap: "round",
                  }}
                />
                <Polyline
                  positions={[
                    [lastCoord[0], lastCoord[1]],
                    [dest.lat, dest.lng],
                  ]}
                  pathOptions={{
                    color: "#a855f7",
                    weight: 3,
                    dashArray: "6 10",
                    opacity: 0.7,
                    lineCap: "round",
                  }}
                />
              </>
            );
          })()}
      </MapContainer>

      {/* Tap hint when prediction mode */}
      {predictionMode && tripPoints.length < 2 && (
        <div className="absolute top-12 md:top-3 left-1/2 -translate-x-1/2 z-[400] px-3 py-1.5 rounded-full bg-primary/90 text-primary-foreground text-[10px] md:text-[11px] font-medium shadow-lg shadow-primary/30 animate-bounce pointer-events-none">
          {tripPoints.length === 0
            ? t("map.tapOrigin")
            : t("map.tapDestination")}
        </div>
      )}

      {/* Map info bar — desktop only */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[400] hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-divider/50 text-[9px] text-default-400">
        <span>Bogotá D.C.</span>
        <span className="w-px h-3 bg-divider" />
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />{" "}
          {t("app.connected")}
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
