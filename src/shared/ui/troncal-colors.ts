export const TRONCAL_COLORS: Record<string, string> = {
  "AUTOPISTA NORTE": "#ef4444",
  CARACAS: "#f97316",
  "CARACAS SUR": "#f97316",
  "CALLE 80": "#eab308",
  AMERICAS: "#22c55e",
  "NQS CENTRAL": "#3b82f6",
  "NQS SUR": "#8b5cf6",
  SUBA: "#ec4899",
  "CALLE 26": "#06b6d4",
  "EJE AMBIENTAL": "#14b8a6",
  "CARRERA 7": "#6366f1",
  "CARRERA 10": "#a855f7",
};

export function getTroncalColor(troncal: string): string {
  const key = troncal?.toUpperCase().trim() || "";
  return TRONCAL_COLORS[key] || "#6b7280";
}
