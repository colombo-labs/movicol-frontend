import { useEffect, useState } from "react";
import { API_URL as API } from "@/shared/config";

interface Stats {
  nodes: number;
  edges: number;
}
interface HeatmapItem {
  id: string;
  name: string;
  congestion: number;
  risk: string;
}

export function useMetricsData() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/graph/stats`).then((r) => r.json()),
      fetch(`${API}/graph/heatmap?hour=${new Date().getHours()}`).then((r) =>
        r.json(),
      ),
    ])
      .then(([s, h]) => {
        setStats(s);
        setHeatmap(Array.isArray(h) ? h : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const avgCongestion =
    heatmap.length > 0
      ? heatmap.reduce((a, s) => a + s.congestion, 0) / heatmap.length
      : 0;
  const critical = heatmap.filter((s) => s.risk === "critical").length;
  const high = heatmap.filter((s) => s.risk === "high").length;
  const topCongested = [...heatmap]
    .sort((a, b) => b.congestion - a.congestion)
    .slice(0, 5);

  return {
    stats,
    heatmap,
    loading,
    avgCongestion,
    critical,
    high,
    topCongested,
  };
}

export type { Stats, HeatmapItem };
