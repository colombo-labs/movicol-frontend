import { Clock, ChevronRight, MapPin, LocateFixed } from "lucide-react";
import type { TripPoint } from "@/app/Layout";

interface Props {
  readonly tripPoints: TripPoint[];
  readonly onUseMyLocation: (index?: number) => void;
  readonly onAddPoint?: (lat: number, lng: number, label: string) => void;
}

export function EmptyState({ tripPoints, onUseMyLocation, onAddPoint }: Props) {
  return (
    <>
      {tripPoints.length === 0 && (
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-[10px] text-primary font-medium">
            Busca una dirección, toca el mapa o usa tu ubicación para comenzar.
          </p>
        </div>
      )}
      {tripPoints.length === 1 && (
        <div className="p-2 rounded-lg bg-danger/10 border border-danger/20">
          <p className="text-[10px] text-danger font-medium">
            Ahora agrega tu destino: busca, toca el mapa o elige abajo.
          </p>
        </div>
      )}

      {tripPoints.length === 0 && <RecentRoutes onAddPoint={onAddPoint} />}

      {tripPoints.length === 0 && (
        <button
          onClick={() => onUseMyLocation()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/30 text-sm font-medium text-primary hover:bg-primary/20 transition-all active:scale-[0.98]"
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <LocateFixed size={16} className="text-primary animate-pulse" />
          </div>
          <div className="text-left">
            <span className="block text-primary font-semibold text-sm">
              Usar mi ubicación
            </span>
            <span className="block text-[10px] text-primary/60">
              Toca para iniciar desde donde estás
            </span>
          </div>
        </button>
      )}
      {tripPoints.length === 1 && (
        <div className="flex gap-2">
          <button
            onClick={() => onUseMyLocation(0)}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-medium text-primary hover:bg-primary/20 transition-all"
          >
            <LocateFixed size={12} /> Origen: mi ubicación
          </button>
        </div>
      )}

      {tripPoints.length === 1 && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-default-400 font-medium px-1">
            ¿A dónde vas?
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {[
              { label: "Portal Norte", lat: 4.7588, lng: -74.0445 },
              { label: "Portal Sur", lat: 4.5968, lng: -74.1372 },
              { label: "Centro (Museo Nal)", lat: 4.6122, lng: -74.0695 },
              { label: "Aeropuerto", lat: 4.7016, lng: -74.1469 },
            ].map((dest) => (
              <button
                key={dest.label}
                onClick={() => onAddPoint?.(dest.lat, dest.lng, dest.label)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-default-100 border border-divider/50 text-[10px] text-foreground hover:bg-default-200 transition-all whitespace-nowrap shrink-0"
              >
                <MapPin size={10} className="text-danger shrink-0" />
                <span className="truncate">{dest.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function RecentRoutes({
  onAddPoint,
}: {
  readonly onAddPoint?: (lat: number, lng: number, label: string) => void;
}) {
  const saved = JSON.parse(
    localStorage.getItem("movicol_saved_routes") || "[]",
  );
  if (saved.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] text-default-400 font-medium px-1">
        Rutas recientes
      </p>
      {saved
        .slice(0, 3)
        .map(
          (r: {
            origin: string;
            dest: string;
            originLat?: number;
            originLng?: number;
            destLat?: number;
            destLng?: number;
            time: number;
            date: string;
          }) => (
            <button
              key={`${r.origin}-${r.dest}`}
              onClick={() => {
                if (
                  r.originLat &&
                  r.originLng &&
                  r.destLat &&
                  r.destLng &&
                  onAddPoint
                ) {
                  onAddPoint(r.originLat, r.originLng, r.origin);
                  setTimeout(
                    () => onAddPoint(r.destLat!, r.destLng!, r.dest),
                    100,
                  );
                }
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-default-100 border border-divider/50 text-left hover:bg-default-200 transition-all"
            >
              <Clock size={12} className="text-default-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-foreground truncate">
                  {r.origin} → {r.dest}
                </p>
                <p className="text-[9px] text-default-400">
                  {r.time} min • {r.date}
                </p>
              </div>
              <ChevronRight size={12} className="text-default-300 shrink-0" />
            </button>
          ),
        )}
    </div>
  );
}
