import { api } from "@shared/api/http-client";
import type { Coordinates, RoutePrediction } from "../models";

interface PredictRouteParams {
  origin: Coordinates;
  destination: Coordinates;
  departure_time: string;
  mode?: "transmilenio" | "sitp" | "vehiculo";
}
function toApiCoordinates(coords: Coordinates): { lat: number; lng: number } {
  const lng = coords.lng ?? coords.lon;
  if (typeof lng !== "number") {
    throw new Error("Coordenadas inválidas: se requiere lng o lon");
  }
  return { lat: coords.lat, lng };
}

export const routePredictionApi = {
  predict: (params: PredictRouteParams) =>
    api.post<RoutePrediction>("/route-prediction", {
      ...params,
      origin: toApiCoordinates(params.origin),
      destination: toApiCoordinates(params.destination),
      mode: params.mode ?? "transmilenio",
    }),
  predictAlternatives: (params: PredictRouteParams) =>
    api.post<RoutePrediction[]>("/route-prediction/alternatives", {
      ...params,
      origin: toApiCoordinates(params.origin),
      destination: toApiCoordinates(params.destination),
      mode: "vehiculo",
    }),
};
