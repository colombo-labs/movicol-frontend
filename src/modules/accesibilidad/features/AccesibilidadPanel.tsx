import { useState, useEffect } from "react";
import { GlassCard } from "@shared/ui/GlassCard";
import { Accessibility, MapPin, Bus, Train } from "lucide-react";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

interface AccData {
  totalParaderos: number;
  totalRutas: number;
  rutasTroncales: number;
  rutasZonales: number;
  totalPuntos: number;
  cobertura: number;
  areaCubierta: number;
  areaBogota: number;
}

export function AccesibilidadPanel() {
  const [data, setData] = useState<AccData | null>(null);

  useEffect(() => {
    fetch(`${API}/graph/accesibilidad`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data)
    return (
      <div className="text-center py-8 text-xs text-default-400">
        Cargando datos...
      </div>
    );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Accessibility size={16} className="text-primary" />
          <p className="text-xs text-default-400">Cobertura del sistema</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-default-400">Cobertura</p>
          <p className="text-sm font-bold text-primary">
            {data.cobertura}
            <span className="text-[9px] text-default-400">%</span>
          </p>
        </div>
      </div>

      <GlassCard>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-default-400 uppercase tracking-wider">
            Cobertura urbana
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
            {data.areaCubierta} km² / {data.areaBogota} km²
          </span>
        </div>
        <div className="flex items-end gap-3">
          <p className="text-3xl font-bold">
            {data.cobertura}
            <span className="text-sm text-default-400">%</span>
          </p>
          <div className="flex-1">
            <div className="h-2 rounded-full bg-default-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-success rounded-full"
                style={{ width: `${data.cobertura}%` }}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <span className="text-[10px] text-default-400 uppercase tracking-wider mb-2 block">
          Infraestructura del sistema
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-default-100 text-center">
            <MapPin size={14} className="text-blue-500 mx-auto mb-1" />
            <p className="text-lg font-bold">
              {data.totalParaderos.toLocaleString()}
            </p>
            <p className="text-[9px] text-default-400">Paraderos SITP</p>
          </div>
          <div className="p-2 rounded-lg bg-default-100 text-center">
            <Bus size={14} className="text-green-500 mx-auto mb-1" />
            <p className="text-lg font-bold">{data.totalRutas}</p>
            <p className="text-[9px] text-default-400">Rutas totales</p>
          </div>
          <div className="p-2 rounded-lg bg-default-100 text-center">
            <Train size={14} className="text-red-500 mx-auto mb-1" />
            <p className="text-lg font-bold">{data.rutasTroncales}</p>
            <p className="text-[9px] text-default-400">Rutas troncales</p>
          </div>
          <div className="p-2 rounded-lg bg-default-100 text-center">
            <Bus size={14} className="text-yellow-500 mx-auto mb-1" />
            <p className="text-lg font-bold">{data.rutasZonales}</p>
            <p className="text-[9px] text-default-400">Rutas zonales</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <span className="text-[10px] text-default-400 uppercase tracking-wider mb-2 block">
          Puntos de servicio
        </span>
        <div className="flex items-end gap-3">
          <p className="text-2xl font-bold">
            {data.totalPuntos.toLocaleString()}
          </p>
          <p className="text-[10px] text-default-400">
            paradas activas en el sistema integrado
          </p>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-default-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 rounded-full"
            style={{ width: "100%" }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[8px] text-default-300">
          <span>Troncales</span>
          <span>Alimentadoras</span>
          <span>Zonales</span>
        </div>
      </GlassCard>

      <GlassCard>
        <span className="text-[10px] text-default-400 uppercase tracking-wider mb-2 block">
          Tarifa integrada
        </span>
        <p className="text-lg font-bold">
          $3,550{" "}
          <span className="text-[10px] text-default-400 font-normal">COP</span>
        </p>
        <p className="text-[10px] text-default-500 mt-1">
          Tarjeta TuLlave — Válida en todo el sistema (TM + SITP)
        </p>
      </GlassCard>
    </div>
  );
}
