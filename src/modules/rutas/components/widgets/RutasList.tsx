/* eslint-disable @typescript-eslint/no-explicit-any */
import { Train, Bus, Search, Clock } from "lucide-react";
import { GlassCard } from "@shared/ui/GlassCard";
import type {
  SitpRuta,
  TmTroncal,
  Tab,
  RutasPanelProps,
} from "../../models/types";

const SITP_PAGE_SIZE = 20;

interface Props extends RutasPanelProps {
  readonly tab: Tab;
  readonly tmTroncales: TmTroncal[];
  readonly sitpRutas: SitpRuta[];
  readonly search: string;
  readonly setSearch: (s: string) => void;
  readonly filter: string;
  readonly setFilter: (f: string) => void;
  readonly sitpPage: number;
  readonly setSitpPage: (fn: (p: number) => number) => void;
  readonly onSelectRuta: (ruta: SitpRuta) => void;
  readonly onSelectTm: (troncal: TmTroncal) => void;
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
    onSelectTm,
    handleTab,
    onFilterChange,
    showTroncales,
    onToggleTroncales,
    showEstaciones,
    onToggleEstaciones,
    showSitpOnMap,
    onToggleSitp,
  } = props;

  const filteredTm = tmTroncales.filter(
    (r) =>
      !search ||
      r.nombre.toLowerCase().includes(search.toLowerCase()) ||
      r.troncal.toLowerCase().includes(search.toLowerCase()) ||
      r.origen.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredSitp = sitpRutas.filter(
    (r) =>
      !search ||
      r.ruta.toLowerCase().includes(search.toLowerCase()) ||
      r.cenefa.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex gap-1 bg-default-100 rounded-xl p-1">
        <button
          onClick={() => handleTab("tm", onFilterChange)}
          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all ${tab === "tm" ? "bg-primary text-primary-foreground shadow-sm" : "text-default-500 hover:text-foreground"}`}
        >
          <Train size={14} /> TM
        </button>
        <button
          onClick={() => handleTab("sitp", onFilterChange)}
          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all ${tab === "sitp" ? "bg-primary text-primary-foreground shadow-sm" : "text-default-500 hover:text-foreground"}`}
        >
          <Bus size={14} /> SITP
        </button>
      </div>

      {/* Status */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="text-center p-2 rounded-lg bg-success/10">
          <p className="text-sm font-bold text-success">{tmTroncales.length}</p>
          <p className="text-[8px] text-success/70">Operando</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-warning/10">
          <p className="text-sm font-bold text-warning">0</p>
          <p className="text-[8px] text-warning/70">Con demora</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-danger/10">
          <p className="text-sm font-bold text-danger">0</p>
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
        {["todas", "operando", "demora", "favoritas"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all capitalize ${filter === f ? "bg-primary/20 text-primary" : "text-default-400 hover:text-foreground"}`}
          >
            {f === "favoritas" ? "⭐" : ""} {f}
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
      <div className="space-y-2 max-h-[calc(100vh-420px)] overflow-y-auto">
        {tab === "sitp" &&
          filteredSitp
            .slice(sitpPage * SITP_PAGE_SIZE, (sitpPage + 1) * SITP_PAGE_SIZE)
            .map((r) => (
              <div
                key={r.ruta}
                onClick={() => onSelectRuta(r)}
                className="cursor-pointer"
              >
                <GlassCard className="!p-3 hover:ring-1 hover:ring-primary/30 transition-all border-l-2 border-l-blue-400">
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
        {tab === "tm" &&
          filteredTm.map((r) => (
            <div
              key={r.id}
              onClick={() => onSelectTm(r)}
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
