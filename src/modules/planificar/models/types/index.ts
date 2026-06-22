import type { RoutePrediction } from "@modules/predicciones/models";
import type { TripPoint } from "@/app/Layout";

export type TransportMode = "publico" | "vehiculo";
export type DepartureType = "ahora" | "programar";

/** Un tramo del viaje (caminar, TM, SITP) */
export interface RouteLeg {
  type: "walk" | "transmilenio" | "sitp" | "drive";
  from: string;
  to: string;
  duration_minutes: number;
  distance_km: number;
  stations?: string[];
  line?: string; // nombre de la ruta/troncal
}

/** Una opción de ruta completa con posibles transbordos */
export interface RouteOption extends Pick<
  RoutePrediction,
  "total_time_minutes" | "total_distance_km" | "cost"
> {
  id: string;
  label: string;
  transfers: number;
  legs: RouteLeg[];
  prediction: RoutePrediction;
  tag?: "fastest" | "cheapest" | "less_walking";
}

export interface PlanificarProps {
  readonly onPredictMulti?: (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: TransportMode,
    departureTime: string,
  ) => void;
  readonly options?: RouteOption[] | null;
  readonly isLoading?: boolean;
  readonly error?: string | null;
  readonly tripPoints: TripPoint[];
  readonly onRemovePoint: (index: number) => void;
  readonly onUseMyLocation: (index?: number) => void;
  readonly onSwapPoints: (i: number, j: number) => void;
  readonly onClear: () => void;
  readonly onAddPoint?: (lat: number, lng: number, label: string) => void;
  readonly onUpdatePoint?: (
    index: number,
    lat: number,
    lng: number,
    label: string,
  ) => void;
  readonly onRequestAddPoint?: () => void;
  readonly onSelectRoute?: (index: number) => void;
  readonly selectedRouteIdx?: number;
}

export interface RutaCercana {
  ruta: string;
  cenefa: string;
  distanciaMinima: number;
}

const RISK_LEVELS = ["low", "medium", "high", "critical"] as const;

export const RISK_COLORS: Record<string, string> = {
  low: "text-success",
  medium: "text-warning",
  high: "text-orange-500",
  critical: "text-danger",
};

export const RISK_BG: Record<string, string> = Object.fromEntries(
  RISK_LEVELS.map((level) => [
    level,
    `${RISK_COLORS[level].replace("text-", "bg-")}/20 ${RISK_COLORS[level]}`,
  ]),
);
