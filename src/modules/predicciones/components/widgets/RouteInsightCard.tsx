import { GlassCard } from "@shared/ui/GlassCard";
import { RiskBadge } from "../ui/RiskBadge";
import type { RoutePrediction } from "../../models";

interface RouteInsightCardProps {
  prediction: RoutePrediction;
}

export function RouteInsightCard({ prediction }: RouteInsightCardProps) {
  const criticalSegments = prediction.risk_segments.filter(
    (s) => s.risk_label === "high" || s.risk_label === "critical",
  );

  return (
    <GlassCard className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Resultado de Ruta</h3>
        <RiskBadge level={prediction.overall_risk} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white/5 rounded-lg p-2">
          <p className="text-lg font-bold">{prediction.total_time_minutes}</p>
          <p className="text-[10px] text-default-400">min</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <p className="text-lg font-bold">{prediction.total_distance_km}</p>
          <p className="text-[10px] text-default-400">km</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <p className="text-lg font-bold">{prediction.stations.length}</p>
          <p className="text-[10px] text-default-400">estaciones</p>
        </div>
      </div>

      {/* Explanation */}
      <p className="text-xs text-default-400 leading-relaxed">
        {prediction.explanation}
      </p>

      {/* Critical segments */}
      {criticalSegments.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-semibold text-warning">
            Tramos críticos:
          </p>
          {criticalSegments.map((s, i) => (
            <div
              key={`rs-${i}`}
              className="flex items-center justify-between text-[11px] bg-white/5 rounded px-2 py-1"
            >
              <span>
                {s.from_station} → {s.to_station}
              </span>
              <span className="font-mono text-warning">
                {Math.round(s.congestion_level * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Stations list */}
      <details className="text-[11px]">
        <summary className="cursor-pointer text-default-400 hover:text-foreground">
          Ver {prediction.stations.length} estaciones
        </summary>
        <div className="mt-1 flex flex-wrap gap-1">
          {prediction.stations.map((s) => (
            <span key={s} className="bg-white/5 rounded px-1.5 py-0.5">
              {s}
            </span>
          ))}
        </div>
      </details>
    </GlassCard>
  );
}
