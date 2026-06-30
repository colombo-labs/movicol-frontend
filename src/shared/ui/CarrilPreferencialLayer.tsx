import { useEffect, useState } from "react";
import { Polyline, Tooltip } from "react-leaflet";
import { API_URL } from "@/shared/config";

interface CarrilFeature {
  geometry: { coordinates: [number, number][] };
  properties: {
    CORREDOR: string;
    TRAMO_CARRIL: string;
    EST_CAR_PRE: string;
  };
}

export function CarrilPreferencialLayer({ show }: { readonly show: boolean }) {
  const [data, setData] = useState<CarrilFeature[]>([]);

  useEffect(() => {
    if (!show || data.length > 0) return;
    fetch(`${API_URL}/graph/carril-preferencial`)
      .then((r) => r.json())
      .then((geo) => setData(geo.features ?? []))
      .catch(() => {});
  }, [show, data.length]);

  if (!show || data.length === 0) return null;

  return (
    <>
      {data.map((f, i) => (
        <Polyline
          key={`carril-${i}`}
          positions={f.geometry.coordinates.map(([lng, lat]) => [lat, lng])}
          pathOptions={{
            color: "#f59e0b",
            weight: 4,
            opacity: 0.8,
            dashArray: "8 4",
          }}
        >
          <Tooltip sticky>
            <div style={{ fontSize: 11 }}>
              <strong>🚌 Carril Preferencial</strong>
              <br />
              {f.properties.CORREDOR} — {f.properties.TRAMO_CARRIL}
            </div>
          </Tooltip>
        </Polyline>
      ))}
    </>
  );
}
