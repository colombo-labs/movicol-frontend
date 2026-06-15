import type { RoutePrediction } from "@modules/predicciones/models";
import type { TripPoint } from "@/app/Layout";

export type TransportMode = "transmilenio" | "sitp" | "vehiculo";
export type DepartureType = "ahora" | "programar";

export interface PlanificarProps {
  readonly onPredict?: (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: TransportMode,
    departureTime: string,
  ) => void;
  readonly prediction?: RoutePrediction | null;
  readonly isLoading?: boolean;
  readonly error?: string | null;
  readonly tripPoints: TripPoint[];
  readonly onRemovePoint: (index: number) => void;
  readonly onUseMyLocation: (index?: number) => void;
  readonly onSwapPoints: (i: number, j: number) => void;
  readonly onClear: () => void;
  readonly onAddPoint?: (lat: number, lng: number, label: string) => void;
}

export interface RutaCercana {
  ruta: string;
  cenefa: string;
  distanciaMinima: number;
}

export const RISK_COLORS: Record<string, string> = {
  low: "text-success",
  medium: "text-warning",
  high: "text-orange-500",
  critical: "text-danger",
};

export const RISK_BG: Record<string, string> = {
  low: "bg-success/20 text-success",
  medium: "bg-warning/20 text-warning",
  high: "bg-orange-500/20 text-orange-500",
  critical: "bg-danger/20 text-danger",
};
