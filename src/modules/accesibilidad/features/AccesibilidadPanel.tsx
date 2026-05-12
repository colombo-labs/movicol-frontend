import { GlassCard } from '@shared/ui/GlassCard';

export function AccesibilidadPanel() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-default-400">Análisis de cobertura y equidad del sistema de transporte público.</p>
      <GlassCard>
        <p className="text-sm text-default-500">Cobertura TM + SITP</p>
        <p className="text-3xl font-bold">78%</p>
        <p className="text-xs text-default-400">De la población urbana</p>
      </GlassCard>
      <GlassCard>
        <p className="text-sm text-default-500">Zonas desconectadas</p>
        <p className="text-2xl font-bold">23</p>
        <p className="text-xs text-default-400">Baja closeness centrality</p>
      </GlassCard>
    </div>
  );
}
