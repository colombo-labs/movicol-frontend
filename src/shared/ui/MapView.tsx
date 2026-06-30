import { useTranslation } from "react-i18next";
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
import { SiniestroLayer } from "./map-components/siniestro-layer";
import { CarrilPreferencialLayer } from "./CarrilPreferencialLayer";
import { makeIcon } from "./map-components/make-icon";
import {
  DraggableMarker,
  FitRouteBounds,
  InvalidateSize,
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

const RISK_COLORS: Record<string, string> = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
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

        {/* Alternative route polylines (light green, clickable like Google Maps) */}
        {altPredictions.map((alt, ai) =>
          alt.risk_segments.map((segment, si) => (
            <Polyline
              key={`alt-${ai}-${si}`}
              positions={segment.coordinates.map(
                (c) => [c[0], c[1]] as [number, number],
              )}
              pathOptions={{
                color: "#86efac",
                weight: 5,
                opacity: 0.6,
                lineCap: "round",
                lineJoin: "round",
              }}
              eventHandlers={{ click: () => onSelectAltRoute?.(ai) }}
            />
          )),
        )}

        {/* Prediction route segments (selected — bold, colored) */}
        {prediction?.risk_segments.map((segment, i) => (
          <Polyline
            key={`pred-seg-${i}-${segment.from_station}-${segment.to_station}`}
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
                    color: RISK_COLORS[segment.risk_label] ?? "#22c55e",
                  }}
                >
                  {Math.round(segment.congestion_level * 100)}% congestión
                </span>
              </div>
            </Popup>
          </Polyline>
        ))}

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
