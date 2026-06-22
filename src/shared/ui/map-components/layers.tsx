/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { CircleMarker, Popup } from "react-leaflet";
import { API_URL } from "@/shared/config";

function getRiskColor(risk: string) {
  if (risk === "critical") return "#ef4444";
  if (risk === "high") return "#f97316";
  if (risk === "medium") return "#eab308";
  return "#22c55e";
}

function getRiskLabel(risk: string) {
  if (risk === "high") return "Alto";
  if (risk === "medium") return "Medio";
  return "Bajo";
}

export function SitpLayer() {
  const [paraderos, setParaderos] = useState<
    { lat: number; lon: number; nombre: string; direccion: string }[]
  >([]);
  useEffect(() => {
    fetch(`${API_URL}/graph/sitp/paraderos`)
      .then((r) => (r.ok ? r.json() : { features: [] }))
      .then((d) => {
        const features = d.features || [];
        setParaderos(
          features
            .filter((f: any) => f.geometry)
            .map((f: any) => ({
              lat: f.geometry.coordinates[1],
              lon: f.geometry.coordinates[0],
              nombre: f.properties.nombre || "",
              direccion:
                f.properties.direccion_bandera || f.properties.via || "",
            })),
        );
      })
      .catch(() => {});
  }, []);
  return (
    <>
      {paraderos.map((p, i) => (
        <CircleMarker
          key={`sitp-${i}-${p.lat}-${p.lon}`}
          center={[p.lat, p.lon]}
          radius={3}
          pathOptions={{
            color: "#3b82f6",
            fillColor: "#3b82f6",
            fillOpacity: 0.7,
            weight: 1,
          }}
        >
          <Popup>
            <div style={{ fontSize: 11, minWidth: 120 }}>
              <strong>{p.nombre}</strong>
              <br />
              <span style={{ color: "#888" }}>{p.direccion}</span>
              <br />
              <span style={{ color: "#3b82f6", fontWeight: 500 }}>
                Paradero SITP Zonal
              </span>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}

// Congestion heatmap overlay

export function CongestionLayer() {
  const [stations, setStations] = useState<
    {
      id: string;
      name: string;
      lat: number;
      lon: number;
      congestion: number;
      risk: string;
    }[]
  >([]);
  useEffect(() => {
    const hour = new Date().getHours();
    fetch(`${API_URL}/graph/heatmap?hour=${hour}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        if (Array.isArray(d)) setStations(d);
      })
      .catch(() => {});
  }, []);
  const riskColor = getRiskColor;
  return (
    <>
      {stations.map((s) => (
        <CircleMarker
          key={`cong-${s.id}`}
          center={[s.lat, s.lon]}
          radius={Math.max(4, s.congestion * 12)}
          pathOptions={{
            color: riskColor(s.risk),
            fillColor: riskColor(s.risk),
            fillOpacity: 0.6,
            weight: 1,
          }}
        >
          <Popup>
            <div style={{ fontSize: 11, minWidth: 130 }}>
              <strong>{s.name}</strong>
              <br />
              Congestión:{" "}
              <span style={{ color: riskColor(s.risk), fontWeight: 600 }}>
                {Math.round(s.congestion * 100)}%
              </span>
              <br />
              <span style={{ color: "#888" }}>
                Nivel:{" "}
                {s.risk === "critical" ? "Crítico" : getRiskLabel(s.risk)}
              </span>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}

// Auto-fit map to route bounds
