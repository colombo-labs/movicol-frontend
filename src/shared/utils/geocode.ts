/* eslint-disable @typescript-eslint/no-explicit-any */
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
import { API_URL as API } from "@/shared/config";

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

async function searchNominatim(query: string): Promise<GeoResult[]> {
  try {
    const hasContext = /bogot[aá]|colombia/i.test(query);
    const q = hasContext ? query : `${query}, Bogotá`;
    const res = await fetch(
      `${NOMINATIM_URL}?q=${encodeURIComponent(q)}&format=json&limit=4&countrycodes=co&addressdetails=1`,
      { headers: { "Accept-Language": "es", "User-Agent": "MoviCol/1.0" } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return [];
    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      label: item.display_name.split(",").slice(0, 3).join(",").trim(),
      type: "address" as const,
    }));
  } catch {
    return [];
  }
}

export async function geocodeAddress(query: string): Promise<GeoResult[]> {
  // Búsqueda local instantánea en estaciones TM
  const stationResults = searchStations(query);
  // Búsqueda en Nominatim (puede ser más lenta)
  const nominatimResults = await searchNominatim(query);
  // Combinar: estaciones primero, luego direcciones, sin duplicados
  const combined = [...stationResults, ...nominatimResults];
  return combined.slice(0, 6);
}
