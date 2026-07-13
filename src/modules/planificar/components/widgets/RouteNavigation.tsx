import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Footprints,
  MapPin,
  ChevronDown,
  Train,
  Bus,
  ArrowLeftRight,
} from "lucide-react";
import { GlassCard } from "@shared/ui/GlassCard";
import type { RoutePrediction } from "@modules/predicciones/models";

type TransitMode = "transmilenio" | "sitp";

interface Props {
  readonly prediction: RoutePrediction;
  readonly mode: TransitMode;
  readonly getETA: () => string | null;
}

/** A grouped transit leg (consecutive segments of same mode) */
type LegMode = "transmilenio" | "sitp" | "walk";

interface TransitLeg {
  mode: LegMode;
  stations: string[];
  durationMin: number;
}

/** Group risk_segments into legs by mode. Absorbs short walk segments into adjacent transit legs. */
function groupSegmentsIntoLegs(prediction: RoutePrediction): TransitLeg[] {
  const segments = prediction.risk_segments || [];
  if (segments.length === 0) {
    return [
      {
        mode: (prediction.mode as "transmilenio" | "sitp") || "transmilenio",
        stations: prediction.stations || [],
        durationMin: Math.round(prediction.total_time_minutes),
      },
    ];
  }

  // First pass: determine the dominant transit mode
  const dominantMode =
    segments.find((s) => s.mode && s.mode !== "walk")?.mode ||
    prediction.mode ||
    "transmilenio";

  // Second pass: treat all segments as ONE transit leg unless there's a REAL
  // mode change (e.g. transmilenio → sitp). Walk segments between same-mode
  // transit are just connections, not transfers.
  const allStations: string[] = [];
  let hasRealTransfer = false;

  for (const seg of segments) {
    if (!allStations.includes(seg.from_station)) {
      allStations.push(seg.from_station);
    }
    if (!allStations.includes(seg.to_station)) {
      allStations.push(seg.to_station);
    }
    // Detect real transfer: mode changes between two non-walk modes
    const segMode = seg.mode || dominantMode;
    if (segMode !== "walk" && segMode !== dominantMode) {
      hasRealTransfer = true;
    }
  }

  // Simple case: single transit mode (even with walk connections) → one leg
  if (!hasRealTransfer) {
    return [
      {
        mode: dominantMode as "transmilenio" | "sitp" | "walk",
        stations: allStations,
        durationMin: Math.round(prediction.total_time_minutes),
      },
    ];
  }

  // Complex case: real multimodal (TM + SITP). Group by actual transit mode changes.
  const legs: TransitLeg[] = [];
  let currentMode = "";
  let currentStations: string[] = [];
  const totalTime = prediction.total_time_minutes;
  const totalSegs = segments.length;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    let segMode = seg.mode || dominantMode;

    // Walk between transit legs: assign to the NEXT transit mode
    if (segMode === "walk") {
      const nextTransit = segments
        .slice(i + 1)
        .find((s) => s.mode && s.mode !== "walk");
      segMode = nextTransit?.mode || currentMode || dominantMode;
    }

    if (segMode !== currentMode && currentStations.length > 0) {
      legs.push({
        mode: currentMode as "transmilenio" | "sitp" | "walk",
        stations: currentStations,
        durationMin: Math.max(
          1,
          Math.round((currentStations.length / totalSegs) * totalTime),
        ),
      });
      currentStations = [];
    }
    currentMode = segMode;
    if (!currentStations.includes(seg.from_station))
      currentStations.push(seg.from_station);
    if (!currentStations.includes(seg.to_station))
      currentStations.push(seg.to_station);
  }
  if (currentStations.length > 0) {
    legs.push({
      mode: currentMode as "transmilenio" | "sitp" | "walk",
      stations: currentStations,
      durationMin: Math.max(
        1,
        Math.round((currentStations.length / totalSegs) * totalTime),
      ),
    });
  }

  return legs;
}

// ═══════════════════════════════════════════════════════════════════

function LegIcon({ mode }: { mode: string }) {
  if (mode === "transmilenio")
    return (
      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
        <Train size={14} className="text-red-500" />
      </div>
    );
  if (mode === "sitp")
    return (
      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
        <Bus size={14} className="text-blue-500" />
      </div>
    );
  return (
    <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center shrink-0">
      <Footprints size={14} className="text-default-500" />
    </div>
  );
}

function LegLabel({ mode }: { mode: string }) {
  if (mode === "transmilenio") return "TransMilenio";
  if (mode === "sitp") return "SITP";
  return "Caminando";
}

