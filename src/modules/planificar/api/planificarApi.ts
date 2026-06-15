import { API_URL } from "@/shared/config";
import type { RutaCercana } from "../models/types";

export async function fetchRutasCercanas(
  lat: number,
  lng: number,
  radius = 600,
): Promise<RutaCercana[]> {
  const res = await fetch(
    `${API_URL}/graph/rutas-cercanas?lat=${lat}&lng=${lng}&radius=${radius}`,
  );
  const data = await res.json();
  return data.rutas || [];
}

export function calcDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function estimateTrip(
  origin: { lat: number; lng: number },
  dest: { lat: number; lng: number },
  mode: string,
) {
  const dist = calcDistance(origin.lat, origin.lng, dest.lat, dest.lng);
  const roadDist = dist * 1.4;
  const speeds: Record<string, number> = {
    transmilenio: 22,
    sitp: 15,
    vehiculo: 30,
  };
  const speed = speeds[mode] || 20;
  const time = Math.round((roadDist / speed) * 60);
  const costs: Record<string, string> = {
    transmilenio: "$3,550",
    sitp: "$3,550",
    vehiculo: `~$${Math.round(roadDist * 1200).toLocaleString()}`,
  };
  return {
    distance: Math.round(roadDist * 10) / 10,
    time,
    cost: costs[mode] || "$3,550",
  };
}
