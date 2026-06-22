/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { API_URL } from "@/shared/config";
import type { SitpRuta, TmTroncal, TmRuta, Tab } from "../models/types";

export function useRutasData() {
  const [tab, setTab] = useState<Tab>("tm");
  const [sitpRutas, setSitpRutas] = useState<SitpRuta[]>([]);
  const [tmTroncales, setTmTroncales] = useState<TmTroncal[]>([]);
  const [tmRutas, setTmRutas] = useState<TmRuta[]>([]);
  const [tmStations, setTmStations] = useState<string[]>([]);
  const [selectedSitpRuta, setSelectedSitpRuta] = useState<string | null>(null);
  const [selectedTmRuta, setSelectedTmRuta] = useState<TmRuta | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [sitpPage, setSitpPage] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todas");

  // Load TM troncales + rutas
  if (tmTroncales.length === 0) {
    const prefix = "transmisig2.tecnica.estacion_troncal.";
    Promise.all([
      fetch(`${API_URL}/graph/tm/troncales`).then((r) => r.json()),
      fetch(`${API_URL}/graph/tm/estaciones`).then((r) => r.json()),
      fetch(`${API_URL}/graph/tm/rutas`).then((r) => r.json()),
    ])
      .then(([tData, eData, rData]) => {
        const stnsByTz: Record<string, string[]> = {};
        eData.features.forEach((f: any) => {
          const tid = f.properties[prefix + "id_trazado"] || "";
          const name = f.properties[prefix + "nom_est"] || "";
          if (tid) {
            if (!stnsByTz[tid]) stnsByTz[tid] = [];
            stnsByTz[tid].push(name);
          }
        });
        setTmTroncales(
          tData.features.map((f: any) => ({
            id: f.properties.id_trazado_troncal,
            nombre: f.properties.nombre_trazado_troncal,
            troncal: f.properties.troncal,
            origen: f.properties.origen_trazado || "",
            destino: f.properties.fin_trazado || "",
            estaciones: stnsByTz[f.properties.id_trazado_troncal] || [],
          })),
        );
        setTmRutas(rData.rutas || []);
      })
      .catch(() => {});
  }

  const handleTab = (
    t: Tab,
    onFilterChange?: (f: "all" | "tm" | "sitp") => void,
  ) => {
    if (sitpRutas.length === 0) {
      fetch(API_URL + "/graph/sitp/rutas")
        .then((r) => r.json())
        .then((d) => setSitpRutas(d.rutas || []))
        .catch(() => {});
    }
    setTab(t);
    setSearch("");
    setFilter("todas");
    onFilterChange?.(t);
  };

  return {
    tab,
    sitpRutas,
    tmTroncales,
    tmRutas,
    tmStations,
    setTmStations,
    selectedSitpRuta,
    setSelectedSitpRuta,
    selectedTmRuta,
    setSelectedTmRuta,
    selected,
    setSelected,
    sitpPage,
    setSitpPage,
    search,
    setSearch,
    filter,
    setFilter,
    handleTab,
  };
}
