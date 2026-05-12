import { GlassCard } from '@shared/ui/GlassCard';

export function MetricasPanel() {
  return (
    <div className="space-y-4">
      <GlassCard>
        <p className="text-sm text-default-500">Estaciones</p>
        <p className="text-3xl font-bold">7,444</p>
      </GlassCard>
      <GlassCard>
        <p className="text-sm text-default-500">Conexiones</p>
        <p className="text-3xl font-bold">41,990</p>
      </GlassCard>
      <GlassCard>
        <p className="text-sm text-default-500">Componente Principal</p>
        <p className="text-3xl font-bold">97.9%</p>
      </GlassCard>
      <GlassCard>
        <p className="text-sm text-default-500">Grado Promedio</p>
        <p className="text-2xl font-bold">11.28</p>
      </GlassCard>
      <GlassCard>
        <p className="text-sm text-default-500">Modelo GNN</p>
        <p className="text-2xl font-bold">GAT</p>
        <p className="text-xs text-default-400">RMSE: 0.42 | MSE: 0.18</p>
      </GlassCard>
    </div>
  );
}
