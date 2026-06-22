import { useEffect, useState } from "react";
import { CircleMarker, Tooltip } from "react-leaflet";
import { API_URL } from "@/shared/config";

interface SiniestroPoint {
  lat: number;
  lon: number;
  intensity: number;
  localidad: string;
  paradero: string;
}

export function SiniestroLayer() {
  const [points, setPoints] = useState<SiniestroPoint[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/graph/siniestralidad/heatmap`)
      .then((r) => r.json())
      .then((data) => setPoints(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  if (!points.length) return null;

  // Normalize intensity for radius/opacity
  const maxIntensity = Math.max(...points.map((p) => p.intensity));

  return (
    <>
      {points.map((p, i) => {
        const norm = p.intensity / maxIntensity;
        return (
          <CircleMarker
            key={i}
            center={[p.lat, p.lon]}
            radius={4 + norm * 8}
            pathOptions={{
              color: "transparent",
              fillColor: norm > 0.7 ? "#ef4444" : norm > 0.4 ? "#f59e0b" : "#22c55e",
              fillOpacity: 0.3 + norm * 0.4,
            }}
          >
            <Tooltip>
              <div className="text-xs">
                <p className="font-semibold">{p.paradero}</p>
                <p>{p.localidad}</p>
                <p>Intensidad: {p.intensity.toFixed(0)} siniestros</p>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}
