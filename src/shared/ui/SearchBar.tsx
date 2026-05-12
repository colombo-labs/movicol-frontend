import { Search, Navigation, X, Route } from 'lucide-react';
import { useState } from 'react';

export function SearchBar() {
  const [showRoute, setShowRoute] = useState(false);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-md">
      {!showRoute ? (
        <div className="flex items-center gap-2 px-4 py-3 rounded-full bg-background/95 backdrop-blur-xl border border-divider shadow-lg">
          <Search size={18} className="text-default-400 shrink-0" />
          <input
            type="text"
            placeholder="¿A dónde quieres ir?"
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-default-400"
            onFocus={() => setShowRoute(true)}
          />
          <button
            onClick={() => setShowRoute(true)}
            className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0"
            title="Agregar ruta"
          >
            <Route size={14} className="text-primary" />
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-background/95 backdrop-blur-xl border border-divider shadow-lg p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-default-500">Planificar ruta</span>
            <button onClick={() => { setShowRoute(false); setOrigin(''); setDestination(''); }} className="text-default-400 hover:text-foreground">
              <X size={14} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <div className="w-3 h-3 rounded-full border-2 border-primary bg-primary/20" />
              <div className="w-0.5 h-6 bg-default-200" />
              <div className="w-3 h-3 rounded-full border-2 border-danger bg-danger/20" />
            </div>
            <div className="flex-1 space-y-2">
              <input
                type="text"
                placeholder="Origen (ej. Portal Norte)"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-default-100 border border-divider text-sm outline-none text-foreground placeholder:text-default-400 focus:border-primary/50"
              />
              <input
                type="text"
                placeholder="Destino (ej. Universidades)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-default-100 border border-divider text-sm outline-none text-foreground placeholder:text-default-400 focus:border-primary/50"
              />
            </div>
          </div>

          <button
            disabled={!origin || !destination}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          >
            <Navigation size={14} />
            Buscar ruta
          </button>
        </div>
      )}
    </div>
  );
}
