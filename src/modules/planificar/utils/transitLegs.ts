import type { RoutePrediction } from "@modules/predicciones/models";

export type LegMode = "transmilenio" | "sitp" | "walk";

export interface TransitLeg {
  mode: LegMode;
  stations: string[];
  durationMin: number;
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

  const allStations: string[] = [];
  let hasRealTransfer = false;

  for (const seg of segments) {
    if (!allStations.includes(seg.from_station))
      allStations.push(seg.from_station);
    if (!allStations.includes(seg.to_station)) allStations.push(seg.to_station);
    const segMode = seg.mode || dominantMode;
    if (segMode !== "walk" && segMode !== dominantMode) {
      hasRealTransfer = true;
    }
  }

  // Single mode → one leg
  if (!hasRealTransfer) {
    return [
      {
        mode: dominantMode as LegMode,
        stations: allStations,
        durationMin: Math.round(prediction.total_time_minutes),
      },
    ];
  }

  // Multimodal → group by transit mode changes
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
