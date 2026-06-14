import { GlassCard } from "@shared/ui/GlassCard";
import { CongestionBar } from "../ui/CongestionBar";
import { RiskBadge } from "../ui/RiskBadge";
import type { Prediction } from "@shared/types";

interface InsightCardProps {
  prediction: Prediction;
}

/**
 * WIDGET: Tarjeta completa de resultado de predicción.
 * Integra: RiskBadge + CongestionBar + texto explicativo.
 */
export function InsightCard({ prediction }: InsightCardProps) {
  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Predicción de Congestión</h3>
        <RiskBadge level={prediction.riskLabel} />
      </div>
      <CongestionBar value={prediction.congestionLevel} />
      <p className="text-xs text-default-400 mt-3 leading-relaxed">
        La estación{" "}
        <span className="text-foreground font-medium">
          {prediction.stationName}
        </span>{" "}
        tiene un nivel de congestión del{" "}
        {Math.round(prediction.congestionLevel * 100)}% en los próximos{" "}
        {prediction.horizonMinutes} min.
      </p>
      <div className="mt-2 text-[10px] text-default-300">
        Confianza: {Math.round(prediction.confidence * 100)}% | Modelo: GAT
      </div>
    </GlassCard>
  );
}
