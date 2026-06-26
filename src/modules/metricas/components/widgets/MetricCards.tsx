import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GlassCard } from "@shared/ui/GlassCard";

export function AlertsCard({
  critical,
  high,
}: {
  readonly critical: number;
  readonly high: number;
}) {
  const { t } = useTranslation();
  if (critical === 0 && high === 0) return null;
  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={14} className="text-warning" />
        <span className="text-xs font-semibold">
          {t("metrics.systemStatus")}
        </span>
      </div>
      <div className="space-y-1">
        {critical > 0 && (
          <p className="text-[10px] text-danger">
            {critical} {t("metrics.criticalStations")}
          </p>
        )}
        {high > 0 && (
          <p className="text-[10px] text-orange-500">
            {high} {t("metrics.highCongestion")}
          </p>
        )}
      </div>
    </GlassCard>
  );
}

export function LiveCounter() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-default-100/50 text-[9px] text-default-400">
      <span className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />{" "}
        {t("metrics.liveData")}
      </span>
      <span>
        {new Date().toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </span>
    </div>
  );
}

export function PassengersCard({
  avgCongestion,
}: {
  readonly avgCongestion: number;
}) {
  const { t } = useTranslation();
  const hour = new Date().getHours();
  let base = 800000;
  if (hour >= 6 && hour <= 9) base = 1800000;
  else if (hour >= 17 && hour <= 20) base = 1600000;

  return (
    <GlassCard>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-default-400 uppercase tracking-wider">
            {t("metrics.passengersNow")}
          </p>
          <p className="text-2xl font-bold">{base.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-default-400">
            {t("metrics.capacityUsed")}
          </p>
          <p className="text-lg font-bold text-warning">
            {Math.round(avgCongestion * 100 + 15)}%
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

function getBarColor(isNow: boolean, h: number) {
  if (isNow) return "bg-primary";
  if (h > 70) return "bg-danger/50";
  if (h > 50) return "bg-warning/50";
  return "bg-success/50";
}

export function NetworkEfficiency() {
  const { t } = useTranslation();
  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-default-400 uppercase tracking-wider">
          {t("metrics.networkEfficiency")}
        </span>
      </div>
      <div className="flex items-end gap-1 h-12">
        {Array.from({ length: 12 }, (_, i) => {
          const h = 30 + ((i * 37 + 13) % 70);
          const isNow = i === new Date().getHours() % 12;
          const color = getBarColor(isNow, h);
          return (
            <div
              key={`bar-${i}`}
              className={`flex-1 rounded-t transition-all ${color}`}
              style={{ height: `${h}%` }}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-1 text-[8px] text-default-300">
        <span>6AM</span>
        <span>12PM</span>
        <span>6PM</span>
      </div>
    </GlassCard>
  );
}
