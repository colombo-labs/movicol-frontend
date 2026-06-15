/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Polyline, CircleMarker, Tooltip } from "react-leaflet";

interface Props {
  readonly troncalName: string;
}

function extractCoords(features: any[]): [number, number][] {
  const allCoords: [number, number][] = [];
  for (const f of features) {
    const geom = f.geometry;
    const lines =
      geom.type === "MultiLineString" ? geom.coordinates : [geom.coordinates];
    for (const line of lines) {
      for (const c of line) {
        if (c?.[0] != null && c?.[1] != null) allCoords.push([c[1], c[0]]);
      }
    }
  }
  return allCoords;
}

function extractStations(features: any[], trazadoIds: Set<string>) {
  const prefix = "transmisig2.tecnica.estacion_troncal.";
  return features
    .filter((f: any) => trazadoIds.has(f.properties[prefix + "id_trazado"]))
    .map((f: any) => ({
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
      nombre: f.properties[prefix + "nom_est"] || "",
    }));
}

export function SelectedTroncalLayer({ troncalName }: Props) {
  const [coords, setCoords] = useState<[number, number][]>([]);
  const [stations, setStations] = useState<
    { lat: number; lon: number; nombre: string }[]
  >([]);

  useEffect(() => {
    Promise.all([
      fetch("/data/tm_troncales.geojson").then((r) => r.json()),
      fetch("/data/tm_estaciones.geojson").then((r) => r.json()),
    ]).then(([tData, eData]) => {
      const matching = tData.features.filter(
        (f: any) =>
          f.properties.troncal
            ?.toUpperCase()
            .includes(troncalName.toUpperCase()) ||
          f.properties.nombre_trazado_troncal
            ?.toUpperCase()
            .includes(troncalName.toUpperCase()),
      );
      setCoords(extractCoords(matching));
      const trazadoIds = new Set<string>(
        matching.map((f: any) => f.properties.id_trazado_troncal),
      );
      setStations(extractStations(eData.features, trazadoIds));
    });
  }, [troncalName]);

  return (
    <>
      {coords.length > 1 && (
        <Polyline
          positions={coords}
          pathOptions={{ color: "#ef4444", weight: 5, opacity: 0.8 }}
        />
      )}
      {stations.map((s) => (
        <CircleMarker
          key={`tm-${s.nombre}`}
          center={[s.lat, s.lon]}
          radius={5}
          pathOptions={{
            color: "#ef4444",
            fillColor: "#fff",
            fillOpacity: 1,
            weight: 2,
          }}
        >
          <Tooltip
            permanent
            direction="right"
            offset={[6, 0]}
            className="!bg-transparent !border-0 !shadow-none !p-0 !text-[9px] !font-semibold !text-red-600"
          >
            {s.nombre}
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}
