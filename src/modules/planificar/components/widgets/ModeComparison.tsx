import { Train, Car, ArrowRightLeft, Footprints } from "lucide-react";
import { GlassCard } from "@shared/ui/GlassCard";
import type { TransportMode, RouteOption, RouteLeg } from "../../models/types";

interface ModeTabsProps {
  readonly mode: TransportMode;
  readonly onModeChange: (mode: TransportMode) => void;
  readonly optionsCount?: number;
}

export function ModeTabs({ mode, onModeChange, optionsCount }: ModeTabsProps) {
  return (
    <div className="flex gap-1.5">
      <button
        type="button"
        onClick={() => onModeChange("publico")}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-[11px] font-semibold transition-all ${mode === "publico" ? "border-primary bg-primary/10 text-primary" : "border-divider text-default-500 hover:border-primary/50"}`}
      >
        <Train size={14} />
        Transporte público
        {optionsCount && mode === "publico" ? (
          <span className="text-[8px] px-1 py-0.5 rounded-full bg-primary/20">{optionsCount}</span>
        ) : null}
      </button>
      <button
        type="button"
        onClick={() => onModeChange("vehiculo")}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-[11px] font-semibold transition-all ${mode === "vehiculo" ? "border-primary bg-primary/10 text-primary" : "border-divider text-default-500 hover:border-primary/50"}`}
      >
        <Car size={14} />
        Vehículo
      </button>
    </div>
  );
}

interface RouteOptionsListProps {
  readonly options: RouteOption[];
  readonly selectedId: string | null;
  readonly onSelect: (option: RouteOption) => void;
}

const TAG_LABELS: Record<string, { label: string; color: string }> = {
  fastest: { label: "Más rápida", color: "bg-primary text-primary-foreground" },
  cheapest: { label: "Económica", color: "bg-success text-success-foreground" },
  less_walking: { label: "Menos caminata", color: "bg-blue-500 text-white" },
};

function LegIcon({ type, size = 12 }: { type: RouteLeg["type"]; size?: number }) {
  if (type === "walk") return <Footprints size={size} className="text-default-500" />;
  if (type === "transmilenio") return <img src="/icons/tm-logo.svg" alt="TM" style={{ width: size + 2, height: size + 2 }} className="inline-block" />;
  if (type === "drive") return <Car size={size} className="text-emerald-400" />;
  return <img src="/icons/sitp-logo.svg" alt="SITP" style={{ width: size + 2, height: size + 2 }} className="inline-block bg-white rounded-full p-px" />;
}

function getLegBg(type: RouteLeg["type"]) {
  if (type === "walk") return "bg-default-200/80";
  if (type === "transmilenio") return "bg-red-500/15";
  if (type === "drive") return "bg-emerald-500/15";
  return "bg-blue-500/15";
}

export function RouteOptionsList({ options, selectedId, onSelect }: RouteOptionsListProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] text-default-400 font-medium">
        {options.length} opción{options.length > 1 ? "es" : ""} encontrada{options.length > 1 ? "s" : ""}
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
                <span className="text-[11px] font-semibold text-foreground">{opt.label}</span>
                {opt.tag && TAG_LABELS[opt.tag] && (
                  <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-medium ${TAG_LABELS[opt.tag].color}`}>
                    {TAG_LABELS[opt.tag].label}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-bold text-foreground">{Math.round(opt.total_time_minutes)} min</span>
            </div>

            {/* Legs timeline — Google Maps style */}
            <div className="flex items-center gap-1 mb-1.5 flex-wrap">
              {opt.legs.filter(l => l.type !== "walk" || l.duration_minutes > 3).map((leg, i) => (
                <div key={`leg-${opt.id}-${i}`} className="flex items-center gap-1">
                  {i > 0 && <ArrowRightLeft size={8} className="text-default-300" />}
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full ${getLegBg(leg.type)}`}>
                    <LegIcon type={leg.type} size={11} />
                    <span className="text-foreground">
                      {leg.type === "walk" ? `${leg.duration_minutes}'` : leg.line || leg.type.toUpperCase()}
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
                  {opt.transfers} transbordo{opt.transfers > 1 ? "s" : ""}
                </span>
              )}
              {opt.legs.filter(l => l.type === "walk").length > 0 && (
                <span className="flex items-center gap-0.5">
                  <Footprints size={8} />
                  {opt.legs.filter(l => l.type === "walk").reduce((a, l) => a + l.duration_minutes, 0)}' caminando
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
export function SelectedRouteDetail({ option }: { readonly option: RouteOption }) {
  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold">{option.label}</span>
        <span className="text-[10px] font-bold text-primary">{Math.round(option.total_time_minutes)} min</span>
      </div>
      <div className="space-y-0 border-l-2 border-primary/20 ml-2 pl-3">
        {option.legs.map((leg, i) => (
          <div key={`detail-${i}`} className="flex items-center gap-2 py-1.5 relative">
            <div className={`absolute -left-[13px] w-2 h-2 rounded-full ${leg.type === "walk" ? "bg-default-300" : leg.type === "transmilenio" ? "bg-danger" : leg.type === "drive" ? "bg-emerald-500" : "bg-blue-500"}`} />
            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full shrink-0 ${getLegBg(leg.type)}`}>
              <LegIcon type={leg.type} size={11} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-foreground font-medium truncate">
                {leg.type === "walk" ? "Caminar" : leg.type === "transmilenio" ? "TransMilenio" : leg.type === "drive" ? "Vehículo" : "SITP"}{leg.line ? ` — ${leg.line}` : ""}
              </p>
              <p className="text-[9px] text-default-400 truncate">
                {leg.from} → {leg.to}
              </p>
            </div>
            <span className="text-[9px] text-default-400 shrink-0">{leg.duration_minutes} min</span>
          </div>
        ))}
      </div>
      {option.transfers > 0 && (
        <div className="mt-2 flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-warning/10 border border-warning/20">
          <ArrowRightLeft size={10} className="text-warning" />
          <span className="text-[9px] text-warning font-medium">
            {option.transfers} transbordo{option.transfers > 1 ? "s" : ""} — Sigue las señales de conexión
          </span>
        </div>
      )}
    </GlassCard>
  );
}
