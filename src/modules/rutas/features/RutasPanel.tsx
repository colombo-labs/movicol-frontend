import { useState } from 'react';
import { Train, Bus, Search, Clock, MapPin, Users, Star, AlertCircle, ChevronRight } from 'lucide-react';
import { GlassCard } from '@shared/ui/GlassCard';

type Tab = 'tm' | 'sitp';
type FilterType = 'todas' | 'operando' | 'demora' | 'favoritas';

interface Ruta {
  id: string;
  origen: string;
  destino: string;
  estado: 'Operando' | 'Demora' | 'Suspendida';
  frecuencia: string;
  estaciones: number;
  demanda: 'Alta' | 'Media' | 'Baja';
  pasajerosDia: string;
  horario: string;
  alerta?: string;
}

const rutasTM: Ruta[] = [
  { id: 'B23', origen: 'Portal Norte', destino: 'Portal Sur', estado: 'Operando', frecuencia: '3 min', estaciones: 28, demanda: 'Alta', pasajerosDia: '45,000', horario: '4:30 AM - 11:00 PM' },
  { id: 'J24', origen: 'Portal Norte', destino: 'Portal Américas', estado: 'Operando', frecuencia: '4 min', estaciones: 22, demanda: 'Alta', pasajerosDia: '38,000', horario: '4:30 AM - 11:00 PM' },
  { id: 'J74', origen: 'Portal 80', destino: 'Portal Sur', estado: 'Operando', frecuencia: '5 min', estaciones: 19, demanda: 'Alta', pasajerosDia: '42,000', horario: '4:30 AM - 11:00 PM' },
  { id: 'M80', origen: 'Portal 80', destino: 'Museo Nacional', estado: 'Demora', frecuencia: '8 min', estaciones: 12, demanda: 'Media', pasajerosDia: '22,000', horario: '5:00 AM - 10:30 PM', alerta: 'Demora por obras en Av. Caracas' },
  { id: 'K23', origen: 'Portal Américas', destino: 'Calle 72', estado: 'Operando', frecuencia: '6 min', estaciones: 15, demanda: 'Media', pasajerosDia: '28,000', horario: '4:30 AM - 11:00 PM' },
  { id: 'H13', origen: 'Portal Tunal', destino: 'Portal Norte', estado: 'Operando', frecuencia: '4 min', estaciones: 24, demanda: 'Alta', pasajerosDia: '40,000', horario: '4:30 AM - 11:00 PM' },
  { id: 'F14', origen: 'Portal Eldorado', destino: 'Portal 80', estado: 'Operando', frecuencia: '5 min', estaciones: 10, demanda: 'Baja', pasajerosDia: '15,000', horario: '5:00 AM - 10:00 PM' },
  { id: 'G12', origen: 'Portal Suba', destino: 'Portal 20 de Julio', estado: 'Suspendida', frecuencia: '—', estaciones: 20, demanda: 'Baja', pasajerosDia: '0', horario: 'Suspendida', alerta: 'Fuera de servicio por mantenimiento' },
  { id: 'D70', origen: 'Portal Américas', destino: 'Calle 76', estado: 'Operando', frecuencia: '7 min', estaciones: 18, demanda: 'Media', pasajerosDia: '25,000', horario: '4:30 AM - 11:00 PM' },
  { id: 'L10', origen: 'Portal Tunal', destino: 'Portal Suba', estado: 'Demora', frecuencia: '10 min', estaciones: 30, demanda: 'Alta', pasajerosDia: '35,000', horario: '4:30 AM - 11:00 PM', alerta: 'Frecuencia reducida por accidente' },
];

