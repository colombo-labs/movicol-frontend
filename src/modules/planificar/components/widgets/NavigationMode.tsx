import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Navigation,
  X,
  Volume2,
  VolumeX,
  ChevronRight,
  MapPin,
  ArrowUp,
  CornerUpLeft,
  CornerUpRight,
} from "lucide-react";
import { useGeolocation } from "@shared/hooks/useGeolocation";
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

function getManeuverIcon(maneuver: string) {
  if (maneuver.includes("left")) return <CornerUpLeft size={24} className="text-white" />;
  if (maneuver.includes("right")) return <CornerUpRight size={24} className="text-white" />;
  return <ArrowUp size={24} className="text-white" />;
}

function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

function formatDuration(seconds: number): string {
  const min = Math.round(seconds / 60);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}min`;
}

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function NavigationMode({ prediction, onExit }: NavigationModeProps) {
  const { t } = useTranslation();
  const { position } = useGeolocation();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [distanceToNext, setDistanceToNext] = useState<number | null>(null);

  const steps: NavStep[] = useMemo(
    () => prediction.navigation_steps || [],
    [prediction],
  );

  const currentStep = steps[currentStepIdx] || null;
  const nextStep = steps[currentStepIdx + 1] || null;

  // Total remaining distance/time
  const remaining = useMemo(() => {
    const remainingSteps = steps.slice(currentStepIdx);
    const dist = remainingSteps.reduce((s, step) => s + step.distance_m, 0);
    const time = remainingSteps.reduce((s, step) => s + step.duration_s, 0);
    return { distance: dist, time };
  }, [steps, currentStepIdx]);

  // Get coordinates of next step's start from risk_segments
  const getStepCoords = useCallback(
    (stepIdx: number): [number, number] | null => {
      const segments = prediction.risk_segments || [];
      if (stepIdx < segments.length && segments[stepIdx].coordinates.length > 0) {
        const c = segments[stepIdx].coordinates[0];
        return [c[0], c[1]];
      }
      return null;
    },
    [prediction],
  );

  // Auto-advance step when user gets close
  useEffect(() => {
    if (!position || !steps.length) return;

    const nextCoords = getStepCoords(currentStepIdx + 1);
    if (nextCoords) {
      const dist = haversineM(position.lat, position.lng, nextCoords[0], nextCoords[1]);
      setDistanceToNext(dist);

      // Advance when within 30m of next step
      if (dist < 30 && currentStepIdx < steps.length - 1) {
        setCurrentStepIdx((prev) => prev + 1);
        if (voiceEnabled && "speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(steps[currentStepIdx + 1]?.instruction);
          utterance.lang = "es-CO";
          utterance.rate = 1.1;
          speechSynthesis.speak(utterance);
        }
      }
    }
  }, [position, currentStepIdx, steps, getStepCoords, voiceEnabled]);

  // Voice announce first step on mount
  useEffect(() => {
    if (voiceEnabled && currentStep && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(currentStep.instruction);
      utterance.lang = "es-CO";
      speechSynthesis.speak(utterance);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!steps.length) {
    return (
      <div className="fixed inset-0 z-[700] bg-background/95 flex items-center justify-center">
        <div className="text-center p-6">
          <Navigation size={48} className="text-default-300 mx-auto mb-4" />
          <p className="text-sm text-default-500">
            {t("nav.noSteps", "No hay instrucciones de navegación disponibles para esta ruta.")}
          </p>
          <button
            onClick={onExit}
            className="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-sm"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const progress = steps.length > 1 ? (currentStepIdx / (steps.length - 1)) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[700] flex flex-col bg-background">
      {/* Top bar — current instruction */}
      <div className="bg-primary text-white px-4 py-3 flex items-center gap-3 shadow-lg safe-top">
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          {currentStep && getManeuverIcon(currentStep.maneuver)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">
            {currentStep?.instruction || "Iniciando navegación..."}
          </p>
          {currentStep?.street && (
            <p className="text-xs opacity-80 truncate">{currentStep.street}</p>
          )}
        </div>
        {distanceToNext !== null && (
          <div className="text-right shrink-0">
            <p className="text-lg font-bold">{formatDistance(distanceToNext)}</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-default-200">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Map area (placeholder — real map would be behind this overlay) */}
      <div className="flex-1 relative bg-default-50 flex items-center justify-center">
        <div className="text-center">
          <Navigation size={64} className="text-primary/30 mx-auto mb-2 animate-pulse" />
          <p className="text-xs text-default-400">Navegación activa</p>
          <p className="text-[10px] text-default-300 mt-1">
            Paso {currentStepIdx + 1} de {steps.length}
          </p>
        </div>
      </div>

      {/* Next step preview */}
      {nextStep && (
        <div className="px-4 py-2 bg-default-100 border-t border-divider flex items-center gap-2">
          <ChevronRight size={14} className="text-default-400 shrink-0" />
          <p className="text-[10px] text-default-500 truncate flex-1">
            Después: {nextStep.instruction}
          </p>
          <span className="text-[10px] text-default-400 shrink-0">
            {formatDistance(nextStep.distance_m)}
          </span>
        </div>
      )}

      {/* Bottom bar — summary + controls */}
      <div className="px-4 py-3 bg-background border-t border-divider flex items-center gap-3 safe-bottom">
        <button
          onClick={onExit}
          className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger"
        >
          <X size={20} />
        </button>

        <div className="flex-1 text-center">
          <p className="text-sm font-bold text-foreground">
            {formatDuration(remaining.time)}
          </p>
          <p className="text-[10px] text-default-400">
            {formatDistance(remaining.distance)} restantes
          </p>
        </div>

        <button
          onClick={() => setVoiceEnabled((v) => !v)}
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            voiceEnabled ? "bg-primary/10 text-primary" : "bg-default-100 text-default-400"
          }`}
        >
          {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-default-100">
          <MapPin size={10} className="text-primary" />
          <span className="text-[10px] text-default-500">
            {prediction.mode === "vehiculo" ? "Auto" : prediction.mode === "sitp" ? "SITP" : "TM"}
          </span>
        </div>
      </div>
    </div>
  );
}
