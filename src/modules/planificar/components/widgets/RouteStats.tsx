import { Leaf, Flame, AlertCircle } from "lucide-react";
import { GlassCard } from "@shared/ui/GlassCard";
import type { RoutePrediction } from "@modules/predicciones/models";
import { RISK_COLORS } from "../../models/types";

export function EcoInfo({
  prediction,
}: {
  readonly prediction: RoutePrediction;
}) {
  return (
    <div className="flex gap-2">
      <div className="flex-1 flex items-center gap-2 px-2.5 py-2 rounded-lg bg-success/10 border border-success/20">
        <Leaf size={14} className="text-success" />
        <div>
          <p className="text-[10px] font-bold text-success">
            {(prediction.total_distance_km * 0.21).toFixed(1)} kg
          </p>
          <p className="text-[8px] text-success/70">
            CO\u2082 ahorrado vs auto
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center gap-2 px-2.5 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
        <Flame size={14} className="text-orange-500" />
        <div>
          <p className="text-[10px] font-bold text-orange-600">
            {Math.round(prediction.total_distance_km * 0.15 * 12 * 3.5)} cal
          </p>
          <p className="text-[8px] text-orange-500/70">Calorías caminando</p>
        </div>
      </div>
    </div>
  );
}

export function CongestionBar({
  prediction,
}: {
  readonly prediction: RoutePrediction;
}) {
  const avg =
    prediction.risk_segments.reduce((a, s) => a + s.congestion_level, 0) /
    Math.max(prediction.risk_segments.length, 1);
  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold">Congestión predicha</span>
        <span className="text-[8px] text-default-400 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-success animate-pulse" />{" "}
          Actualizado ahora
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-default-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-success via-warning to-danger rounded-full transition-all"
            style={{ width: `${Math.round(avg * 100)}%` }}
          />
        </div>
        <span
          className={`text-[10px] font-bold ${RISK_COLORS[prediction.overall_risk]}`}
        >
          {Math.round(avg * 100)}%
        </span>
      </div>
    </GlassCard>
  );
}

export function WaitEstimation({
  prediction,
}: {
  readonly prediction: RoutePrediction;
}) {
  const waitMin = prediction.estimated_wait_minutes ?? 5;
  const occupancy = Math.min(Math.round(waitMin * 8), 100);
  const filledBars = Math.round(occupancy / 20);

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold">
          Espera estimada en estación
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-default-400">
              Tiempo de espera
            </span>
            <span className="text-[10px] font-bold">
              {Math.round(waitMin)} min
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-default-400">
              Ocupación del bus
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, idx) => (
                <div
                  key={`occ-${idx}`}
                  className={`w-3 h-4 rounded-sm ${idx < filledBars ? "bg-warning" : "bg-default-200"}`}
                />
              ))}
              <span className="text-[9px] text-warning font-medium ml-1">
                {occupancy}%
              </span>
            </div>
          </div>
        </div>
      </div>
      <p className="text-[9px] text-default-400 mt-1.5 border-t border-divider/30 pt-1.5">
        Probabilidad de asiento:{" "}
        <strong className="text-foreground">
          {waitMin <= 4 ? "Alta" : waitMin <= 8 ? "Media" : "Baja"}
        </strong>{" "}
        — Viaja de pie ~{Math.round(prediction.total_time_minutes * 0.7)} min
      </p>
    </GlassCard>
  );
}

export function RouteAlerts({
  prediction,
}: {
  readonly prediction: RoutePrediction;
}) {
  const alerts = prediction.risk_segments
    .filter((s) => s.congestion_level > 0.7)
    .slice(0, 3);
  if (prediction.overall_risk === "low" || alerts.length === 0) return null;
  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-1.5">
        <AlertCircle size={12} className="text-warning" />
        <span className="text-[10px] font-semibold text-warning">
          Alertas en tu ruta
        </span>
      </div>
      <div className="space-y-1">
        {alerts.map((s) => (
          <div
            key={`rs-${s.from_station}-${s.to_station}`}
            className="flex items-center gap-2 text-[10px] text-default-500"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
            <span>
              Alta congestión en{" "}
              <strong>
                {s.from_station} → {s.to_station}
              </strong>{" "}
              ({Math.round(s.congestion_level * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
