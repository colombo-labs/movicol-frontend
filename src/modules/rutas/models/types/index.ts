export type Tab = "tm" | "sitp";

export interface SitpRuta {
  ruta: string;
  cenefa: string;
  paraderos: { lat: number; lon: number; nombre: string }[];
}

export interface TmTroncal {
  id: string;
  nombre: string;
  troncal: string;
  origen: string;
  destino: string;
  estaciones: string[];
}

export interface RutasPanelProps {
  readonly activeFilter?: "all" | "tm" | "sitp";
  readonly onFilterChange?: (filter: "all" | "tm" | "sitp") => void;
  readonly onToggleSitp?: () => void;
  readonly showSitpOnMap?: boolean;
  readonly showTroncales?: boolean;
  readonly onToggleTroncales?: () => void;
  readonly showEstaciones?: boolean;
  readonly onToggleEstaciones?: () => void;
  readonly onSelectSitpRoute?: (
    data: {
      coords: [number, number][];
      stops: { lat: number; lon: number; nombre: string }[];
    } | null,
  ) => void;
  readonly onSelectTmRoute?: (troncal: string | null) => void;
}
