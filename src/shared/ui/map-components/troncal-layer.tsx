/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Polyline, CircleMarker, Tooltip } from "react-leaflet";

export function SelectedTroncalLayer({ troncalName }: { troncalName: string }) {
  const [coords, setCoords] = useState<[number, number][]>([]);
  const [stations, setStations] = useState<
    { lat: number; lon: number; nombre: string }[]
  >([]);

  useEffect(() => {
    fetch("/data/tm_troncales.geojson")
      .then((r) => r.json())
      .then((data) => {
        const matching = data.features.filter(
          (f: any) =>
            f.properties.troncal
              ?.toUpperCase()
              .includes(troncalName.toUpperCase()) ||
            f.properties.nombre_trazado_troncal
              ?.toUpperCase()
              .includes(troncalName.toUpperCase()),
        );
        const allCoords: [number, number][] = [];
        matching.forEach((f: any) => {
          const geom = f.geometry;
          if (geom.type === "MultiLineString") {
            geom.coordinates.forEach((line: number[][]) => {
              line.forEach((c: number[]) => {
                if (c && c[0] != null && c[1] != null)
                  allCoords.push([c[1], c[0]]);
              });
            });
          } else {
            geom.coordinates.forEach((c: number[]) => {
              if (c && c[0] != null && c[1] != null)
                allCoords.push([c[1], c[0]]);
            });
          }
        });
        setCoords(allCoords);
        const trazadoIds = matching.map(
          (f: any) => f.properties.id_trazado_troncal,
        );
        fetch("/data/tm_estaciones.geojson")
          .then((r2) => r2.json())
          .then((eData) => {
            const prefix = "transmisig2.tecnica.estacion_troncal.";
            const stns = eData.features
              .filter((f: any) =>
                trazadoIds.includes(f.properties[prefix + "id_trazado"]),
              )
              .map((f: any) => ({
                lat: f.geometry.coordinates[1],
                lon: f.geometry.coordinates[0],
                nombre: f.properties[prefix + "nom_est"] || "",
              }));
            setStations(stns);
          });
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
      {stations.map((s, i) => (
        <CircleMarker
          key={"tm-st-" + i}
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
