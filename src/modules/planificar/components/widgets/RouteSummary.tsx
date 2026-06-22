import {
  Clock,
  Train,
  Car,
  MapPin,
  RefreshCw,
  Footprints,
  Shield,
  AlertCircle,
} from "lucide-react";
import { GlassCard } from "@shared/ui/GlassCard";
import type { RoutePrediction } from "@modules/predicciones/models";
import type { TransportMode } from "../../models/types";
import { RISK_BG } from "../../models/types";

interface Props {
  readonly prediction: RoutePrediction;
  readonly mode: TransportMode;
  readonly rutasDisponibles: { ruta: string }[];
  readonly getETA: () => string | null;
}

function getRiskLabel(risk: string) {
  if (risk === "low") return "Fluido";
  if (risk === "medium") return "Moderado";
  if (risk === "high") return "Lento";
  return "Crítico";
}

function getModeService(mode: string) {
  if (mode === "vehiculo") return "Ruta vehicular directa";
  if (mode === "transmilenio") return "Servicio troncal frecuente";
  return "Servicio zonal disponible";
}

export function LiveTimeBanner({
  prediction,
  mode,
  getETA,
}: Omit<Props, "rutasDisponibles">) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-primary/10 border border-primary/20">
      <div>
        <p className="text-[10px] text-primary/70">Sal ahora</p>
        <p className="text-lg font-bold text-primary">{getETA()}</p>
        <p className="text-[9px] text-success font-medium flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-success animate-ping" />
          {getModeService(mode)}
        </p>
      </div>
      <div className="text-right">
        <p className="text-[10px] text-default-400">Duración estimada</p>
        <p className="text-base font-bold">
          {Math.round(prediction.total_time_minutes)} min
        </p>
      </div>
      <div className="text-center">
        <span
          className={`text-[9px] px-2 py-1 rounded-full font-semibold ${RISK_BG[prediction.overall_risk]}`}
        >
          {getRiskLabel(prediction.overall_risk)}
        </span>
        <p className="text-[8px] text-default-400 mt-0.5">Ocupación</p>
      </div>
    </div>
  );
}

export function RouteSummaryCard({
  prediction,
  mode,
  rutasDisponibles,
  getETA,
}: Props) {
  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold">Resumen de ruta</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
        <div className="text-center p-1.5 rounded-lg bg-default-100">
          <p className="text-[9px] text-default-400">Tiempo</p>
          <p className="text-base font-bold">
            {Math.round(prediction.total_time_minutes)}
            <span className="text-[9px] font-normal"> min</span>
          </p>
        </div>
        <div className="text-center p-1.5 rounded-lg bg-default-100">
          <p className="text-[9px] text-default-400">Distancia</p>
          <p className="text-base font-bold">
            {prediction.total_distance_km.toFixed(1)}
            <span className="text-[9px] font-normal"> km</span>
          </p>
        </div>
        <div className="text-center p-1.5 rounded-lg bg-default-100">
          <p className="text-[9px] text-default-400">Costo</p>
          <p className="text-base font-bold text-xs">
            {mode === "vehiculo"
              ? `$${Math.round(prediction.total_distance_km * 800 + 5000).toLocaleString()}`
              : prediction.cost}
          </p>
        </div>
        <div className="text-center p-1.5 rounded-lg bg-primary/10">
          <p className="text-[9px] text-primary">Llegada</p>
          <p className="text-base font-bold text-primary">{getETA()}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-divider/30">
        <div className="flex items-center gap-1.5 text-[10px] text-default-500">
          <Clock size={10} />
          {mode === "vehiculo" ? (
            "Directo"
          ) : (
            <>
              <span>Frecuencia: </span>
              <strong className="text-foreground">
                {mode === "transmilenio" ? "3-5" : "8-12"} min
              </strong>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-default-500">
          <Train size={10} />
          {mode === "vehiculo" ? (
            "Vía principal"
          ) : (
            <>
              <span>Ruta: </span>
              <strong className="text-foreground">
                {rutasDisponibles.length > 0 ? rutasDisponibles[0].ruta : "..."}
              </strong>
            </>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

export function TripDetails({
  prediction,
  mode,
}: {
  readonly prediction: RoutePrediction;
  readonly mode: TransportMode;
}) {
  if (mode === "vehiculo") {
    return (
      <div className="grid grid-cols-3 gap-1.5">
        <div className="flex flex-col items-center p-2 rounded-lg bg-default-100">
          <Car size={14} className="text-default-500 mb-0.5" />
          <p className="text-[10px] font-bold">
            {(prediction.total_distance_km * 800).toLocaleString()}
          </p>
          <p className="text-[8px] text-default-400">Gasolina (COP)</p>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-default-100">
          <MapPin size={14} className="text-default-500 mb-0.5" />
          <p className="text-[10px] font-bold">$5,000</p>
          <p className="text-[8px] text-default-400">Parqueadero/h</p>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-default-100">
          <AlertCircle size={14} className="text-default-500 mb-0.5" />
          <p className="text-[10px] font-bold">
            {
              prediction.risk_segments.filter((s) => s.congestion_level > 0.6)
                .length
            }
          </p>
          <p className="text-[8px] text-default-400">Tramos lentos</p>
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-1.5">
      <div className="flex flex-col items-center p-2 rounded-lg bg-default-100">
        <RefreshCw size={14} className="text-default-500" />
        <p className="text-[10px] font-bold">
          {prediction.stations.length > 10 ? "1" : "0"}
        </p>
        <p className="text-[8px] text-default-400">Transbordos</p>
      </div>
      <div className="flex flex-col items-center p-2 rounded-lg bg-default-100">
        <Footprints size={14} className="text-default-500" />
        <p className="text-[10px] font-bold">
          {Math.round(prediction.total_distance_km * 0.15 * 12)} min
        </p>
        <p className="text-[8px] text-default-400">Caminando</p>
      </div>
      <div className="flex flex-col items-center p-2 rounded-lg bg-default-100">
        <Shield size={14} className="text-success" />
        <p className="text-[10px] font-bold text-success">Sí</p>
        <p className="text-[8px] text-default-400">Accesible</p>
      </div>
    </div>
  );
}
