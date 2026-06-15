import { Train, Bus, Car, Navigation } from "lucide-react";
import type { RoutePrediction } from "@modules/predicciones/models";
import type { TransportMode } from "../../models/types";

interface Props {
  readonly prediction: RoutePrediction;
  readonly mode: TransportMode;
  readonly onModeChange: (mode: TransportMode) => void;
}

const MODES: {
  key: TransportMode;
  icon: typeof Train;
  color: string;
  factor: number;
}[] = [
  { key: "transmilenio", icon: Train, color: "text-danger", factor: 1 },
  { key: "sitp", icon: Bus, color: "text-blue-500", factor: 1.4 },
  { key: "vehiculo", icon: Car, color: "text-default-500", factor: 0.7 },
];

function getModePrice(current: TransportMode, key: TransportMode) {
  if (current === key) return "Actual";
  if (key === "vehiculo") return "~$15,000";
  return "$3,550";
}

export function ModeComparison({ prediction, mode, onModeChange }: Props) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] text-default-400 font-medium">
        Comparar opciones
      </p>
      <div className="flex gap-1.5">
        {MODES.map(({ key, icon: Icon, color, factor }) => (
          <button
            type="button"
            key={key}
            className={`flex-1 p-2 rounded-lg border text-center cursor-pointer transition-all ${mode === key ? "border-primary bg-primary/10" : "border-divider hover:border-primary/50"}`}
            onClick={() => onModeChange(key)}
          >
            <Icon size={14} className={`mx-auto mb-0.5 ${color}`} />
            <p className="text-[10px] font-bold">
              {Math.round(prediction.total_time_minutes * factor)} min
            </p>
            <p className="text-[8px] text-default-400">
              {getModePrice(mode, key)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

export function RouteAlternatives({
  prediction,
}: {
  readonly prediction: RoutePrediction;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] text-default-400 font-medium">Alternativas</p>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Navigation size={10} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-semibold text-primary">
              Ruta más rápida
            </p>
            <p className="text-[9px] text-primary/70">
              {Math.round(prediction.total_time_minutes)} min •{" "}
              {prediction.stations.length} estaciones
            </p>
          </div>
          <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">
            Mejor
          </span>
        </div>
        {[
          { label: "Ruta económica", factor: 1.3, desc: "Menos transbordos" },
          { label: "Menos caminata", factor: 1.1, desc: "Parada más cercana" },
        ].map((alt) => (
          <div
            key={alt.label}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-default-100 border border-divider/50 opacity-80"
          >
            <div className="w-6 h-6 rounded-full bg-default-200 flex items-center justify-center shrink-0">
              <span className="text-[10px]">🚌</span>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-semibold text-foreground">
                {alt.label}
              </p>
              <p className="text-[9px] text-default-400">
                {Math.round(prediction.total_time_minutes * alt.factor)} min •{" "}
                {alt.desc}
              </p>
            </div>
            <span className="text-[9px] text-default-400">$3,550</span>
          </div>
        ))}
      </div>
    </div>
  );
}
