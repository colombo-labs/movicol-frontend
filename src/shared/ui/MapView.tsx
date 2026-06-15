/* eslint-disable @typescript-eslint/no-explicit-any */
import "leaflet/dist/leaflet.css";
import { useTheme } from "@shared/hooks/useTheme";
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  CircleMarker,
  Popup,
  Tooltip,
  Polyline,
  Marker,
  useMap,
} from "react-leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { TroncalesLayer } from "./TroncalesLayer";
import type { TripPoint } from "../../app/Layout";
import type { RoutePrediction } from "../../modules/predicciones/models";

import { API_URL } from "@/shared/config";

const RISK_COLORS: Record<string, string> = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
};

function makeIcon(color: string, size = 32, label?: string) {
  return L.divIcon({
    className: "",
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    html: `<div style="position:relative;width:${size}px;height:${size + 8}px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 1C7.58 1 4 4.58 4 9c0 6.25 8 14 8 14s8-7.75 8-14c0-4.42-3.58-8-8-8z" fill="${color}" stroke="#fff" stroke-width="2"/>
        <circle cx="12" cy="9" r="3" fill="#fff"/>
        ${label ? `<text x="12" y="10.5" text-anchor="middle" font-size="5" font-weight="bold" fill="${color}">${label}</text>` : ""}
      </svg>
    </div>`,
  });
}

const originIcon = makeIcon("#22c55e", 36, "A");
const destIcon = makeIcon("#ef4444", 36, "B");
const waypointIcon = makeIcon("#3b82f6", 28);

// Draggable Marker component
function DraggableMarker({
  position,
  icon,
  onDragEnd,
}: {
  position: [number, number];
  icon: L.DivIcon;
  onDragEnd: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker) {
          const { lat, lng } = marker.getLatLng();
          onDragEnd(lat, lng);
        }
      },
    }),
    [onDragEnd],
  );
  return (
    <Marker
      draggable
      position={position}
      icon={icon}
      eventHandlers={eventHandlers}
      ref={markerRef}
    />
  );
}

