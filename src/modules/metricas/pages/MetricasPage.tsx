import { BarChart3 } from 'lucide-react';
import { GlassCard } from '@shared/ui/GlassCard';

/**
 * Módulo MÉTRICAS — Dashboard con estadísticas del grafo.
 * - Cards con métricas principales
 * - Gráficos de distribución
 * - No necesita modals (es informativo)
 */
export function MetricasPage() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><BarChart3 size={18} className="text-primary" /> Métricas del Grafo</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard>
          <p className="text-sm text-default-500 mb-2">Grado Promedio</p>
          <p className="text-2xl font-bold">11.28</p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-default-500 mb-2">Modelo GNN</p>
          <p className="text-2xl font-bold">GAT</p>
          <p className="text-xs text-default-400">RMSE: 0.42 | MSE: 0.18</p>
        </GlassCard>
      </div>
    </div>
  );
}
