import { useEffect, useState } from "react";
import { MapPin, Footprints, Clock } from "lucide-react";
import { API_URL } from "@/shared/config";
import { GlassCard } from "@shared/ui/GlassCard";

interface NearbyRoute {
  ruta: string;
  cenefa: string;
  paraderosCercanos: { nombre: string; distancia: number }[];
  distanciaMinima: number;
}

interface StopGroup {
  nombre: string;
  distancia: number;
  rutas: NearbyRoute[];
}

function groupByStop(routes: NearbyRoute[]): StopGroup[] {
  const map = new Map<string, StopGroup>();
  for (const r of routes) {
    const stop = r.paraderosCercanos[0];
    if (!stop) continue;
    const key = stop.nombre;
    if (!map.has(key)) {
      map.set(key, {
        nombre: stop.nombre,
        distancia: stop.distancia,
        rutas: [],
      });
    }
    map.get(key)!.rutas.push(r);
  }
  return Array.from(map.values())
    .sort((a, b) => a.distancia - b.distancia)
    .slice(0, 3);
}

function estimateArrival(): string {
  // Estimate based on time of day (peak = more frequent)
  const hour = new Date().getHours();
  const isPeak = (hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 20);
  const base = isPeak ? 5 : 10;
  const variation = Math.round(base + (Date.now() % 7));
  return `~${variation} min`;
}

export function NearbyRoutes() {
  const [groups, setGroups] = useState<StopGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `${API_URL}/graph/rutas-cercanas?lat=${latitude}&lng=${longitude}&radius=500`,
          );
          const data = await res.json();
          const rutas: NearbyRoute[] = data.rutas || [];
          setGroups(groupByStop(rutas));
        } catch {
          setError(true);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setError(true);
      },
      { timeout: 5000 },
    );
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-3 rounded-xl bg-primary/5 border border-primary/10 animate-pulse">
        <MapPin size={14} className="text-primary" />
        <span className="text-[11px] text-primary font-medium">
          Buscando paradas cercanas...
        </span>
      </div>
    );
  }

  if (error || groups.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 px-1">
        <MapPin size={11} className="text-primary" />
        <span className="text-[10px] font-semibold text-foreground">
          Paradas cercanas
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse ml-1" />
      </div>

      {groups.map((g) => {
        const walkMin = Math.max(1, Math.round(g.distancia / 80));
        return (
          <GlassCard key={g.nombre} className="!p-2.5">
            {/* Stop header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <img
                    src="/icons/sitp-logo.svg"
                    alt=""
                    className="w-3 h-3 bg-white rounded-full p-px"
                  />
                </div>
                <p className="text-[11px] font-medium text-foreground truncate">
                  {g.nombre}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0 text-[9px] text-default-400">
                <Footprints size={9} />
                <span>
                  {walkMin} min · {g.distancia}m
                </span>
              </div>
            </div>

            {/* Routes at this stop */}
            <div className="space-y-1">
              {g.rutas.slice(0, 4).map((r) => (
                <div
                  key={r.ruta}
                  className="flex items-center justify-between py-1 px-1.5 rounded-md hover:bg-default-100/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded min-w-[36px] text-center"
                      style={{
                        backgroundColor: `#${r.cenefa}20`,
                        color: `#${r.cenefa}`,
                        border: `1px solid #${r.cenefa}40`,
                      }}
                    >
                      {r.ruta}
                    </span>
                    <span className="text-[9px] text-default-500 truncate max-w-[120px]">
                      {r.paraderosCercanos[r.paraderosCercanos.length - 1]
                        ?.nombre || ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-medium text-success">
                    <Clock size={9} />
                    <span>{estimateArrival()}</span>
                  </div>
                </div>
              ))}
              {g.rutas.length > 4 && (
                <p className="text-[8px] text-primary text-center pt-0.5 cursor-pointer hover:underline">
                  +{g.rutas.length - 4} rutas más
                </p>
              )}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
