import { useState, useEffect, useCallback, useMemo, useRef } from "react";

import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  X,
  Volume2,
  VolumeX,
  ChevronRight,
  ArrowUp,
  CornerUpLeft,
  CornerUpRight,
  RotateCcw,
  Gauge,
} from "lucide-react";
import type { RoutePrediction } from "@modules/predicciones/models";

interface NavigationModeProps {
  readonly prediction: RoutePrediction;
  readonly onExit: () => void;
}

interface NavStep {
  instruction: string;
  street: string;
  distance_m: number;
  duration_s: number;
  maneuver: string;
}

// --- Utilities ---

function haversineM(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters / 10) * 10} m`;
}

function formatETA(seconds: number): string {
  const arrival = new Date(Date.now() + seconds * 1000);
  return arrival.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getManeuverIcon(maneuver: string, size = 28) {
  if (maneuver.includes("left")) return <CornerUpLeft size={size} />;
  if (maneuver.includes("right")) return <CornerUpRight size={size} />;
  if (maneuver.includes("uturn") || maneuver.includes("u-turn"))
    return <RotateCcw size={size} />;
  if (maneuver === "board") return <ArrowUp size={size} />;
  if (maneuver === "transfer") return <RotateCcw size={size} />;
  if (maneuver === "arrive") return <ArrowUp size={size} />;
  return <ArrowUp size={size} />;
}

function getManeuverColor(maneuver: string): string {
  if (maneuver.includes("left") || maneuver.includes("right"))
    return "bg-amber-500";
  if (maneuver.includes("uturn")) return "bg-red-500";
  if (maneuver === "board") return "bg-emerald-600";
  if (maneuver === "transfer") return "bg-orange-500";
  if (maneuver === "arrive") return "bg-blue-600";
  return "bg-primary";
}

// --- Map follower component ---

function FollowUser({
  lat,
  lng,
  heading,
}: {
  lat: number;
  lng: number;
  heading: number | null;
}) {
  const map = useMap();
  const prevPos = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (!prevPos.current) {
      map.setView([lat, lng], 17);
    } else {
      map.panTo([lat, lng], { animate: true, duration: 0.5 });
    }
    prevPos.current = [lat, lng];
  }, [lat, lng, map]);

  // Rotate map based on heading (CSS transform on container)
  useEffect(() => {
    if (heading === null) return;
    const container = map.getContainer();
    container.style.transition = "transform 0.5s ease";
    container.style.transform = `rotate(${-heading}deg)`;
    return () => {
      container.style.transform = "";
    };
  }, [heading, map]);

  return null;
}

// --- Main component ---

export function NavigationMode({ prediction, onExit }: NavigationModeProps) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [distanceToNext, setDistanceToNext] = useState<number>(0);
  const [speed, setSpeed] = useState(0); // km/h
  const [heading, setHeading] = useState<number | null>(null);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [offRoute, setOffRoute] = useState(false);
  const watchRef = useRef<number | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const prevPosRef = useRef<{ lat: number; lng: number; time: number } | null>(
    null,
  );

  const steps: NavStep[] = useMemo(() => {
    // If backend provides navigation_steps, use them (vehicle routes)
    if (prediction.navigation_steps && prediction.navigation_steps.length > 0) {
      return prediction.navigation_steps;
    }

    // For transit routes: generate steps from stations + risk_segments
    const stations = prediction.stations || [];
    const segments = prediction.risk_segments || [];
    if (stations.length < 2) return [];

    const generated: NavStep[] = [];
    const totalTime = prediction.total_time_minutes * 60;
    const totalDist = prediction.total_distance_km * 1000;
    const perStop = stations.length > 1 ? 1 / (stations.length - 1) : 1;

    // Step 1: Walk to first station
    generated.push({
      instruction: `Camina hacia ${stations[0]}`,
      street: stations[0],
      distance_m: Math.round(totalDist * 0.05),
      duration_s: Math.round(totalTime * 0.05),
      maneuver: "depart",
    });

    // Step 2: Board
    const mode = prediction.mode === "sitp" ? "SITP" : "TransMilenio";
    const code = prediction.route_code || mode;
    generated.push({
      instruction: `Toma el ${mode} ${code} en ${stations[0]}`,
      street: stations[0],
      distance_m: 0,
      duration_s: Math.round((prediction.estimated_wait_minutes || 5) * 60),
      maneuver: "board",
    });

    // Steps for each station segment
    for (let i = 1; i < stations.length; i++) {
      const segMode = segments[i - 1]?.mode;
      const isTransfer = segMode === "walk";

      if (isTransfer) {
        generated.push({
          instruction: `Transbordo: camina hacia ${stations[i]}`,
          street: stations[i],
          distance_m: Math.round(totalDist * perStop * 0.3),
          duration_s: Math.round(totalTime * perStop * 0.5),
          maneuver: "transfer",
        });
      } else {
        generated.push({
          instruction: i === stations.length - 1
            ? `Baja en ${stations[i]}`
            : `Pasa por ${stations[i]}`,
          street: stations[i],
          distance_m: Math.round(totalDist * perStop * 0.9),
          duration_s: Math.round(totalTime * perStop * 0.9),
          maneuver: i === stations.length - 1 ? "arrive" : "straight",
        });
      }
    }

    // Final: walk to destination
    generated.push({
      instruction: "Camina hacia tu destino",
      street: "Destino",
      distance_m: Math.round(totalDist * 0.05),
      duration_s: Math.round(totalTime * 0.05),
      maneuver: "arrive",
    });

    return generated;
  }, [prediction]);

  const currentStep = steps[currentStepIdx] || null;
  const nextStep = steps[currentStepIdx + 1] || null;

  // Extract all route coordinates for polyline
  const routeCoords: [number, number][] = useMemo(() => {
    const coords: [number, number][] = [];
    for (const seg of prediction.risk_segments || []) {
      for (const c of seg.coordinates || []) {
        coords.push([c[0], c[1]]);
      }
    }
    return coords;
  }, [prediction]);

  // Remaining time/distance
  const remaining = useMemo(() => {
    const rem = steps.slice(currentStepIdx);
    return {
      distance: rem.reduce((s, step) => s + step.distance_m, 0),
      time: rem.reduce((s, step) => s + step.duration_s, 0),
    };
  }, [steps, currentStepIdx]);

  // Get coordinate of a step from risk_segments
  const getStepCoord = useCallback(
    (idx: number): [number, number] | null => {
      const segments = prediction.risk_segments || [];
      if (idx < segments.length && segments[idx].coordinates.length > 0) {
        return [
          segments[idx].coordinates[0][0],
          segments[idx].coordinates[0][1],
        ];
      }
      return null;
    },
    [prediction],
  );

  // Wake Lock — keep screen on
  useEffect(() => {
    async function acquireWakeLock() {
      try {
        if ("wakeLock" in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        }
      } catch {
        /* ignore */
      }
    }
    acquireWakeLock();
    return () => {
      wakeLockRef.current?.release();
    };
  }, []);

  // GPS tracking
  // --- GPS position handler helpers ---
  const updateSpeedAndHeading = useCallback(
    (lat: number, lng: number, now: number) => {
      if (!prevPosRef.current) return;
      const dt = (now - prevPosRef.current.time) / 1000;
      if (dt <= 1) return;
      const dist = haversineM(
        prevPosRef.current.lat,
        prevPosRef.current.lng,
        lat,
        lng,
      );
      setSpeed(Math.round((dist / dt) * 3.6));
      const dLat = lat - prevPosRef.current.lat;
      const dLng = lng - prevPosRef.current.lng;
      if (Math.abs(dLat) > 0.00001 || Math.abs(dLng) > 0.00001) {
        setHeading((Math.atan2(dLng, dLat) * 180) / Math.PI);
      }
    },
    [],
  );

  const checkOffRoute = useCallback(
    (lat: number, lng: number) => {
      if (routeCoords.length === 0) return;
      const minDist = Math.min(
        ...routeCoords.map((c) => haversineM(lat, lng, c[0], c[1])),
      );
      setOffRoute(minDist > 150);
    },
    [routeCoords],
  );

  const advanceStep = useCallback(
    (lat: number, lng: number) => {
      const nextCoord = getStepCoord(currentStepIdx + 1);
      if (!nextCoord) return;
      const dist = haversineM(lat, lng, nextCoord[0], nextCoord[1]);
      setDistanceToNext(dist);
      if (dist >= 30 || currentStepIdx >= steps.length - 1) return;
      setCurrentStepIdx((prev) => prev + 1);
      if ("vibrate" in navigator) navigator.vibrate(100);
      if (voiceEnabled && "speechSynthesis" in window) {
        const next = steps[currentStepIdx + 1];
        if (next) {
          const u = new SpeechSynthesisUtterance(next.instruction);
          u.lang = "es-CO";
          u.rate = 1.1;
          speechSynthesis.speak(u);
        }
      }
    },
    [currentStepIdx, steps, voiceEnabled, getStepCoord],
  );

  // --- GPS tracking effect ---
  useEffect(() => {
    if (!navigator.geolocation) return;
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserPos({ lat, lng });
        const now = Date.now();
        updateSpeedAndHeading(lat, lng, now);
        prevPosRef.current = { lat, lng, time: now };
        checkOffRoute(lat, lng);
        advanceStep(lat, lng);
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 },
    );
    return () => {
      if (watchRef.current !== null)
        navigator.geolocation.clearWatch(watchRef.current);
    };
  }, [currentStepIdx, steps, voiceEnabled, getStepCoord, routeCoords]);

  // Voice on mount
  useEffect(() => {
    if (voiceEnabled && currentStep && "speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(currentStep.instruction);
      u.lang = "es-CO";
      speechSynthesis.speak(u);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // No steps fallback
  if (!steps.length) {
    return (
      <div className="fixed inset-0 z-[700] bg-background flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-sm text-default-500 mb-4">
            No hay instrucciones de navegación para esta ruta.
          </p>
          <button
            onClick={onExit}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const progress =
    steps.length > 1 ? (currentStepIdx / (steps.length - 1)) * 100 : 0;
  const mapCenter = userPos
    ? ([userPos.lat, userPos.lng] as [number, number])
    : routeCoords[0] || ([4.65, -74.1] as [number, number]);

  return (
    <div className="fixed inset-0 z-[700] flex flex-col bg-background">
      {/* Instruction banner */}
      <div
        className={`${getManeuverColor(currentStep?.maneuver || "")} text-white px-4 py-3 flex items-center gap-3 shadow-lg z-10`}
      >
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
          {getManeuverIcon(currentStep?.maneuver || "", 32)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold leading-tight line-clamp-2">
            {currentStep?.instruction || "Iniciando..."}
          </p>
          {currentStep?.street && (
            <p className="text-sm opacity-80 truncate mt-0.5">
              {currentStep.street}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-black">
            {formatDistance(distanceToNext)}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-black/20 relative z-10">
        <div
          className="h-full bg-white/80 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Map */}
      <div className="flex-1 relative overflow-hidden">
        <MapContainer
          center={mapCenter}
          zoom={17}
          zoomControl={false}
          attributionControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {userPos && (
            <FollowUser lat={userPos.lat} lng={userPos.lng} heading={heading} />
          )}

          {/* Full route — gray for completed, colored for remaining */}
          {routeCoords.length > 0 && (
            <>
              <Polyline
                positions={routeCoords}
                pathOptions={{ color: "#10b981", weight: 6, opacity: 0.9 }}
              />
              {/* Completed portion overlay */}
              {currentStepIdx > 0 && (
                <Polyline
                  positions={routeCoords.slice(
                    0,
                    Math.min(currentStepIdx * 3, routeCoords.length),
                  )}
                  pathOptions={{ color: "#6b7280", weight: 6, opacity: 0.7 }}
                />
              )}
            </>
          )}

          {/* User position */}
          {userPos && (
            <CircleMarker
              center={[userPos.lat, userPos.lng]}
              radius={10}
              pathOptions={{
                color: "#3b82f6",
                fillColor: "#3b82f6",
                fillOpacity: 0.9,
                weight: 3,
              }}
            />
          )}
        </MapContainer>

        {/* Speed indicator */}
        <div className="absolute bottom-4 left-4 z-[10] bg-background/90 backdrop-blur rounded-xl px-3 py-2 border border-divider">
          <div className="flex items-center gap-1.5">
            <Gauge size={14} className="text-default-400" />
            <span className="text-lg font-bold text-foreground">{speed}</span>
            <span className="text-[10px] text-default-400">km/h</span>
          </div>
        </div>

        {/* Off-route warning */}
        {offRoute && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[10] bg-danger text-white px-4 py-2 rounded-xl text-xs font-bold animate-pulse">
            Fuera de ruta — recalculando...
          </div>
        )}
      </div>

      {/* Next step preview */}
      {nextStep && (
        <div className="px-4 py-2.5 bg-default-50 border-t border-divider flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-default-200 flex items-center justify-center shrink-0">
            {getManeuverIcon(nextStep.maneuver, 14)}
          </div>
          <p className="text-xs text-default-600 truncate flex-1">
            {nextStep.instruction}
          </p>
          <span className="text-xs text-default-400 font-medium shrink-0">
            {formatDistance(nextStep.distance_m)}
          </span>
          <ChevronRight size={12} className="text-default-300" />
        </div>
      )}

      {/* Bottom bar */}
      <div className="px-4 py-3 bg-background border-t border-divider flex items-center gap-3">
        <button
          onClick={onExit}
          className="w-11 h-11 rounded-full bg-danger/10 border border-danger/20 flex items-center justify-center text-danger active:scale-90"
        >
          <X size={20} />
        </button>

        <div className="flex-1 text-center">
          <p className="text-lg font-bold text-foreground">
            {formatETA(remaining.time)}
          </p>
          <p className="text-[10px] text-default-400">
            {formatDistance(remaining.distance)} •{" "}
            {Math.round(remaining.time / 60)} min
          </p>
        </div>

        <button
          onClick={() => setVoiceEnabled((v) => !v)}
          className={`w-11 h-11 rounded-full border flex items-center justify-center active:scale-90 ${
            voiceEnabled
              ? "bg-primary/10 border-primary/30 text-primary"
              : "bg-default-100 border-divider text-default-400"
          }`}
        >
          {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>
    </div>
  );
}
