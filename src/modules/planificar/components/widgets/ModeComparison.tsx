import { useTranslation } from "react-i18next";
import { Train, Car, ArrowRightLeft, Footprints, Bike, Motorbike } from "lucide-react";
import { GlassCard } from "@shared/ui/GlassCard";
import type { TransportMode, RouteOption, RouteLeg } from "../../models/types";

function formatTime(min: number): string {
  const m = Math.round(min);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r === 0 ? `${h} h` : `${h} h ${r} min`;
}

interface ModeTabsProps {
  readonly mode: TransportMode;
  readonly onModeChange: (mode: TransportMode) => void;
  readonly optionsCount?: number;
}

export function ModeTabs({ mode, onModeChange, optionsCount }: ModeTabsProps) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-hide">
      {([
        { id: "publico", icon: Train, label: "Bus" },
        { id: "vehiculo", icon: Car, label: t("planner.vehicle") },
        { id: "moto", icon: Motorbike, label: "Moto" },
        { id: "bicicleta", icon: Bike, label: "Bici" },
        { id: "caminando", icon: Footprints, label: t("planner.walking") },
      ] as const).map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onModeChange(m.id as TransportMode)}
          className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border text-[9px] font-semibold transition-all whitespace-nowrap ${mode === m.id ? "border-primary bg-primary/10 text-primary" : "border-divider text-default-500 hover:border-primary/50"}`}
        >
          <m.icon size={11} />
          {m.label}
          {optionsCount && mode === m.id ? (
            <span className="text-[8px] px-1 py-0.5 rounded-full bg-primary/20">{optionsCount}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

interface RouteOptionsListProps {
  readonly options: RouteOption[];
  readonly selectedId: string | null;
  readonly onSelect: (option: RouteOption) => void;
}

const TAG_LABELS: Record<string, { label: string; color: string }> = {
  fastest: { label: "planner.fastest", color: "bg-primary text-primary-foreground" },
  cheapest: { label: "planner.cheapest", color: "bg-success text-success-foreground" },
  less_walking: { label: "planner.lessWalking", color: "bg-blue-500 text-white" },
};

function LegIcon({
  type,
  size = 12,
}: {
  readonly type: RouteLeg["type"];
  readonly size?: number;
}) {
  if (type === "walk")
    return <Footprints size={size} className="text-default-500" />;
  if (type === "transmilenio")
    return (
      <img
        src="/icons/tm-logo.svg"
        alt="TM"
        style={{ width: size + 2, height: size + 2 }}
        className="inline-block"
      />
    );
  if (type === "drive") return <Car size={size} className="text-emerald-400" />;
  if (type === "moto") return <Motorbike size={size} className="text-orange-400" />;
  if (type === "bike") return <Bike size={size} className="text-blue-400" />;
  if (type === "foot") return <Footprints size={size} className="text-purple-400" />;
  return (
    <img
      src="/icons/sitp-logo.svg"
      alt="SITP"
      style={{ width: size + 2, height: size + 2 }}
      className="inline-block bg-white rounded-full p-px"
    />
  );
}

function getLegBg(type: RouteLeg["type"]) {
  if (type === "walk") return "bg-default-200/80";
  if (type === "transmilenio") return "bg-red-500/15";
  if (type === "drive") return "bg-emerald-500/15";
  if (type === "moto") return "bg-orange-500/15";
  if (type === "bike") return "bg-blue-500/15";
  if (type === "foot") return "bg-purple-500/15";
  return "bg-blue-500/15";
}

function getDotColor(type: RouteLeg["type"]): string {
  if (type === "walk") return "bg-default-300";
  if (type === "transmilenio") return "bg-danger";
  if (type === "drive") return "bg-emerald-500";
  if (type === "moto") return "bg-orange-500";
  if (type === "bike") return "bg-blue-500";
  if (type === "foot") return "bg-purple-500";
  return "bg-blue-500";
}

function getLegLabel(type: RouteLeg["type"], line: string | undefined, t: (k: string) => string): string {
  const labels: Record<string, string> = {
    walk: t("planner.walking"),
    transmilenio: "TransMilenio",
    drive: t("planner.vehicle"),
    moto: "Moto",
    bike: "Bici",
    foot: t("planner.walking"),
    sitp: "SITP",
  };
  const base = labels[type] || type;
  return line ? `${base} — ${line}` : base;
}

export function RouteOptionsList({
  options,
  selectedId,
  onSelect,
}: RouteOptionsListProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] text-default-400 font-medium">
        {t("route.optionsFound", { count: options.length })}


      </p>
      {options.map((opt) => {
        const isSelected = selectedId === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt)}
            className={`w-full text-left p-2.5 rounded-xl border transition-all overflow-hidden ${isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-divider/50 hover:border-primary/40 bg-default-50"}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-foreground">
                  {t(opt.label)}
                </span>
                {opt.tag && TAG_LABELS[opt.tag] && (
                  <span
                    className={`text-[7px] px-1.5 py-0.5 rounded-full font-medium ${TAG_LABELS[opt.tag].color}`}
                  >
                    {t(TAG_LABELS[opt.tag].label)}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-bold text-foreground">
                {formatTime(opt.total_time_minutes)}
              </span>
            </div>

            {/* Legs timeline — Google Maps style */}
            <div className="flex items-center gap-1 mb-1.5 flex-wrap">
              {opt.legs
                .filter((l) => l.type !== "walk" || l.duration_minutes > 3)
                .map((leg, i) => (
                  <div
                    key={`leg-${opt.id}-${i}`}
                    className="flex items-center gap-1"
                  >
                    {i > 0 && (
                      <ArrowRightLeft size={8} className="text-default-300" />
                    )}
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full ${getLegBg(leg.type)}`}
                    >
                      <LegIcon type={leg.type} size={11} />
                      <span className="text-foreground">
                        {leg.type === "walk"
                          ? `${leg.duration_minutes}'`
                          : leg.line || leg.type.toUpperCase()}
                      </span>
                    </span>
                  </div>
                ))}
            </div>

            {/* Summary line */}
            <div className="flex items-center gap-3 text-[9px] text-default-400">
              <span>{opt.total_distance_km.toFixed(1)} km</span>
              <span>{opt.cost}</span>
              {opt.transfers > 0 && (
                <span className="flex items-center gap-0.5">
                  <ArrowRightLeft size={8} />
                  {opt.transfers} {t("planner.transfers")}
                </span>
              )}
              {opt.legs.some((l) => l.type === "walk") && (
                <span className="flex items-center gap-0.5">
                  <Footprints size={8} />
                  {opt.legs
                    .filter((l) => l.type === "walk")
                    .reduce((a, l) => a + l.duration_minutes, 0)}
                  ' {t("planner.walking")}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/** Detalle expandido de la opción seleccionada */
export function SelectedRouteDetail({
  option,
}: {
  readonly option: RouteOption;
}) {
  const { t } = useTranslation();
  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold">{t(option.label)}</span>
        <span className="text-[10px] font-bold text-primary">
          {formatTime(option.total_time_minutes)}
        </span>
      </div>
      <div className="space-y-0 border-l-2 border-primary/20 ml-2 pl-3">
        {option.legs.map((leg) => (
          <div
            key={`detail-${leg.from}-${leg.to}`}
            className="flex items-center gap-2 py-1.5 relative"
          >
            <div
              className={`absolute -left-[13px] w-2 h-2 rounded-full ${getDotColor(leg.type)}`}
            />
            <span
              className={`inline-flex items-center justify-center w-5 h-5 rounded-full shrink-0 ${getLegBg(leg.type)}`}
            >
              <LegIcon type={leg.type} size={11} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-foreground font-medium truncate">
                {getLegLabel(leg.type, leg.line, t)}
              </p>
              <p className="text-[9px] text-default-400 truncate">
                {leg.from} → {leg.to}
              </p>
            </div>
            <span className="text-[9px] text-default-400 shrink-0">
              {leg.duration_minutes} min
            </span>
          </div>
        ))}
      </div>
      {option.transfers > 0 && (
        <div className="mt-2 flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-warning/10 border border-warning/20">
          <ArrowRightLeft size={10} className="text-warning" />
          <span className="text-[9px] text-warning font-medium">
            {option.transfers} {t("planner.transfers")} —
            Sigue las señales de conexión
          </span>
        </div>
      )}
    </GlassCard>
  );
}
