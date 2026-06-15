import { Bus } from "lucide-react";
import { GlassCard } from "@shared/ui/GlassCard";
import type { SitpRuta } from "../../models/types";

interface Props {
  readonly ruta: SitpRuta;
  readonly onBack: () => void;
}

export function SitpDetail({ ruta, onBack }: Props) {
  return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-xs text-primary hover:underline">
        ← Volver
      </button>
      <GlassCard>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bus size={16} className="text-primary" />
            <span className="text-lg font-bold">{ruta.ruta}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            {ruta.paraderos.length} paradas
          </span>
        </div>
        <p className="text-xs text-default-500 mb-1">Cenefa: {ruta.cenefa}</p>
        {ruta.paraderos.length > 0 && (
          <p className="text-[11px] text-default-600">
            {ruta.paraderos[0].nombre} →{" "}
            {ruta.paraderos[ruta.paraderos.length - 1].nombre}
          </p>
        )}
      </GlassCard>
      <GlassCard>
        <span className="text-xs font-semibold mb-2 block">
          Paradas del recorrido
        </span>
        <div className="space-y-1 max-h-[calc(100vh-350px)] overflow-y-auto">
          {ruta.paraderos.map((p, i) => (
            <div
              key={p.nombre || `p-${i}`}
              className="flex items-center gap-2 py-1 border-b border-default-100 last:border-0"
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0 ${i === 0 ? "bg-success" : i === ruta.paraderos.length - 1 ? "bg-danger" : "bg-blue-500"}`}
              >
                {i + 1}
              </div>
              <span className="text-[11px] text-default-600 truncate">
                {p.nombre || `Parada ${i + 1}`}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
