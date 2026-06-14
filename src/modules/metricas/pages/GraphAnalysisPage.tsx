import { Network } from "lucide-react";
import { useEffect, useState } from "react";
import { GlassCard } from "@shared/ui/GlassCard";
import { api } from "@shared/api/http-client";

interface GraphAnalysis {
  nodes: number;
  edges: number;
  density: number;
  avg_degree: number;
  max_degree: number;
  min_degree: number;
  components: number;
  largest_component_pct: number;
  degree_distribution: Record<string, number>;
  top_hubs: { id: string; name: string; degree: number }[];
  node_types: Record<string, number>;
}

export function GraphAnalysisPage() {
  const [data, setData] = useState<GraphAnalysis | null>(null);

  useEffect(() => {
    api
      .get<GraphAnalysis>("/graph/analysis")
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center text-default-400">
        Cargando análisis...
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
        <Network size={18} className="text-primary" /> Análisis del Grafo
      </h2>

      {/* Main stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <GlassCard className="text-center">
          <p className="text-3xl font-bold">{data.nodes.toLocaleString()}</p>
          <p className="text-[10px] text-default-400">Nodos</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-3xl font-bold">{data.edges.toLocaleString()}</p>
          <p className="text-[10px] text-default-400">Aristas</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-3xl font-bold">{data.avg_degree}</p>
          <p className="text-[10px] text-default-400">Grado promedio</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-3xl font-bold">{data.largest_component_pct}%</p>
          <p className="text-[10px] text-default-400">Componente principal</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Degree distribution */}
        <GlassCard>
          <p className="text-sm font-semibold mb-3">Distribución de Grado</p>
          <div className="space-y-2">
            {Object.entries(data.degree_distribution).map(([range, count]) => {
              const pct = (count / data.nodes) * 100;
              return (
                <div key={range} className="flex items-center gap-2">
                  <span className="text-xs w-12 text-default-400">{range}</span>
                  <div className="flex-1 h-4 bg-white/5 rounded overflow-hidden">
                    <div
                      className="h-full bg-primary/60 rounded"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs w-16 text-right font-mono">
                    {count.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Top hubs */}
        <GlassCard>
          <p className="text-sm font-semibold mb-3">
            Top 10 Hubs (más conectados)
          </p>
          <div className="space-y-1.5">
            {data.top_hubs.map((hub, i) => (
              <div
                key={hub.id}
                className="flex items-center justify-between text-xs"
              >
                <span className="truncate max-w-[200px]">
                  <span className="text-default-400 mr-1">#{i + 1}</span>
                  {hub.name}
                </span>
                <span className="font-mono font-bold text-primary">
                  {hub.degree}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Node types + extra stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard>
          <p className="text-sm font-semibold mb-3">Tipos de Nodo</p>
          <div className="space-y-2">
            {Object.entries(data.node_types).map(([type, count]) => (
              <div
                key={type}
                className="flex items-center justify-between text-xs"
              >
                <span className="capitalize">{type.replace(/_/g, " ")}</span>
                <span className="font-mono">{count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <p className="text-sm font-semibold mb-3">Propiedades</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-default-400">Densidad</span>
              <span className="font-mono">{data.density}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-default-400">Grado máximo</span>
              <span className="font-mono">{data.max_degree}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-default-400">Grado mínimo</span>
              <span className="font-mono">{data.min_degree}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-default-400">Componentes conexos</span>
              <span className="font-mono">{data.components}</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
