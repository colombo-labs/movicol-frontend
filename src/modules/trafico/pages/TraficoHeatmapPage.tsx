import { Flame } from "lucide-react";
import {
  MapContainer,
  CircleMarker,
  Popup,
  TileLayer,
  ZoomControl,
} from "react-leaflet";
import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@shared/hooks/useTheme";
import { GlassCard } from "@shared/ui/GlassCard";
import { api } from "@shared/api/http-client";
import "leaflet/dist/leaflet.css";

const tiles = {
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
};

interface HeatmapPoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  congestion: number;
  risk: "low" | "medium" | "high" | "critical";
}

const RISK_COLORS: Record<string, string> = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
};

/**
 * Módulo TRÁFICO — Heatmap de congestión GNN.
 * Muestra predicciones del modelo GAT para todas las estaciones a una hora dada.
 */
export function TraficoHeatmapPage() {
  const { theme } = useTheme();
  const [points, setPoints] = useState<HeatmapPoint[]>([]);
  const [hour, setHour] = useState(new Date().getHours());
  const [isLoading, setIsLoading] = useState(false);

  const fetchHeatmap = useCallback(async (h: number) => {
    setIsLoading(true);
    try {
      const data = await api.get<HeatmapPoint[]>(`/graph/heatmap?hour=${h}`);
      setPoints(data);
    } catch {
      setPoints([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeatmap(hour);
  }, [hour, fetchHeatmap]);

  const stats = {
    critical: points.filter((p) => p.risk === "critical").length,
    high: points.filter((p) => p.risk === "high").length,
    medium: points.filter((p) => p.risk === "medium").length,
    low: points.filter((p) => p.risk === "low").length,
  };

  return (
    <div className="flex h-full">
      {/* Panel */}
      <div className="w-[320px] h-full overflow-y-auto border-r border-white/10 p-4">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Flame size={18} className="text-danger" /> Congestión GNN
        </h2>

        {/* Hour selector */}
        <GlassCard className="mb-4">
          <label className="text-xs text-default-400 block mb-2">
            Hora de predicción
          </label>
          <input
            type="range"
            min={0}
            max={23}
            value={hour}
            onChange={(e) => setHour(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-default-400 mt-1">
            <span>0:00</span>
            <span className="font-bold text-foreground">{hour}:00</span>
            <span>23:00</span>
          </div>
        </GlassCard>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <GlassCard className="text-center py-2">
            <p className="text-2xl font-bold text-danger">{stats.critical}</p>
            <p className="text-[10px] text-default-400">Crítico</p>
          </GlassCard>
          <GlassCard className="text-center py-2">
            <p className="text-2xl font-bold text-warning">{stats.high}</p>
            <p className="text-[10px] text-default-400">Alto</p>
          </GlassCard>
          <GlassCard className="text-center py-2">
            <p className="text-2xl font-bold text-yellow-500">{stats.medium}</p>
            <p className="text-[10px] text-default-400">Medio</p>
          </GlassCard>
          <GlassCard className="text-center py-2">
            <p className="text-2xl font-bold text-success">{stats.low}</p>
            <p className="text-[10px] text-default-400">Bajo</p>
          </GlassCard>
        </div>

        {/* Top congested */}
        <GlassCard>
          <p className="text-xs font-semibold mb-2">
            Top 10 más congestionadas
          </p>
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {points.slice(0, 10).map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-[11px]"
              >
                <span className="truncate max-w-[160px]">
                  #{i + 1} {p.name}
                </span>
                <span
                  className="font-mono font-bold"
                  style={{ color: RISK_COLORS[p.risk] }}
                >
                  {Math.round(p.congestion * 100)}%
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        <p className="text-[10px] text-default-400 mt-3 text-center">
          {isLoading
            ? "Cargando..."
            : `${points.length} estaciones | Modelo: GAT`}
        </p>
      </div>

      {/* Map */}
      <div className="flex-1 h-full">
        <MapContainer
          center={[4.65, -74.08]}
          zoom={12}
          zoomControl={false}
          className="w-full h-full z-0"
          attributionControl={false}
        >
          <TileLayer key={theme} url={tiles[theme]} />
          <ZoomControl position="topright" />
          {points.map((p) => (
            <CircleMarker
              key={p.id}
              center={[p.lat, p.lon]}
              radius={Math.max(3, p.congestion * 8)}
              pathOptions={{
                color: RISK_COLORS[p.risk],
                fillColor: RISK_COLORS[p.risk],
                fillOpacity: 0.7,
                weight: 0,
              }}
            >
              <Popup>
                <div className="text-xs">
                  <strong>{p.name}</strong>
                  <br />
                  Congestión: {Math.round(p.congestion * 100)}%<br />
                  Riesgo: {p.risk}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
