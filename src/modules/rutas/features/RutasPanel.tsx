/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RutasPanelProps, SitpRuta, TmRuta } from "../models/types";
import { useRutasData } from "../hooks/useRutasData";
import { SitpDetail } from "../components/widgets/SitpDetail";
import { TmDetail } from "../components/widgets/TmDetail";
import { TmRutaDetail } from "../components/widgets/TmRutaDetail";
import { RutasList } from "../components/widgets/RutasList";

export function RutasPanel(props: RutasPanelProps) {
  const {
    tab,
    sitpRutas,
    tmTroncales,
    tmRutas,
    tmStations,
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

  // TM ruta detail view
  if (tab === "tm" && selectedTmRuta) {
    return (
      <TmRutaDetail
        ruta={selectedTmRuta}
        onBack={() => {
          setSelectedTmRuta(null);
          props.onSelectSitpRoute?.(null);
        }}
      />
    );
  }

  // TM troncal detail view
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
      tmRutas={tmRutas}
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
      onSelectTmRuta={(r: TmRuta) => {
        setSelectedTmRuta(r);
        props.onSelectSitpRoute?.({
          coords: r.coords,
          stops: r.estaciones || [],
        });
      }}
    />
  );
}
