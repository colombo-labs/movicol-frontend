import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Footprints, MapPin, ChevronDown, Train, Bus } from "lucide-react";
import { GlassCard } from "@shared/ui/GlassCard";
import type { RoutePrediction } from "@modules/predicciones/models";

type TransitMode = "transmilenio" | "sitp";

interface Props {
  readonly prediction: RoutePrediction;
  readonly mode: TransitMode;
  readonly getETA: () => string | null;
}

// ═══════════════════════════════════════════════════════════════════
//  TRANSIT ROUTE CARD — Unified accordion (legs + stations)
// ═══════════════════════════════════════════════════════════════════

export function NavigationSteps({ prediction, mode, getETA }: Props) {
  const { t } = useTranslation();
  const [stationsOpen, setStationsOpen] = useState(false);

  const stations = prediction.stations || [];
  const walkTime = Math.round(prediction.total_distance_km * 0.15 * 12);
  const walkDist = Math.round(prediction.total_distance_km * 150);
  const isTM = mode === "transmilenio";
  const modeColor = isTM ? "text-red-500" : "text-blue-500";
  const modeBg = isTM ? "bg-red-500" : "bg-blue-500";
  const modeBgLight = isTM ? "bg-red-500/10" : "bg-blue-500/10";
  const ModeIcon = isTM ? Train : Bus;
  const modeLabel = isTM ? "TransMilenio" : "SITP";
  const routeCode = prediction.route_code || modeLabel;

  return (
    <GlassCard>
      {/* ── Leg 1: Walk to station ── */}
      <div className="flex items-center gap-3 py-2">
        <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
          <Footprints size={14} className="text-success" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-foreground">
            {isTM ? t("route.walkToStation") : t("route.walkToStop")}
          </p>
          <p className="text-[9px] text-default-400">
            ~{walkTime} min · {walkDist} m
          </p>
        </div>
        <span className="text-[11px] font-bold text-default-500">{walkTime} min</span>
      </div>

      <div className="h-px bg-divider/50 mx-2" />

      {/* ── Leg 2: Transit (with accordion for stations) ── */}
      <div className="py-2">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${modeBgLight} flex items-center justify-center shrink-0`}>
            <ModeIcon size={14} className={modeColor} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-foreground">
              {routeCode}
            </p>
            <p className="text-[9px] text-default-400">
              {stations[0] || "Origen"} → {stations[stations.length - 1] || "Destino"}
            </p>
          </div>
          <span className="text-[11px] font-bold text-default-500">
            {Math.round(prediction.total_time_minutes - walkTime * 2)} min
          </span>
        </div>

        {/* Accordion: Stations */}
        {stations.length > 0 && (
          <div className="mt-2 ml-11">
            <button
              onClick={() => setStationsOpen(!stationsOpen)}
              className="flex items-center gap-1.5 text-[10px] font-medium text-default-500 hover:text-foreground transition-colors"
            >
              <ChevronDown
                size={12}
                className={`transition-transform duration-200 ${stationsOpen ? "rotate-180" : ""}`}
              />
              <span>{stations.length} estaciones</span>
              {!stationsOpen && (
                <span className="text-[9px] text-default-400 ml-1">
                  (ver recorrido)
                </span>
              )}
            </button>

            {stationsOpen && (
              <div className="mt-2 max-h-52 overflow-y-auto pr-1 border-l-2 border-divider/40 pl-3 ml-1">
                {stations.map((s, i) => {
                  const isFirst = i === 0;
                  const isLast = i === stations.length - 1;
                  const timePerStation = prediction.total_time_minutes / stations.length;
                  const arriveAt = new Date(Date.now() + (walkTime + i * timePerStation) * 60000);

                  return (
                    <div key={`st-${i}-${s}`} className="flex items-center justify-between py-0.5">
                      <div className="flex items-center gap-2 min-w-0">
                        {isFirst ? (
                          <div className={`w-2 h-2 rounded-full ${modeBg} shrink-0`} />
                        ) : isLast ? (
                          <div className="w-2 h-2 rounded-full bg-danger shrink-0" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-default-300 shrink-0" />
                        )}
                        <span
                          className={`text-[10px] truncate ${
                            isFirst || isLast ? "font-medium text-foreground" : "text-default-500"
                          }`}
                        >
                          {s}
                        </span>
                      </div>
                      <span className="text-[9px] text-default-400 tabular-nums shrink-0 ml-2">
                        {arriveAt.toLocaleTimeString("es-CO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="h-px bg-divider/50 mx-2" />

      {/* ── Leg 3: Walk to destination ── */}
      <div className="flex items-center gap-3 py-2">
        <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center shrink-0">
          <MapPin size={14} className="text-danger" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-foreground">Camina a tu destino</p>
          <p className="text-[9px] text-success font-medium">
            Llegas aprox. {getETA()}
          </p>
        </div>
        <span className="text-[11px] font-bold text-default-500">{walkTime} min</span>
      </div>
    </GlassCard>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  STATIONS LIST — kept for backwards compat but now empty
//  (consolidated into NavigationSteps above)
// ═══════════════════════════════════════════════════════════════════

export function StationsList(_props: {
  readonly prediction: RoutePrediction;
}) {
  // Consolidated into NavigationSteps — render nothing
  return null;
}

// ═══════════════════════════════════════════════════════════════════
//  VEHICLE NAV STEPS — Accordion for turn-by-turn
// ═══════════════════════════════════════════════════════════════════

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
  const [open, setOpen] = useState(false);

  const maneuverIcon = (m: string) => {
    if (m.includes("left")) return "↰";
    if (m.includes("right")) return "↱";
    if (m === "depart") return "▶";
    if (m === "arrive") return "•";
    return "↑";
  };

  const filteredSteps = steps.filter((s) => s.distance_m > 0 || s.maneuver === "arrive");

  return (
    <GlassCard>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between"
      >
        <span className="text-[10px] font-semibold">
          {t("route.detailedDirections")}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-default-100 text-default-500">
            {filteredSteps.length} pasos
          </span>
          <ChevronDown
            size={12}
            className={`text-default-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="mt-2 max-h-48 overflow-y-auto pl-1 space-y-0">
          {filteredSteps.map((s, i) => (
            <div
              key={`nav-v-${i}-${s.street}`}
              className="flex items-stretch gap-2.5 py-1.5"
            >
              <div className="flex flex-col items-center w-5 shrink-0">
                {s.maneuver === "arrive" ? (
                  <MapPin size={11} className="text-danger" />
                ) : (
                  <span className="text-[11px]">{maneuverIcon(s.maneuver)}</span>
                )}
                {i < filteredSteps.length - 1 && (
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
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-divider/30">
            <MapPin size={12} className="text-danger" />
            <div>
              <p className="text-[10px] text-foreground font-medium">
                {t("route.arrivedDestination")}
              </p>
              <p className="text-[9px] text-success font-medium">{getETA()}</p>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
