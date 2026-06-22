import { useState, useEffect, useRef } from "react";
import { Navigation, Clock, AlertCircle } from "lucide-react";
import { useWeather } from "@shared/hooks/useWeather";
import { RouteSkeleton } from "@shared/ui/Skeleton";
import type {
  PlanificarProps,
  TransportMode,
  DepartureType,
  RouteOption,
} from "../models/types";
import { TripPointsList } from "../components/ui/TripPointsList";
import {
  ModeTabs,
  RouteOptionsList,
  SelectedRouteDetail,
} from "../components/widgets/ModeComparison";
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
  VehicleNavSteps,
} from "../components/widgets/RouteNavigation";

export function PlanificarViajePanel({
  onPredictMulti,
  options,
  isLoading,
  error,
  tripPoints,
  onRemovePoint,
  onUseMyLocation,
  onSwapPoints,
  onClear,
  onAddPoint,
  onUpdatePoint,
  onRequestAddPoint,
  onSelectRoute,
  selectedRouteIdx,
}: PlanificarProps) {
  const [mode, setMode] = useState<TransportMode>("publico");
  const temp = useWeather();
  const [departureType, setDepartureType] = useState<DepartureType>("ahora");
  const [departureTime, setDepartureTime] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // Sync from map selection
  useEffect(() => {
    if (selectedRouteIdx !== undefined && options?.[selectedRouteIdx]) {
      setSelectedOptionId(options[selectedRouteIdx].id);
    }
  }, [selectedRouteIdx]);

  const origin = tripPoints.length > 0 ? tripPoints[0] : null;
  const destination =
    tripPoints.length > 1 ? tripPoints[tripPoints.length - 1] : null;

  const selectedOption =
    options?.find((o) => o.id === selectedOptionId) ?? null;

  // Auto-calcular cuando cambian los puntos (origen + destino mínimo)
  const prevPointsRef = useRef("");
  useEffect(() => {
    if (!origin || !destination) return;
    const key = `${origin.lat},${origin.lng}-${destination.lat},${destination.lng}-${mode}`;
    if (key === prevPointsRef.current) return;
    prevPointsRef.current = key;
    const dt =
      departureType === "programar" && departureTime
        ? new Date(`2026-06-12T${departureTime}:00`).toISOString()
        : new Date().toISOString();
    setSelectedOptionId(null);
    onPredictMulti?.(origin, destination, mode, dt);
  }, [tripPoints, mode]);

  const handleSearch = () => {
    if (!origin || !destination) return;
    const dt =
      departureType === "programar" && departureTime
        ? new Date(`2026-06-12T${departureTime}:00`).toISOString()
        : new Date().toISOString();
    setSelectedOptionId(null);
    onPredictMulti?.(origin, destination, mode, dt);
  };

  const handleModeChange = (newMode: TransportMode) => {
    setMode(newMode);
    setSelectedOptionId(null);
    if (origin && destination) {
      const dt =
        departureType === "programar" && departureTime
          ? new Date(`2026-06-12T${departureTime}:00`).toISOString()
          : new Date().toISOString();
      onPredictMulti?.(origin, destination, newMode, dt);
    }
  };

  const handleSelectOption = (opt: RouteOption) => {
    setSelectedOptionId(opt.id);
    const idx = options?.findIndex((o) => o.id === opt.id) ?? 0;
    onSelectRoute?.(idx);
  };

  const getETA = () => {
    if (!selectedOption) return null;
    const eta = new Date(
      Date.now() + selectedOption.total_time_minutes * 60000,
    );
    return eta.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-3">
      <TripPointsList
        tripPoints={tripPoints}
        mode={mode}
        onRemovePoint={onRemovePoint}
        onUseMyLocation={onUseMyLocation}
        onSwapPoints={onSwapPoints}
        onClear={onClear}
        onAddPoint={onAddPoint}
        onUpdatePoint={onUpdatePoint}
        onRequestAddPoint={onRequestAddPoint}
      />

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

      {/* Recalculate button */}
      {tripPoints.length >= 2 && !isLoading && (
        <button
          onClick={handleSearch}
          className="w-full py-1.5 rounded-lg border border-primary/30 text-primary text-[10px] font-medium flex items-center justify-center gap-1.5 hover:bg-primary/5 transition-all"
        >
          <Navigation size={10} /> Recalcular
        </button>
      )}

      {/* Loading */}
      {isLoading && <RouteSkeleton />}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-danger/10 border border-danger/20">
          <AlertCircle size={12} className="text-danger mt-0.5 shrink-0" />
          <p className="text-[10px] text-danger">{error}</p>
        </div>
      )}

      {/* Rush hour */}
      {options &&
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
      {options && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-default-100/50 text-[9px] text-default-400">
            <span>{temp ?? "..."}°C Bogotá</span>
            <span>Datos en vivo</span>
            <span>
              {new Date().toLocaleTimeString("es-CO", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <ModeTabs
            mode={mode}
            onModeChange={handleModeChange}
            optionsCount={options.length}
          />

          <RouteOptionsList
            options={options}
            selectedId={selectedOptionId}
            onSelect={handleSelectOption}
          />

          {/* Detalle de la opción seleccionada */}
          {selectedOption && (
            <>
              <SelectedRouteDetail option={selectedOption} />
              <EcoInfo prediction={selectedOption.prediction} />
              <CongestionBar prediction={selectedOption.prediction} />
              {mode === "publico" && (
                <WaitEstimation prediction={selectedOption.prediction} />
              )}
              <RouteAlerts prediction={selectedOption.prediction} />
              {mode === "publico" &&
                selectedOption.prediction.stations.length > 0 && (
                  <NavigationSteps
                    prediction={selectedOption.prediction}
                    mode={
                      selectedOption.prediction.mode === "sitp"
                        ? "sitp"
                        : "transmilenio"
                    }
                    getETA={getETA}
                  />
                )}
              {mode === "vehiculo" &&
                selectedOption.prediction.navigation_steps &&
                selectedOption.prediction.navigation_steps.length > 0 && (
                  <VehicleNavSteps
                    steps={selectedOption.prediction.navigation_steps}
                    getETA={getETA}
                  />
                )}
              <NearDestination
                destLat={destination?.lat}
                destLng={destination?.lng}
              />
              <ActionButtons
                prediction={selectedOption.prediction}
                tripPoints={tripPoints}
                onClear={onClear}
              />
              <QuickActions />
              <TravelTips
                mode={mode === "publico" ? "transmilenio" : "vehiculo"}
              />
              {selectedOption.prediction.stations.length > 0 && (
                <StationsList prediction={selectedOption.prediction} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
