import { GlassCard } from "@shared/ui/GlassCard";
import type { RoutePrediction } from "@modules/predicciones/models";
import type { TransportMode } from "../../models/types";

interface Props {
  readonly prediction: RoutePrediction;
  readonly mode: TransportMode;
  readonly getETA: () => string | null;
}

function getStationDot(i: number, total: number) {
  if (i === 0) return "border-success bg-success";
  if (i === total - 1) return "border-danger bg-danger";
  return "border-primary/40 bg-background";
}

export function NavigationSteps({ prediction, mode, getETA }: Props) {
  return (
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

      <div className="flex items-start gap-2 py-1.5 mb-1">
        <div className="flex flex-col items-center mt-0.5">
          <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
            <span className="text-[8px]">🚶</span>
          </div>
          <div className="w-0.5 h-3 bg-success/30" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] text-foreground font-medium">
            Camina {mode === "transmilenio" ? "a la estación" : "al paradero"}
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

      <div className="space-y-0 max-h-40 overflow-y-auto border-l-2 border-primary/20 ml-2.5 pl-3">
        {prediction.stations.map((s, i) => {
          const timePerStation =
            prediction.total_time_minutes / prediction.stations.length;
          const arriveAt = new Date(Date.now() + i * timePerStation * 60000);
          const isTerminal = i === 0 || i === prediction.stations.length - 1;
          return (
            <div
              key={`nav-${s}`}
              className={`flex items-center gap-2 py-1.5 relative ${isTerminal ? "" : "opacity-80"}`}
            >
              <div
                className={`absolute -left-[17px] w-2.5 h-2.5 rounded-full border-2 ${getStationDot(i, prediction.stations.length)}`}
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-[10px] truncate ${isTerminal ? "font-semibold text-foreground" : "text-default-500"}`}
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

      <div className="flex items-start gap-2 py-1.5 mt-1">
        <div className="flex flex-col items-center mt-0.5">
          <div className="w-0.5 h-3 bg-danger/30" />
          <div className="w-5 h-5 rounded-full bg-danger/20 flex items-center justify-center">
            <span className="text-[8px]">📍</span>
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
  );
}

export function StationsList({
  prediction,
}: {
  readonly prediction: RoutePrediction;
}) {
  function getListDot(i: number, total: number) {
    if (i === 0) return "border-primary bg-primary";
    if (i === total - 1) return "border-danger bg-danger";
    return "border-default-300 bg-default-300";
  }

  return (
    <GlassCard>
      <span className="text-[10px] font-semibold mb-1.5 block">
        Recorrido ({prediction.stations.length} estaciones)
      </span>
      <div className="space-y-0 max-h-32 overflow-y-auto">
        {prediction.stations.map((station, i) => (
          <div key={`st-${station}`} className="flex items-center gap-2 py-0.5">
            <div className="flex flex-col items-center">
              <div
                className={`w-2 h-2 rounded-full border-2 ${getListDot(i, prediction.stations.length)}`}
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
  );
}
