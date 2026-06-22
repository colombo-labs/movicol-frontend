import type { LucideIcon } from "lucide-react";
import { GlassCard } from "@shared/ui/GlassCard";

interface Stop {
  nombre: string;
  lat?: number;
  lon?: number;
}

interface RutaDetailProps {
  readonly icon?: LucideIcon;
  readonly iconSrc?: string;
  readonly codigo: string;
  readonly subtitulo?: string;
  readonly origen: string;
  readonly destino: string;
  readonly extra?: string;
  readonly paradas: Stop[];
  readonly badgeLabel: string;
  readonly badgeColor: string;
  readonly onBack: () => void;
}

export function RutaDetail({
  icon: Icon,
  iconSrc,
  codigo,
  subtitulo,
  origen,
  destino,
  extra,
  paradas,
  badgeLabel,
  badgeColor,
  onBack,
}: RutaDetailProps) {
  return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-xs text-primary hover:underline">
        ← Volver
      </button>

      <GlassCard>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {iconSrc && <img src={iconSrc} alt="" className="w-5 h-5" />}
            {!iconSrc && Icon && <Icon size={16} className="text-primary" />}
            <span className="text-lg font-bold">{codigo}</span>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badgeColor}`}
          >
            {badgeLabel}
          </span>
        </div>
        {subtitulo && (
          <p className="text-xs text-default-500 mb-1">{subtitulo}</p>
        )}
        <p className="text-[11px] text-default-600">
          {origen} → {destino}
        </p>
        {extra && <p className="text-[10px] text-default-400 mt-1">{extra}</p>}
      </GlassCard>

      <GlassCard>
        <span className="text-xs font-semibold mb-2 block">
          Paradas del recorrido ({paradas.length})
        </span>
        <div className="max-h-[calc(100vh-350px)] overflow-y-auto pl-1">
          {paradas.map((p, i) => {
            const isFirst = i === 0;
            const isLast = i === paradas.length - 1;
            return (
              <div
                key={`stop-${p.nombre || i}`}
                className="flex items-stretch gap-3"
              >
                {/* Timeline column */}
                <div className="flex flex-col items-center w-4 shrink-0">
                  {/* Dot */}
                  {isFirst && (
                    <div className="w-3.5 h-3.5 rounded-full bg-success border-2 border-success/30 shrink-0 mt-2" />
                  )}
                  {!isFirst && isLast && (
                    <div className="w-3.5 h-3.5 rounded-full bg-danger border-2 border-danger/30 shrink-0 mt-2" />
                  )}
                  {!isFirst && !isLast && (
                    <div className="w-2 h-2 rounded-full bg-default-400 shrink-0 mt-2.5" />
                  )}
                  {/* Connector line */}
                  {!isLast && (
                    <div className="w-0.5 flex-1 bg-default-200 min-h-[16px]" />
                  )}
                </div>
                {/* Content */}
                <div className={`flex-1 pb-2 pt-1`}>
                  <p
                    className={`text-[11px] leading-tight ${isFirst || isLast ? "font-semibold text-foreground" : "text-default-500"}`}
                  >
                    {p.nombre || `Parada ${i + 1}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
