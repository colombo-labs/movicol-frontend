import { X, LocateFixed, ArrowUpDown, Plus, Trash2 } from "lucide-react";
import type { TripPoint } from "@/app/Layout";

interface Props {
  readonly tripPoints: TripPoint[];
  readonly onRemovePoint: (index: number) => void;
  readonly onUseMyLocation: (index?: number) => void;
  readonly onSwapPoints: (i: number, j: number) => void;
  readonly onClear: () => void;
}

function formatCoord(pt: TripPoint) {
  return pt.label || `${pt.lat.toFixed(4)}, ${pt.lng.toFixed(4)}`;
}

function getDotStyle(isFirst: boolean, isLast: boolean) {
  if (isFirst) return "border-success bg-success/30";
  if (isLast) return "border-danger bg-danger/30";
  return "border-blue-500 bg-blue-500/30";
}

export function TripPointsList({
  tripPoints,
  onRemovePoint,
  onUseMyLocation,
  onSwapPoints,
  onClear,
}: Props) {
  return (
    <>
      <div className="space-y-0">
        <div className="flex items-stretch gap-2">
          <div className="flex flex-col items-center py-2 w-5 shrink-0">
            {tripPoints.map((pt, i) => (
              <div
                key={`dot-${pt.lat}-${pt.lng}`}
                className="flex flex-col items-center"
              >
                <div
                  className={`w-3 h-3 rounded-full border-2 ${getDotStyle(i === 0, i === tripPoints.length - 1 && tripPoints.length > 1)}`}
                />
                {i < tripPoints.length - 1 && (
                  <div className="w-0.5 h-6 bg-default-200" />
                )}
              </div>
            ))}
          </div>
          <div className="flex-1 space-y-1.5">
            {tripPoints.map((pt) => (
              <div
                key={`pt-${pt.lat}-${pt.lng}`}
                className="flex items-center gap-1.5"
              >
                <div className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg bg-default-100 border border-divider">
                  <span className="text-[11px] text-foreground truncate block">
                    {formatCoord(pt)}
                  </span>
                </div>
                <button
                  onClick={() => onUseMyLocation(tripPoints.indexOf(pt))}
                  className="text-default-400 hover:text-primary p-0.5"
                  title="Mi ubicación"
                >
                  <LocateFixed size={11} />
                </button>
                <button
                  onClick={() => onRemovePoint(tripPoints.indexOf(pt))}
                  className="text-default-400 hover:text-danger p-0.5"
                  title="Quitar"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
          {tripPoints.length >= 2 && (
            <button
              onClick={() => onSwapPoints(0, tripPoints.length - 1)}
              className="self-center text-default-400 hover:text-primary"
              title="Intercambiar"
            >
              <ArrowUpDown size={16} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 pt-1 pl-7">
          <Plus size={11} className="text-default-400" />
          <span className="text-[9px] text-default-400">
            Toca el mapa o busca para agregar paradas
          </span>
        </div>
      </div>
      <button
        onClick={onClear}
        className="flex items-center gap-1 text-[10px] text-danger hover:underline"
      >
        <Trash2 size={10} /> Limpiar
      </button>
    </>
  );
}
