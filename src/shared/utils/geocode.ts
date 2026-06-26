/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_URL as API } from "@/shared/config";

const PHOTON_URL = "https://photon.komoot.io/api";

export interface GeoResult {
  lat: number;
  lng: number;
  label: string;
  type?: "station" | "address";
}

// Cache de estaciones TM para búsqueda local instantánea
let stationsCache: GeoResult[] | null = null;
let stationsLoading = false;

async function loadStations(): Promise<GeoResult[]> {
  if (stationsCache) return stationsCache;
  if (stationsLoading) return [];
  stationsLoading = true;
  try {
    const res = await fetch(`${API}/graph/tm/estaciones`);
    if (!res.ok) return [];
    const data = await res.json();
    const features = data?.features || data || [];
    stationsCache = (features as any[])
      .filter(
        (f: any) =>
          f.properties?.["transmisig2.tecnica.estacion_troncal.nom_est"],
      )
      .map((f: any) => ({
        lat: f.geometry?.coordinates?.[1] ?? 0,
        lng: f.geometry?.coordinates?.[0] ?? 0,
        label: f.properties["transmisig2.tecnica.estacion_troncal.nom_est"],
        type: "station" as const,
      }));
    return stationsCache;
  } catch {
    return [];
  } finally {
    stationsLoading = false;
  }
}

// Precargar estaciones al importar
loadStations();

function searchStations(query: string): GeoResult[] {
  if (!stationsCache) return [];
  const q = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return stationsCache
    .filter((s) => {
      const name = s.label
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return name.includes(q);
    })
    .slice(0, 4);
}

async function searchPhoton(query: string): Promise<GeoResult[]> {
  try {
    const res = await fetch(
      `${PHOTON_URL}?q=${encodeURIComponent(query)}&lat=4.65&lon=-74.08&limit=5`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.features?.length) return [];
    return data.features.map((f: any) => {
      const props = f.properties;
      const parts = [
        props.name,
        props.street,
        props.city || props.district,
      ].filter(Boolean);
      return {
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        label: parts.join(", "),
        type: "address" as const,
      };
    });
  } catch {
    return [];
  }
}

export async function geocodeAddress(query: string): Promise<GeoResult[]> {
  // Búsqueda local instantánea en estaciones TM
  const stationResults = searchStations(query);
  // Búsqueda en Photon (rápido, fuzzy, priorizando Bogotá)
  const photonResults = await searchPhoton(query);
  // Combinar: estaciones primero, luego direcciones
  const combined = [...stationResults, ...photonResults];
  return combined.slice(0, 6);
}
