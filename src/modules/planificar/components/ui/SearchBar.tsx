import { Search, Loader2, MapPin } from "lucide-react";
import type { GeoResult } from "@shared/utils/geocode";

interface Props {
  readonly query: string;
  readonly results: GeoResult[];
  readonly searching: boolean;
  readonly onSearch: (query: string) => void;
  readonly onSelect: (result: GeoResult) => void;
}

export function SearchBar({
  query,
  results,
  searching,
  onSearch,
  onSelect,
}: Props) {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-default-100 border border-divider">
        <Search size={14} className="text-default-400 shrink-0" />
        <input
          type="text"
          placeholder="Buscar dirección..."
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-default-400"
        />
        {searching && (
          <Loader2 size={14} className="animate-spin text-primary" />
        )}
      </div>
      {(results.length > 0 || searching) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-default-50 border border-divider rounded-xl shadow-lg z-50 max-h-52 overflow-y-auto">
          {searching && results.length === 0 && (
            <div className="px-3 py-2.5 text-[10px] text-default-400 text-center">
              Buscando...
            </div>
          )}
          {!searching && results.length === 0 && query.length >= 3 && (
            <div className="px-3 py-2.5 text-[10px] text-default-400 text-center">
              Sin resultados.
            </div>
          )}
          {results.map((r) => (
            <button
              key={r.label}
              onClick={() => onSelect(r)}
              className="w-full flex items-center gap-2 text-left px-3 py-2 text-xs text-foreground hover:bg-default-100 border-b border-divider/50 last:border-0 transition-colors"
            >
              <MapPin
                size={11}
                className={`shrink-0 ${r.type === "station" ? "text-danger" : "text-primary"}`}
              />
              <span className="flex-1 truncate">{r.label}</span>
              <span
                className={`text-[8px] px-1.5 py-0.5 rounded-full shrink-0 ${r.type === "station" ? "bg-danger/10 text-danger" : "bg-primary/10 text-primary"}`}
              >
                {r.type === "station" ? "TM" : "Dir"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
