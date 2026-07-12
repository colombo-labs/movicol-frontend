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
    cost: prediction.cost || "$3.550",
    transfers: prediction.transfers ?? 0,
    legs,
    prediction,
    tag,
  };
}

function addAlternatives(
  options: RouteOption[],
  prediction: RoutePrediction,
  prefix: string,
  idPrefix: string,
  dist: number,
): void {
  if (!prediction.alternatives || prediction.alternatives.length === 0) return;
  prediction.alternatives.forEach((alt: RoutePrediction, i: number) => {
    const altCode = alt.route_code || deriveLineName(alt);
    options.push(
      predictionToOption(
        alt,
        `${idPrefix}-alt-${i}`,
        altCode ? `${prefix} ${altCode}` : `${prefix} Alt ${i + 1}`,
        dist,
      ),
    );
  });
}

/**
 * Classify a route prediction automatically based on its segments and transfers.
 * Returns a human-readable label like "Solo TM", "SITP → TM", etc.
 */
function classifyRoute(prediction: RoutePrediction): string {
  const segments = prediction.risk_segments || [];
  const code = prediction.route_code || "";

  // Determine transport modes used (excluding walk segments)
  const transportModes = segments
    .map((s) => s.mode)
    .filter((m) => m && m !== "walk");

  const hasTm = transportModes.includes("transmilenio");
  const hasSitp = transportModes.includes("sitp");
  const transfers = prediction.transfers ?? 0;

  if (transfers === 0) {
    // Direct route — no transfers
    if (hasTm && !hasSitp) return code ? `Solo TM · ${code}` : "Solo TM";
    if (hasSitp && !hasTm) return code ? `Solo SITP · ${code}` : "Solo SITP";
    if (hasTm && hasSitp) return code ? `TM + SITP · ${code}` : "TM + SITP";
  } else {
    // Route with transfers — detect type
    if (hasTm && !hasSitp) return code ? `TM → TM · ${code}` : "TM → TM";
    if (hasSitp && !hasTm)
      return code ? `SITP → SITP · ${code}` : "SITP → SITP";
    // Mixed: determine order (first non-walk segment determines start)
    const firstMode = transportModes[0];
    if (firstMode === "transmilenio")
      return code ? `TM → SITP · ${code}` : "TM → SITP";
    return code ? `SITP → TM · ${code}` : "SITP → TM";
  }

  // Fallback based on backend mode field
  if (prediction.mode === "transmilenio") return code ? `TM · ${code}` : "TM";
  if (prediction.mode === "sitp") return code ? `SITP · ${code}` : "SITP";
  return code ? `TM + SITP · ${code}` : "TM + SITP";
}

function buildOptions(
  tm: RoutePrediction | null,
  sitp: RoutePrediction | null,
  multimodal: RoutePrediction | null,
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

  // Deduplicate: track added route_codes to avoid showing same route twice
  const addedCodes = new Set<string>();

  if (tm && tm.stations.length > 0) {
    const label = classifyRoute(tm);
    addedCodes.add(tm.route_code || "tm");
    options.push(predictionToOption(tm, "tm-direct", label, dist, "fastest"));
    addAlternatives(options, tm, "TM", "tm", dist);
  }

  if (sitp && sitp.stations.length > 0) {
    const sitpCode = sitp.route_code || "sitp";
    // Skip if same route as TM result
    if (!addedCodes.has(sitpCode)) {
      const label = classifyRoute(sitp);
      addedCodes.add(sitpCode);
      options.push(
        predictionToOption(sitp, "sitp-direct", label, dist, "less_walking"),
      );
      addAlternatives(options, sitp, "SITP", "sitp", dist);
    }
  }

  if (multimodal && multimodal.stations.length > 0) {
    const mmCode = multimodal.route_code || "mm";
    // Skip if same route already shown
    if (!addedCodes.has(mmCode)) {
      const label = classifyRoute(multimodal);
      options.push(
        predictionToOption(multimodal, "multimodal", label, dist, "cheapest"),
      );
    }
  }

  options.sort((a, b) => a.total_time_minutes - b.total_time_minutes);
  if (options.length > 0) options[0].tag = "fastest";

  return options;
}

