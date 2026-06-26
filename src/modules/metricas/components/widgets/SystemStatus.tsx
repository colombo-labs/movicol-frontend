import { Wifi } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GlassCard } from "@shared/ui/GlassCard";

interface Props {
  readonly avgCongestion: number;
}

export function SystemStatus({ avgCongestion }: Props) {
  const { t } = useTranslation();

  function getStatus(avg: number) {
    if (avg > 0.7)
      return {
        label: t("metrics.critical"),
        color: "text-danger",
        bg: "bg-danger/20",
      };
    if (avg > 0.5)
      return {
        label: "Congestionado",
        color: "text-orange-500",
        bg: "bg-orange-500/20",
      };
    if (avg > 0.3)
      return {
        label: t("metrics.moderate"),
        color: "text-warning",
        bg: "bg-warning/20",
      };
    return { label: "Fluido", color: "text-success", bg: "bg-success/20" };
  }

  const { label, color, bg } = getStatus(avgCongestion);
  return (
    <GlassCard>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-default-400 uppercase tracking-wider">
            {t("metrics.systemStatus")}
          </p>
          <p className={`text-xl font-bold ${color}`}>{label}</p>
        </div>
        <div
          className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center`}
        >
          <Wifi size={18} className={color} />
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full bg-default-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-success via-warning to-danger rounded-full"
            style={{ width: `${Math.round(avgCongestion * 100)}%` }}
          />
        </div>
        <span className={`text-xs font-bold ${color}`}>
          {Math.round(avgCongestion * 100)}%
        </span>
      </div>
      <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-divider/30">
        <p className="text-[9px] text-default-400">
          {t("metrics.vsYesterday")}
        </p>
        <p
          className={`text-[9px] font-medium ${avgCongestion > 0.5 ? "text-danger" : "text-success"}`}
        >
          {avgCongestion > 0.5 ? "+" : ""}
          {Math.round((avgCongestion - 0.45) * 100)}%
        </p>
      </div>
    </GlassCard>
  );
}
