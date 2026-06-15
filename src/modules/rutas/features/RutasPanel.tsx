import { API_URL } from "@/shared/config";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Train, Bus, Search, Clock, MapPin, AlertCircle } from "lucide-react";
import { GlassCard } from "@shared/ui/GlassCard";

type Tab = "tm" | "sitp";

export function RutasPanel({
  onFilterChange,
  onToggleSitp,
  showSitpOnMap,
  showTroncales,
  onToggleTroncales,
  showEstaciones,
  onToggleEstaciones,
  onSelectSitpRoute,
  onSelectTmRoute,
}: {
  onFilterChange?: (filter: "all" | "tm" | "sitp") => void;
  onToggleSitp?: () => void;
  showSitpOnMap?: boolean;
  showTroncales?: boolean;
  onToggleTroncales?: () => void;
  showEstaciones?: boolean;
  onToggleEstaciones?: () => void;
  onSelectSitpRoute?: (
    data: {
      coords: [number, number][];
      stops: { lat: number; lon: number; nombre: string }[];
    } | null,
  ) => void;
  onSelectTmRoute?: (troncal: string | null) => void;
}) {
  const [tab, setTab] = useState<Tab>("tm");
  const [sitpRutas, setSitpRutas] = useState<
    {
      ruta: string;
      cenefa: string;
      paraderos: { lat: number; lon: number; nombre: string }[];
    }[]
  >([]);
  const [selectedSitpRuta, setSelectedSitpRuta] = useState<string | null>(null);
  const [tmStations, setTmStations] = useState<string[]>([]);

  const [sitpPage, setSitpPage] = useState(0);
  const [tmTroncales, setTmTroncales] = useState<
    {
      id: string;
      nombre: string;
      troncal: string;
      origen: string;
      destino: string;
      estaciones: string[];
    }[]
  >([]);

  // Load TM troncales on mount
  if (tmTroncales.length === 0) {
    const prefix = "transmisig2.tecnica.estacion_troncal.";
    Promise.all([
      fetch("/data/tm_troncales.geojson").then((r) => r.json()),
      fetch("/data/tm_estaciones.geojson").then((r) => r.json()),
    ])
      .then(([tData, eData]) => {
        const stnsByTz: Record<string, string[]> = {};
        eData.features.forEach((f: any) => {
          const tid = f.properties[prefix + "id_trazado"] || "";
          const name = f.properties[prefix + "nom_est"] || "";
          if (tid) {
            if (!stnsByTz[tid]) stnsByTz[tid] = [];
            stnsByTz[tid].push(name);
          }
        });
        setTmTroncales(
          tData.features.map((f: any) => ({
            id: f.properties.id_trazado_troncal,
            nombre: f.properties.nombre_trazado_troncal,
            troncal: f.properties.troncal,
            origen: f.properties.origen_trazado || "",
            destino: f.properties.fin_trazado || "",
            estaciones: stnsByTz[f.properties.id_trazado_troncal] || [],
          })),
        );
      })
      .catch(() => {});
  }

  const SITP_PAGE_SIZE = 20;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("todas");
  const [selected, setSelected] = useState<any>(null);

  // API_URL from shared config

  const handleTab = (t: Tab) => {
    if (sitpRutas.length === 0) {
      fetch(API_URL + "/graph/sitp/rutas")
        .then((r) => r.json())
        .then((d) => setSitpRutas(d.rutas || []))
        .catch(() => {});
    }
    setTab(t);
    setSearch("");
    setFilter("todas");
    onFilterChange?.(t);
  };

  const alertCount = 0;

  // Vista detalle SITP
  if (tab === "sitp" && selectedSitpRuta) {
    const rutaData = sitpRutas.find((r) => r.ruta === selectedSitpRuta);
    if (rutaData) {
      return (
        <div className="space-y-3">
          <button
            onClick={() => {
              setSelectedSitpRuta(null);
              onSelectSitpRoute?.(null);
            }}
            className="text-xs text-primary hover:underline"
          >
            ← Volver
          </button>
          <GlassCard>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Bus size={16} className="text-primary" />
                <span className="text-lg font-bold">{rutaData.ruta}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {rutaData.paraderos.length} paradas
              </span>
            </div>
            <p className="text-xs text-default-500 mb-1">
              Cenefa: {rutaData.cenefa}
            </p>
            {rutaData.paraderos.length > 0 && (
              <p className="text-[11px] text-default-600">
                {rutaData.paraderos[0].nombre} →{" "}
                {rutaData.paraderos[rutaData.paraderos.length - 1].nombre}
              </p>
            )}
          </GlassCard>
          <GlassCard>
            <span className="text-xs font-semibold mb-2 block">
              Paradas del recorrido
            </span>
            <div className="space-y-1 max-h-[calc(100vh-350px)] overflow-y-auto">
              {rutaData.paraderos.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 py-1 border-b border-default-100 last:border-0"
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0 ${i === 0 ? "bg-success" : i === rutaData.paraderos.length - 1 ? "bg-danger" : "bg-blue-500"}`}
                  >
                    {i + 1}
                  </div>
                  <span className="text-[11px] text-default-600 truncate">
                    {p.nombre || "Parada " + (i + 1)}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      );
    }
  }

  // Vista detalle TM
  if (selected) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => {
            setSelected(null);
            onSelectTmRoute?.(null);
          }}
          className="text-xs text-primary hover:underline"
        >
          ← Volver
        </button>
        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Train size={16} className="text-primary" />
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
            {tmStations.map((name, i, arr) => (
              <div
                key={`station-${i}`}
                className="flex items-center gap-2 py-1"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-2.5 h-2.5 rounded-full border-2 ${i === 0 ? "border-success bg-success" : i === arr.length - 1 ? "border-danger bg-danger" : "border-default-300 bg-default-300"}`}
                  />
                  {i < arr.length - 1 && (
                    <div className="w-0.5 h-3 bg-default-200" />
                  )}
                </div>
                <span className="text-[11px] text-default-600">{name}</span>
                {i === 0 && (
                  <span className="text-[9px] text-success ml-auto">
                    Inicio
                  </span>
                )}
                {i === arr.length - 1 && (
                  <span className="text-[9px] text-danger ml-auto">Fin</span>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    );
  }

  // Vista lista
  return (
    <div className="space-y-3">
      {/* Map filter + Tabs */}
      <div className="flex gap-1 bg-default-100 rounded-xl p-1">
        <button
          onClick={() => {
            handleTab("tm");
          }}
          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all ${
            tab === "tm"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-default-500 hover:text-foreground"
          }`}
        >
          <Train size={14} /> TM
        </button>
        <button
          onClick={() => {
            handleTab("sitp");
          }}
          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all ${
            tab === "sitp"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-default-500 hover:text-foreground"
          }`}
        >
          <Bus size={14} /> SITP
        </button>
      </div>

      {/* System status summary */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="text-center p-2 rounded-lg bg-success/10">
          <p className="text-sm font-bold text-success">{tmTroncales.length}</p>
          <p className="text-[8px] text-success/70">Operando</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-warning/10">
          <p className="text-sm font-bold text-warning">{0}</p>
          <p className="text-[8px] text-warning/70">Con demora</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-danger/10">
          <p className="text-sm font-bold text-danger">{0}</p>
          <p className="text-[8px] text-danger/70">Suspendidas</p>
        </div>
      </div>

      {/* Alertas */}
      {alertCount > 0 && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-warning/10 border border-warning/20">
          <AlertCircle size={12} className="text-warning shrink-0" />
          <p className="text-[11px] text-warning">
            {alertCount} ruta{alertCount > 1 ? "s" : ""} con alertas activas
          </p>
        </div>
      )}

      {/* Capas en mapa */}
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
                />
                Troncales
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-default-600">
                <input
                  type="checkbox"
                  checked={!!showEstaciones}
                  onChange={() => onToggleEstaciones?.()}
                  className="w-3 h-3 rounded accent-emerald-400"
                />
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
              />
              Paraderos SITP
            </label>
          )}
        </div>
      </div>

      {/* Búsqueda */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-default-100 border border-divider">
        <Search size={14} className="text-default-400" />
        <input
          type="text"
          placeholder="Buscar ruta, origen o destino..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSitpPage(0);
          }}
          className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-default-400"
        />
      </div>

      {/* Filtros */}
      <div className="flex gap-1">
        {(["todas", "operando", "demora", "favoritas"] as string[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all capitalize ${
              filter === f
                ? "bg-primary/20 text-primary"
                : "text-default-400 hover:text-foreground"
            }`}
          >
            {f === "favoritas" ? "⭐" : ""} {f}
          </button>
        ))}
      </div>

      {/* Info */}
      <div className="flex items-center justify-between text-[10px] text-default-400 px-1">
        <span>
          {tab === "tm"
            ? tmTroncales.filter(
                (r) =>
                  !search ||
                  r.nombre.toLowerCase().includes(search.toLowerCase()) ||
                  r.troncal.toLowerCase().includes(search.toLowerCase()) ||
                  r.origen.toLowerCase().includes(search.toLowerCase()),
              ).length
            : sitpRutas.filter(
                (r) =>
                  !search ||
                  r.ruta.toLowerCase().includes(search.toLowerCase()) ||
                  r.cenefa.toLowerCase().includes(search.toLowerCase()),
              ).length}{" "}
          rutas encontradas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <Clock size={10} /> Tiempo real
        </span>
      </div>

      {/* Lista */}
      <div className="space-y-2 max-h-[calc(100vh-420px)] overflow-y-auto">
        {tab === "sitp" &&
          sitpRutas
            .filter(
              (r) =>
                !search ||
                r.ruta.toLowerCase().includes(search.toLowerCase()) ||
                r.cenefa.toLowerCase().includes(search.toLowerCase()),
            )
            .slice(sitpPage * SITP_PAGE_SIZE, (sitpPage + 1) * SITP_PAGE_SIZE)
            .map((r) => (
              <div
                key={r.ruta}
                onClick={() => {
                  setSelectedSitpRuta(r.ruta);
                  onSelectSitpRoute?.({
                    coords: r.paraderos.map(
                      (p) => [p.lat, p.lon] as [number, number],
                    ),
                    stops: r.paraderos,
                  });
                }}
                className="cursor-pointer"
              >
                <GlassCard
                  className={`!p-3 hover:ring-1 hover:ring-primary/30 transition-all border-l-2 ${selectedSitpRuta === r.ruta ? "border-l-primary ring-1 ring-primary/30" : "border-l-blue-400"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-primary">
                      {r.ruta}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {r.paraderos.length} paradas
                    </span>
                  </div>
                  <p className="text-xs text-default-500">{r.cenefa}</p>
                  {r.paraderos.length > 0 && (
                    <p className="text-[9px] text-default-400 mt-1">
                      {r.paraderos[0].nombre} →{" "}
                      {r.paraderos[r.paraderos.length - 1].nombre}
                    </p>
                  )}
                </GlassCard>
              </div>
            ))}
        {tab === "sitp" &&
          sitpRutas.length > 0 &&
          (() => {
            const filtered = sitpRutas.filter(
              (r) =>
                !search ||
                r.ruta.toLowerCase().includes(search.toLowerCase()) ||
                r.cenefa.toLowerCase().includes(search.toLowerCase()),
            );
            const totalPages = Math.ceil(filtered.length / SITP_PAGE_SIZE);
            return totalPages > 1 ? (
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
            ) : null;
          })()}
        {tab === "tm" &&
          tmTroncales
            .filter(
              (r) =>
                !search ||
                r.nombre.toLowerCase().includes(search.toLowerCase()) ||
                r.troncal.toLowerCase().includes(search.toLowerCase()) ||
                r.origen.toLowerCase().includes(search.toLowerCase()),
            )
            .map((r) => (
              <div
                key={r.id}
                onClick={() => {
                  onSelectTmRoute?.(r.troncal);
                  setTmStations(r.estaciones);
                  setSelected({
                    id: r.id,
                    origen: r.origen,
                    destino: r.destino,
                    estado: "Operando",
                    frecuencia: "—",
                    estaciones: r.estaciones.length,
                    demanda: "—",
                    pasajerosDia: "—",
                    horario: "4:30 AM - 11:00 PM",
                    troncal: r.troncal,
                  } as any);
                }}
                className="cursor-pointer"
              >
                <GlassCard className="!p-3 hover:ring-1 hover:ring-primary/30 transition-all border-l-2 border-l-red-500">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-primary">
                      {r.nombre}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                      {r.estaciones.length} est.
                    </span>
                  </div>
                  <p className="text-xs text-default-500">
                    {r.origen} → {r.destino}
                  </p>
                  <p className="text-[9px] text-default-400 mt-1">
                    Troncal: {r.troncal}
                  </p>
                </GlassCard>
              </div>
            ))}
        {tab === "tm" && tmTroncales.length === 0 && (
          <p className="text-xs text-default-400 text-center py-4">
            No se encontraron rutas
          </p>
        )}
        {tab === "sitp" && sitpRutas.length === 0 && (
          <p className="text-xs text-default-400 text-center py-4">
            Cargando rutas SITP...
          </p>
        )}
      </div>
    </div>
  );
}
