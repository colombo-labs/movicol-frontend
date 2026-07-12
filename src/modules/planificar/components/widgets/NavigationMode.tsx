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
  Navigation,
  Bus,
  Train,
  Footprints,
  MapPin,
  Clock,
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

// ═══════════════════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════════════════

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

function formatMinutes(min: number): string {
  if (min < 1) return "< 1 min";
  return `${Math.round(min)} min`;
}

function isTransitMode(mode: string): boolean {
  return ["transmilenio", "sitp", "multimodal", "publico"].includes(mode);
}

// ═══════════════════════════════════════════════════════════════════
//  SHARED: Route Map View (eliminates duplication between transit/vehicle)
// ═══════════════════════════════════════════════════════════════════

function RouteMapView({
  center,
  zoom,
  routeCoords,
  routeColor,
  routeWeight = 5,
  userPos,
  children,
  className = "h-[35vh]",
}: {
  center: [number, number];
  zoom: number;
  routeCoords: [number, number][];
  routeColor: string;
  routeWeight?: number;
  userPos: { lat: number; lng: number } | null;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`${className} relative overflow-hidden`}>
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        attributionControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        {children}
        {routeCoords.length > 0 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: routeColor, weight: routeWeight, opacity: 0.9 }}
          />
        )}
        {userPos && (
          <CircleMarker
            center={[userPos.lat, userPos.lng]}
            radius={10}
            pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.9, weight: 3 }}
          />
        )}
      </MapContainer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════

