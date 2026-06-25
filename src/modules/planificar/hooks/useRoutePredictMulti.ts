import { useCallback, useRef, useState } from "react";
import type {
  Coordinates,
  RoutePrediction,
} from "@modules/predicciones/models";
import { routePredictionApi } from "@modules/predicciones/api";
import type { RouteOption, RouteLeg, TransportMode } from "../models/types";
import { calcDistance, fetchRutasCercanas } from "../api/planificarApi";

interface PredictMultiParams {
  origin: Coordinates;
  destination: Coordinates;
  waypoints?: Coordinates[];
  departureTime: string;
  mode: TransportMode;
}

/** Derive a readable route line name from prediction data */
function deriveLineName(prediction: RoutePrediction): string {
  if (prediction.route_code) return prediction.route_code;
  return "";
}

/** Build a RouteOption from a RoutePrediction, inferring legs from mode/stations */
function predictionToOption(
  prediction: RoutePrediction,
  id: string,
  label: string,
  dist: number,
  tag?: RouteOption["tag"],
): RouteOption {
  const walkTime = Math.round(dist * 0.15 * 12);
  const code = deriveLineName(prediction);
  const legType: RouteLeg["type"] =
    prediction.mode === "transmilenio"
      ? "transmilenio"
      : prediction.mode === "sitp"
        ? "sitp"
        : prediction.mode === "vehiculo"
          ? "drive"
          : "transmilenio";

  const legs: RouteLeg[] = [];
  if (prediction.stations.length > 0) {
    legs.push({
      type: "walk",
      from: "Tu ubicación",
      to: prediction.stations[0],
      duration_minutes: walkTime,
      distance_km: dist * 0.15,
    });
    legs.push({
      type: legType,
      from: prediction.stations[0],
      to: prediction.stations[prediction.stations.length - 1],
      duration_minutes: prediction.total_time_minutes - walkTime * 2,
      distance_km: prediction.total_distance_km * 0.85,
      stations: prediction.stations,
      line: code || prediction.mode.toUpperCase(),
    });
    legs.push({
      type: "walk",
      from: prediction.stations[prediction.stations.length - 1],
      to: "Destino",
      duration_minutes: walkTime,
      distance_km: dist * 0.15,
    });
  } else {
    legs.push({
      type: legType,
      from: "Origen",
      to: "Destino",
      duration_minutes: prediction.total_time_minutes,
      distance_km: prediction.total_distance_km,
    });
  }

  return {
    id,
    label,
    total_time_minutes: prediction.total_time_minutes,
    total_distance_km: prediction.total_distance_km,
    cost: prediction.cost || "$3,550",
    transfers: prediction.transfers ?? 0,
    legs,
    prediction,
    tag,
  };
}

function buildOptions(
  tm: RoutePrediction | null,
  sitp: RoutePrediction | null,
  origin: Coordinates,
  destination: Coordinates,
): RouteOption[] {
  const options: RouteOption[] = [];
  const dist = calcDistance(
    origin.lat,
    origin.lng ?? origin.lon ?? 0,
    destination.lat,
    destination.lng ?? destination.lon ?? 0,
  );
  const walkTime = Math.round(dist * 0.15 * 12);

  if (tm && tm.stations.length > 0) {
    const tmCode = deriveLineName(tm);
    options.push(
      predictionToOption(
        tm,
        "tm-direct",
        tmCode ? `TM ${tmCode}` : "TransMilenio",
        dist,
        "fastest",
      ),
    );

    // Add AI-provided alternatives for TM
    if (tm.alternatives && tm.alternatives.length > 0) {
      tm.alternatives.forEach((alt, i) => {
        const altCode = alt.route_code || deriveLineName(alt);
        options.push(
          predictionToOption(
            alt,
            `tm-alt-${i}`,
            altCode ? `TM ${altCode}` : `TM Alt ${i + 1}`,
            dist,
          ),
        );
      });
    }
  }

  if (sitp && sitp.stations.length > 0) {
    const sitpCode = deriveLineName(sitp);
    options.push(
      predictionToOption(
        sitp,
        "sitp-direct",
        sitpCode ? `SITP ${sitpCode}` : "SITP",
        dist,
        "less_walking",
      ),
    );

    // Add AI-provided alternatives for SITP
    if (sitp.alternatives && sitp.alternatives.length > 0) {
      sitp.alternatives.forEach((alt, i) => {
        const altCode = alt.route_code || deriveLineName(alt);
        options.push(
          predictionToOption(
            alt,
            `sitp-alt-${i}`,
            altCode ? `SITP ${altCode}` : `SITP Alt ${i + 1}`,
            dist,
          ),
        );
      });
    }
  }

  if (tm && sitp && tm.stations.length > 1 && sitp.stations.length > 1) {
    options.push(buildCombinedOption(tm, sitp, dist, walkTime));
  }

  options.sort((a, b) => a.total_time_minutes - b.total_time_minutes);
  if (options.length > 0) options[0].tag = "fastest";

  return options;
}

