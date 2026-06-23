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

const AI_URL = "http://localhost:8000";

function ParaderoPopupContent({ id, nombre, direccion, demanda, color }: any) {
  const [aiData, setAiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${AI_URL}/predictions/sitp/paradero/${id}/info`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        setAiData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  return (
    <div style={{ fontSize: 11, minWidth: 160 }}>
      <strong>{nombre}</strong>
      <br />
      <span style={{ color: "#888" }}>{direccion}</span>
      <br />
      <div style={{ marginTop: 4, padding: "4px 0", borderTop: "1px solid #eee" }}>
        {loading ? (
          <span style={{ color: "#666" }}>Conectando con IA para predicción...</span>
        ) : aiData ? (
          <>
            <span style={{ color: color, fontWeight: 600 }}>
              Demanda {aiData.nivel_demanda} ({Math.round(aiData.demanda_actual_score)}%)
            </span>
            <div style={{ marginTop: 4, maxHeight: 100, overflowY: "auto" }}>
              {aiData.rutas.map((r: any) => (
                <div key={r.ruta} style={{ marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{r.ruta}</span>: Espera {r.tiempo_espera_predicho}
                  <span style={{ fontSize: 9, color: "#888", display: "block" }}>
                    (Frec. base: {r.frecuencia_estimada_min}m | Riesgo: {r.congestion_esperada})
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <span style={{ color: "#ef4444" }}>No se pudo obtener predicción AI.</span>
        )}
      </div>
    </div>
  );
}

export function SitpLayer() {
  const [paraderos, setParaderos] = useState<any[]>([]);
  
  useEffect(() => {
    fetch(`${API_URL}/graph/sitp/paraderos`)
      .then((r) => (r.ok ? r.json() : { features: [] }))
      .then((d) => {
        const features = d.features || [];
        setParaderos(features.filter((f: any) => f.geometry));
      })
      .catch(() => {});
  }, []);

  const getDemandaColor = (score: number) => {
    if (!score) return "#22c55e"; // Default baja
    if (score > 70) return "#ef4444"; // Alta
    if (score > 30) return "#eab308"; // Media
    return "#22c55e"; // Baja
  };

  const getDemandaLabel = (score: number) => {
    if (!score) return "Baja";
    if (score > 70) return "Alta";
    if (score > 30) return "Media";
    return "Baja";
  };
  return (
    <>
      {paraderos.map((p, i) => {
        const lat = p.geometry.coordinates[1];
        const lon = p.geometry.coordinates[0];
        const nombre = p.properties.nombre || "";
        const direccion = p.properties.direccion_bandera || p.properties.via || "";
        const demanda = p.properties.demanda_score || 0;
        const color = getDemandaColor(demanda);

        return (
          <CircleMarker
            key={`sitp-${i}-${lat}-${lon}`}
            center={[lat, lon]}
            radius={4}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: 0.8,
              weight: 1,
            }}
          >
            <Popup>
              <ParaderoPopupContent
                id={p.properties?.cenefa || p.id || p.properties?.objectid}
                nombre={nombre}
                direccion={direccion}
                demanda={demanda}
                color={color}
              />
            </Popup>
          </CircleMarker>
        );
      })}
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