const rutasSITP: Ruta[] = [
  { id: '120', origen: 'Usaquén', destino: 'Kennedy', estado: 'Operando', frecuencia: '8 min', estaciones: 34, demanda: 'Alta', pasajerosDia: '12,000', horario: '4:00 AM - 11:00 PM' },
  { id: '803', origen: 'Suba', destino: 'Centro', estado: 'Operando', frecuencia: '10 min', estaciones: 28, demanda: 'Media', pasajerosDia: '9,500', horario: '4:30 AM - 10:30 PM' },
  { id: '291', origen: 'Engativá', destino: 'Chapinero', estado: 'Demora', frecuencia: '15 min', estaciones: 22, demanda: 'Media', pasajerosDia: '8,000', horario: '4:30 AM - 10:00 PM', alerta: 'Desvío por cierre vial en Calle 80' },
  { id: '540', origen: 'Fontibón', destino: 'Usme', estado: 'Operando', frecuencia: '12 min', estaciones: 40, demanda: 'Baja', pasajerosDia: '6,500', horario: '4:00 AM - 10:30 PM' },
  { id: '166', origen: 'Bosa', destino: 'Suba', estado: 'Operando', frecuencia: '9 min', estaciones: 38, demanda: 'Alta', pasajerosDia: '11,000', horario: '4:00 AM - 11:00 PM' },
  { id: '735', origen: 'Ciudad Bolívar', destino: 'Chapinero', estado: 'Operando', frecuencia: '11 min', estaciones: 30, demanda: 'Media', pasajerosDia: '7,800', horario: '4:30 AM - 10:00 PM' },
  { id: '18-3', origen: 'Soacha', destino: 'Portal Américas', estado: 'Operando', frecuencia: '7 min', estaciones: 15, demanda: 'Alta', pasajerosDia: '14,000', horario: '4:00 AM - 11:00 PM' },
  { id: '444', origen: 'Usme', destino: 'Portal Norte', estado: 'Demora', frecuencia: '18 min', estaciones: 45, demanda: 'Media', pasajerosDia: '8,200', horario: '4:00 AM - 10:00 PM', alerta: 'Alta congestión en hora pico' },
];

function estadoColor(estado: Ruta['estado']) {
  if (estado === 'Operando') return 'bg-success/20 text-success';
  if (estado === 'Demora') return 'bg-warning/20 text-warning';
  return 'bg-danger/20 text-danger';
}

function demandaColor(demanda: Ruta['demanda']) {
  if (demanda === 'Alta') return 'text-danger';
  if (demanda === 'Media') return 'text-warning';
  return 'text-success';
}

