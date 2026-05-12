import { useState } from 'react';
import { Navigation, Train, Bus, Car, Plus, X, Clock, ArrowRightLeft, Zap, Leaf, DollarSign, MapPin } from 'lucide-react';
import { GlassCard } from '@shared/ui/GlassCard';

type TransportMode = 'transmilenio' | 'sitp' | 'vehiculo';
type Preference = 'rapido' | 'economico' | 'ecologico';
type DepartureType = 'ahora' | 'programar';

const modes = [
  { id: 'transmilenio' as TransportMode, icon: Train, label: 'TM' },
  { id: 'sitp' as TransportMode, icon: Bus, label: 'SITP' },
  { id: 'vehiculo' as TransportMode, icon: Car, label: 'Carro' },
];

const preferences = [
  { id: 'rapido' as Preference, icon: Zap, label: 'Más rápido' },
  { id: 'economico' as Preference, icon: DollarSign, label: 'Más barato' },
  { id: 'ecologico' as Preference, icon: Leaf, label: 'Ecológico' },
];

export function PlanificarViajePanel() {
  const [mode, setMode] = useState<TransportMode>('transmilenio');
  const [preference, setPreference] = useState<Preference>('rapido');
  const [departureType, setDepartureType] = useState<DepartureType>('ahora');
  const [departureTime, setDepartureTime] = useState('');
  const [stops, setStops] = useState<string[]>(['', '']);
  const [searched, setSearched] = useState(false);

  const addStop = () => {
    const newStops = [...stops];
    newStops.splice(stops.length - 1, 0, '');
    setStops(newStops);
    setSearched(false);
  };

  const removeStop = (index: number) => {
    if (stops.length <= 2) return;
    setStops(stops.filter((_, i) => i !== index));
    setSearched(false);
  };

  const updateStop = (index: number, value: string) => {
    const newStops = [...stops];
    newStops[index] = value;
    setStops(newStops);
    setSearched(false);
  };

  const swapStops = () => {
    setStops([...stops].reverse());
    setSearched(false);
  };

  const canSearch = stops.every((s) => s.trim().length > 0);

  return (
    <div className="space-y-4">
      {/* Modo de transporte */}
      <div>
        <span className="text-[10px] uppercase tracking-wider text-default-400 mb-1.5 block">Modo de transporte</span>
        <div className="flex gap-1 bg-default-100 rounded-xl p-1">
          {modes.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => { setMode(m.id); setSearched(false); }}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg text-[10px] font-semibold transition-all ${
                  mode === m.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-default-500 hover:text-foreground'
                }`}
              >
                <Icon size={16} />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Paradas */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase tracking-wider text-default-400">Ruta</span>
          {stops.length === 2 && (
            <button onClick={swapStops} className="text-default-400 hover:text-primary transition-colors" title="Invertir ruta">
              <ArrowRightLeft size={14} />
            </button>
          )}
        </div>
        <div className="flex items-stretch gap-3">
          <div className="flex flex-col items-center py-2">
            {stops.map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full border-2 ${
                  i === 0 ? 'border-primary bg-primary/20' : i === stops.length - 1 ? 'border-danger bg-danger/20' : 'border-warning bg-warning/20'
                }`} />
                {i < stops.length - 1 && <div className="w-0.5 h-6 bg-default-200" />}
              </div>
            ))}
          </div>
          <div className="flex-1 space-y-2">
            {stops.map((stop, i) => (
              <div key={i} className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder={i === 0 ? 'Origen (ej. Portal Norte)' : i === stops.length - 1 ? 'Destino (ej. Universidades)' : `Parada ${i}`}
                  value={stop}
                  onChange={(e) => updateStop(i, e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-default-100 border border-divider text-sm outline-none text-foreground placeholder:text-default-400 focus:border-primary/50 transition-colors"
                />
                {stops.length > 2 && i > 0 && i < stops.length - 1 && (
                  <button onClick={() => removeStop(i)} className="w-7 h-7 rounded-lg flex items-center justify-center text-default-400 hover:text-danger hover:bg-danger/10 transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={addStop}
          className="w-full mt-2 py-1.5 rounded-xl border border-dashed border-divider text-[11px] text-default-400 hover:text-foreground hover:border-primary/50 flex items-center justify-center gap-1 transition-colors"
        >
          <Plus size={11} /> Agregar parada
        </button>
      </div>

      {/* Hora de salida */}
      <div>
        <span className="text-[10px] uppercase tracking-wider text-default-400 mb-1.5 block">Salida</span>
        <div className="flex gap-2">
          <button
            onClick={() => setDepartureType('ahora')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
              departureType === 'ahora' ? 'bg-primary/20 text-primary ring-1 ring-primary/50' : 'bg-default-100 text-default-500 hover:text-foreground'
            }`}
          >
            <Clock size={12} /> Ahora
          </button>
          <button
            onClick={() => setDepartureType('programar')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
              departureType === 'programar' ? 'bg-primary/20 text-primary ring-1 ring-primary/50' : 'bg-default-100 text-default-500 hover:text-foreground'
            }`}
          >
            <Clock size={12} /> Programar
          </button>
        </div>
        {departureType === 'programar' && (
          <input
            type="datetime-local"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            className="w-full mt-2 px-3 py-2 rounded-xl bg-default-100 border border-divider text-sm outline-none text-foreground focus:border-primary/50 transition-colors"
          />
        )}
      </div>

      {/* Preferencia */}
      <div>
        <span className="text-[10px] uppercase tracking-wider text-default-400 mb-1.5 block">Preferencia</span>
        <div className="flex gap-1">
          {preferences.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => setPreference(p.id)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-semibold flex items-center justify-center gap-1 transition-all ${
                  preference === p.id ? 'bg-primary/20 text-primary ring-1 ring-primary/50' : 'bg-default-100 text-default-500 hover:text-foreground'
                }`}
              >
                <Icon size={12} /> {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Buscar */}
      <button
        onClick={() => { if (canSearch) setSearched(true); }}
        disabled={!canSearch}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all active:scale-[0.98]"
      >
        <Navigation size={14} />
        Buscar ruta
      </button>

      {/* Resultado */}
      {searched && (
        <div className="space-y-3">
          <span className="text-[10px] uppercase tracking-wider text-default-400">Resultado — Predicción IA (GNN)</span>

          {/* Ruta principal */}
          <GlassCard>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Ruta recomendada</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/20 text-success font-medium">87% confianza</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-default-500 mb-3">
              <MapPin size={10} className="text-primary" />
              <span>{stops.filter(Boolean).join(' → ')}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-[10px] text-default-400">Tiempo</p>
                <p className="text-lg font-bold">{stops.length * 14} min</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-default-400">Distancia</p>
                <p className="text-lg font-bold">{(stops.length * 3.2).toFixed(1)} km</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-default-400">Costo</p>
                <p className="text-lg font-bold">${mode === 'transmilenio' || mode === 'sitp' ? '2,950' : '0'}</p>
              </div>
            </div>
          </GlassCard>

          {/* Detalles del trayecto */}
          <GlassCard>
            <span className="text-xs font-semibold mb-2 block">Detalle del trayecto</span>
            <div className="space-y-2">
              {stops.filter(Boolean).map((stop, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-primary' : i === stops.length - 1 ? 'bg-danger' : 'bg-warning'}`} />
                  <span className="text-xs text-foreground">{stop}</span>
                  {i < stops.filter(Boolean).length - 1 && (
                    <span className="text-[10px] text-default-400 ml-auto">{Math.round(Math.random() * 10 + 5)} min</span>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Congestión predicha */}
          <GlassCard>
            <span className="text-xs font-semibold mb-2 block">Congestión predicha (GNN)</span>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-default-100 overflow-hidden">
                <div className="h-full w-[62%] bg-gradient-to-r from-success via-warning to-danger rounded-full" />
              </div>
              <span className="text-xs font-bold text-warning">62%</span>
            </div>
            <p className="text-[10px] text-default-400 mt-1">Nivel medio — se recomienda salir 10 min antes</p>
          </GlassCard>

          {/* Alternativa */}
          <GlassCard className="opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold">Ruta alternativa</span>
                <p className="text-[10px] text-default-400">{stops.length * 18} min — Menos congestión</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">Ver</span>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
