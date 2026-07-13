import type { RoutePrediction } from "@modules/predicciones/models";

export type LegMode = "transmilenio" | "sitp" | "walk";

export interface TransitLeg {
  mode: LegMode;
  stations: string[];
  durationMin: number;
}

/** Extract all unique station names from segments */
function extractAllStations(prediction: RoutePrediction): string[] {
  const stations: string[] = [];
  for (const seg of prediction.risk_segments || []) {
    if (!stations.includes(seg.from_station)) stations.push(seg.from_station);
    if (!stations.includes(seg.to_station)) stations.push(seg.to_station);
  }
  return stations;
}

/** Detect if there's a real mode transfer (TM↔SITP, not walk connections) */
function detectRealTransfer(
  prediction: RoutePrediction,
  dominantMode: string,
): boolean {
  for (const seg of prediction.risk_segments || []) {
    const segMode = seg.mode || dominantMode;
    if (segMode !== "walk" && segMode !== dominantMode) return true;
  }
  return false;
}

/** Build legs for multimodal routes (real transfers between TM and SITP) */
function buildMultimodalLegs(
  prediction: RoutePrediction,
  dominantMode: string,
): TransitLeg[] {
  const segments = prediction.risk_segments || [];
  const legs: TransitLeg[] = [];
  let currentMode = "";
  let currentStations: string[] = [];
  const totalTime = prediction.total_time_minutes;
  const totalSegs = segments.length;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    let segMode = seg.mode || dominantMode;

    if (segMode === "walk") {
      const nextTransit = segments
        .slice(i + 1)
        .find((s) => s.mode && s.mode !== "walk");
      segMode = nextTransit?.mode || currentMode || dominantMode;
    }

    if (segMode !== currentMode && currentStations.length > 0) {
      legs.push({
        mode: currentMode as LegMode,
        stations: currentStations,
        durationMin: Math.max(
          1,
          Math.round((currentStations.length / totalSegs) * totalTime),
        ),
      });
      currentStations = [];
    }
    currentMode = segMode;
    if (!currentStations.includes(seg.from_station))
      currentStations.push(seg.from_station);
    if (!currentStations.includes(seg.to_station))
      currentStations.push(seg.to_station);
  }

  if (currentStations.length > 0) {
    legs.push({
      mode: currentMode as LegMode,
      stations: currentStations,
      durationMin: Math.max(
        1,
        Math.round((currentStations.length / totalSegs) * totalTime),
      ),
    });
  }

  return legs;
}

/** Group risk_segments into legs by mode. Absorbs walk segments into adjacent transit legs. */
export function groupSegmentsIntoLegs(
  prediction: RoutePrediction,
): TransitLeg[] {
  const segments = prediction.risk_segments || [];
  if (segments.length === 0) {
    return [
      {
        mode: (prediction.mode as LegMode) || "transmilenio",
        stations: prediction.stations || [],
        durationMin: Math.round(prediction.total_time_minutes),
      },
    ];
  }

  const dominantMode =
    segments.find((s) => s.mode && s.mode !== "walk")?.mode ||
    prediction.mode ||
    "transmilenio";

  // Single mode → one leg
  if (!detectRealTransfer(prediction, dominantMode)) {
    return [
      {
        mode: dominantMode as LegMode,
        stations: extractAllStations(prediction),
        durationMin: Math.round(prediction.total_time_minutes),
      },
    ];
  }

  // Multimodal → group by transit mode changes
  return buildMultimodalLegs(prediction, dominantMode);
}
