import { useState, useRef } from "react";
import {
  X,
  LocateFixed,
  ArrowUpDown,
  Plus,
  Trash2,
  Search,
} from "lucide-react";
import type { PlanificarProps } from "../../models/types";

interface Props extends Pick<
  PlanificarProps,
  | "tripPoints"
  | "onRemovePoint"
  | "onUseMyLocation"
  | "onSwapPoints"
  | "onClear"
  | "onAddPoint"
  | "onUpdatePoint"
  | "onRequestAddPoint"
> {
  readonly mode: "publico" | "vehiculo";
}

interface SearchResult {
  lat: number;
  lng: number;
  label: string;
}

function getDotStyle(isFirst: boolean, isLast: boolean) {
  if (isFirst) return "border-success bg-success/30";
  if (isLast) return "border-danger bg-danger/30";
  return "border-blue-500 bg-blue-500/30";
}

function getPlaceholder(index: number, total: number) {
  if (index === 0) return "Origen — buscar dirección";
  if (index === total - 1) return "Destino — buscar dirección";
  return "Parada intermedia";
}

export function TripPointsList({
  tripPoints,
  mode,
  onRemovePoint,
  onUseMyLocation,
  onSwapPoints,
  onClear,
  onAddPoint,
  onUpdatePoint,
  onRequestAddPoint,
}: Props) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const maxPoints = mode === "vehiculo" ? 10 : 2;

  const handleSearch = (value: string, idx: number) => {
    setQuery(value);
    setEditingIdx(idx);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 3) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value + " Bogotá")}&limit=5&countrycodes=co`,
        );
        const data = await res.json();
        setResults(
          data.map((r: { lat: string; lon: string; display_name: string }) => ({
            lat: Number.parseFloat(r.lat),
            lng: Number.parseFloat(r.lon),
            label: r.display_name.split(",").slice(0, 3).join(","),
          })),
        );
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleSelect = (r: SearchResult, idx: number) => {
    if (idx < tripPoints.length) {
      onUpdatePoint?.(idx, r.lat, r.lng, r.label);
    } else {
      onAddPoint?.(r.lat, r.lng, r.label);
    }
    setEditingIdx(null);
    setQuery("");
    setResults([]);
    setShowExtraSlot(false);
  };

  const closeSearch = () => {
    setEditingIdx(null);
    setQuery("");
    setResults([]);
  };

  const [showExtraSlot, setShowExtraSlot] = useState(false);

  // Reset extra slot when a point is added externally (e.g. map click)
  const prevLenRef = useRef(tripPoints.length);
  if (tripPoints.length > prevLenRef.current && showExtraSlot) {
    setShowExtraSlot(false);
  }
  prevLenRef.current = tripPoints.length;

  // Empty slot: only when less than 2 points (need origin+dest), or user explicitly wants to add
  const needsSlot =
    tripPoints.length < 2 ||
    (mode === "vehiculo" && showExtraSlot && tripPoints.length < maxPoints);
  const slots = needsSlot ? [...tripPoints, null] : tripPoints;

  return (
    <>
      <div className="space-y-0">
        <div className="flex items-stretch gap-2">
          {/* Dots column */}
          <div className="flex flex-col items-center py-2 w-5 shrink-0">
            {slots.map((pt, i) => (
              <div
                key={`dot-${pt?.lat ?? "empty"}-${pt?.lng ?? i}`}
                className="flex flex-col items-center"
              >
                <div
                  className={`w-3 h-3 rounded-full border-2 ${getDotStyle(
                    i === 0,
                    i === slots.length - 1 && slots.length > 1,
                  )}`}
                />
                {i < slots.length - 1 && (
                  <div className="w-0.5 h-7 bg-default-200" />
                )}
              </div>
            ))}
          </div>

          {/* Inputs column */}
          <div className="flex-1 space-y-1.5">
            {slots.map((pt, i) => (
              <div
                key={`input-${pt?.lat ?? "empty"}-${pt?.lng ?? i}`}
                className="relative"
              >
                <div className="flex items-center gap-1">
                  <div className="flex-1 min-w-0 relative">
                    <input
                      type="text"
                      id={`trip-point-${i}`}
                      name={`trip-point-${i}`}
                      value={editingIdx === i ? query : pt?.label || ""}
                      placeholder={getPlaceholder(i, slots.length)}
                      onFocus={() => {
                        setEditingIdx(i);
                        setQuery(pt?.label || "");
                      }}
                      onChange={(e) => handleSearch(e.target.value, i)}
                      className="w-full px-2.5 py-2 rounded-lg bg-default-100 border border-divider text-[11px] text-foreground placeholder:text-default-400 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                    {editingIdx === i && searching && (
                      <Search
                        size={10}
                        className="absolute right-2 top-2.5 text-primary animate-pulse"
                      />
                    )}
                  </div>
                  {pt && (
                    <>
                      <button
                        onClick={() => onUseMyLocation(i)}
                        className="text-default-400 hover:text-primary p-1"
                        title="Mi ubicación"
                      >
                        <LocateFixed size={12} />
                      </button>
                      <button
                        onClick={() => {
                          onRemovePoint(i);
                          closeSearch();
                        }}
                        className="text-default-400 hover:text-danger p-1"
                        title="Quitar"
                      >
                        <X size={12} />
                      </button>
                    </>
                  )}
                </div>

                {/* Search results dropdown */}
                {editingIdx === i && results.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-1 rounded-lg bg-background border border-divider shadow-lg max-h-40 overflow-y-auto">
                    {results.map((r) => (
                      <button
                        key={`res-${r.label}-${r.lat}`}
                        onClick={() => handleSelect(r, i)}
                        className="w-full text-left px-3 py-2 text-[11px] text-foreground hover:bg-default-100 transition-colors border-b border-divider/30 last:border-0"
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Swap button */}
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

        {/* Add destination (vehículo only, more than 2) */}
        {mode === "vehiculo" &&
          tripPoints.length >= 2 &&
          !showExtraSlot &&
          tripPoints.length < maxPoints && (
            <button
              onClick={() => {
                setShowExtraSlot(true);
                onRequestAddPoint?.();
              }}
              className="flex items-center gap-2 pt-2 pl-7 text-[10px] text-primary hover:underline"
            >
              <Plus size={11} /> Agregar un destino
            </button>
          )}
      </div>

      {/* Use my location - prominent when no points */}
      {tripPoints.length === 0 && (
        <button
          onClick={() => onUseMyLocation(undefined)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all active:scale-[0.98]"
        >
          <LocateFixed size={16} className="text-primary animate-pulse" />
          <div className="text-left">
            <span className="block text-[11px] text-primary font-semibold">
              Usar mi ubicación
            </span>
            <span className="block text-[9px] text-primary/60">
              Iniciar desde donde estás
            </span>
          </div>
        </button>
      )}

      {tripPoints.length > 0 && (
        <button
          onClick={() => {
            onClear();
            closeSearch();
          }}
          className="flex items-center gap-1 text-[10px] text-danger hover:underline"
        >
          <Trash2 size={10} /> Limpiar
        </button>
      )}
    </>
  );
}
