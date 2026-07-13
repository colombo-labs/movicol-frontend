import { useEffect, useState } from "react";
import { CircleMarker, Tooltip } from "react-leaflet";
import { API_URL } from "@/shared/config";

interface SiniestroPoint {
  lat: number;
  lng: number;
  gravedad: string;
  clase: string;
  localidad: string;
}

const GRAVEDAD_COLORS: Record<string, string> = {
  "CON MUERTOS": "#ef4444",
  "CON HERIDOS": "#f59e0b",
  "SOLO DAÑOS": "#22c55e",
};

const GRAVEDAD_RADIUS: Record<string, number> = {
  "CON MUERTOS": 10,
  "CON HERIDOS": 6,
  "SOLO DAÑOS": 4,
};

// Module-level cache
let cachedSiniestros: SiniestroPoint[] | null = null;

export function SiniestroLayer() {
  const [points, setPoints] = useState<SiniestroPoint[]>(
    cachedSiniestros || [],
  );

  useEffect(() => {
    if (cachedSiniestros) return;
    fetch(`${API_URL}/graph/siniestralidad/heatmap`)
      .then((r) => r.json())
      .then((data) => {
        cachedSiniestros = Array.isArray(data) ? data : [];
        setPoints(cachedSiniestros);
      })
      .catch(() => {});
  }, []);

  if (!points.length) return null;

  // Limit to 2000 points for performance
  const displayed = points.slice(0, 2000);

  return (
    <>
      {displayed
        .filter((p) => p.lat != null && p.lng != null)
        .map((p, i) => {
          const color = GRAVEDAD_COLORS[p.gravedad] || "#f59e0b";
          const radius = GRAVEDAD_RADIUS[p.gravedad] || 5;
          return (
            <CircleMarker
              key={`sin-${i}-${p.lat}-${p.lng}`}
              center={[p.lat, p.lng]}
              radius={radius}
              pathOptions={{
                color: "transparent",
                fillColor: color,
                fillOpacity: 0.4,
              }}
            >
              <Tooltip>
                <div className="text-xs">
                  <p className="font-semibold">{p.clase}</p>
                  <p>{p.gravedad}</p>
                  <p className="text-default-400">{p.localidad}</p>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
    </>
  );
}