function buildSimpleVehicleOptions(results: RoutePrediction[]): RouteOption[] {
  return results.map((result, i) => ({
    id: `vehiculo-${i}`,
    label: i === 0 ? "planner.fastest" : `planner.alternative${i}`,
    total_time_minutes: result.total_time_minutes,
    total_distance_km: result.total_distance_km,
    cost: result.cost,
    transfers: 0,
    legs: [
      {
        type:
          (
            {
              vehiculo: "drive",
              moto: "moto",
              bicicleta: "bike",
              caminando: "foot",
            } as Record<string, RouteLeg["type"]>
          )[result.mode] || "drive",
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
    mode: legResults[0]?.mode || "vehiculo",
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
      label: "planner.privateVehicle",
      total_time_minutes: totalTime,
      total_distance_km: totalDist,
      cost,
      transfers: 0,
      legs: [
        {
          type:
            (
              {
                vehiculo: "drive",
                moto: "moto",
                bicicleta: "bike",
                caminando: "foot",
              } as Record<string, RouteLeg["type"]>
            )[legResults[0]?.mode] || "drive",
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
      mode: params.mode,
    });
    return buildSimpleVehicleOptions(results);
  }

  const legResults: RoutePrediction[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const res = await routePredictionApi.predict({
      origin: points[i],
      destination: points[i + 1],
      departure_time: params.departureTime,
      mode: params.mode,
    });
    legResults.push(res);
  }
  return buildMultiWaypointOptions(legResults, params.departureTime);
}

async function fetchTransitRoute(
  params: PredictMultiParams,
): Promise<RouteOption[]> {
  const [tmResult, sitpResult, multimodalResult, rutasCercanasResult] =
    await Promise.allSettled([
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
      routePredictionApi.predict({
        origin: params.origin,
        destination: params.destination,
        departure_time: params.departureTime,
        mode: "multimodal",
      }),
      fetchRutasCercanas(
        params.origin.lat,
        params.origin.lng ?? params.origin.lon ?? 0,
        800,
      ),
    ]);

  const tm = tmResult.status === "fulfilled" ? tmResult.value : null;
  let sitp = sitpResult.status === "fulfilled" ? sitpResult.value : null;
  const multimodal =
    multimodalResult.status === "fulfilled" ? multimodalResult.value : null;

  if (sitp && !sitp.route_code) {
    const cercanas =
      rutasCercanasResult.status === "fulfilled"
        ? rutasCercanasResult.value
        : [];
    if (cercanas.length > 0) {
      sitp = { ...sitp, route_code: cercanas[0].ruta };
    }
  }

  if (!tm && !sitp && !multimodal) {
    throw new Error(
      "No se encontraron rutas de transporte público para este trayecto",
    );
  }

  return buildOptions(tm, sitp, multimodal, params.origin, params.destination);
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
      const opts = ["vehiculo", "moto", "bicicleta", "caminando"].includes(
        params.mode,
      )
        ? await fetchVehicleRoute(params)
        : await fetchTransitRoute(params);

      if (!cancelledRef.current) {
        setOptions(opts);
        setIsLoading(false);
      }
    } catch (err) {
      if (!cancelledRef.current) {
        const message = err instanceof Error ? err.message : "";
        if (
          message.includes("Failed to fetch") ||
          message.includes("NetworkError")
        ) {
          setError(
            "Sin conexión al servidor. Verifica tu internet e intenta de nuevo.",
          );
        } else if (message.includes("No se encontraron rutas")) {
          setError(message);
        } else {
          setError("No pudimos calcular la ruta. Intenta con otros puntos.");
        }
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
