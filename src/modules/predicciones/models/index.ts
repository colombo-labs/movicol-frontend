import type { Prediction } from "@shared/types";

export type PredictionResponse = Prediction;

/** Route prediction types — matches backend contract */

export interface Coordinates {
  lat: number;
  lng: number;
  lon?: number;
}

export interface RiskSegment {
  from_station: string;
  to_station: string;
  congestion_level: number;
  risk_label: "low" | "medium" | "high" | "critical";
  coordinates: [number, number][];
}

export interface RoutePrediction {
  route_id: string;
  total_time_minutes: number;
  total_distance_km: number;
  cost: string;
  mode: string;
  risk_segments: RiskSegment[];
  overall_risk: "low" | "medium" | "high" | "critical";
  safety_score: number;
  explanation: string;
  stations: string[];
  departure_time: string;
  route_code?: string;
  transfers: number;
  estimated_wait_minutes: number;
  alternatives: RoutePrediction[];
  navigation_steps?: {
    instruction: string;
    street: string;
    distance_m: number;
    duration_s: number;
    maneuver: string;
  }[];
}
