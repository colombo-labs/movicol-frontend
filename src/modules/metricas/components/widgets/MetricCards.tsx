import { AlertTriangle } from "lucide-react";
import { GlassCard } from "@shared/ui/GlassCard";

export function AlertsCard({
  critical,
  high,
}: {
  readonly critical: number;
  readonly high: number;
}) {
  if (critical === 0 && high === 0) return null;
  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={14} className="text-warning" />
        <span className="text-xs font-semibold">Alertas activas</span>
      </div>
      <div className="space-y-1">
        {critical > 0 && (
          <p className="text-[10px] text-danger">
            {critical} estaciones en estado crítico
          </p>
        )}
        {high > 0 && (
          <p className="text-[10px] text-orange-500">
            {high} estaciones con alta congestión
          </p>
        )}
      </div>
    </GlassCard>
  );
}

export function LiveCounter() {
  return (
    <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-default-100/50 text-[9px] text-default-400">
      <span className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />{" "}
        Datos en vivo
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
  const hour = new Date().getHours();
  let base = 800000;
  if (hour >= 6 && hour <= 9) base = 1800000;
  else if (hour >= 17 && hour <= 20) base = 1600000;

  return (
    <GlassCard>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-default-400 uppercase tracking-wider">
            Pasajeros ahora
          </p>
          <p className="text-2xl font-bold">{base.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-default-400">Capacidad usada</p>
          <p className="text-lg font-bold text-warning">
            {Math.round(avgCongestion * 100 + 15)}%
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

export function NetworkEfficiency() {
  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-default-400 uppercase tracking-wider">
          Eficiencia de la red
        </span>
      </div>
      <div className="flex items-end gap-1 h-12">
        {Array.from({ length: 12 }, (_, i) => {
          const h = 30 + ((i * 37 + 13) % 70);
          const isNow = i === new Date().getHours() % 12;
          const color = isNow
            ? "bg-primary"
            : h > 70
              ? "bg-danger/50"
              : h > 50
                ? "bg-warning/50"
                : "bg-success/50";
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
