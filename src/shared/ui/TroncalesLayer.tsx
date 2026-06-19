import { GeoJSON, CircleMarker, Popup } from "react-leaflet";
import { useEffect, useState, useMemo } from "react";
import type { FeatureCollection } from "geojson";

import { API_URL } from "@/shared/config";
import { getTroncalColor } from "./troncal-colors";

// Prefix for station properties from GeoJSON
const P = "transmisig2.tecnica.estacion_troncal.";

interface Props {
  showTroncales?: boolean;
  showEstaciones?: boolean;
}

export function TroncalesLayer({
  showTroncales = true,
  showEstaciones = true,
}: Props) {
  const [troncales, setTroncales] = useState<FeatureCollection | null>(null);
  const [estaciones, setEstaciones] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/graph/tm/troncales`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setTroncales)
      .catch(() => {});
    fetch(`${API_URL}/graph/tm/estaciones`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setEstaciones)
      .catch(() => {});
  }, []);

  // Build a map from id_trazado -> troncal name for coloring stations
  const trazadoToTroncal = useMemo(() => {
    if (!troncales) return {};
    const map: Record<string, string> = {};
    for (const f of troncales.features) {
      const id = f.properties?.id_trazado_troncal;
      const troncal = f.properties?.troncal;
      if (id && troncal) map[id] = troncal;
    }
    return map;
  }, [troncales]);

  return (
    <>
      {showTroncales && troncales && (
        <GeoJSON
          key="tm-troncales"
          data={troncales}
          style={(feature) => ({
            color: getTroncalColor(feature?.properties?.troncal || ""),
            weight: 4,
            opacity: 0.85,
          })}
          onEachFeature={(feature, layer) => {
            const p = feature.properties;
            const color = getTroncalColor(p.troncal || "");
            layer.bindPopup(
              `<div style="font-size:11px;line-height:1.5">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
                  <span style="width:14px;height:4px;border-radius:2px;background:${color};display:inline-block"></span>
                  <strong>${p.troncal || "—"}</strong>
                </div>
                <div style="color:#666">Trazado: ${p.nombre_trazado_troncal || "—"}</div>
                <div style="color:#666">Tipo: ${p.tipo_trazado || "—"}</div>
                <div style="color:#666">${p.origen_trazado || "—"} → ${p.fin_trazado || "—"}</div>
                <div style="color:#888;font-size:10px">Fase: ${p.fase_trazado_troncal || "—"}</div>
              </div>`,
            );
          }}
        />
      )}
      {showEstaciones &&
        estaciones?.features.map((feat, i) => {
          const coords =
            feat.geometry.type === "Point" ? feat.geometry.coordinates : null;
          if (!coords) return null;
          const props = feat.properties || {};
          const name = props[`${P}nom_est`] || `Estación ${i + 1}`;
          const ubicacion = props[`${P}ub_est`] || "";
          const idTrazado = props[`${P}id_trazado`] || "";
          const vagones = props[`${P}num_vag`] || 0;
          const troncal = trazadoToTroncal[idTrazado] || "";
          const color = getTroncalColor(troncal);

          return (
            <CircleMarker
              key={`tm-est-${i}`}
              center={[coords[1], coords[0]]}
              radius={5}
              pathOptions={{
                color: "#fff",
                fillColor: color,
                fillOpacity: 0.9,
                weight: 2,
              }}
            >
              <Popup>
                <div style={{ fontSize: 11, lineHeight: 1.5 }}>
                  <strong>{name}</strong>
                  {troncal && (
                    <div style={{ color: "#555" }}>Troncal: {troncal}</div>
                  )}
                  {ubicacion && (
                    <div style={{ color: "#666" }}>{ubicacion}</div>
                  )}
                  {vagones > 0 && (
                    <div style={{ color: "#888", fontSize: 10 }}>
                      Vagones: {vagones}
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
    </>
  );
}