// SITP bus stops layer
function SitpLayer() {
  const [paraderos, setParaderos] = useState<
    { lat: number; lon: number; nombre: string; direccion: string }[]
  >([]);
  useEffect(() => {
    fetch(`${API_URL}/graph/sitp/paraderos`)
      .then((r) => (r.ok ? r.json() : { features: [] }))
      .then((d) => {
        const features = d.features || [];
        setParaderos(
          features
            .filter((f: any) => f.geometry)
            .map((f: any) => ({
              lat: f.geometry.coordinates[1],
              lon: f.geometry.coordinates[0],
              nombre: f.properties.nombre || "",
              direccion:
                f.properties.direccion_bandera || f.properties.via || "",
            })),
        );
      })
      .catch(() => {});
  }, []);
  return (
    <>
      {paraderos.map((p, i) => (
        <CircleMarker
          key={`sitp-${i}`}
          center={[p.lat, p.lon]}
          radius={3}
          pathOptions={{
            color: "#3b82f6",
            fillColor: "#3b82f6",
            fillOpacity: 0.7,
            weight: 1,
          }}
        >
          <Popup>
            <div style={{ fontSize: 11, minWidth: 120 }}>
              <strong>{p.nombre}</strong>
              <br />
              <span style={{ color: "#888" }}>{p.direccion}</span>
              <br />
              <span style={{ color: "#3b82f6", fontWeight: 500 }}>
                Paradero SITP Zonal
              </span>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}

// Congestion heatmap overlay
function CongestionLayer() {
  const [stations, setStations] = useState<
    {
      id: string;
      name: string;
      lat: number;
      lon: number;
      congestion: number;
      risk: string;
    }[]
  >([]);
  useEffect(() => {
    const hour = new Date().getHours();
    fetch(`${API_URL}/graph/heatmap?hour=${hour}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        if (Array.isArray(d)) setStations(d);
      })
      .catch(() => {});
  }, []);
  const riskColor = (risk: string) =>
    risk === "critical"
      ? "#ef4444"
      : risk === "high"
        ? "#f97316"
        : risk === "medium"
          ? "#eab308"
          : "#22c55e";
  return (
    <>
      {stations.map((s) => (
        <CircleMarker
          key={`cong-${s.id}`}
          center={[s.lat, s.lon]}
          radius={Math.max(4, s.congestion * 12)}
          pathOptions={{
            color: riskColor(s.risk),
            fillColor: riskColor(s.risk),
            fillOpacity: 0.6,
            weight: 1,
          }}
        >
          <Popup>
            <div style={{ fontSize: 11, minWidth: 130 }}>
              <strong>{s.name}</strong>
              <br />
              Congestión:{" "}
              <span style={{ color: riskColor(s.risk), fontWeight: 600 }}>
                {Math.round(s.congestion * 100)}%
              </span>
              <br />
              <span style={{ color: "#888" }}>
                Nivel:{" "}
                {s.risk === "critical"
                  ? "Crítico"
                  : s.risk === "high"
                    ? "Alto"
                    : s.risk === "medium"
                      ? "Medio"
                      : "Bajo"}
              </span>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}

// Auto-fit map to route bounds
function FitRouteBounds({
  prediction,
  tripPoints,
}: {
  prediction: any;
  tripPoints: any[];
}) {
  const map = useMap();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    try {
      if (prediction?.risk_segments?.length > 0) {
        const allCoords: [number, number][] = [];
        prediction.risk_segments.forEach((s: any) => {
          if (s.coordinates) {
            s.coordinates.forEach((c: [number, number]) => {
              if (
                c &&
                c.length >= 2 &&
                c[0] > 4 &&
                c[0] < 5 &&
                c[1] < -73 &&
                c[1] > -75
              ) {
                allCoords.push(c);
              }
            });
          }
        });
        if (allCoords.length > 1) {
          const bounds = L.latLngBounds(allCoords);
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
          }
        }
      } else if (tripPoints.length >= 2) {
        const coords = tripPoints.map(
          (p: any) => [p.lat, p.lng] as [number, number],
        );
        if (coords.every((c) => isFinite(c[0]) && isFinite(c[1]))) {
          const bounds = L.latLngBounds(coords);
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
          }
        }
      }
    } catch {
      // Silently ignore bounds errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prediction, tripPoints.length]);
  return null;
}

// Fix: invalidate map size once after initial render
function InvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function MapClickHandler({
  onClick,
  active,
}: {
  onClick: (lat: number, lng: number) => void;
  active: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    if (!active) return;
    const handler = (e: L.LeafletMouseEvent) =>
      onClick(e.latlng.lat, e.latlng.lng);
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [active, map, onClick]);
  return null;
}

interface MapViewProps {
  onMapClick?: (lat: number, lng: number) => void;
  predictionMode?: boolean;
  selectedTroncal?: string | null;
  showTroncalesOnMap?: boolean;
  showEstacionesOnMap?: boolean;
  showRouteFilters?: boolean;
  routeFilter?: "all" | "tm" | "sitp";
  prediction?: RoutePrediction | null;
  tripPoints?: TripPoint[];
  onMovePoint?: (index: number, lat: number, lng: number) => void;
  showCongestion?: boolean;
  showSitpOnMap?: boolean;
  sitpRouteCoords?: {
    coords: [number, number][];
    stops: { lat: number; lon: number; nombre: string }[];
  };
}

function SelectedTroncalLayer({ troncalName }: { troncalName: string }) {
  const [coords, setCoords] = useState<[number, number][]>([]);
  const [stations, setStations] = useState<
    { lat: number; lon: number; nombre: string }[]
  >([]);

  useEffect(() => {
    fetch("/data/tm_troncales.geojson")
      .then((r) => r.json())
      .then((data) => {
        const matching = data.features.filter(
          (f: any) =>
            f.properties.troncal
              ?.toUpperCase()
              .includes(troncalName.toUpperCase()) ||
            f.properties.nombre_trazado_troncal
              ?.toUpperCase()
              .includes(troncalName.toUpperCase()),
        );
        const allCoords: [number, number][] = [];
        matching.forEach((f: any) => {
          const geom = f.geometry;
          if (geom.type === "MultiLineString") {
            geom.coordinates.forEach((line: number[][]) => {
              line.forEach((c: number[]) => {
                if (c && c[0] != null && c[1] != null)
                  allCoords.push([c[1], c[0]]);
              });
            });
          } else {
            geom.coordinates.forEach((c: number[]) => {
              if (c && c[0] != null && c[1] != null)
                allCoords.push([c[1], c[0]]);
            });
          }
        });
        setCoords(allCoords);
        const trazadoIds = matching.map(
          (f: any) => f.properties.id_trazado_troncal,
        );
        fetch("/data/tm_estaciones.geojson")
          .then((r2) => r2.json())
          .then((eData) => {
            const prefix = "transmisig2.tecnica.estacion_troncal.";
            const stns = eData.features
              .filter((f: any) =>
                trazadoIds.includes(f.properties[prefix + "id_trazado"]),
              )
              .map((f: any) => ({
                lat: f.geometry.coordinates[1],
                lon: f.geometry.coordinates[0],
                nombre: f.properties[prefix + "nom_est"] || "",
              }));
            setStations(stns);
          });
      });
  }, [troncalName]);

  return (
    <>
      {coords.length > 1 && (
        <Polyline
          positions={coords}
          pathOptions={{ color: "#ef4444", weight: 5, opacity: 0.8 }}
        />
      )}
      {stations.map((s, i) => (
        <CircleMarker
          key={"tm-st-" + i}
          center={[s.lat, s.lon]}
          radius={5}
          pathOptions={{
            color: "#ef4444",
            fillColor: "#fff",
            fillOpacity: 1,
            weight: 2,
          }}
        >
          <Tooltip
            permanent
            direction="right"
            offset={[6, 0]}
            className="!bg-transparent !border-0 !shadow-none !p-0 !text-[9px] !font-semibold !text-red-600"
          >
            {s.nombre}
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}

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
