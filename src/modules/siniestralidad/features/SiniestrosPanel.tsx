import { GlassCard } from "@shared/ui/GlassCard";

export function SiniestrosPanel() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-default-400">
        Zonas de mayor riesgo vial en Bogotá basadas en datos históricos de
        accidentes.
      </p>
      <GlassCard>
        <p className="text-sm text-default-500">Total siniestros (2024)</p>
        <p className="text-3xl font-bold">196,482</p>
      </GlassCard>
      <GlassCard>
        <p className="text-sm text-default-500">Zonas críticas</p>
        <p className="text-2xl font-bold">47</p>
        <p className="text-xs text-default-400">
          Sectores con alta concentración
        </p>
      </GlassCard>
      <GlassCard>
        <p className="text-sm text-default-500">Mortalidad vial</p>
        <p className="text-2xl font-bold">12,340</p>
        <p className="text-xs text-default-400">Registros históricos</p>
      </GlassCard>
    </div>
  );
}
