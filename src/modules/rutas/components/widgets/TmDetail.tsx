import { MapPin } from "lucide-react";
import { GlassCard } from "@shared/ui/GlassCard";

interface Props {
  readonly selected: {
    id: string;
    origen: string;
    destino: string;
    estaciones: number;
    troncal: string;
  };
  readonly tmStations: string[];
  readonly onBack: () => void;
}

function getStationDot(i: number, total: number) {
  if (i === 0) return "border-success bg-success";
  if (i === total - 1) return "border-danger bg-danger";
  return "border-default-300 bg-default-300";
}

export function TmDetail({ selected, tmStations, onBack }: Props) {
  return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-xs text-primary hover:underline">
        ← Volver
      </button>
      <GlassCard>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <img src="/icons/tm-logo.svg" alt="TM" className="w-5 h-5" />
            <span className="text-lg font-bold">{selected.id}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {selected.estaciones} estaciones
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs mb-3">
          <MapPin size={12} className="text-primary" />
          <span>
            {selected.origen} → {selected.destino}
          </span>
        </div>
        {selected.troncal && (
          <p className="text-[11px] text-default-400">
            Troncal: {selected.troncal}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="p-2 rounded-lg bg-default-100 text-center">
            <p className="text-[10px] text-default-400">Estaciones</p>
            <p className="text-sm font-bold">{selected.estaciones}</p>
          </div>
          <div className="p-2 rounded-lg bg-default-100 text-center">
            <p className="text-[10px] text-default-400">Tarifa</p>
            <p className="text-sm font-bold">$3,550</p>
          </div>
        </div>
      </GlassCard>
      <GlassCard>
        <span className="text-xs font-semibold mb-2 block">
          Estaciones del recorrido ({tmStations.length})
        </span>
        <div className="space-y-0 max-h-[calc(100vh-350px)] overflow-y-auto">
          {tmStations.map((name, i) => (
            <div key={`st-${i}-${name}`} className="flex items-center gap-2 py-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-2.5 h-2.5 rounded-full border-2 ${getStationDot(i, tmStations.length)}`}
                />
                {i < tmStations.length - 1 && (
                  <div className="w-0.5 h-3 bg-default-200" />
                )}
              </div>
              <span className="text-[11px] text-default-600">{name}</span>
              {i === 0 && (
                <span className="text-[9px] text-success ml-auto">Inicio</span>
              )}
              {i === tmStations.length - 1 && (
                <span className="text-[9px] text-danger ml-auto">Fin</span>
              )}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
