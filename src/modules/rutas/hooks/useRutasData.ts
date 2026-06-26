/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { API_URL } from "@/shared/config";
import type { SitpRuta, TmTroncal, TmRuta, Tab } from "../models/types";

export function useRutasData() {
  const [tab, setTab] = useState<Tab>("tm");
  const [sitpRutas, setSitpRutas] = useState<SitpRuta[]>([]);
  const [sitpShapes, setSitpShapes] = useState<any>(null);
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
    Promise.all([
      fetch(`${API_URL}/graph/tm/troncales`).then((r) => r.json()),
      fetch(`${API_URL}/graph/tm/estaciones`).then((r) => r.json()),
      fetch(`${API_URL}/graph/tm/rutas`).then((r) => r.json()),
    ])
      .then(([tData, eData, rData]) => {
        const stnsByTz: Record<string, string[]> = {};
        eData.features.forEach((f: any) => {
          const troncal = f.properties.troncal_es || "";
          const name = f.properties.nombre_est || "";
          if (troncal && name) {
            if (!stnsByTz[troncal]) stnsByTz[troncal] = [];
            stnsByTz[troncal].push(name);
          }
        });
        setTmTroncales(
          tData.features.map((f: any) => ({
            id: f.properties.id_trazado || f.id || '',
            nombre: f.properties.nombre_tra || f.properties.troncal || '',
            troncal: f.properties.troncal || '',
            origen: f.properties.origen_tra || '',
            destino: f.properties.fin_trazad || '',
            estaciones: stnsByTz[f.properties.troncal] || [],
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
      fetch(API_URL + "/graph/sitp/rutas/shapes")
        .then((r) => r.json())
        .then((d) => setSitpShapes(d))
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
    sitpShapes,
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