function buildCombinedOption(
  tm: RoutePrediction,
  sitp: RoutePrediction,
  dist: number,
  walkTime: number,
): RouteOption {
  const tmHalf = Math.ceil(tm.stations.length / 2);
  const transferStation = tm.stations[tmHalf - 1];
  const combinedTime = Math.round(
    tm.total_time_minutes * 0.6 + sitp.total_time_minutes * 0.5 + 5,
  );
  const combinedDist =
    tm.total_distance_km * 0.6 + sitp.total_distance_km * 0.5;
  const tmC = deriveLineName(tm);
  const sitpC = deriveLineName(sitp);

  const tmSegHalf = Math.ceil(tm.risk_segments.length / 2);
  const combinedPrediction: RoutePrediction = {
    route_id: `combined-${tm.route_id}-${sitp.route_id}`,
    total_time_minutes: combinedTime,
    total_distance_km: combinedDist,
    cost: "$3,550",
    mode: "combined",
    risk_segments: [
      ...tm.risk_segments.slice(0, tmSegHalf),
      ...sitp.risk_segments,
    ],
    overall_risk: tm.overall_risk,
    safety_score: Math.round((tm.safety_score + sitp.safety_score) / 2),
    explanation: "",
    stations: [...tm.stations.slice(0, tmHalf), ...sitp.stations],
    departure_time: tm.departure_time,
    route_code: `${tmC}+${sitpC}`,
    transfers: 1,
    estimated_wait_minutes: Math.max(
      tm.estimated_wait_minutes ?? 0,
      sitp.estimated_wait_minutes ?? 0,
    ),
    alternatives: [],
  };

  return {
    id: "tm-sitp-transfer",
    label:
      "TM" + (tmC ? " " + tmC : "") + " + SITP" + (sitpC ? " " + sitpC : ""),
    total_time_minutes: combinedTime,
    total_distance_km: combinedDist,
    cost: "$3,550",
    transfers: 1,
    legs: [
      {
        type: "walk",
        from: "Tu ubicación",
        to: tm.stations[0],
        duration_minutes: walkTime,
        distance_km: dist * 0.15,
      },
      {
        type: "transmilenio",
        from: tm.stations[0],
        to: transferStation,
        duration_minutes: Math.round(tm.total_time_minutes * 0.5),
        distance_km: tm.total_distance_km * 0.5,
        stations: tm.stations.slice(0, tmHalf),
        line: tmC || "TM",
      },
      {
        type: "walk",
        from: transferStation,
        to: sitp.stations[0],
        duration_minutes: 5,
        distance_km: 0.3,
      },
      {
        type: "sitp",
        from: sitp.stations[0],
        to: sitp.stations[sitp.stations.length - 1],
        duration_minutes: Math.round(sitp.total_time_minutes * 0.5),
        distance_km: sitp.total_distance_km * 0.5,
        stations: sitp.stations,
        line: sitpC || "SITP",
      },
      {
        type: "walk",
        from: sitp.stations[sitp.stations.length - 1],
        to: "Destino",
        duration_minutes: Math.round(walkTime * 0.5),
        distance_km: dist * 0.05,
      },
    ],
    prediction: combinedPrediction,
    tag: "cheapest",
  };
}

function buildSimpleVehicleOptions(results: RoutePrediction[]): RouteOption[] {
  return results.map((result, i) => ({
    id: `vehiculo-${i}`,
    label: i === 0 ? "Más rápida" : `Alternativa ${i}`,
    total_time_minutes: result.total_time_minutes,
    total_distance_km: result.total_distance_km,
    cost: result.cost,
    transfers: 0,
    legs: [
      {
        type: "drive" as const,
        from: result.stations[0] || "Origen",
        to: result.stations[result.stations.length - 1] || "Destino",
        duration_minutes: result.total_time_minutes,
        distance_km: result.total_distance_km,
      },
    ],
    prediction: result,
    tag: i === 0 ? ("fastest" as const) : undefined,
  }));
}

