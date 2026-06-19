import {
  Navigation,
  Bell,
  Share2,
  MapPinned,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { GlassCard } from "@shared/ui/GlassCard";
import type { RoutePrediction } from "@modules/predicciones/models";
import type { TripPoint } from "@/app/Layout";
import type { TransportMode } from "../../models/types";

export function ActionButtons({
  prediction,
  tripPoints,
  onClear,
}: {
  readonly prediction: RoutePrediction;
  readonly tripPoints: TripPoint[];
  readonly onClear: () => void;
}) {
  return (
    <>
      <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.95] shadow-lg shadow-primary/30">
        <Navigation size={14} className="animate-pulse" /> Iniciar navegación
      </button>
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (navigator.share)
              navigator.share({
                title: "Mi ruta MoviCol",
                text: `Ruta de ${Math.round(prediction.total_time_minutes)} min`,
                url: globalThis.location.href,
              });
          }}
          className="flex-1 py-2 rounded-lg border border-divider text-[10px] font-medium text-default-500 hover:bg-default-100 transition-all flex items-center justify-center gap-1"
        >
          Compartir
        </button>
        <button
          onClick={() => {
            const saved = JSON.parse(
              localStorage.getItem("movicol_saved_routes") || "[]",
            );
            saved.unshift({
              origin: tripPoints[0]?.label,
              dest: tripPoints.slice(-1)[0]?.label,
              time: Math.round(prediction.total_time_minutes),
              date: new Date().toLocaleDateString(),
            });
            localStorage.setItem(
              "movicol_saved_routes",
              JSON.stringify(saved.slice(0, 5)),
            );
          }}
          className="flex-1 py-2 rounded-lg border border-divider text-[10px] font-medium text-default-500 hover:bg-default-100 transition-all flex items-center justify-center gap-1"
        >
          Guardar
        </button>
        <button
          onClick={onClear}
          className="flex-1 py-2 rounded-lg border border-danger/30 text-[10px] font-medium text-danger hover:bg-danger/10 transition-all flex items-center justify-center gap-1"
        >
          Nueva
        </button>
      </div>
    </>
  );
}

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-default-100 border border-divider/50 text-[10px] text-foreground hover:bg-default-200 transition-all">
        <Bell size={12} className="text-default-500" /> Alarma de bajada
      </button>
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-default-100 border border-divider/50 text-[10px] text-foreground hover:bg-default-200 transition-all">
        <Share2 size={12} className="text-default-500" /> Compartir en vivo
      </button>
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-default-100 border border-divider/50 text-[10px] text-foreground hover:bg-default-200 transition-all">
        <AlertCircle size={12} className="text-warning" /> Reportar incidencia
      </button>
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-default-100 border border-divider/50 text-[10px] text-foreground hover:bg-default-200 transition-all">
        <MapPinned size={12} className="text-default-500" /> Ver mapa completo
      </button>
    </div>
  );
}

export function NearDestination() {
  const places = [
    { name: "Café", dist: "50m" },
    { name: "Cajero", dist: "120m" },
    { name: "Tienda", dist: "80m" },
    { name: "Bici TM", dist: "30m" },
  ];
  return (
    <GlassCard>
      <span className="text-[10px] font-semibold mb-1.5 block">
        Cerca de tu destino
      </span>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {places.map((p) => (
          <div
            key={p.name}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg bg-default-100 min-w-[52px]"
          >
            <MapPin size={12} className="text-primary" />
            <span className="text-[8px] text-foreground font-medium">
              {p.name}
            </span>
            <span className="text-[8px] text-default-400">{p.dist}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export function TravelTips({ mode }: { readonly mode: TransportMode }) {
  const hour = new Date().getHours();
  let tip: string;
  if (hour < 10)
    tip = "En la mañana, los vagones traseros suelen ir menos llenos.";
  else if (hour < 16)
    tip = "A esta hora el servicio es más frecuente. Buen momento para viajar.";
  else
    tip =
      "En hora pico, considera usar las puertas centrales para subir más rápido.";

  return (
    <>
      <div className="px-3 py-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
        <p className="text-[9px] text-blue-600">
          <strong>Tip:</strong> {tip}
        </p>
      </div>
      {(hour >= 19 || hour < 5) && (
        <div className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <p className="text-[9px] text-purple-600">
            <strong>Viaje nocturno:</strong> Mantente en zonas iluminadas. El
            último servicio sale a las 11:00 PM.
          </p>
        </div>
      )}
      <div className="flex items-center justify-between px-2 py-2 rounded-lg bg-default-100/50">
        <p className="text-[9px] text-default-400">¿Te fue útil esta ruta?</p>
        <div className="flex gap-2">
          <button className="text-[16px] hover:scale-125 transition-transform">
            👍
          </button>
          <button className="text-[16px] hover:scale-125 transition-transform">
            👎
          </button>
        </div>
      </div>
      {mode !== "vehiculo" && <TuLlaveCard />}
    </>
  );
}

function TuLlaveCard() {
  return (
    <GlassCard>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-5 rounded bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
            <span className="text-[7px] font-bold text-white">TL</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold">Tarjeta TuLlave</p>
            <p className="text-[9px] text-default-400">
              Saldo estimado después del viaje
            </p>
          </div>
        </div>
        <p className="text-sm font-bold text-success">$12,050</p>
      </div>
    </GlassCard>
  );
}