export function RutasPanel() {
  const [tab, setTab] = useState<Tab>('tm');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('todas');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['B23', 'J74', '120']));
  const [selected, setSelected] = useState<Ruta | null>(null);

  const toggleFavorite = (id: string) => {
    const next = new Set(favorites);
    next.has(id) ? next.delete(id) : next.add(id);
    setFavorites(next);
  };

  const allRutas = tab === 'tm' ? rutasTM : rutasSITP;
  const rutas = allRutas.filter((r) => {
    const matchSearch = !search || r.id.toLowerCase().includes(search.toLowerCase()) || r.origen.toLowerCase().includes(search.toLowerCase()) || r.destino.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'todas' || (filter === 'operando' && r.estado === 'Operando') || (filter === 'demora' && r.estado !== 'Operando') || (filter === 'favoritas' && favorites.has(r.id));
    return matchSearch && matchFilter;
  });

  const alertCount = allRutas.filter((r) => r.alerta).length;

  // Vista detalle
  if (selected) {
    return (
      <div className="space-y-3">
        <button onClick={() => setSelected(null)} className="text-xs text-primary hover:underline">← Volver</button>
        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {tab === 'tm' ? <Train size={16} className="text-primary" /> : <Bus size={16} className="text-primary" />}
              <span className="text-lg font-bold">{selected.id}</span>
              <button onClick={() => toggleFavorite(selected.id)} className="text-default-400 hover:text-warning transition-colors">
                <Star size={14} fill={favorites.has(selected.id) ? 'currentColor' : 'none'} className={favorites.has(selected.id) ? 'text-warning' : ''} />
              </button>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${estadoColor(selected.estado)}`}>{selected.estado}</span>
          </div>
          {selected.alerta && (
            <div className="flex items-start gap-2 p-2 rounded-lg bg-warning/10 border border-warning/20 mb-3">
              <AlertCircle size={12} className="text-warning mt-0.5 shrink-0" />
              <p className="text-[11px] text-warning">{selected.alerta}</p>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs mb-3">
            <MapPin size={12} className="text-primary" />
            <span>{selected.origen} → {selected.destino}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-default-100 text-center">
              <p className="text-[10px] text-default-400">Frecuencia</p>
              <p className="text-sm font-bold">{selected.frecuencia}</p>
            </div>
            <div className="p-2 rounded-lg bg-default-100 text-center">
              <p className="text-[10px] text-default-400">Estaciones</p>
              <p className="text-sm font-bold">{selected.estaciones}</p>
            </div>
            <div className="p-2 rounded-lg bg-default-100 text-center">
              <p className="text-[10px] text-default-400">Pasajeros/día</p>
              <p className="text-sm font-bold">{selected.pasajerosDia}</p>
            </div>
            <div className="p-2 rounded-lg bg-default-100 text-center">
              <p className="text-[10px] text-default-400">Demanda</p>
              <p className={`text-sm font-bold ${demandaColor(selected.demanda)}`}>{selected.demanda}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <span className="text-xs font-semibold mb-2 block">Recorrido ({selected.estaciones} estaciones)</span>
          <div className="space-y-0 max-h-40 overflow-y-auto">
            {Array.from({ length: selected.estaciones }, (_, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full border-2 ${i === 0 ? 'border-primary bg-primary' : i === selected.estaciones - 1 ? 'border-danger bg-danger' : 'border-default-300 bg-default-300'}`} />
                  {i < selected.estaciones - 1 && <div className="w-0.5 h-3 bg-default-200" />}
                </div>
                <span className="text-[11px] text-default-500">Estación {i + 1}</span>
                {i === 0 && <span className="text-[9px] text-primary ml-auto">Inicio</span>}
                {i === selected.estaciones - 1 && <span className="text-[9px] text-danger ml-auto">Fin</span>}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <span className="text-xs font-semibold mb-1 block">Horario</span>
          <p className="text-xs text-default-500">{selected.horario}</p>
        </GlassCard>

        <GlassCard>
          <span className="text-xs font-semibold mb-1 block">Tarifa</span>
          <p className="text-xs text-default-500">{tab === 'tm' ? '$2,950 COP (tarjeta TuLlave)' : '$2,650 COP (tarjeta TuLlave)'}</p>
        </GlassCard>

        <button className="w-full py-2.5 rounded-xl bg-primary/20 text-primary text-xs font-semibold hover:bg-primary/30 transition-colors">
          Ver en el mapa
        </button>
      </div>
    );
  }

  // Vista lista
  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex gap-1 bg-default-100 rounded-xl p-1">
        <button
          onClick={() => { setTab('tm'); setSearch(''); setFilter('todas'); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            tab === 'tm' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-default-500 hover:text-foreground'
          }`}
        >
          <Train size={14} /> TransMilenio
        </button>
        <button
          onClick={() => { setTab('sitp'); setSearch(''); setFilter('todas'); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            tab === 'sitp' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-default-500 hover:text-foreground'
          }`}
        >
          <Bus size={14} /> SITP
        </button>
      </div>

      {/* Alertas */}
      {alertCount > 0 && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-warning/10 border border-warning/20">
          <AlertCircle size={12} className="text-warning shrink-0" />
          <p className="text-[11px] text-warning">{alertCount} ruta{alertCount > 1 ? 's' : ''} con alertas activas</p>
        </div>
      )}

      {/* Búsqueda */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-default-100 border border-divider">
        <Search size={14} className="text-default-400" />
        <input
          type="text"
          placeholder="Buscar ruta, origen o destino..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-default-400"
        />
      </div>

      {/* Filtros */}
      <div className="flex gap-1">
        {(['todas', 'operando', 'demora', 'favoritas'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all capitalize ${
              filter === f ? 'bg-primary/20 text-primary' : 'text-default-400 hover:text-foreground'
            }`}
          >
            {f === 'favoritas' ? '⭐' : ''} {f}
          </button>
        ))}
      </div>

      {/* Info */}
      <div className="flex items-center justify-between text-[10px] text-default-400 px-1">
        <span>{rutas.length} rutas</span>
        <span className="flex items-center gap-1"><Clock size={10} /> En vivo</span>
      </div>

      {/* Lista */}
      <div className="space-y-2 max-h-[calc(100vh-420px)] overflow-y-auto">
        {rutas.map((r) => (
          <div key={r.id} onClick={() => setSelected(r)} className="cursor-pointer">
            <GlassCard className="!p-3 hover:ring-1 hover:ring-primary/30 transition-all">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-primary">{r.id}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${estadoColor(r.estado)}`}>{r.estado}</span>
                  {favorites.has(r.id) && <Star size={10} className="text-warning" fill="currentColor" />}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-default-400 flex items-center gap-0.5"><Clock size={9} />{r.frecuencia}</span>
                  <ChevronRight size={12} className="text-default-300" />
                </div>
              </div>
              <p className="text-xs text-default-500">{r.origen} → {r.destino}</p>
              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-default-400">
                <span className="flex items-center gap-0.5"><MapPin size={9} />{r.estaciones} est.</span>
                <span className={`flex items-center gap-0.5 ${demandaColor(r.demanda)}`}><Users size={9} />{r.demanda}</span>
                {r.alerta && <span className="flex items-center gap-0.5 text-warning"><AlertCircle size={9} />Alerta</span>}
              </div>
            </GlassCard>
          </div>
        ))}
        {rutas.length === 0 && (
          <p className="text-xs text-default-400 text-center py-4">No se encontraron rutas</p>
        )}
      </div>
    </div>
  );
}