function TransitNavigation({ prediction, onExit }: NavigationModeProps) {
  const [currentStopIdx, setCurrentStopIdx] = useState(0);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const watchRef = useRef<number | null>(null);

  const stations = prediction.stations || [];
  const segments = prediction.risk_segments || [];
  const mode = prediction.mode;
  const code = prediction.route_code || "";
  const totalTime = prediction.total_time_minutes;
  const totalDist = prediction.total_distance_km;

  // Route coords for map
  const routeCoords: [number, number][] = useMemo(() => {
    const coords: [number, number][] = [];
    for (const seg of segments) {
      for (const c of seg.coordinates || []) {
        coords.push([c[0], c[1]]);
      }
    }
    return coords;
  }, [segments]);

  // GPS tracking to auto-advance stops
  useEffect(() => {
    if (!navigator.geolocation || stations.length === 0) return;
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserPos({ lat, lng });

        // Find closest station to user
        // We only advance forward (never go back)
        for (let i = currentStopIdx + 1; i < stations.length; i++) {
          // Use segment coords to approximate station positions
          if (
            i - 1 < segments.length &&
            segments[i - 1]?.coordinates?.length > 0
          ) {
            const lastCoord =
              segments[i - 1].coordinates[
                segments[i - 1].coordinates.length - 1
              ];
            const dist = haversineM(lat, lng, lastCoord[0], lastCoord[1]);
            if (dist < 100) {
              setCurrentStopIdx(i);
              if ("vibrate" in navigator) navigator.vibrate([50, 30, 50]);
              break;
            }
          }
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 },
    );
    return () => {
      if (watchRef.current !== null)
        navigator.geolocation.clearWatch(watchRef.current);
    };
  }, [currentStopIdx, stations, segments]);

  const remainingStops = Math.max(0, stations.length - 1 - currentStopIdx);
  const progress =
    stations.length > 1 ? (currentStopIdx / (stations.length - 1)) * 100 : 0;
  const remainingTime = totalTime * (1 - progress / 100);

  const modeIcon =
    mode === "transmilenio" ? <Train size={18} /> : <Bus size={18} />;
  const modeColor = mode === "transmilenio" ? "text-red-500" : "text-blue-500";
  const modeBg = mode === "transmilenio" ? "bg-red-500" : "bg-blue-500";
  const modeBgLight =
    mode === "transmilenio" ? "bg-red-500/10" : "bg-blue-500/10";
  const modeLabel = mode === "transmilenio" ? "TransMilenio" : "SITP";

  const mapCenter: [number, number] = userPos
    ? [userPos.lat, userPos.lng]
    : routeCoords.length > 0
      ? routeCoords[Math.floor(routeCoords.length / 2)]
      : [4.65, -74.1];

  return (
    <div className="fixed inset-0 z-[700] flex flex-col bg-background">
      {/* Header */}
      <div
        className={`${modeBg} text-white px-4 py-3 flex items-center gap-3 shadow-lg z-10`}
      >
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
          {modeIcon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold leading-tight">
            {code || modeLabel}
          </p>
          <p className="text-sm opacity-80">
            {currentStopIdx === 0
              ? "Dirígete a la estación"
              : currentStopIdx >= stations.length - 1
                ? "¡Has llegado!"
                : `Próxima: ${stations[currentStopIdx + 1] || ""}`}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-black">{remainingStops}</p>
          <p className="text-[10px] opacity-70">paradas</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-default-200 relative z-10">
        <div
          className={`h-full ${modeBg} transition-all duration-700`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Map */}
      <RouteMapView
        center={mapCenter}
        zoom={14}
        routeCoords={routeCoords}
        routeColor={mode === "transmilenio" ? "#ef4444" : "#3b82f6"}
        userPos={userPos}
      />

      {/* Journey timeline */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* ETA card */}
        <div
          className={`${modeBgLight} rounded-xl p-3 mb-3 flex items-center justify-between`}
        >
          <div className="flex items-center gap-2">
            <Clock size={14} className={modeColor} />
            <span className="text-xs font-medium">Llegas aprox.</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold">
              {formatETA(remainingTime * 60)}
            </span>
            <span className="text-[10px] text-default-400 ml-2">
              {formatMinutes(remainingTime)} ·{" "}
              {formatDistance(totalDist * 1000 * (1 - progress / 100))}
            </span>
          </div>
        </div>

        {/* Station list as timeline */}
        <div className="space-y-0">
          {stations.map((station, i) => {
            const isPast = i < currentStopIdx;
            const isCurrent = i === currentStopIdx;
            const isLast = i === stations.length - 1;
            const isFirst = i === 0;

            return (
              <div key={`nav-stop-${i}`} className="flex items-stretch gap-3">
                {/* Timeline dot + line */}
                <div className="flex flex-col items-center w-5 shrink-0">
                  {isFirst ? (
                    <div className="w-4 h-4 rounded-full bg-success border-2 border-success/30 shrink-0 mt-2.5" />
                  ) : isLast ? (
                    <div className="w-4 h-4 rounded-full bg-danger border-2 border-danger/30 shrink-0 mt-2.5" />
                  ) : isCurrent ? (
                    <div
                      className={`w-4 h-4 rounded-full ${modeBg} border-2 border-white shadow-lg shrink-0 mt-2.5 animate-pulse`}
                    />
                  ) : isPast ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-default-300 shrink-0 mt-3" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-default-200 shrink-0 mt-3" />
                  )}
                  {!isLast && (
                    <div
                      className={`w-0.5 flex-1 min-h-[20px] ${isPast ? "bg-default-300" : modeBg + "/30"}`}
                    />
                  )}
                </div>

                {/* Station content */}
                <div
                  className={`flex-1 pb-2 pt-1.5 ${isCurrent ? "scale-[1.02]" : ""}`}
                >
                  <p
                    className={`text-[12px] leading-tight ${
                      isCurrent
                        ? "font-bold text-foreground"
                        : isPast
                          ? "text-default-400 line-through"
                          : isFirst || isLast
                            ? "font-semibold text-foreground"
                            : "text-default-500"
                    }`}
                  >
                    {station || `Parada ${i + 1}`}
                  </p>
                  {isFirst && (
                    <p className="text-[10px] text-success mt-0.5 flex items-center gap-1">
                      <Footprints size={10} /> Camina hasta aquí
                    </p>
                  )}
                  {isCurrent && !isFirst && !isLast && (
                    <p
                      className={`text-[10px] ${modeColor} mt-0.5 font-medium`}
                    >
                      ← Estás aquí
                    </p>
                  )}
                  {isLast && (
                    <p className="text-[10px] text-danger mt-0.5 flex items-center gap-1">
                      <MapPin size={10} /> Baja aquí
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="px-4 py-3 bg-background border-t border-divider flex items-center gap-3 shrink-0">
        <button
          onClick={onExit}
          className="w-11 h-11 rounded-full bg-danger/10 border border-danger/20 flex items-center justify-center text-danger active:scale-90"
        >
          <X size={20} />
        </button>
        <div className="flex-1 text-center">
          <p className="text-sm font-bold text-foreground">
            {currentStopIdx >= stations.length - 1
              ? "¡Llegaste! 🎉"
              : `${remainingStops} paradas restantes`}
          </p>
          <p className="text-[10px] text-default-400">
            {formatMinutes(remainingTime)} ·{" "}
            {formatDistance(totalDist * 1000 * (1 - progress / 100))}
          </p>
        </div>
        <div
          className={`w-11 h-11 rounded-full ${modeBgLight} border border-divider flex items-center justify-center ${modeColor}`}
        >
          {modeIcon}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  VEHICLE NAVIGATION (GPS Turn-by-Turn)
// ═══════════════════════════════════════════════════════════════════

function getManeuverIcon(maneuver: string, size = 28) {
  if (maneuver.includes("left")) return <CornerUpLeft size={size} />;
  if (maneuver.includes("right")) return <CornerUpRight size={size} />;
  if (maneuver.includes("uturn") || maneuver.includes("u-turn"))
    return <RotateCcw size={size} />;
  return <ArrowUp size={size} />;
}

function getManeuverColor(maneuver: string): string {
  if (maneuver.includes("left") || maneuver.includes("right"))
    return "bg-amber-500";
  if (maneuver.includes("uturn")) return "bg-red-500";
  return "bg-primary";
}

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

function VehicleNavigation({ prediction, onExit }: NavigationModeProps) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [distanceToNext, setDistanceToNext] = useState<number>(0);
  const [speed, setSpeed] = useState(0);
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

  const steps: NavStep[] = useMemo(
    () => prediction.navigation_steps || [],
    [prediction],
  );
  const currentStep = steps[currentStepIdx] || null;
  const nextStep = steps[currentStepIdx + 1] || null;

  const routeCoords: [number, number][] = useMemo(() => {
    const coords: [number, number][] = [];
    for (const seg of prediction.risk_segments || []) {
      for (const c of seg.coordinates || []) coords.push([c[0], c[1]]);
    }
    return coords;
  }, [prediction]);

  const remaining = useMemo(() => {
    const rem = steps.slice(currentStepIdx);
    return {
      distance: rem.reduce((s, step) => s + step.distance_m, 0),
      time: rem.reduce((s, step) => s + step.duration_s, 0),
    };
  }, [steps, currentStepIdx]);

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

  // Wake Lock
  useEffect(() => {
    async function acquire() {
      try {
        if ("wakeLock" in navigator)
          wakeLockRef.current = await navigator.wakeLock.request("screen");
      } catch {
        /* */
      }
    }
    acquire();
    return () => {
      wakeLockRef.current?.release();
    };
  }, []);

  // GPS tracking
  useEffect(() => {
    if (!navigator.geolocation) return;
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserPos({ lat, lng });
        const now = Date.now();

        // Speed + heading
        if (prevPosRef.current) {
          const dt = (now - prevPosRef.current.time) / 1000;
          if (dt > 1) {
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
          }
        }
        prevPosRef.current = { lat, lng, time: now };

        // Off-route check
        if (routeCoords.length > 0) {
          const minDist = Math.min(
            ...routeCoords.map((c) => haversineM(lat, lng, c[0], c[1])),
          );
          setOffRoute(minDist > 150);
        }

        // Advance step
        const nextCoord = getStepCoord(currentStepIdx + 1);
        if (nextCoord) {
          const dist = haversineM(lat, lng, nextCoord[0], nextCoord[1]);
          setDistanceToNext(dist);
          if (dist < 30 && currentStepIdx < steps.length - 1) {
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
          }
        }
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // No steps → show fallback message
  if (!steps.length) {
    return (
      <div className="fixed inset-0 z-[700] bg-background flex items-center justify-center">
        <div className="text-center p-6">
          <Navigation size={40} className="mx-auto mb-3 text-default-300" />
          <p className="text-sm text-default-500 mb-2">
            Ruta calculada sin instrucciones detalladas.
          </p>
          <p className="text-xs text-default-400 mb-4">
            {formatDistance(prediction.total_distance_km * 1000)} ·{" "}
            {formatMinutes(prediction.total_time_minutes)}
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

      {/* Progress */}
      <div className="h-1.5 bg-black/20 relative z-10">
        <div
          className="h-full bg-white/80 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Map */}
      <RouteMapView
        center={mapCenter}
        zoom={17}
        routeCoords={routeCoords}
        routeColor="#10b981"
        routeWeight={6}
        userPos={userPos}
        className="flex-1"
      >
        {userPos && <FollowUser lat={userPos.lat} lng={userPos.lng} heading={heading} />}
      </RouteMapView>
      <div className="absolute inset-0 pointer-events-none">

        {/* Speed */}
        <div className="absolute bottom-4 left-4 z-[10] bg-background/90 backdrop-blur rounded-xl px-3 py-2 border border-divider">
          <div className="flex items-center gap-1.5">
            <Gauge size={14} className="text-default-400" />
            <span className="text-lg font-bold text-foreground">{speed}</span>
            <span className="text-[10px] text-default-400">km/h</span>
          </div>
        </div>

        {offRoute && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[10] bg-danger text-white px-4 py-2 rounded-xl text-xs font-bold animate-pulse">
            Fuera de ruta — recalculando...
          </div>
        )}
      </div>

      {/* Next step */}
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

      {/* Bottom */}
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
          className={`w-11 h-11 rounded-full border flex items-center justify-center active:scale-90 ${voiceEnabled ? "bg-primary/10 border-primary/30 text-primary" : "bg-default-100 border-divider text-default-400"}`}
        >
          {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN EXPORT — Routes to correct view
// ═══════════════════════════════════════════════════════════════════

export function NavigationMode({ prediction, onExit }: NavigationModeProps) {
  if (isTransitMode(prediction.mode)) {
    return <TransitNavigation prediction={prediction} onExit={onExit} />;
  }
  return <VehicleNavigation prediction={prediction} onExit={onExit} />;
}
