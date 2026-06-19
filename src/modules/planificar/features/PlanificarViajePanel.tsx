import { useState, useEffect } from "react";
import { Navigation, Clock, AlertCircle } from "lucide-react";
import type {
  PlanificarProps,
  TransportMode,
  DepartureType,
} from "../models/types";
import { useRutasCercanas } from "../hooks/useRutasCercanas";
import { useAddressSearch } from "../hooks/useAddressSearch";
import { estimateTrip } from "../api/planificarApi";
import { SearchBar } from "../components/ui/SearchBar";
import { TripPointsList } from "../components/ui/TripPointsList";
import { EmptyState } from "../components/ui/EmptyState";
import {
  ModeComparison,
  RouteAlternatives,
} from "../components/widgets/ModeComparison";
import {
  LiveTimeBanner,
  RouteSummaryCard,
  TripDetails,
} from "../components/widgets/RouteSummary";
import {
  EcoInfo,
  CongestionBar,
  WaitEstimation,
  RouteAlerts,
} from "../components/widgets/RouteStats";
import {
  ActionButtons,
  QuickActions,
  NearDestination,
  TravelTips,
} from "../components/widgets/RouteActions";
import {
  NavigationSteps,
  StationsList,
} from "../components/widgets/RouteNavigation";

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
}: PlanificarProps) {
  const [mode, setMode] = useState<TransportMode>("transmilenio");
  const [departureType, setDepartureType] = useState<DepartureType>("ahora");
  const [departureTime, setDepartureTime] = useState("");

  const origin = tripPoints.length > 0 ? tripPoints[0] : null;
  const destination =
    tripPoints.length > 1 ? tripPoints[tripPoints.length - 1] : null;

  const rutasDisponibles = useRutasCercanas(origin, destination, mode);
  const {
    searchQuery,
    searchResults,
    searching,
    handleSearch: onSearchAddress,
    clearSearch,
  } = useAddressSearch();

  const handlePredict = () => {
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (tripPoints.length >= 2 && !prediction && !isLoading) {
      const timer = setTimeout(() => handlePredict(), 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripPoints]);

  const getETA = () => {
    if (!prediction) return null;
    const eta = new Date(Date.now() + prediction.total_time_minutes * 60000);
    return eta.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fill estimated values if backend returns 0
  if (prediction?.total_time_minutes === 0 && origin && destination) {
    const est = estimateTrip(origin, destination, mode);
    prediction.total_time_minutes = est.time;
    prediction.total_distance_km = est.distance;
    prediction.cost = est.cost;
  }

  return (
    <div className="space-y-3">
      <SearchBar
        query={searchQuery}
        results={searchResults}
        searching={searching}
        onSearch={onSearchAddress}
        onSelect={(r) => {
          onAddPoint?.(r.lat, r.lng, r.label);
          clearSearch();
        }}
      />

      {!prediction && (
        <EmptyState
          tripPoints={tripPoints}
          onUseMyLocation={onUseMyLocation}
          onAddPoint={onAddPoint}
        />
      )}

      {tripPoints.length > 0 && (
        <TripPointsList
          tripPoints={tripPoints}
          onRemovePoint={onRemovePoint}
          onUseMyLocation={onUseMyLocation}
          onSwapPoints={onSwapPoints}
          onClear={onClear}
        />
      )}

      {/* Departure time */}
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

      {/* Search / Recalculate buttons */}
      {!prediction && !isLoading && tripPoints.length >= 2 && (
        <button
          onClick={handlePredict}
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]"
        >
          <Navigation size={14} /> Buscar ruta
        </button>
      )}
      {prediction && !isLoading && (
        <button
          onClick={handlePredict}
          className="w-full py-1.5 rounded-lg border border-primary/30 text-primary text-[10px] font-medium flex items-center justify-center gap-1.5 hover:bg-primary/5 transition-all"
        >
          <Navigation size={10} /> Recalcular ruta
        </button>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-5 gap-2">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-primary/20" />
            <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          </div>
          <span className="text-xs text-primary font-medium">
            Calculando mejor ruta...
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-danger/10 border border-danger/20">
          <AlertCircle size={12} className="text-danger mt-0.5 shrink-0" />
          <p className="text-[10px] text-danger">{error}</p>
        </div>
      )}

      {/* Rush hour */}
      {prediction &&
        (() => {
          const hour = new Date().getHours();
          if (!((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 20)))
            return null;
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
          <ModeComparison
            prediction={prediction}
            mode={mode}
            onModeChange={handleModeChange}
          />
          <RouteAlternatives prediction={prediction} />
          <LiveTimeBanner prediction={prediction} mode={mode} getETA={getETA} />
          <RouteSummaryCard
            prediction={prediction}
            mode={mode}
            rutasDisponibles={rutasDisponibles}
            getETA={getETA}
          />
          <TripDetails prediction={prediction} mode={mode} />
          <EcoInfo prediction={prediction} />
          <CongestionBar prediction={prediction} />
          {mode !== "vehiculo" && <WaitEstimation prediction={prediction} />}
          <RouteAlerts prediction={prediction} />
          {mode !== "vehiculo" && prediction.stations.length > 0 && (
            <NavigationSteps
              prediction={prediction}
              mode={mode}
              getETA={getETA}
            />
          )}
          <NearDestination />
          <ActionButtons
            prediction={prediction}
            tripPoints={tripPoints}
            onClear={onClear}
          />
          <QuickActions />
          <TravelTips mode={mode} />
          {prediction.stations.length > 0 && (
            <StationsList prediction={prediction} />
          )}
          <button
            onClick={handlePredict}
            className="w-full py-1.5 text-[10px] text-primary hover:underline"
          >
            Recalcular
          </button>
        </div>
      )}
    </div>
  );
}
