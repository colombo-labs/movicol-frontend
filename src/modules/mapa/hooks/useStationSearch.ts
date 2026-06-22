import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL } from "@/shared/config";
import type { Station } from "../models";

let cachedStations: Station[] | null = null;

async function loadStations(): Promise<Station[]> {
  if (cachedStations) return cachedStations;

  const [tmRes, sitpRes] = await Promise.allSettled([
    fetch(`${API_URL}/graph/tm/estaciones`).then(r => r.json()),
    fetch(`${API_URL}/graph/sitp/paraderos`).then(r => r.json()),
  ]);

  const stations: Station[] = [];

  // TM estaciones
  if (tmRes.status === "fulfilled") {
    const features = tmRes.value?.features || [];
    for (const f of features) {
      const props = f.properties || {};
      const name = props["transmisig2.tecnica.estacion_troncal.nom_est"] || "";
      const coords = f.geometry?.coordinates;
      if (name && coords) {
        stations.push({ id: `tm-${name}`, name: `TM ${name}`, lat: coords[1], lon: coords[0] });
      }
    }
  }

  // SITP paraderos
  if (sitpRes.status === "fulfilled") {
    const features = sitpRes.value?.features || sitpRes.value || [];
    for (const f of Array.isArray(features) ? features : []) {
      const props = f.properties || {};
      const name = props.nombre || props.name || "";
      const coords = f.geometry?.coordinates;
      if (name && coords) {
        stations.push({ id: `sitp-${name}`, name, lat: coords[1], lon: coords[0] });
      }
    }
  }

  cachedStations = stations;
  return stations;
}

export function useStationSearch() {
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setStations([]); return; }
    setIsLoading(true);
    try {
      const all = await loadStations();
      const lower = q.toLowerCase();
      setStations(all.filter(s => s.name.toLowerCase().includes(lower)).slice(0, 10));
    } catch { setStations([]); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  return { stations, isLoading, query, setQuery };
}
