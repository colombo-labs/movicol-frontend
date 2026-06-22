export type Tab = "tm" | "sitp";

export interface SitpRuta {
  ruta: string;
  cenefa: string;
  paraderos: { lat: number; lon: number; nombre: string }[];
}

export interface TmRuta {
  codigo: string;
  nombre: string;
  origen: string;
  destino: string;
  tipo_bus: string;
  tipo_ruta: string;
  horario_lv: string;
  horario_sab: string;
  horario_dom: string;
  estado: string;
  coords: [number, number][];
  estaciones: { nombre: string; lat: number; lon: number }[];
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
