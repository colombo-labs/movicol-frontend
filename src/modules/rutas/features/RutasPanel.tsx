/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RutasPanelProps, SitpRuta, TmTroncal } from "../models/types";
import { useRutasData } from "../hooks/useRutasData";
import { SitpDetail } from "../components/widgets/SitpDetail";
import { TmDetail } from "../components/widgets/TmDetail";
import { RutasList } from "../components/widgets/RutasList";

export function RutasPanel(props: RutasPanelProps) {
  const {
    tab,
    sitpRutas,
    tmTroncales,
    tmStations,
    setTmStations,
    selectedSitpRuta,
    setSelectedSitpRuta,
    selected,
    setSelected,
    sitpPage,
    setSitpPage,
    search,
    setSearch,
    filter,
    setFilter,
    handleTab,
  } = useRutasData();

  // SITP detail view
  if (tab === "sitp" && selectedSitpRuta) {
    const rutaData = sitpRutas.find((r) => r.ruta === selectedSitpRuta);
    if (rutaData) {
      return (
        <SitpDetail
          ruta={rutaData}
          onBack={() => {
            setSelectedSitpRuta(null);
            props.onSelectSitpRoute?.(null);
          }}
        />
      );
    }
  }

  // TM detail view
  if (selected) {
    return (
      <TmDetail
        selected={selected}
        tmStations={tmStations}
        onBack={() => {
          setSelected(null);
          props.onSelectTmRoute?.(null);
        }}
      />
    );
  }

  // List view
  return (
    <RutasList
      {...props}
      tab={tab}
      tmTroncales={tmTroncales}
      sitpRutas={sitpRutas}
      search={search}
      setSearch={setSearch}
      filter={filter}
      setFilter={setFilter}
      sitpPage={sitpPage}
      setSitpPage={setSitpPage}
      handleTab={handleTab}
      onSelectRuta={(r: SitpRuta) => {
        setSelectedSitpRuta(r.ruta);
        props.onSelectSitpRoute?.({
          coords: r.paraderos.map((p) => [p.lat, p.lon] as [number, number]),
          stops: r.paraderos,
        });
      }}
      onSelectTm={(r: TmTroncal) => {
        props.onSelectTmRoute?.(r.troncal);
        setTmStations(r.estaciones);
        setSelected({
          id: r.id,
          origen: r.origen,
          destino: r.destino,
          estado: "Operando",
          estaciones: r.estaciones.length,
          troncal: r.troncal,
        } as any);
      }}
    />
  );
}
