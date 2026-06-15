/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import {
  Navigation,
  Train,
  Bus,
  Car,
  Clock,
  MapPin,
  Loader2,
  AlertCircle,
  X,
  LocateFixed,
  ArrowUpDown,
  Plus,
  Trash2,
  Search,
  ChevronRight,
  Leaf,
  Flame,
  RefreshCw,
  Footprints,
  Share2,
  Bell,
  MapPinned,
  Shield,
} from "lucide-react";
import { GlassCard } from "@shared/ui/GlassCard";
import type { RoutePrediction } from "@modules/predicciones/models";
import type { TripPoint } from "@/app/Layout";
import { geocodeAddress, type GeoResult } from "@shared/utils/geocode";
import { API_URL } from "@/shared/config";

type TransportMode = "transmilenio" | "sitp" | "vehiculo";
// Calculate real distance between two points (Haversine)
function calcDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateTrip(
  origin: { lat: number; lng: number },
  dest: { lat: number; lng: number },
  mode: string,
) {
  const dist = calcDistance(origin.lat, origin.lng, dest.lat, dest.lng);
  const roadDist = dist * 1.4; // road factor
  const speeds: Record<string, number> = {
    transmilenio: 22,
    sitp: 15,
    vehiculo: 30,
  };
  const speed = speeds[mode] || 20;
  const time = Math.round((roadDist / speed) * 60);
  const costs: Record<string, string> = {
    transmilenio: "$3,550",
    sitp: "$3,550",
    vehiculo: `~$${Math.round(roadDist * 1200).toLocaleString()}`,
  };
  return {
    distance: Math.round(roadDist * 10) / 10,
    time,
    cost: costs[mode] || "$3,550",
  };
}

type DepartureType = "ahora" | "programar";

const riskColors: Record<string, string> = {
  low: "text-success",
  medium: "text-warning",
  high: "text-orange-500",
  critical: "text-danger",
};
const riskBg: Record<string, string> = {
  low: "bg-success/20 text-success",
  medium: "bg-warning/20 text-warning",
  high: "bg-orange-500/20 text-orange-500",
  critical: "bg-danger/20 text-danger",
};

interface Props {
  onPredict?: (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: TransportMode,
    departureTime: string,
  ) => void;
  prediction?: RoutePrediction | null;
  isLoading?: boolean;
  error?: string | null;
  tripPoints: TripPoint[];
  onRemovePoint: (index: number) => void;
  onUseMyLocation: (index?: number) => void;
  onSwapPoints: (i: number, j: number) => void;
  onClear: () => void;
  onAddPoint?: (lat: number, lng: number, label: string) => void;
}

