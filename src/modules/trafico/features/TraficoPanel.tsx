import { GlassCard } from '@shared/ui/GlassCard';

export function TraficoPanel() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-default-400">Estado del tráfico vehicular en tiempo real.</p>
      <GlassCard>
        <p className="text-sm text-default-500">Velocidad promedio</p>
        <p className="text-3xl font-bold">24 km/h</p>
        <p className="text-xs text-default-400">Hora pico actual</p>
      </GlassCard>
      <GlassCard>
        <p className="text-sm text-default-500">Vías congestionadas</p>
        <p className="text-2xl font-bold">34</p>
        <p className="text-xs text-danger">Alto nivel de congestión</p>
      </GlassCard>
      <GlassCard>
        <p className="text-sm text-default-500">Incidentes activos</p>
        <p className="text-2xl font-bold">7</p>
        <p className="text-xs text-warning">Afectando movilidad</p>
      </GlassCard>
    </div>
  );
}
