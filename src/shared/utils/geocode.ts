/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_URL as API } from "@/shared/config";

const PHOTON_URL = "https://photon.komoot.io/api";

// Known Bogotá localities/zones for instant, accurate geocoding
const BOGOTA_ZONES: Record<string, { lat: number; lng: number; label: string }> = {
  "usaquen": { lat: 4.6957, lng: -74.0318, label: "Usaquén, Bogotá" },
  "chapinero": { lat: 4.6436, lng: -74.0629, label: "Chapinero, Bogotá" },
  "centro": { lat: 4.5981, lng: -74.0760, label: "Centro Histórico, Bogotá" },
  "la candelaria": { lat: 4.5962, lng: -74.0732, label: "La Candelaria, Bogotá" },
  "suba": { lat: 4.7416, lng: -74.0837, label: "Suba, Bogotá" },
  "kennedy": { lat: 4.6210, lng: -74.1522, label: "Kennedy, Bogotá" },
  "bosa": { lat: 4.5963, lng: -74.1827, label: "Bosa, Bogotá" },
  "engativa": { lat: 4.7060, lng: -74.1106, label: "Engativá, Bogotá" },
  "fontibon": { lat: 4.6780, lng: -74.1463, label: "Fontibón, Bogotá" },
  "teusaquillo": { lat: 4.6337, lng: -74.0833, label: "Teusaquillo, Bogotá" },
  "barrios unidos": { lat: 4.6603, lng: -74.0784, label: "Barrios Unidos, Bogotá" },
  "puente aranda": { lat: 4.6253, lng: -74.1172, label: "Puente Aranda, Bogotá" },
  "antonio narino": { lat: 4.5879, lng: -74.1040, label: "Antonio Nariño, Bogotá" },
  "rafael uribe": { lat: 4.5666, lng: -74.1065, label: "Rafael Uribe Uribe, Bogotá" },
  "ciudad bolivar": { lat: 4.5423, lng: -74.1582, label: "Ciudad Bolívar, Bogotá" },
  "san cristobal": { lat: 4.5564, lng: -74.0818, label: "San Cristóbal, Bogotá" },
  "santa fe": { lat: 4.6040, lng: -74.0640, label: "Santa Fe, Bogotá" },
  "los martires": { lat: 4.6062, lng: -74.0910, label: "Los Mártires, Bogotá" },
  "tunjuelito": { lat: 4.5733, lng: -74.1325, label: "Tunjuelito, Bogotá" },
  "usme": { lat: 4.4810, lng: -74.1195, label: "Usme, Bogotá" },
  "portal norte": { lat: 4.7590, lng: -74.0453, label: "Portal Norte TM, Bogotá" },
  "portal sur": { lat: 4.5955, lng: -74.1570, label: "Portal Sur TM, Bogotá" },
  "portal americas": { lat: 4.6258, lng: -74.1758, label: "Portal Américas TM, Bogotá" },
  "portal eldorado": { lat: 4.6838, lng: -74.1238, label: "Portal El Dorado TM, Bogotá" },
  "portal 80": { lat: 4.7180, lng: -74.1117, label: "Portal 80 TM, Bogotá" },
  "portal suba": { lat: 4.7551, lng: -74.0937, label: "Portal Suba TM, Bogotá" },
  "portal tunal": { lat: 4.5712, lng: -74.1310, label: "Portal Tunal TM, Bogotá" },
  "calle 72": { lat: 4.6596, lng: -74.0564, label: "Calle 72, Bogotá" },
  "calle 100": { lat: 4.6881, lng: -74.0426, label: "Calle 100, Bogotá" },
  "la 72": { lat: 4.6596, lng: -74.0564, label: "Calle 72, Bogotá" },
  "soacha": { lat: 4.5795, lng: -74.2174, label: "Soacha, Cundinamarca" },
  "chia": { lat: 4.8637, lng: -74.0540, label: "Chía, Cundinamarca" },
  "zipaquira": { lat: 5.0224, lng: -73.9932, label: "Zipaquirá, Cundinamarca" },
  "mosquera": { lat: 4.7088, lng: -74.2330, label: "Mosquera, Cundinamarca" },
  "funza": { lat: 4.7170, lng: -74.2116, label: "Funza, Cundinamarca" },
  "el dorado": { lat: 4.7016, lng: -74.1469, label: "Aeropuerto El Dorado, Bogotá" },
  "aeropuerto": { lat: 4.7016, lng: -74.1469, label: "Aeropuerto El Dorado, Bogotá" },
  "terminal": { lat: 4.6554, lng: -74.1178, label: "Terminal de Transporte, Bogotá" },
  "terminal de transporte": { lat: 4.6554, lng: -74.1178, label: "Terminal de Transporte, Bogotá" },
  "unicentro": { lat: 4.7015, lng: -74.0423, label: "Unicentro, Bogotá" },
  "titan plaza": { lat: 4.6965, lng: -74.0838, label: "Titán Plaza, Bogotá" },
  "gran estacion": { lat: 4.6475, lng: -74.1017, label: "Gran Estación, Bogotá" },
  "centro mayor": { lat: 4.5889, lng: -74.1273, label: "Centro Mayor, Bogotá" },
  "adl": { lat: 4.6574, lng: -74.0558, label: "ADL Digital Labs, Bogotá" },
  "adl digital lab": { lat: 4.6574, lng: -74.0558, label: "ADL Digital Labs, Bogotá" },
};

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
      `${PHOTON_URL}?q=${encodeURIComponent(query)}&lat=4.65&lon=-74.08&limit=10`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.features?.length) return [];

    // Bogotá bounding box filter
    const BOG_LAT_MIN = 4.45;
    const BOG_LAT_MAX = 4.90;
    const BOG_LNG_MIN = -74.25;
    const BOG_LNG_MAX = -73.90;

    const filtered = data.features
      .filter((f: any) => {
        const [lng, lat] = f.geometry.coordinates;
        return lat >= BOG_LAT_MIN && lat <= BOG_LAT_MAX &&
               lng >= BOG_LNG_MIN && lng <= BOG_LNG_MAX;
      });

    // Sort: prioritize localities/districts over POIs
    // osm_value: "suburb", "city_district", "residential" > "yes", "attraction", etc.
    const priorityTypes = new Set(["suburb", "city_district", "residential", "neighbourhood", "district"]);
    filtered.sort((a: any, b: any) => {
      const aType = a.properties?.osm_value || "";
      const bType = b.properties?.osm_value || "";
      const aPriority = priorityTypes.has(aType) ? 0 : 1;
      const bPriority = priorityTypes.has(bType) ? 0 : 1;
      return aPriority - bPriority;
    });

    return filtered
      .slice(0, 5)
      .map((f: any) => {
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
  // 1. Check known Bogotá zones first (instant, accurate)
  const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/bogota/gi, "").trim();
  const zone = BOGOTA_ZONES[q] || Object.values(BOGOTA_ZONES).find(
    (_, idx) => q.includes(Object.keys(BOGOTA_ZONES)[idx])
  );
  if (zone) {
    // Find matching key for the zone
    const key = Object.keys(BOGOTA_ZONES).find(k => BOGOTA_ZONES[k] === zone) || q;
    const zoneResult: GeoResult = { lat: zone.lat, lng: zone.lng, label: zone.label, type: "address" };
    // Still search stations nearby for extra results
    const stationResults = searchStations(key);
    return [zoneResult, ...stationResults].slice(0, 6);
  }

  // 2. Búsqueda local instantánea en estaciones TM
  const stationResults = searchStations(query);
  // 3. Búsqueda en Photon (rápido, fuzzy, priorizando Bogotá)
  const photonResults = await searchPhoton(query);
  // Combinar: estaciones primero, luego direcciones
  const combined = [...stationResults, ...photonResults];
  return combined.slice(0, 6);
}