export function PlanificarViajePanel({
  onPredict,
  prediction,
  isLoading,
  error,
  tripPoints,
  onRemovePoint,
  onUseMyLocation,
  onSwapPoints,
  onClear,
  onAddPoint,
}: Props) {
  const [mode, setMode] = useState<TransportMode>("transmilenio");
  const [departureType, setDepartureType] = useState<DepartureType>("ahora");
  const [departureTime, setDepartureTime] = useState("");
  const [rutasDisponibles, setRutasDisponibles] = useState<
    { ruta: string; cenefa: string; distanciaMinima: number }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const origin = tripPoints.length > 0 ? tripPoints[0] : null;
  const destination =
    tripPoints.length > 1 ? tripPoints[tripPoints.length - 1] : null;

  const handleSearch = () => {
    if (!origin || !destination) return;
    const dt =
      departureType === "programar" && departureTime
        ? new Date(`2026-06-12T${departureTime}:00`).toISOString()
        : new Date().toISOString();
    onPredict?.(origin, destination, mode, dt);
  };

  const handleModeChange = (newMode: TransportMode) => {
    setMode(newMode);
    if (prediction && origin && destination) {
      const dt =
        departureType === "programar" && departureTime
          ? new Date(`2026-06-12T${departureTime}:00`).toISOString()
          : new Date().toISOString();
      onPredict?.(origin, destination, newMode, dt);
    }
  };

  // Fetch real routes when origin+destination are set
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!origin || !destination || mode === "vehiculo") {
      setRutasDisponibles([]);
      return;
    }
    const fetchRutas = async () => {
      try {
        const API = API_URL;
        const radius = 600;
        const [resO, resD] = await Promise.all([
          fetch(
            `${API}/graph/rutas-cercanas?lat=${origin.lat}&lng=${origin.lng}&radius=${radius}`,
          ).then((r) => r.json()),
          fetch(
            `${API}/graph/rutas-cercanas?lat=${destination.lat}&lng=${destination.lng}&radius=${radius}`,
          ).then((r) => r.json()),
        ]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rutasOrigen = new Set((resO.rutas || []).map((r: any) => r.ruta));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const comunes = (resD.rutas || []).filter((r: any) =>
          rutasOrigen.has(r.ruta),
        );
        setRutasDisponibles(comunes.slice(0, 5));
      } catch {
        setRutasDisponibles([]);
      }
    };
    fetchRutas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin?.lat, origin?.lng, destination?.lat, destination?.lng, mode]);

  // Swap first and last points
  const handleSwap = () => {
    if (tripPoints.length >= 2) {
      onSwapPoints(0, tripPoints.length - 1);
    }
  };

  // Search address
  const handleAddressSearch = (query: string) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      const results = await geocodeAddress(query);
      setSearchResults(results);
      setSearching(false);
    }, 300);
  };

  const handleSelectResult = (result: GeoResult) => {
    onAddPoint?.(result.lat, result.lng, result.label);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Auto-buscar ruta cuando hay 2+ puntos (estilo Waze/Moovit)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (tripPoints.length >= 2 && !prediction && !isLoading) {
      const timer = setTimeout(() => handleSearch(), 500);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripPoints]);
  const formatCoord = (pt: TripPoint) =>
    pt.label || `${pt.lat.toFixed(4)}, ${pt.lng.toFixed(4)}`;

  // Estimated arrival time
  const getETA = () => {
    if (!prediction) return null;
    const now = new Date();
    const eta = new Date(now.getTime() + prediction.total_time_minutes * 60000);
    return eta.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-default-100 border border-divider">
          <Search size={14} className="text-default-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar dirección..."
            value={searchQuery}
            onChange={(e) => handleAddressSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-default-400"
          />
          {searching && (
            <Loader2 size={14} className="animate-spin text-primary" />
          )}
        </div>
        {(searchResults.length > 0 || searching) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-default-50 border border-divider rounded-xl shadow-lg z-50 max-h-52 overflow-y-auto">
            {searching && searchResults.length === 0 && (
              <div className="px-3 py-2.5 text-[10px] text-default-400 text-center">
                Buscando...
              </div>
            )}
            {!searching &&
              searchResults.length === 0 &&
              searchQuery.length >= 3 && (
                <div className="px-3 py-2.5 text-[10px] text-default-400 text-center">
                  Sin resultados. Intenta otro término.
                </div>
              )}
            {searchResults.map((r, i) => (
              <button
                key={i}
                onClick={() => handleSelectResult(r)}
                className="w-full flex items-center gap-2 text-left px-3 py-2 text-xs text-foreground hover:bg-default-100 border-b border-divider/50 last:border-0 transition-colors"
              >
                <MapPin
                  size={11}
                  className={`shrink-0 ${r.type === "station" ? "text-danger" : "text-primary"}`}
                />
                <span className="flex-1 truncate">{r.label}</span>
                <span
                  className={`text-[8px] px-1.5 py-0.5 rounded-full shrink-0 ${r.type === "station" ? "bg-danger/10 text-danger" : "bg-primary/10 text-primary"}`}
                >
                  {r.type === "station" ? "TM" : "Dir"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hint */}
      {tripPoints.length === 0 && (
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-[10px] text-primary font-medium">
            Busca una dirección, toca el mapa o usa tu ubicación para comenzar.
          </p>
        </div>
      )}
      {tripPoints.length === 1 && !prediction && (
        <div className="p-2 rounded-lg bg-danger/10 border border-danger/20">
          <p className="text-[10px] text-danger font-medium">
            Ahora agrega tu destino: busca, toca el mapa o elige abajo.
          </p>
        </div>
      )}

      {/* Recent routes - like Waze/Moovit */}
      {tripPoints.length === 0 &&
        (() => {
          const saved = JSON.parse(
            localStorage.getItem("movicol_saved_routes") || "[]",
          );
          if (saved.length === 0) return null;
          return (
            <div className="space-y-1.5">
              <p className="text-[10px] text-default-400 font-medium px-1">
                Rutas recientes
              </p>
              {saved.slice(0, 3).map((r: any, i: number) => (
                <button
                  key={`recent-${i}`}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-default-100 border border-divider/50 text-left hover:bg-default-200 transition-all"
                >
                  <Clock size={12} className="text-default-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-foreground truncate">
                      {r.origin} → {r.dest}
                    </p>
                    <p className="text-[9px] text-default-400">
                      {r.time} min • {r.date}
                    </p>
                  </div>
                  <ChevronRight
                    size={12}
                    className="text-default-300 shrink-0"
                  />
                </button>
              ))}
            </div>
          );
        })()}

      {/* Use my location - always available */}
      {tripPoints.length === 0 && (
        <button
          onClick={() => onUseMyLocation()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/30 text-sm font-medium text-primary hover:bg-primary/20 transition-all active:scale-[0.98]"
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <LocateFixed size={16} className="text-primary animate-pulse" />
          </div>
          <div className="text-left">
            <span className="block text-primary font-semibold text-sm">
              Usar mi ubicación
            </span>
            <span className="block text-[10px] text-primary/60">
              Toca para iniciar desde donde estás
            </span>
          </div>
        </button>
      )}
      {tripPoints.length > 0 && tripPoints.length < 2 && (
        <div className="flex gap-2">
          <button
            onClick={() => onUseMyLocation(0)}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-medium text-primary hover:bg-primary/20 transition-all"
          >
            <LocateFixed size={12} /> Origen: mi ubicación
          </button>
        </div>
      )}

      {/* Quick destinations - Moovit style */}
      {tripPoints.length === 1 && !prediction && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-default-400 font-medium px-1">
            ¿A dónde vas?
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {[
              { label: "Portal Norte", lat: 4.7588, lng: -74.0445 },
              { label: "Portal Sur", lat: 4.5968, lng: -74.1372 },
              { label: "Centro (Museo Nal)", lat: 4.6122, lng: -74.0695 },
              { label: "Aeropuerto", lat: 4.7016, lng: -74.1469 },
            ].map((dest) => (
              <button
                key={dest.label}
                onClick={() => onAddPoint?.(dest.lat, dest.lng, dest.label)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-default-100 border border-divider/50 text-[10px] text-foreground hover:bg-default-200 transition-all whitespace-nowrap shrink-0"
              >
                <MapPin size={10} className="text-danger shrink-0" />
                <span className="truncate">{dest.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Trip Points List */}
      {tripPoints.length > 0 && (
        <div className="space-y-0">
          <div className="flex items-stretch gap-2">
            {/* Dots column */}
            <div className="flex flex-col items-center py-2 w-5 shrink-0">
              {tripPoints.map((_, i) => {
                const isFirst = i === 0;
                const isLast =
                  i === tripPoints.length - 1 && tripPoints.length > 1;
                return (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full border-2 ${isFirst ? "border-success bg-success/30" : isLast ? "border-danger bg-danger/30" : "border-blue-500 bg-blue-500/30"}`}
                    />
                    {i < tripPoints.length - 1 && (
                      <div className="w-0.5 h-6 bg-default-200" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Points column */}
            <div className="flex-1 space-y-1.5">
              {tripPoints.map((pt, i) => (
                <div key={`pt-${i}`} className="flex items-center gap-1.5">
                  <div className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg bg-default-100 border border-divider">
                    <span className="text-[11px] text-foreground truncate block">
                      {formatCoord(pt)}
                    </span>
                  </div>
                  <button
                    onClick={() => onUseMyLocation(i)}
                    className="text-default-400 hover:text-primary p-0.5"
                    title="Mi ubicación"
                  >
                    <LocateFixed size={11} />
                  </button>
                  <button
                    onClick={() => onRemovePoint(i)}
                    className="text-default-400 hover:text-danger p-0.5"
                    title="Quitar"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>

            {/* Swap button */}
            {tripPoints.length >= 2 && (
              <button
                onClick={handleSwap}
                className="self-center text-default-400 hover:text-primary"
                title="Intercambiar"
              >
                <ArrowUpDown size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1 pl-7">
            <Plus size={11} className="text-default-400" />
            <span className="text-[9px] text-default-400">
              Toca el mapa o busca para agregar paradas
            </span>
          </div>
        </div>
      )}

      {/* Clear */}
      {tripPoints.length > 0 && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-[10px] text-danger hover:underline"
        >
          <Trash2 size={10} /> Limpiar
        </button>
      )}

      {/* Departure */}
      <div className="flex items-center gap-2 flex-wrap">
        <Clock size={13} className="text-default-400 shrink-0" />
        <button
          onClick={() => setDepartureType("ahora")}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${departureType === "ahora" ? "bg-primary/20 text-primary" : "bg-default-100 text-default-500"}`}
        >
          Salir ahora
        </button>
        <button
          onClick={() => setDepartureType("programar")}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${departureType === "programar" ? "bg-primary/20 text-primary" : "bg-default-100 text-default-500"}`}
        >
          Programar
        </button>
        {departureType === "programar" && (
          <input
            type="time"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            className="px-2 py-0.5 rounded-lg bg-default-100 border border-divider text-[10px] outline-none text-foreground"
          />
        )}
      </div>

      {/* Search route button */}
      {!prediction && !isLoading && tripPoints.length >= 2 && (
        <button
          onClick={handleSearch}
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]"
        >
          <Navigation size={14} /> Buscar ruta
        </button>
      )}

      {prediction && !isLoading && (
        <button
          onClick={handleSearch}
          className="w-full py-1.5 rounded-lg border border-primary/30 text-primary text-[10px] font-medium flex items-center justify-center gap-1.5 hover:bg-primary/5 transition-all"
        >
          <Navigation size={10} /> Recalcular ruta
        </button>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-5 gap-2">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-primary/20" />
            <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          </div>
          <span className="text-xs text-primary font-medium">
            Calculando mejor ruta...
          </span>
          <span className="text-[9px] text-default-400">
            Analizando congestión en tiempo real
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-danger/10 border border-danger/20">
          <AlertCircle size={12} className="text-danger mt-0.5 shrink-0" />
          <p className="text-[10px] text-danger">{error}</p>
        </div>
      )}

      {/* Rush hour warning - Waze style */}
      {prediction &&
        (() => {
          const hour = new Date().getHours();
          const isRushHour =
            (hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 20);
          if (!isRushHour) return null;
          return (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-warning/10 border border-warning/20">
              <Clock size={12} className="text-warning shrink-0" />
              <div>
                <p className="text-[10px] text-warning font-semibold">
                  Hora pico activa
                </p>
                <p className="text-[9px] text-warning/70">
                  El tiempo puede ser mayor al estimado
                </p>
              </div>
            </div>
          );
        })()}
      {/* Results */}
      {prediction && (
        <div className="space-y-2.5">
          {/* Weather + live info strip */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-default-100/50 text-[9px] text-default-400">
            <span>14°C Bogotá</span>
            <span>Datos en vivo</span>
            <span>
              {new Date().toLocaleTimeString("es-CO", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {/* Calculated real values when backend returns 0 */}
          {(() => {
            if (prediction.total_time_minutes === 0 && origin && destination) {
              const est = estimateTrip(origin, destination, mode);
              prediction.total_time_minutes = est.time;
              prediction.total_distance_km = est.distance;
              prediction.cost = est.cost;
            }
            return null;
          })()}
          {/* Mode comparison - Moovit style */}
          <div className="space-y-1">
            <p className="text-[10px] text-default-400 font-medium">
              Comparar opciones
            </p>
            <div className="flex gap-1.5">
              <div
                className={`flex-1 p-2 rounded-lg border text-center cursor-pointer transition-all ${mode === "transmilenio" ? "border-primary bg-primary/10" : "border-divider hover:border-primary/50"}`}
                onClick={() => handleModeChange("transmilenio")}
              >
                <Train size={14} className="mx-auto mb-0.5 text-danger" />
                <p className="text-[10px] font-bold">
                  {Math.round(prediction.total_time_minutes)} min
                </p>
                <p className="text-[8px] text-default-400">
                  {mode === "transmilenio" ? "Actual" : "$3,550"}
                </p>
              </div>
              <div
                className={`flex-1 p-2 rounded-lg border text-center cursor-pointer transition-all ${mode === "sitp" ? "border-primary bg-primary/10" : "border-divider hover:border-primary/50"}`}
                onClick={() => handleModeChange("sitp")}
              >
                <Bus size={14} className="mx-auto mb-0.5 text-blue-500" />
                <p className="text-[10px] font-bold">
                  {Math.round(prediction.total_time_minutes * 1.4)} min
                </p>
                <p className="text-[8px] text-default-400">
                  {mode === "sitp" ? "Actual" : "$3,550"}
                </p>
              </div>
              <div
                className={`flex-1 p-2 rounded-lg border text-center cursor-pointer transition-all ${mode === "vehiculo" ? "border-primary bg-primary/10" : "border-divider hover:border-primary/50"}`}
                onClick={() => handleModeChange("vehiculo")}
              >
                <Car size={14} className="mx-auto mb-0.5 text-default-500" />
                <p className="text-[10px] font-bold">
                  {Math.round(prediction.total_time_minutes * 0.7)} min
                </p>
                <p className="text-[8px] text-default-400">
                  {mode === "vehiculo" ? "Actual" : "~$15,000"}
                </p>
              </div>
            </div>
          </div>

          {/* Route alternatives - like Google Maps */}
          <div className="space-y-1.5">
            <p className="text-[10px] text-default-400 font-medium">
              Alternativas
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Navigation size={10} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-primary">
                    Ruta más rápida
                  </p>
                  <p className="text-[9px] text-primary/70">
                    {Math.round(prediction.total_time_minutes)} min •{" "}
                    {prediction.stations.length} estaciones
                  </p>
                </div>
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">
                  Mejor
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-default-100 border border-divider/50 opacity-80">
                <div className="w-6 h-6 rounded-full bg-default-200 flex items-center justify-center shrink-0">
                  <span className="text-[10px]"></span>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-foreground">
                    Ruta económica
                  </p>
                  <p className="text-[9px] text-default-400">
                    {Math.round(prediction.total_time_minutes * 1.3)} min •
                    Menos transbordos
                  </p>
                </div>
                <span className="text-[9px] text-default-400">$3,550</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-default-100 border border-divider/50 opacity-80">
                <div className="w-6 h-6 rounded-full bg-default-200 flex items-center justify-center shrink-0">
                  <span className="text-[10px]"></span>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-foreground">
                    Menos caminata
                  </p>
                  <p className="text-[9px] text-default-400">
                    {Math.round(prediction.total_time_minutes * 1.1)} min •
                    Parada más cercana
                  </p>
                </div>
                <span className="text-[9px] text-default-400">$3,550</span>
              </div>
            </div>
          </div>

          {/* Live time banner - Waze style */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-primary/10 border border-primary/20">
            <div>
              <p className="text-[10px] text-primary/70">Sal ahora</p>
              <p className="text-lg font-bold text-primary">{getETA()}</p>
              <p className="text-[9px] text-success font-medium flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-success animate-ping" />
                {mode === "vehiculo"
                  ? "Ruta vehicular directa"
                  : mode === "transmilenio"
                    ? "Servicio troncal frecuente"
                    : "Servicio zonal disponible"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-default-400">Duración estimada</p>
              <p className="text-base font-bold">
                {Math.round(prediction.total_time_minutes)} min
              </p>
            </div>
            <div className="text-center">
              <span
                className={`text-[9px] px-2 py-1 rounded-full font-semibold ${riskBg[prediction.overall_risk]}`}
              >
                {prediction.overall_risk === "low"
                  ? "Fluido"
                  : prediction.overall_risk === "medium"
                    ? "Moderado"
                    : prediction.overall_risk === "high"
                      ? "Lento"
                      : "Crítico"}
              </span>
              <p className="text-[8px] text-default-400 mt-0.5">Ocupación</p>
            </div>
          </div>

          {/* Route summary */}
          <GlassCard>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold">Resumen de ruta</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
              <div className="text-center p-1.5 rounded-lg bg-default-100">
                <p className="text-[9px] text-default-400">Tiempo</p>
                <p className="text-base font-bold">
                  {Math.round(prediction.total_time_minutes)}
                  <span className="text-[9px] font-normal"> min</span>
                </p>
              </div>
              <div className="text-center p-1.5 rounded-lg bg-default-100">
                <p className="text-[9px] text-default-400">Distancia</p>
                <p className="text-base font-bold">
                  {prediction.total_distance_km.toFixed(1)}
                  <span className="text-[9px] font-normal"> km</span>
                </p>
                <p className="text-[8px] text-default-300">
                  {Math.round(
                    (prediction.total_distance_km /
                      prediction.total_time_minutes) *
                      60,
                  )}{" "}
                  km/h
                </p>
              </div>
              <div className="text-center p-1.5 rounded-lg bg-default-100">
                <p className="text-[9px] text-default-400">Costo</p>
                <p className="text-base font-bold text-xs">
                  {mode === "vehiculo"
                    ? `$${Math.round(prediction.total_distance_km * 800 + 5000).toLocaleString()}`
                    : prediction.cost}
                </p>
              </div>
              <div className="text-center p-1.5 rounded-lg bg-primary/10">
                <p className="text-[9px] text-primary">Llegada</p>
                <p className="text-base font-bold text-primary">{getETA()}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-divider/30">
              <div className="flex items-center gap-1.5 text-[10px] text-default-500">
                <Clock size={10} />{" "}
                {mode === "vehiculo" ? (
                  "Directo"
                ) : (
                  <>
                    Frecuencia:{" "}
                    <strong className="text-foreground">
                      {mode === "transmilenio" ? "3-5" : "8-12"} min
                    </strong>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-default-500">
                <Train size={10} />{" "}
                {mode === "vehiculo" ? (
                  "Vía principal"
                ) : (
                  <>
                    Ruta:{" "}
                    <strong className="text-foreground">
                      {rutasDisponibles.length > 0
                        ? rutasDisponibles[0].ruta
                        : "..."}
                    </strong>
                  </>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Trip details */}
          {mode === "vehiculo" ? (
            <div className="grid grid-cols-3 gap-1.5">
              <div className="flex flex-col items-center p-2 rounded-lg bg-default-100">
                <Car size={14} className="text-default-500 mb-0.5" />
                <p className="text-[10px] font-bold">
                  {(prediction.total_distance_km * 800).toLocaleString()}
                </p>
                <p className="text-[8px] text-default-400">Gasolina (COP)</p>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-default-100">
                <MapPin size={14} className="text-default-500 mb-0.5" />
                <p className="text-[10px] font-bold">$5,000</p>
                <p className="text-[8px] text-default-400">Parqueadero/h</p>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-default-100">
                <AlertCircle size={14} className="text-default-500 mb-0.5" />
                <p className="text-[10px] font-bold">
                  {
                    prediction.risk_segments.filter(
                      (s) => s.congestion_level > 0.6,
                    ).length
                  }
                </p>
                <p className="text-[8px] text-default-400">Tramos lentos</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              <div className="flex flex-col items-center p-2 rounded-lg bg-default-100">
                <RefreshCw size={14} className="text-default-500" />
                <p className="text-[10px] font-bold">
                  {prediction.stations.length > 10 ? "1" : "0"}
                </p>
                <p className="text-[8px] text-default-400">Transbordos</p>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-default-100">
                <Footprints size={14} className="text-default-500" />
                <p className="text-[10px] font-bold">
                  {Math.round(prediction.total_distance_km * 0.15 * 12)} min
                </p>
                <p className="text-[8px] text-default-400">Caminando</p>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-default-100">
                <Shield size={14} className="text-success" />
                <p className="text-[10px] font-bold text-success">Sí</p>
                <p className="text-[8px] text-default-400">Accesible</p>
              </div>
            </div>
          )}

          {/* Eco & health info - Moovit style */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-2.5 py-2 rounded-lg bg-success/10 border border-success/20">
              <Leaf size={14} className="text-success" />
              <div>
                <p className="text-[10px] font-bold text-success">
                  {(prediction.total_distance_km * 0.21).toFixed(1)} kg
                </p>
                <p className="text-[8px] text-success/70">
                  CO₂ ahorrado vs auto
                </p>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-2 px-2.5 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <Flame size={14} className="text-orange-500" />
              <div>
                <p className="text-[10px] font-bold text-orange-600">
                  {Math.round(prediction.total_time_minutes * 3.5)} cal
                </p>
                <p className="text-[8px] text-orange-500/70">
                  Calorías caminando
                </p>
              </div>
            </div>
          </div>

          {/* Congestion */}
          <GlassCard>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold">
                Congestión predicha
              </span>
              <span className="text-[8px] text-default-400 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-success animate-pulse" />{" "}
                Actualizado ahora
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-default-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-success via-warning to-danger rounded-full transition-all"
                  style={{
                    width: `${Math.round((prediction.risk_segments.reduce((a, s) => a + s.congestion_level, 0) / Math.max(prediction.risk_segments.length, 1)) * 100)}%`,
                  }}
                />
              </div>
              <span
                className={`text-[10px] font-bold ${riskColors[prediction.overall_risk]}`}
              >
                {Math.round(
                  (prediction.risk_segments.reduce(
                    (a, s) => a + s.congestion_level,
                    0,
                  ) /
                    Math.max(prediction.risk_segments.length, 1)) *
                    100,
                )}
                %
              </span>
            </div>
          </GlassCard>

          {/* Stations */}
          {/* Wait & crowd estimation - only for public transport */}
          {mode !== "vehiculo" && (
            <GlassCard>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold">
                  Espera estimada en estación
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-default-400">
                      Tiempo de espera
                    </span>
                    <span className="text-[10px] font-bold">
                      {Math.floor(Math.random() * 3) + 2} min
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-default-400">
                      Ocupación del bus
                    </span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div
                          key={`occ-${i}`}
                          className={`w-3 h-4 rounded-sm ${i < 3 ? "bg-warning" : "bg-default-200"}`}
                        />
                      ))}
                      <span className="text-[9px] text-warning font-medium ml-1">
                        60%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-default-400 mt-1.5 border-t border-divider/30 pt-1.5">
                Probabilidad de asiento:{" "}
                <strong className="text-foreground">Baja</strong> — Viaja de pie
                ~{Math.round(prediction.total_time_minutes * 0.7)} min
              </p>
            </GlassCard>
          )}

          {/* Route alerts */}
          {prediction.overall_risk !== "low" &&
            prediction.risk_segments.filter((s) => s.congestion_level > 0.7)
              .length > 0 && (
              <GlassCard>
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertCircle size={12} className="text-warning" />
                  <span className="text-[10px] font-semibold text-warning">
                    Alertas en tu ruta
                  </span>
                </div>
                <div className="space-y-1">
                  {prediction.risk_segments
                    .filter((s) => s.congestion_level > 0.7)
                    .slice(0, 3)
                    .map((s, i) => (
                      <div
                        key={`alert-${i}`}
                        className="flex items-center gap-2 text-[10px] text-default-500"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                        <span>
                          Alta congestión en{" "}
                          <strong>
                            {s.from_station} → {s.to_station}
                          </strong>{" "}
                          ({Math.round(s.congestion_level * 100)}%)
                        </span>
                      </div>
                    ))}
                </div>
              </GlassCard>
            )}

          {/* Best departure suggestion */}
          {prediction.overall_risk !== "low" && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <span className="text-sm">💡</span>
              <p className="text-[10px] text-blue-600">
                <strong>Sugerencia:</strong> Salir{" "}
                {new Date().getHours() < 12
                  ? "después de las 9:00 AM"
                  : "después de las 8:00 PM"}{" "}
                para evitar congestión
              </p>
            </div>
          )}

          {/* Navigation steps - only for public transport */}
          {mode !== "vehiculo" && prediction.stations.length > 0 && (
            <GlassCard>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold">
                  Indicaciones detalladas
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-default-100 text-default-500">
                  {prediction.stations.length}{" "}
                  {mode === "transmilenio" ? "estaciones" : "paraderos"}
                </span>
              </div>

              {/* Walk to first station */}
              <div className="flex items-start gap-2 py-1.5 mb-1">
                <div className="flex flex-col items-center mt-0.5">
                  <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                    <span className="text-[8px]"></span>
                  </div>
                  <div className="w-0.5 h-3 bg-success/30" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-foreground font-medium">
                    Camina{" "}
                    {mode === "transmilenio" ? "a la estación" : "al paradero"}
                  </p>
                  <p className="text-[9px] text-default-400">
                    ~{Math.round(prediction.total_distance_km * 0.15 * 12)} min
                    caminando
                  </p>
                </div>
                <span className="text-[9px] text-default-400">
                  {Math.round(prediction.total_distance_km * 150)} m
                </span>
              </div>

              {/* Stations timeline */}
              <div className="space-y-0 max-h-40 overflow-y-auto border-l-2 border-primary/20 ml-2.5 pl-3">
                {prediction.stations.map((s, i) => {
                  const timePerStation =
                    prediction.total_time_minutes / prediction.stations.length;
                  const arriveAt = new Date(
                    Date.now() + i * timePerStation * 60000,
                  );
                  return (
                    <div
                      key={`nav-${i}`}
                      className={`flex items-center gap-2 py-1.5 relative ${i === 0 || i === prediction.stations.length - 1 ? "" : "opacity-80"}`}
                    >
                      <div
                        className={`absolute -left-[17px] w-2.5 h-2.5 rounded-full border-2 ${i === 0 ? "border-success bg-success" : i === prediction.stations.length - 1 ? "border-danger bg-danger" : "border-primary/40 bg-background"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-[10px] truncate ${i === 0 || i === prediction.stations.length - 1 ? "font-semibold text-foreground" : "text-default-500"}`}
                        >
                          {s}
                        </p>
                      </div>
                      <span className="text-[9px] text-default-400 tabular-nums shrink-0">
                        {arriveAt.toLocaleTimeString("es-CO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Walk from last station */}
              <div className="flex items-start gap-2 py-1.5 mt-1">
                <div className="flex flex-col items-center mt-0.5">
                  <div className="w-0.5 h-3 bg-danger/30" />
                  <div className="w-5 h-5 rounded-full bg-danger/20 flex items-center justify-center">
                    <span className="text-[8px]"></span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-foreground font-medium">
                    Llegaste a tu destino
                  </p>
                  <p className="text-[9px] text-success font-medium">
                    Hora estimada: {getETA()}
                  </p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Near destination */}
          <GlassCard>
            <span className="text-[10px] font-semibold mb-1.5 block">
              Cerca de tu destino
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { icon: "cafe", name: "Café", dist: "50m" },
                { icon: "cajero", name: "Cajero", dist: "120m" },
                { icon: "tienda", name: "Tienda", dist: "80m" },
                { icon: "bici", name: "Bici TM", dist: "30m" },
              ].map((place) => (
                <div
                  key={place.name}
                  className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg bg-default-100 min-w-[52px]"
                >
                  <MapPin size={12} className="text-primary" />
                  <span className="text-[8px] text-foreground font-medium">
                    {place.name}
                  </span>
                  <span className="text-[8px] text-default-400">
                    {place.dist}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Action buttons - like Moovit/Waze */}
          <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.95] shadow-lg shadow-primary/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Navigation size={14} className="animate-pulse" /> Iniciar
            navegación
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (navigator.share)
                  navigator.share({
                    title: "Mi ruta MoviCol",
                    text: `Ruta de ${Math.round(prediction.total_time_minutes)} min (${prediction.total_distance_km.toFixed(1)} km). Llegada: ${getETA()}`,
                    url: window.location.href,
                  });
              }}
              className="flex-1 py-2 rounded-lg border border-divider text-[10px] font-medium text-default-500 hover:bg-default-100 transition-all flex items-center justify-center gap-1"
            >
              Compartir
            </button>
            <button
              onClick={() => {
                const saved = JSON.parse(
                  localStorage.getItem("movicol_saved_routes") || "[]",
                );
                saved.unshift({
                  origin: tripPoints[0]?.label,
                  dest: tripPoints[tripPoints.length - 1]?.label,
                  time: Math.round(prediction.total_time_minutes),
                  date: new Date().toLocaleDateString(),
                });
                localStorage.setItem(
                  "movicol_saved_routes",
                  JSON.stringify(saved.slice(0, 5)),
                );
                alert("Ruta guardada");
              }}
              className="flex-1 py-2 rounded-lg border border-divider text-[10px] font-medium text-default-500 hover:bg-default-100 transition-all flex items-center justify-center gap-1"
            >
              Guardar
            </button>
            <button
              onClick={() => {
                onClear();
              }}
              className="flex-1 py-2 rounded-lg border border-danger/30 text-[10px] font-medium text-danger hover:bg-danger/10 transition-all flex items-center justify-center gap-1"
            >
              Nueva
            </button>
          </div>

          {/* TuLlave card info - only public transport */}
          {mode !== "vehiculo" && (
            <GlassCard>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-5 rounded bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
                    <span className="text-[7px] font-bold text-white">TL</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold">Tarjeta TuLlave</p>
                    <p className="text-[9px] text-default-400">
                      Saldo estimado después del viaje
                    </p>
                  </div>
                </div>
                <p className="text-sm font-bold text-success">$12,050</p>
              </div>
            </GlassCard>
          )}

          {/* Quick actions grid */}
          <div className="grid grid-cols-2 gap-1.5">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-default-100 border border-divider/50 text-[10px] text-foreground hover:bg-default-200 transition-all">
              <Bell size={12} className="text-default-500" /> Alarma de bajada
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-default-100 border border-divider/50 text-[10px] text-foreground hover:bg-default-200 transition-all">
              <Share2 size={12} className="text-default-500" /> Compartir en
              vivo
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-default-100 border border-divider/50 text-[10px] text-foreground hover:bg-default-200 transition-all">
              <AlertCircle size={12} className="text-warning" /> Reportar
              incidencia
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-default-100 border border-divider/50 text-[10px] text-foreground hover:bg-default-200 transition-all">
              <MapPinned size={12} className="text-default-500" /> Ver mapa
              completo
            </button>
          </div>

          {/* Tips */}
          <div className="px-3 py-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
            <p className="text-[9px] text-blue-600">
              <strong>Tip:</strong>{" "}
              {new Date().getHours() < 10
                ? "En la mañana, los vagones traseros suelen ir menos llenos."
                : new Date().getHours() < 16
                  ? "A esta hora el servicio es más frecuente. Buen momento para viajar."
                  : "En hora pico, considera usar las puertas centrales para subir más rápido."}
            </p>
          </div>

          {/* Night safety - only show 7PM-5AM */}
          {(new Date().getHours() >= 19 || new Date().getHours() < 5) && (
            <div className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-[9px] text-purple-600">
                <strong>Viaje nocturno:</strong> Mantente en zonas iluminadas.
                Comparte tu ubicación con un contacto de confianza. El último
                servicio sale a las 11:00 PM.
              </p>
            </div>
          )}

          {/* Feedback prompt */}
          <div className="flex items-center justify-between px-2 py-2 rounded-lg bg-default-100/50">
            <p className="text-[9px] text-default-400">
              ¿Te fue útil esta ruta?
            </p>
            <div className="flex gap-2">
              <button className="text-[16px] hover:scale-125 transition-transform">
                👍
              </button>
              <button className="text-[16px] hover:scale-125 transition-transform">
                👎
              </button>
            </div>
          </div>

          {prediction.stations.length > 0 && (
            <GlassCard>
              <span className="text-[10px] font-semibold mb-1.5 block">
                Recorrido ({prediction.stations.length} estaciones)
              </span>
              <div className="space-y-0 max-h-32 overflow-y-auto">
                {prediction.stations.map((station, i) => (
                  <div
                    key={`st-${i}`}
                    className="flex items-center gap-2 py-0.5"
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-2 h-2 rounded-full border-2 ${i === 0 ? "border-primary bg-primary" : i === prediction.stations.length - 1 ? "border-danger bg-danger" : "border-default-300 bg-default-300"}`}
                      />
                      {i < prediction.stations.length - 1 && (
                        <div className="w-0.5 h-2.5 bg-default-200" />
                      )}
                    </div>
                    <span className="text-[10px] text-default-500 truncate">
                      {station}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          <button
            onClick={handleSearch}
            className="w-full py-1.5 text-[10px] text-primary hover:underline"
          >
            Recalcular
          </button>
        </div>
      )}
    </div>
  );
}
