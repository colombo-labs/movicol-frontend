/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Search, Clock, Star, CheckCircle2, AlertCircle, List, MapPin } from "lucide-react";
import { GlassCard } from "@shared/ui/GlassCard";
import { API_URL } from "@/shared/config";
import type {
  SitpRuta,
  TmTroncal,
  TmRuta,
  Tab,
  RutasPanelProps,
} from "../../models/types";

const SITP_PAGE_SIZE = 20;

interface Props extends RutasPanelProps {
  readonly tab: Tab;
  readonly tmTroncales: TmTroncal[];
  readonly tmRutas?: TmRuta[];
  readonly sitpRutas: SitpRuta[];
  readonly search: string;
  readonly setSearch: (s: string) => void;
  readonly filter: string;
  readonly setFilter: (f: string) => void;
  readonly sitpPage: number;
  readonly setSitpPage: (fn: (p: number) => number) => void;
  readonly onSelectRuta: (ruta: SitpRuta) => void;
  readonly onSelectTm: (troncal: TmTroncal) => void;
  readonly onSelectTmRuta?: (ruta: TmRuta) => void;
  readonly handleTab: (
    t: Tab,
    onFilterChange?: RutasPanelProps["onFilterChange"],
  ) => void;
}

export function RutasList(props: Props) {
  const {
    tab,
    tmTroncales,
    sitpRutas,
    search,
    setSearch,
    filter,
    setFilter,
    sitpPage,
    setSitpPage,
    onSelectRuta,
    // onSelectTm unused — troncales replaced by tmRutas
    handleTab,
    onFilterChange,
    showTroncales,
    onToggleTroncales,
    showEstaciones,
    onToggleEstaciones,
    showSitpOnMap,
    onToggleSitp,
  } = props;

  const [nearbyRutas, setNearbyRutas] = useState<string[]>([]);
  const [alerts, setAlerts] = useState({ operating: 125, delayed: 0, suspended: 0, items: [] as { title: string; url: string; route_codes?: string[] }[], affectedCodes: [] as string[] });

  // Fetch system alerts
  useEffect(() => {
    fetch(`${API_URL}/route-prediction/alerts`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          const codes = (d.alerts || []).flatMap((a: any) => a.route_codes || []);
          setAlerts({ operating: d.operating, delayed: d.delayed, suspended: d.suspended, items: d.alerts || [], affectedCodes: codes });
        }
      })
      .catch(() => {});
  }, []);
  const [nearbyTmCodigos, setNearbyTmCodigos] = useState<string[]>([]);
  const [nearbyInfo, setNearbyInfo] = useState<Map<string, { distancia: number; paradero: string }>>(new Map());
  const [nearbyLoading, setNearbyLoading] = useState(false);

  // Cargar rutas cercanas cuando se selecciona el filtro
  useEffect(() => {
    if (filter !== "cercanas") return;
    setNearbyLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // SITP cercanas
          const res = await fetch(
            `${API_URL}/graph/rutas-cercanas?lat=${latitude}&lng=${longitude}&radius=600`,
          );
          const data = await res.json();
          const rutas = data.rutas || [];
          setNearbyRutas(rutas.map((r: any) => r.ruta));

          // Mapa de info por ruta (distancia + paradero)
          const info = new Map<string, { distancia: number; paradero: string }>();
          for (const r of rutas) {
            info.set(r.ruta, {
              distancia: r.distanciaMinima,
              paradero: r.paraderosCercanos?.[0]?.nombre || "",
            });
          }

          // TM cercanas
          if (props.tmRutas) {
            for (const ruta of props.tmRutas) {
              let minDist = Infinity;
              let closestName = "";
              for (const e of (ruta.estaciones || []) as any[]) {
                if (!e.lat || !e.lon) continue;
                const d = Math.sqrt((e.lat - latitude) ** 2 + (e.lon - longitude) ** 2) * 111000;
                if (d < minDist) { minDist = d; closestName = e.nombre || ""; }
              }
              if (minDist < 800) {
                info.set(ruta.codigo, { distancia: Math.round(minDist), paradero: closestName });
              }
            }
            setNearbyTmCodigos(
              props.tmRutas.filter(r => info.has(r.codigo)).map(r => r.codigo)
            );
          }
          setNearbyInfo(info);
        } catch { setNearbyRutas([]); setNearbyTmCodigos([]); }
        finally { setNearbyLoading(false); }
      },
      () => { setNearbyRutas([]); setNearbyTmCodigos([]); setNearbyLoading(false); },
      { timeout: 5000 },
    );
  }, [filter]);

  const filteredTm = tmTroncales.filter(
    (r) =>
      !search ||
      r.nombre.toLowerCase().includes(search.toLowerCase()) ||
      r.troncal.toLowerCase().includes(search.toLowerCase()) ||
      r.origen.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredSitp = sitpRutas.filter(
    (r) => {
      const matchSearch = !search ||
        r.ruta.toLowerCase().includes(search.toLowerCase()) ||
        r.cenefa.toLowerCase().includes(search.toLowerCase());
      const matchNearby = filter !== "cercanas" || nearbyRutas.includes(r.ruta);
      return matchSearch && matchNearby;
    },
  ).sort((a, b) => {
    if (filter !== "cercanas") return 0;
    const da = nearbyInfo.get(a.ruta)?.distancia ?? 9999;
    const db = nearbyInfo.get(b.ruta)?.distancia ?? 9999;
    return da - db;
  });

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex gap-1 bg-default-100 rounded-xl p-1">
        <button
          onClick={() => handleTab("tm", onFilterChange)}
          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all ${tab === "tm" ? "bg-primary text-primary-foreground shadow-sm" : "text-default-500 hover:text-foreground"}`}
        >
          <img src="/icons/tm-logo.svg" alt="TM" className="w-4 h-4 inline-block" /> TM
        </button>
        <button
          onClick={() => handleTab("sitp", onFilterChange)}
          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all ${tab === "sitp" ? "bg-primary text-primary-foreground shadow-sm" : "text-default-500 hover:text-foreground"}`}
        >
          <img src="/icons/sitp-logo.svg" alt="SITP" className="w-4 h-4 inline-block bg-white rounded-full p-px" /> SITP
        </button>
      </div>

      {/* Status */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="text-center p-2 rounded-lg bg-success/10">
          <p className="text-sm font-bold text-success">{alerts.operating}</p>
          <p className="text-[8px] text-success/70">Operando</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-warning/10">
          <p className="text-sm font-bold text-warning">{alerts.delayed}</p>
          <p className="text-[8px] text-warning/70">Con demora</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-danger/10">
          <p className="text-sm font-bold text-danger">{alerts.suspended}</p>
          <p className="text-[8px] text-danger/70">Suspendidas</p>
        </div>
      </div>

      {/* Layers */}
      <div className="p-2.5 rounded-xl bg-default-100/50 border border-default-200/50">
        <p className="text-[10px] font-semibold text-default-500 mb-1.5 uppercase tracking-wider">
          Capas en mapa
        </p>
        <div className="flex flex-col gap-1">
          {tab === "tm" && (
            <>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-default-600">
                <input
                  type="checkbox"
                  checked={!!showTroncales}
                  onChange={() => onToggleTroncales?.()}
                  className="w-3 h-3 rounded accent-emerald-400"
                />{" "}
                Troncales
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-default-600">
                <input
                  type="checkbox"
                  checked={!!showEstaciones}
                  onChange={() => onToggleEstaciones?.()}
                  className="w-3 h-3 rounded accent-emerald-400"
                />{" "}
                Estaciones
              </label>
            </>
          )}
          {tab === "sitp" && (
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-default-600">
              <input
                type="checkbox"
                checked={!!showSitpOnMap}
                onChange={() => onToggleSitp?.()}
                className="w-3 h-3 rounded accent-blue-400"
              />{" "}
              Paraderos SITP
            </label>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-default-100 border border-divider">
        <Search size={14} className="text-default-400" />
        <input
          type="text"
          placeholder="Buscar ruta, origen o destino..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSitpPage(() => 0);
          }}
          className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-default-400"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-1">
        {[
          { id: "todas", icon: "list" },
          { id: "operando", icon: "check" },
          { id: "demora", icon: "alert" },
          { id: "cercanas", icon: "pin" },
          { id: "favoritas", icon: "star" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => { setFilter(f.id); setSitpPage(() => 0); }}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all capitalize flex items-center justify-center gap-1 ${filter === f.id ? "bg-primary/20 text-primary" : "text-default-400 hover:text-foreground"}`}
          >
            {f.icon === "star" && <Star size={10} />}
            {f.icon === "check" && <CheckCircle2 size={10} />}
            {f.icon === "alert" && <AlertCircle size={10} />}
            {f.icon === "list" && <List size={10} />}
            {f.icon === "pin" && <MapPin size={10} />}
            {f.id}
          </button>
        ))}
      </div>

      {/* Info */}
      <div className="flex items-center justify-between text-[10px] text-default-400 px-1">
        <span>
          {tab === "tm" ? filteredTm.length : filteredSitp.length} rutas
          encontradas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <Clock size={10} /> Tiempo real
        </span>
      </div>

      {/* List */}
      {/* Alerts list when filter=demora */}
      {filter === "demora" && alerts.items.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-warning font-medium px-1">⚠️ Alertas operacionales</p>
          {alerts.items.map((a, i) => (
            <a
              key={`alert-${i}`}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 rounded-lg bg-warning/10 border border-warning/20 hover:bg-warning/20 transition-colors"
            >
              <p className="text-[10px] text-warning font-medium leading-tight">{a.title.trim()}</p>
              <p className="text-[8px] text-warning/60 mt-0.5">Fuente: transmilenio.gov.co</p>
            </a>
          ))}
        </div>
      )}
      {filter === "demora" && alerts.items.length === 0 && (
        <p className="text-[10px] text-default-400 text-center py-4">Sin alertas de demora actualmente ✅</p>
      )}

      <div className="space-y-2 max-h-[calc(100vh-420px)] overflow-y-auto">
        {filter === "cercanas" && nearbyLoading && (
          <div className="flex items-center justify-center gap-2 py-4">
            <MapPin size={12} className="text-primary animate-pulse" />
            <span className="text-[10px] text-primary">Buscando rutas cercanas...</span>
          </div>
        )}
        {tab === "sitp" &&
          filteredSitp
            .slice(sitpPage * SITP_PAGE_SIZE, (sitpPage + 1) * SITP_PAGE_SIZE)
            .map((r) => (
              <button
                type="button"
                key={r.ruta}
                onClick={() => onSelectRuta(r)}
                className="cursor-pointer w-full text-left"
              >
                <GlassCard className="!p-3 hover:ring-1 hover:ring-primary/30 transition-all" style={{ borderLeft: `3px solid #${r.cenefa}` }}>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-sm font-bold px-2 py-0.5 rounded flex items-center gap-1 text-white"
                      style={{ backgroundColor: `#${r.cenefa}` }}
                    >
                      <img src="/icons/sitp-logo.svg" alt="" className="w-3.5 h-3.5 bg-white rounded-full p-px" />
                      {r.ruta}
                    </span>
                    {filter === "cercanas" && nearbyInfo.has(r.ruta) ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-primary/10 text-primary flex items-center gap-1">
                        <MapPin size={8} />
                        {nearbyInfo.get(r.ruta)!.distancia}m · {nearbyInfo.get(r.ruta)!.paradero}
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-default-100 text-default-600">
                        {r.paraderos.length} paradas
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-default-500">
                    {r.paraderos.length > 0 ? `${r.paraderos[0].nombre} → ${r.paraderos[r.paraderos.length - 1].nombre}` : ""}
                  </p>
                  {r.paraderos.length > 2 && (
                    <p className="text-[9px] text-default-400 mt-0.5">
                      Vía {r.paraderos[Math.floor(r.paraderos.length / 2)]?.nombre}
                    </p>
                  )}
                </GlassCard>
              </button>
            ))}
        {tab === "sitp" &&
          (() => {
            const totalPages = Math.ceil(filteredSitp.length / SITP_PAGE_SIZE);
            if (totalPages <= 1) return null;
            return (
              <div className="flex items-center justify-between py-2 px-1">
                <button
                  disabled={sitpPage === 0}
                  onClick={() => setSitpPage((p) => p - 1)}
                  className="text-[10px] px-2 py-1 rounded-lg bg-default-100 text-default-600 disabled:opacity-30"
                >
                  ← Anterior
                </button>
                <span className="text-[10px] text-default-400">
                  {sitpPage + 1} / {totalPages}
                </span>
                <button
                  disabled={sitpPage >= totalPages - 1}
                  onClick={() => setSitpPage((p) => p + 1)}
                  className="text-[10px] px-2 py-1 rounded-lg bg-default-100 text-default-600 disabled:opacity-30"
                >
                  Siguiente →
                </button>
              </div>
            );
          })()}
        {tab === "tm" && tmTroncales.length === 0 && !props.tmRutas?.length && (
          <p className="text-xs text-default-400 text-center py-4">
            No se encontraron rutas
          </p>
        )}
        {/* TM Rutas (J74, F51, etc.) */}
        {tab === "tm" && props.tmRutas && props.tmRutas.length > 0 && (() => {
          const busFilter = (filter === "todas" || filter === "cercanas" || filter === "demora" || filter === "operando" || filter === "favoritas") ? null : filter;
          const filtered = props.tmRutas.filter(r => {
            const matchSearch = !search || r.codigo.toLowerCase().includes(search.toLowerCase()) || r.origen.toLowerCase().includes(search.toLowerCase()) || r.destino.toLowerCase().includes(search.toLowerCase());
            const matchType = !busFilter || r.tipo_bus.toLowerCase() === busFilter;
            const matchNearby = filter !== "cercanas" || nearbyTmCodigos.includes(r.codigo);
            const matchDemora = filter !== "demora" || alerts.affectedCodes.some(c => r.codigo.includes(c));
            return matchSearch && matchType && matchNearby && matchDemora;
          });
          const pageSize = 15;
          const totalPages = Math.ceil(filtered.length / pageSize);
          const paged = filtered.slice(sitpPage * pageSize, (sitpPage + 1) * pageSize);
          return (
            <>
              {/* Sub-tabs tipo bus */}
              {filter !== "cercanas" && (
              <div className="flex gap-1 mt-2">
                {["todas", "articulado", "biarticulado", "dual"].map((t) => (
                  <button
                    key={t}
                    onClick={() => { setFilter(t); setSitpPage(() => 0); }}
                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-semibold transition-all capitalize ${filter === t ? "bg-emerald-500/20 text-emerald-500" : "text-default-400 hover:text-foreground"}`}
                  >
                    {t} {t !== "todas" ? `(${props.tmRutas!.filter(r => r.tipo_bus.toLowerCase() === t).length})` : `(${props.tmRutas!.length})`}
                  </button>
                ))}
              </div>
              )}

              <p className="text-[10px] text-default-400 px-1">
                {filtered.length} rutas
              </p>

              {paged.map((r) => {
                const tmColor = r.tipo_bus === "BIARTICULADO" ? "#E3342F" : r.tipo_bus === "ARTICULADO" ? "#F6993F" : "#38A169";
                return (
                <button
                  type="button"
                  key={`tmr-${r.codigo}`}
                  onClick={() => {
                    if (r.coords.length > 0) {
                      props.onSelectSitpRoute?.({
                        coords: r.coords as [number, number][],
                        stops: r.estaciones || [],
                      });
                    }
                    props.onSelectTmRuta?.(r);
                  }}
                  className="cursor-pointer w-full text-left"
                >
                  <GlassCard className="!p-3 hover:ring-1 hover:ring-emerald-500/30 transition-all" style={{ borderLeft: `3px solid ${tmColor}` }}>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-sm font-bold px-2 py-0.5 rounded flex items-center gap-1 text-white"
                        style={{ backgroundColor: tmColor }}
                      >
                        <img src="/icons/tm-logo.svg" alt="" className="w-3.5 h-3.5" />
                        {r.codigo}
                      </span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: `${tmColor}15`, color: tmColor }}
                      >
                        {filter === "cercanas" && nearbyInfo.has(r.codigo)
                          ? `📍 ${nearbyInfo.get(r.codigo)!.distancia}m`
                          : r.tipo_bus.toLowerCase()}
                      </span>
                    </div>
                    <p className="text-xs text-default-500">{r.origen} → {r.destino}</p>
                    <p className="text-[9px] text-default-400 mt-1">
                      L-V: {r.horario_lv} | Sáb: {r.horario_sab} | {r.estado}
                    </p>
                  </GlassCard>
                </button>
              );})}
              {totalPages > 1 && (
                <div className="flex items-center justify-between py-2 px-1">
                  <button
                    disabled={sitpPage === 0}
                    onClick={() => setSitpPage(() => Math.max(0, sitpPage - 1))}
                    className="text-[10px] px-2 py-1 rounded-lg bg-default-100 text-default-600 disabled:opacity-30"
                  >
                    ← Anterior
                  </button>
                  <span className="text-[10px] text-default-400">
                    {sitpPage + 1} / {totalPages}
                  </span>
                  <button
                    disabled={sitpPage >= totalPages - 1}
                    onClick={() => setSitpPage(() => Math.min(totalPages - 1, sitpPage + 1))}
                    className="text-[10px] px-2 py-1 rounded-lg bg-default-100 text-default-600 disabled:opacity-30"
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          );
        })()}
        {tab === "sitp" && sitpRutas.length === 0 && (
          <p className="text-xs text-default-400 text-center py-4">
            Cargando rutas SITP...
          </p>
        )}
      </div>
    </div>
  );
}
