import type { RoutePrediction } from "./index";

export type TransitStopMode = "transmilenio" | "sitp";

export interface PredictionStop {
  name: string;
  lat: number;
  lon: number;
  mode?: TransitStopMode;
}

const TRANSIT_MODES = new Set(["transmilenio", "sitp", "multimodal"]);

function isTransitStopMode(mode: string | undefined): mode is TransitStopMode {
  return mode === "transmilenio" || mode === "sitp";
}

function getStopMode(
  prediction: RoutePrediction,
  segmentIndex: number,
): TransitStopMode | undefined {
  const outgoingMode = prediction.risk_segments
    .slice(segmentIndex)
    .find((segment) => isTransitStopMode(segment.mode))?.mode;
  if (isTransitStopMode(outgoingMode)) return outgoingMode;

  const incomingMode = prediction.risk_segments
    .slice(0, segmentIndex)
    .reverse()
    .find((segment) => isTransitStopMode(segment.mode))?.mode;
  if (isTransitStopMode(incomingMode)) return incomingMode;

  return isTransitStopMode(prediction.mode) ? prediction.mode : undefined;
}

function appendUniqueName(names: string[], name: string) {
  const normalized = name.trim();
  if (normalized && names[names.length - 1] !== normalized) {
    names.push(normalized);
  }
}

export function getPredictionStationNames(
  prediction: RoutePrediction,
): string[] {
  const listedStations = prediction.stations.filter(
    (station) => station.trim().length > 0,
  );
  if (listedStations.length > 0) return listedStations;

  const names: string[] = [];
  prediction.risk_segments.forEach((segment) => {
    appendUniqueName(names, segment.from_station);
  });
  const lastSegment =
    prediction.risk_segments[prediction.risk_segments.length - 1];
  if (lastSegment) appendUniqueName(names, lastSegment.to_station);
  return names;
}

export function withPredictionStations(
  prediction: RoutePrediction,
): RoutePrediction {
  if (prediction.stations.some((station) => station.trim().length > 0)) {
    return prediction;
  }
  const stations = getPredictionStationNames(prediction);
  return stations.length > 0 ? { ...prediction, stations } : prediction;
}

export function getPredictionStops(
  prediction: RoutePrediction | null | undefined,
): PredictionStop[] {
  if (!prediction || !TRANSIT_MODES.has(prediction.mode)) return [];

  const stops: PredictionStop[] = [];
  prediction.risk_segments.forEach((segment, segmentIndex) => {
    const coordinate = segment.coordinates[0];
    if (!coordinate || !coordinate.every(Number.isFinite)) return;
    const previous = stops[stops.length - 1];
    if (
      previous &&
      previous.lat === coordinate[0] &&
      previous.lon === coordinate[1]
    ) {
      return;
    }
    stops.push({
      name: segment.from_station || `Parada ${stops.length + 1}`,
      lat: coordinate[0],
      lon: coordinate[1],
      mode: getStopMode(prediction, segmentIndex),
    });
  });

  const lastSegment = [...prediction.risk_segments]
    .reverse()
    .find((segment) => segment.coordinates.length > 0);
  const lastCoordinate =
    lastSegment?.coordinates[lastSegment.coordinates.length - 1];
  if (lastSegment && lastCoordinate?.every(Number.isFinite)) {
    const previous = stops[stops.length - 1];
    if (
      !previous ||
      previous.lat !== lastCoordinate[0] ||
      previous.lon !== lastCoordinate[1]
    ) {
      stops.push({
        name: lastSegment.to_station || `Parada ${stops.length + 1}`,
        lat: lastCoordinate[0],
        lon: lastCoordinate[1],
        mode: getStopMode(
          prediction,
          prediction.risk_segments.indexOf(lastSegment),
        ),
      });
    }
  }
  return stops;
}
