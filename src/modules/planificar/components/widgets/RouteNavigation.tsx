import { useTranslation } from "react-i18next";
import { Footprints, MapPin } from "lucide-react";
import { GlassCard } from "@shared/ui/GlassCard";
import type { RoutePrediction } from "@modules/predicciones/models";

type NavigationMode = "transmilenio" | "sitp";

interface Props {
  readonly prediction: RoutePrediction;
  readonly mode: NavigationMode;
  readonly getETA: () => string | null;
}

export function NavigationSteps({ prediction, mode, getETA }: Props) {
  const { t } = useTranslation();
  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold">
          {t("route.detailedDirections")}
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-default-100 text-default-500">
          {prediction.stations.length} {t("route.stations")}
        </span>
      </div>

      {/* Walk to station */}
      <div className="flex items-stretch gap-3 pl-1">
        <div className="flex flex-col items-center w-4 shrink-0">
          <div className="w-4 h-4 rounded-full bg-success/20 flex items-center justify-center shrink-0 mt-0.5">
            <Footprints size={10} className="text-success" />
          </div>
          <div className="w-0.5 flex-1 bg-success/30 min-h-[8px]" />
        </div>
        <div className="flex-1 pb-1.5">
          <p className="text-[10px] text-foreground font-medium">
            {mode === "transmilenio"
              ? t("route.walkToStation")
              : t("route.walkToStop")}
          </p>
          <p className="text-[9px] text-default-400">
            ~{Math.round(prediction.total_distance_km * 0.15 * 12)} min ·{" "}
            {Math.round(prediction.total_distance_km * 150)} m
          </p>
        </div>
      </div>

      {/* Stations timeline */}
      <div className="max-h-40 overflow-y-auto pl-1">
        {prediction.stations.map((s, i) => {
          const isFirst = i === 0;
          const isLast = i === prediction.stations.length - 1;
          const timePerStation =
            prediction.total_time_minutes / prediction.stations.length;
          const arriveAt = new Date(Date.now() + i * timePerStation * 60000);
          return (
            <div key={`nav-${i}-${s}`} className="flex items-stretch gap-3">
              <div className="flex flex-col items-center w-4 shrink-0">
                {isFirst && (
                  <div className="w-3 h-3 rounded-full bg-success border-2 border-success/30 shrink-0 mt-1.5" />
                )}
                {!isFirst && isLast && (
                  <div className="w-3 h-3 rounded-full bg-danger border-2 border-danger/30 shrink-0 mt-1.5" />
                )}
                {!isFirst && !isLast && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0 mt-2" />
                )}
                {!isLast && (
                  <div className="w-0.5 flex-1 bg-primary/20 min-h-[12px]" />
                )}
              </div>
              <div className="flex-1 flex items-center justify-between pb-1.5 min-w-0">
                <p
                  className={`text-[10px] truncate ${isFirst || isLast ? "font-semibold text-foreground" : "text-default-500"}`}
                >
                  {s}
                </p>
                <span className="text-[9px] text-default-400 tabular-nums shrink-0 ml-2">
                  {arriveAt.toLocaleTimeString("es-CO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Arrival */}
      <div className="flex items-stretch gap-3 pl-1 mt-0.5">
        <div className="flex flex-col items-center w-4 shrink-0">
          <div className="w-0.5 h-2 bg-danger/30" />
          <div className="w-4 h-4 rounded-full bg-danger/20 flex items-center justify-center shrink-0">
            <MapPin size={10} className="text-danger" />
          </div>
        </div>
        <div className="flex-1 pt-1">
          <p className="text-[10px] text-foreground font-medium">
            {t("route.arrivedDestination")}
          </p>
          <p className="text-[9px] text-success font-medium">
            {t("route.estimatedTime")} {getETA()}
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
  const { t } = useTranslation();
  return (
    <GlassCard>
      <span className="text-[10px] font-semibold mb-1.5 block">
        {t("route.route")} ({prediction.stations.length} {t("route.stations")})
      </span>
      <div className="max-h-32 overflow-y-auto pl-1">
        {prediction.stations.map((station, i) => {
          const isFirst = i === 0;
          const isLast = i === prediction.stations.length - 1;
          return (
            <div
              key={`st-${i}-${station}`}
              className="flex items-stretch gap-2.5"
            >
              <div className="flex flex-col items-center w-3 shrink-0">
                {isFirst ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-primary/30 shrink-0 mt-1" />
                ) : null}
                {isLast && !isFirst ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-danger border-2 border-danger/30 shrink-0 mt-1" />
                ) : null}
                {!isFirst && !isLast ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-default-300 shrink-0 mt-1.5" />
                ) : null}
                {!isLast && (
                  <div className="w-0.5 flex-1 bg-default-200 min-h-[10px]" />
                )}
              </div>
              <span
                className={`text-[10px] pb-1 ${isFirst || isLast ? "font-medium text-foreground" : "text-default-500"}`}
              >
                {station}
              </span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

export function VehicleNavSteps({
  steps,
  getETA,
}: {
  readonly steps: {
    instruction: string;
    street: string;
    distance_m: number;
    duration_s: number;
    maneuver: string;
  }[];
  readonly getETA: () => string | null;
}) {
  const { t } = useTranslation();
  const maneuverIcon = (m: string) => {
    if (m.includes("left")) return "↰";
    if (m.includes("right")) return "↱";
    if (m === "depart") return "▶";
    if (m === "arrive") return "•";
    return "↑";
  };

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold">
          {t("route.detailedDirections")}
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-default-100 text-default-500">
          {steps.length} pasos
        </span>
      </div>
      <div className="max-h-48 overflow-y-auto pl-1 space-y-0">
        {steps
          .filter((s) => s.distance_m > 0 || s.maneuver === "arrive")
          .map((s, i) => (
            <div
              key={`nav-v-${s.street}-${s.distance_m}`}
              className="flex items-stretch gap-2.5 py-1.5"
            >
              <div className="flex flex-col items-center w-5 shrink-0">
                {s.maneuver === "arrive" ? (
                  <MapPin size={11} className="text-danger" />
                ) : (
                  <span className="text-[11px]">
                    {maneuverIcon(s.maneuver)}
                  </span>
                )}
                {i < steps.length - 1 && (
                  <div className="w-0.5 flex-1 bg-primary/20 min-h-[8px]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-foreground font-medium leading-tight">
                  {s.instruction}
                </p>
                {s.distance_m > 0 && (
                  <p className="text-[9px] text-default-400">
                    {s.distance_m >= 1000
                      ? `${(s.distance_m / 1000).toFixed(1)} km`
                      : `${s.distance_m} m`}
                    {" · "}
                    {Math.ceil(s.duration_s / 60)} min
                  </p>
                )}
              </div>
            </div>
          ))}
      </div>
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-divider/30">
        <MapPin size={12} className="text-danger" />
        <div>
          <p className="text-[10px] text-foreground font-medium">
            {t("route.arrivedDestination")}
          </p>
          <p className="text-[9px] text-success font-medium">{getETA()}</p>
        </div>
      </div>
    </GlassCard>
  );
}
