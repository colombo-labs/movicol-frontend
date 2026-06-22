import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL } from "@/shared/config";
import type { Station } from "../models";

let cachedStations: Station[] | null = null;

function parseTmStations(data: any): Station[] {
  const features = data?.features || [];
  return features
    .map((f: any) => {
      const name = f.properties?.["transmisig2.tecnica.estacion_troncal.nom_est"] || "";
      const coords = f.geometry?.coordinates;
      return name && coords ? { id: `tm-${name}`, name: `TM ${name}`, lat: coords[1], lon: coords[0] } : null;
    })
    .filter(Boolean) as Station[];
}

function parseSitpStations(data: any): Station[] {
  const features = data?.features || data || [];
  const list = Array.isArray(features) ? features : [];
  return list
    .map((f: any) => {
      const name = f.properties?.nombre || f.properties?.name || "";
      const coords = f.geometry?.coordinates;
      return name && coords ? { id: `sitp-${name}`, name, lat: coords[1], lon: coords[0] } : null;
    })
    .filter(Boolean) as Station[];
}

async function loadStations(): Promise<Station[]> {
  if (cachedStations) return cachedStations;

  const [tmRes, sitpRes] = await Promise.allSettled([
    fetch(`${API_URL}/graph/tm/estaciones`).then(r => r.json()),
    fetch(`${API_URL}/graph/sitp/paraderos`).then(r => r.json()),
  ]);

  const tmStations = tmRes.status === "fulfilled" ? parseTmStations(tmRes.value) : [];
  const sitpStations = sitpRes.status === "fulfilled" ? parseSitpStations(sitpRes.value) : [];

  cachedStations = [...tmStations, ...sitpStations];
  return cachedStations;
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