function LegAccordion({
  leg,
  startTime,
}: {
  leg: TransitLeg;
  startTime: number;
}) {
  const [open, setOpen] = useState(false);
  const isWalk = leg.mode === "walk";
  const modeBg = leg.mode === "transmilenio" ? "bg-red-500" : "bg-blue-500";

  if (isWalk || leg.stations.length <= 2) return null;

  return (
    <div className="mt-1.5 ml-11">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[10px] font-medium text-default-500 hover:text-foreground transition-colors"
      >
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
        <span>{leg.stations.length} paradas</span>
      </button>

      {open && (
        <div className="mt-1.5 max-h-40 overflow-y-auto pr-1 border-l-2 border-divider/40 pl-3 ml-1">
          {leg.stations.map((s, i) => {
            const isFirst = i === 0;
            const isLast = i === leg.stations.length - 1;
            const timePerStop = leg.durationMin / leg.stations.length;
            const arriveAt = new Date(
              Date.now() + (startTime + i * timePerStop) * 60000,
            );

            return (
              <div
                key={`leg-st-${i}-${s}`}
                className="flex items-center justify-between py-0.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isFirst ? (
                    <div
                      className={`w-2 h-2 rounded-full ${modeBg} shrink-0`}
                    />
                  ) : isLast ? (
                    <div className="w-2 h-2 rounded-full bg-danger shrink-0" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-default-300 shrink-0" />
                  )}
                  <span
                    className={`text-[10px] truncate ${
                      isFirst || isLast
                        ? "font-medium text-foreground"
                        : "text-default-500"
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
  );
}

// ═══════════════════════════════════════════════════════════════════
//  TRANSIT ROUTE CARD — Multi-leg with transfers
// ═══════════════════════════════════════════════════════════════════

export function NavigationSteps({ prediction, getETA }: Props) {
  const legs = groupSegmentsIntoLegs(prediction);
  const walkTime = Math.min(
    7,
    Math.max(3, Math.round(prediction.total_distance_km * 0.8)),
  );

  // Calculate cumulative time for each leg
  let cumulativeTime = walkTime; // start after initial walk

  return (
    <GlassCard>
      {/* ── Initial walk to first stop ── */}
      <div className="flex items-center gap-3 py-2">
        <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
          <Footprints size={14} className="text-success" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-foreground">
            Camina a la parada
          </p>
          <p className="text-[9px] text-default-400">
            Tu ubicación → {legs[0]?.stations[0] || "Parada"}
          </p>
        </div>
        <span className="text-[11px] font-bold text-default-500">
          {walkTime} min
        </span>
      </div>

      {/* ── Each transit/walk leg ── */}
      {legs.map((leg, legIdx) => {
        const legStart = cumulativeTime;
        cumulativeTime += leg.durationMin;
        const isLast = legIdx === legs.length - 1;
        const isWalk = leg.mode === "walk";
        const nextLeg = legs[legIdx + 1];

        return (
          <div key={`leg-${legIdx}`}>
            <div className="h-px bg-divider/50 mx-2" />

            <div className="py-2">
              <div className="flex items-center gap-3">
                <LegIcon mode={leg.mode} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-foreground">
                    {isWalk ? (
                      "Transbordo a pie"
                    ) : (
                      <>
                        <LegLabel mode={leg.mode} />{" "}
                        {leg.stations.length > 0 && (
                          <span className="text-default-400 font-normal">
                            — {prediction.route_code || ""}
                          </span>
                        )}
                      </>
                    )}
                  </p>
                  <p className="text-[9px] text-default-400">
                    {leg.stations[0] || ""} →{" "}
                    {leg.stations[leg.stations.length - 1] || ""}
                  </p>
                </div>
                <span className="text-[11px] font-bold text-default-500">
                  {Math.round(leg.durationMin)} min
                </span>
              </div>

              {/* Expandable stations for this leg */}
              <LegAccordion leg={leg} startTime={legStart} />
            </div>

            {/* Transfer indicator between legs */}
            {!isLast &&
              nextLeg &&
              nextLeg.mode !== "walk" &&
              leg.mode !== "walk" && (
                <>
                  <div className="h-px bg-divider/50 mx-2" />
                  <div className="flex items-center gap-3 py-1.5 px-1">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                      <ArrowLeftRight size={12} className="text-orange-500" />
                    </div>
                    <p className="text-[10px] text-orange-500 font-medium">
                      Transbordo → <LegLabel mode={nextLeg.mode} />
                    </p>
                  </div>
                </>
              )}
          </div>
        );
      })}

      <div className="h-px bg-divider/50 mx-2" />

      {/* ── Final walk to destination ── */}
      <div className="flex items-center gap-3 py-2">
        <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center shrink-0">
          <MapPin size={14} className="text-danger" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-foreground">
            Camina a tu destino
          </p>
          <p className="text-[9px] text-success font-medium">
            Llegas aprox. {getETA()}
          </p>
        </div>
        <span className="text-[11px] font-bold text-default-500">
          {walkTime} min
        </span>
      </div>
    </GlassCard>
  );
}

// ═══════════════════════════════════════════════════════════════════

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function StationsList(_: { readonly prediction: RoutePrediction }) {
  return null;
}

// ═══════════════════════════════════════════════════════════════════
//  VEHICLE NAV STEPS
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

  const filteredSteps = steps.filter(
    (s) => s.distance_m > 0 || s.maneuver === "arrive",
  );

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
                  <span className="text-[11px]">
                    {maneuverIcon(s.maneuver)}
                  </span>
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
