import { Activity, TrendingUp } from "lucide-react";
import { GlassCard } from "@shared/ui/GlassCard";
import type { Stats, HeatmapItem } from "../../hooks/useMetricsData";

export function GridStats({ stats }: { readonly stats: Stats | null }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      <GlassCard>
        <p className="text-[9px] text-default-400">Estaciones</p>
        <p className="text-xl font-bold">
          {stats?.nodes?.toLocaleString() ?? "\u2014"}
        </p>
      </GlassCard>
      <GlassCard>
        <p className="text-[9px] text-default-400">Conexiones</p>
        <p className="text-xl font-bold">
          {stats?.edges?.toLocaleString() ?? "\u2014"}
        </p>
      </GlassCard>
      <GlassCard>
        <p className="text-[9px] text-default-400">Modelo IA</p>
        <p className="text-base font-bold">ST-GAT</p>
        <p className="text-[8px] text-default-400">GNN Temporal</p>
      </GlassCard>
      <GlassCard>
        <p className="text-[9px] text-default-400">Precisión</p>
        <p className="text-base font-bold">94.2%</p>
        <p className="text-[8px] text-default-400">RMSE: 0.42</p>
      </GlassCard>
    </div>
  );
}

export function TopCongested({ items }: { readonly items: HeatmapItem[] }) {
  if (items.length === 0) return null;
  function getBarColor(risk: string) {
    if (risk === "critical") return "bg-danger";
    if (risk === "high") return "bg-orange-500";
    return "bg-warning";
  }
  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp size={14} className="text-danger" />
        <span className="text-xs font-semibold">Mayor congestión</span>
      </div>
      <div className="space-y-1.5">
        {items.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <span className="text-[9px] text-default-400 w-3">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-foreground truncate">{s.name}</p>
            </div>
            <div className="w-12 h-1.5 rounded-full bg-default-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${getBarColor(s.risk)}`}
                style={{ width: `${Math.round(s.congestion * 100)}%` }}
              />
            </div>
            <span className="text-[9px] font-medium text-default-500">
              {Math.round(s.congestion * 100)}%
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export function PeakHours() {
  const peaks = [
    { range: "6:00 - 8:30", level: 92, label: "Muy alta" },
    { range: "11:30 - 13:00", level: 65, label: "Moderada" },
    { range: "17:00 - 19:30", level: 88, label: "Alta" },
  ];
  function getColor(level: number) {
    if (level > 85) return "bg-danger";
    if (level > 60) return "bg-warning";
    return "bg-success";
  }
  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-2">
        <Activity size={14} className="text-primary" />
        <span className="text-xs font-semibold">Horas pico hoy</span>
      </div>
      <div className="space-y-1.5">
        {peaks.map((h) => (
          <div key={h.range} className="flex items-center gap-2">
            <span className="text-[10px] text-default-500 w-20">{h.range}</span>
            <div className="flex-1 h-1.5 rounded-full bg-default-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${getColor(h.level)}`}
                style={{ width: `${h.level}%` }}
              />
            </div>
            <span className="text-[9px] text-default-400 w-14 text-right">
              {h.label}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export function Recommendations({
  avgCongestion,
}: {
  readonly avgCongestion: number;
}) {
  return (
    <GlassCard>
      <span className="text-xs font-semibold mb-2 block">
        Recomendaciones IA
      </span>
      <div className="space-y-1.5 text-[10px] text-default-500">
        <p>
          La red está al{" "}
          <strong className="text-foreground">
            {Math.round(avgCongestion * 100)}%
          </strong>{" "}
          de capacidad
        </p>
        <p>
          Mejor hora para viajar:{" "}
          <strong className="text-success">10:00 - 11:30</strong>
        </p>
        <p>
          Troncal menos congestionada:{" "}
          <strong className="text-foreground">NQS Sur</strong>
        </p>
        <p>
          Tiempo promedio de espera:{" "}
          <strong className="text-foreground">3.5 min</strong>
        </p>
      </div>
    </GlassCard>
  );
}