function buildMultiWaypointOptions(
  legResults: RoutePrediction[],
  departureTime: string,
): RouteOption[] {
  const totalTime = legResults.reduce((s, r) => s + r.total_time_minutes, 0);
  const totalDist = legResults.reduce((s, r) => s + r.total_distance_km, 0);
  const allSegments = legResults.flatMap((r) => r.risk_segments);
  const allStations = legResults.flatMap((r) => r.stations);
  const costNum = Math.round((totalDist * 2000) / 100) * 100;
  const cost = `$${costNum.toLocaleString("es-CO")}`;

  const combined: RoutePrediction = {
    route_id: "vehiculo-multi",
    total_time_minutes: totalTime,
    total_distance_km: totalDist,
    cost,
    mode: "vehiculo",
    risk_segments: allSegments,
    overall_risk: legResults[0]?.overall_risk || "low",
    safety_score: Math.round(
      legResults.reduce((s, r) => s + r.safety_score, 0) / legResults.length,
    ),
    explanation: "",
    stations: allStations,
    departure_time: departureTime,
    transfers: 0,
    estimated_wait_minutes: 0,
    alternatives: [],
  };

  return [
    {
      id: "vehiculo",
      label: "Vehículo particular",
      total_time_minutes: totalTime,
      total_distance_km: totalDist,
      cost,
      transfers: 0,
      legs: [
        {
          type: "drive" as const,
          from: allStations[0] || "Origen",
          to: allStations[allStations.length - 1] || "Destino",
          duration_minutes: totalTime,
          distance_km: totalDist,
        },
      ],
      prediction: combined,
    },
  ];
}

async function fetchVehicleRoute(
  params: PredictMultiParams,
): Promise<RouteOption[]> {
  const points = [
    params.origin,
    ...(params.waypoints || []),
    params.destination,
  ];

  if (points.length === 2) {
    const results = await routePredictionApi.predictAlternatives({
      origin: params.origin,
      destination: params.destination,
      departure_time: params.departureTime,
      mode: "vehiculo",
    });
    return buildSimpleVehicleOptions(results);
  }

  const legResults: RoutePrediction[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const res = await routePredictionApi.predict({
      origin: points[i],
      destination: points[i + 1],
      departure_time: params.departureTime,
      mode: "vehiculo",
    });
    legResults.push(res);
  }
  return buildMultiWaypointOptions(legResults, params.departureTime);
}

async function fetchTransitRoute(
  params: PredictMultiParams,
): Promise<RouteOption[]> {
  const [tmResult, sitpResult, rutasCercanasResult] = await Promise.allSettled([
    routePredictionApi.predict({
      origin: params.origin,
      destination: params.destination,
      departure_time: params.departureTime,
      mode: "transmilenio",
    }),
    routePredictionApi.predict({
      origin: params.origin,
      destination: params.destination,
      departure_time: params.departureTime,
      mode: "sitp",
    }),
    fetchRutasCercanas(
      params.origin.lat,
      params.origin.lng ?? params.origin.lon ?? 0,
      800,
    ),
  ]);

  const tm = tmResult.status === "fulfilled" ? tmResult.value : null;
  let sitp = sitpResult.status === "fulfilled" ? sitpResult.value : null;

  if (sitp && !sitp.route_code) {
    const cercanas =
      rutasCercanasResult.status === "fulfilled"
        ? rutasCercanasResult.value
        : [];
    if (cercanas.length > 0) {
      sitp = { ...sitp, route_code: cercanas[0].ruta };
    }
  }

  if (!tm && !sitp) {
    throw new Error(
      "No se encontraron rutas de transporte público para este trayecto",
    );
  }

  return buildOptions(tm, sitp, params.origin, params.destination);
}

export function useRoutePredictMulti() {
  const [options, setOptions] = useState<RouteOption[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  const predictMulti = useCallback(async (params: PredictMultiParams) => {
    cancelledRef.current = false;
    setIsLoading(true);
    setError(null);

    try {
      const opts =
        params.mode === "vehiculo"
          ? await fetchVehicleRoute(params)
          : await fetchTransitRoute(params);

      if (!cancelledRef.current) {
        setOptions(opts);
        setIsLoading(false);
      }
    } catch (err) {
      if (!cancelledRef.current) {
        setError(err instanceof Error ? err.message : "Error al buscar rutas");
        setOptions(null);
        setIsLoading(false);
      }
    }
  }, []);

  const clear = useCallback(() => {
    cancelledRef.current = true;
    setOptions(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { predictMulti, options, isLoading, error, clear };
}
