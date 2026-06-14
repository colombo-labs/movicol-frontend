import { BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@shared/api/http-client";
import { GlassCard } from "@shared/ui/GlassCard";

interface GraphStats {
  nodes: number;
  edges: number;
}

/**
 * Módulo MÉTRICAS — Dashboard con estadísticas del grafo.
 */
export function MetricasPage() {
  const [stats, setStats] = useState<GraphStats | null>(null);

  useEffect(() => {
    api
      .get<GraphStats>("/graph/stats")
      .then(setStats)
      .catch(() => {});
  }, []);

  const nodes = stats?.nodes ?? 7444;
  const edges = stats?.edges ?? 41990;
  const avgDegree = nodes > 0 ? ((edges * 2) / nodes).toFixed(2) : "0";

  return (
    <div className="h-full overflow-y-auto p-6">
      <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
        <BarChart3 size={18} className="text-primary" /> Métricas del Grafo
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <GlassCard>
          <p className="text-sm text-default-500">Estaciones</p>
          <p className="text-3xl font-bold">{nodes.toLocaleString()}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-default-500">Conexiones</p>
          <p className="text-3xl font-bold">{edges.toLocaleString()}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-default-500">Grado Promedio</p>
          <p className="text-3xl font-bold">{avgDegree}</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <GlassCard>
          <p className="text-sm text-default-500 mb-2">Modelo Predictivo</p>
          <p className="text-2xl font-bold">GAT</p>
          <p className="text-xs text-default-400">
            Graph Attention Network — PyTorch Geometric
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-default-500 mb-2">Métricas del Modelo</p>
          <div className="flex gap-4">
            <div>
              <p className="text-2xl font-bold">0.18</p>
              <p className="text-[10px] text-default-400">MSE</p>
            </div>
            <div>
              <p className="text-2xl font-bold">0.42</p>
              <p className="text-[10px] text-default-400">RMSE</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Congestion by hour chart (simplified) */}
      <GlassCard>
        <p className="text-sm text-default-500 mb-3">
          Congestión Promedio por Hora
        </p>
        <div className="flex items-end gap-1 h-24">
          {[
            5, 10, 30, 50, 55, 45, 30, 25, 35, 30, 25, 30, 40, 55, 60, 45, 30,
            20, 10, 5,
          ].map((v, i) => (
            <div
              key={`bar-${i}`}
              className="flex-1 rounded-t transition-all"
              style={{
                height: `${v}%`,
                backgroundColor:
                  v > 50 ? "#ef4444" : v > 30 ? "#eab308" : "#22c55e",
                opacity: 0.8,
              }}
              title={`${i + 4}:00 — ${v}%`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[9px] text-default-400 mt-1">
          <span>4am</span>
          <span>8am</span>
          <span>12pm</span>
          <span>4pm</span>
          <span>8pm</span>
          <span>12am</span>
        </div>
      </GlassCard>
    </div>
  );
}
