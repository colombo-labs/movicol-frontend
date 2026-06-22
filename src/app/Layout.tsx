import { useState, useCallback } from "react";
import { AlertTriangle } from "lucide-react";

import { Sidebar, type PanelId } from "@shared/ui/Sidebar";
import { MobileNav } from "@shared/ui/MobileNav";
import { Header } from "@shared/ui/Header";
import { SidePanel } from "@shared/ui/SidePanel";
import { MapView } from "@shared/ui/MapView";
import { ChatWidget } from "@modules/chat/components/widgets/ChatWidget";
import { PlanificarViajePanel } from "@modules/planificar/features/PlanificarViajePanel";
import { RutasPanel } from "@modules/rutas/features/RutasPanel";
import { AccesibilidadPanel } from "@modules/accesibilidad/features/AccesibilidadPanel";
import { MetricasPanel } from "@modules/metricas/features/MetricasPanel";
import { useRoutePredictMulti } from "@modules/planificar/hooks/useRoutePredictMulti";
import type { Coordinates } from "@modules/predicciones/models";
import type { TransportMode } from "@modules/planificar/models/types";
import { reverseGeocode } from "@shared/utils/reverseGeocode";

export type TripPoint = { lat: number; lng: number; label?: string };

function updateLabel(
  setter: React.Dispatch<React.SetStateAction<TripPoint[]>>,
  index: number,
  lat: number,
  lng: number,
) {
  reverseGeocode(lat, lng).then((address) => {
    setter((prev) =>
      prev.map((p, i) => (i === index ? { ...p, label: address } : p)),
    );
  });
}

function handleGeoSuccess(
  pos: GeolocationPosition,
  index: number | undefined,
  setTripPoints: React.Dispatch<React.SetStateAction<TripPoint[]>>,
) {
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;
  const pt: TripPoint = { lat, lng, label: "Obteniendo dirección..." };
  setTripPoints((prev) => {
    if (index !== undefined && index < prev.length) {
      return prev.map((p, i) => (i === index ? pt : p));
    }
    return [pt, ...prev];
  });
  const targetIdx = index ?? 0;
  updateLabel(setTripPoints, targetIdx, lat, lng);
}

export function Layout() {
  const [activePanel, setActivePanel] = useState<PanelId>("planificar");
  const [showTroncales, setShowTroncales] = useState(false);
  const [showEstaciones, setShowEstaciones] = useState(false);
  const [showSitpOnMap, setShowSitpOnMap] = useState(false);
  const [selectedTroncal, setSelectedTroncal] = useState<string | null>(null);
  const [sitpRouteCoords, setSitpRouteCoords] = useState<{
    coords: [number, number][];
    stops: { lat: number; lon: number; nombre: string }[];
  } | null>(null);
  const [tripPoints, setTripPoints] = useState<TripPoint[]>([]);
  const [showRoutesOnMap, setShowRoutesOnMap] = useState(false);
  const [routeFilter, setRouteFilter] = useState<"all" | "tm" | "sitp">("all");
  const [showCongestion] = useState(false);
  const [showSiniestros, setShowSiniestros] = useState(false);
  const { predictMulti, options, isLoading, error, clear } = useRoutePredictMulti();
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const [addingPoint, setAddingPoint] = useState(false);

  const togglePanel = useCallback((id: PanelId) => {
    setActivePanel(id);
    // Reset contexto de rutas al salir del módulo rutas
    if (id !== "rutas") {
      setShowTroncales(false);
      setShowEstaciones(false);
      setShowSitpOnMap(false);
      setShowRoutesOnMap(false);
      setSitpRouteCoords(null);
      setSelectedTroncal(null);
    }
    // Reset contexto de planificar al salir del módulo planificar
    if (id !== "planificar") {
      setTripPoints([]);
      clear();
      setSelectedRouteIdx(0);
      setAddingPoint(false);
    }
  }, [clear]);

  // Click on map => add point with reverse geocoding
  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (activePanel !== "planificar") return;
      if (tripPoints.length >= 2 && !addingPoint) return;
      const newIndex = tripPoints.length;
      setTripPoints((prev) => [...prev, { lat, lng, label: "Buscando..." }]);
      updateLabel(setTripPoints, newIndex, lat, lng);
      setAddingPoint(false);
    },
    [activePanel, tripPoints.length, addingPoint],
  );

  // Drag marker => update point position with reverse geocoding
  const handleMovePoint = useCallback(
    (index: number, lat: number, lng: number) => {
      setTripPoints((prev) =>
        prev.map((p, i) =>
          i === index ? { ...p, lat, lng, label: "Buscando..." } : p,
        ),
      );
      updateLabel(setTripPoints, index, lat, lng);
    },
    [],
  );

  // Remove a point
  const handleRemovePoint = useCallback((index: number) => {
    setTripPoints((prev) => prev.filter((_, i) => i !== index));
    clear();
  }, [clear]);

  // Use my location for a specific index (or append)
  const handleUseMyLocation = useCallback((index?: number) => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => handleGeoSuccess(pos, index, setTripPoints),
      (err) => {
        if (err.code === 1)
          alert("Permiso de ubicación denegado. Actívalo en tu navegador.");
        else if (err.code === 2)
          alert("No se pudo obtener tu ubicación. Intenta de nuevo.");
        else alert("Tiempo agotado obteniendo ubicación. Intenta de nuevo.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, []);

  // Reorder points (swap)
  const handleSwapPoints = useCallback((i: number, j: number) => {
    setTripPoints((prev) => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }, []);

  // Add point from search
  const handleAddPoint = useCallback(
    (lat: number, lng: number, label: string) => {
      setTripPoints((prev) => [...prev, { lat, lng, label }]);
    },
    [],
  );

  const handleUpdatePoint = useCallback(
    (index: number, lat: number, lng: number, label: string) => {
      setTripPoints((prev) =>
        prev.map((p, i) => (i === index ? { lat, lng, label } : p)),
      );
    },
    [],
  );

  const handleClearPrediction = useCallback(() => {
    setTripPoints([]);
    clear();
  }, [clear]);

  const handlePredict = useCallback(
    (
      orig: Coordinates,
      dest: Coordinates,
      mode: TransportMode,
      departureTime: string,
    ) => {
      const waypoints = tripPoints.length > 2
        ? tripPoints.slice(1, -1).map(p => ({ lat: p.lat, lng: p.lng }))
        : undefined;
      predictMulti({ origin: orig, destination: dest, waypoints, departureTime, mode });
    },
    [predictMulti, tripPoints],
  );

  return (
  <>
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <div className="hidden md:block">
        <Sidebar activePanel={activePanel} onTogglePanel={togglePanel} />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden relative">
          <SidePanel
            isOpen={activePanel === "planificar"}
            onClose={() => {
              setActivePanel(null);
              handleClearPrediction();
            }}
            title="Planificar viaje"
          >
            <PlanificarViajePanel
              onPredictMulti={handlePredict}
              options={options}
              isLoading={isLoading}
              error={error}
              tripPoints={tripPoints}
              onRemovePoint={handleRemovePoint}
              onUseMyLocation={handleUseMyLocation}
              onSwapPoints={handleSwapPoints}
              onClear={handleClearPrediction}
              onAddPoint={handleAddPoint}
              onUpdatePoint={handleUpdatePoint}
              onRequestAddPoint={() => setAddingPoint(true)}
              onSelectRoute={(idx: number) => setSelectedRouteIdx(idx)}
              selectedRouteIdx={selectedRouteIdx}
            />
          </SidePanel>
          <SidePanel
            isOpen={activePanel === "rutas"}
            onClose={() => {
              setActivePanel(null);
              setShowRoutesOnMap(false);
            }}
            title="Rutas del sistema"
          >
            <RutasPanel
              activeFilter={routeFilter}
              onFilterChange={(f) => setRouteFilter(f)}
              showTroncales={showTroncales}
              onToggleTroncales={() => setShowTroncales((v) => !v)}
              showEstaciones={showEstaciones}
              onToggleEstaciones={() => setShowEstaciones((v) => !v)}
              showSitpOnMap={showSitpOnMap}
              onToggleSitp={() => setShowSitpOnMap((v) => !v)}
              onSelectSitpRoute={(coords) => setSitpRouteCoords(coords)}
              onSelectTmRoute={(t) => setSelectedTroncal(t)}
            />
          </SidePanel>
          <SidePanel
            isOpen={activePanel === "accesibilidad"}
            onClose={() => setActivePanel(null)}
            title="Accesibilidad"
          >
            <AccesibilidadPanel />
          </SidePanel>
          <SidePanel
            isOpen={activePanel === "metricas"}
            onClose={() => setActivePanel(null)}
            title="Métricas del Grafo"
          >
            <MetricasPanel />
          </SidePanel>

          <MapView
            selectedTroncal={selectedTroncal}
            showTroncalesOnMap={showTroncales}
            showEstacionesOnMap={showEstaciones}
            showSitpOnMap={showSitpOnMap}
            sitpRouteCoords={activePanel === "rutas" ? (sitpRouteCoords || undefined) : undefined}
            onMapClick={handleMapClick}
            predictionMode={activePanel === "planificar" && (tripPoints.length < 2 || addingPoint)}
            prediction={activePanel === "planificar" ? (options?.[selectedRouteIdx]?.prediction ?? options?.[0]?.prediction ?? null) : null}
            altPredictions={activePanel === "planificar" ? (options?.filter((_, i) => i !== selectedRouteIdx).map(o => o.prediction) ?? []) : []}
            onSelectAltRoute={(ai) => {
              // ai = index in altPredictions (which skips selectedRouteIdx)
              let realIdx = 0;
              let count = 0;
              for (let i = 0; i < (options?.length ?? 0); i++) {
                if (i === selectedRouteIdx) continue;
                if (count === ai) { realIdx = i; break; }
                count++;
              }
              setSelectedRouteIdx(realIdx);
            }}
            tripPoints={activePanel === "planificar" ? tripPoints : []}
            onMovePoint={handleMovePoint}
            showCongestion={showCongestion}
            showSiniestros={showSiniestros}
            showRoutesOnMap={showRoutesOnMap}
          />

          {/* Toggle siniestralidad */}
          <button
            onClick={() => setShowSiniestros((v) => !v)}
            className={`absolute top-[90px] right-[10px] z-[400] w-[34px] h-[34px] rounded-md flex items-center justify-center shadow-lg transition-all duration-200 ${
              showSiniestros
                ? "bg-danger text-white shadow-danger/30"
                : "bg-background/90 text-default-500 border border-divider hover:text-danger"
            }`}
            title="Zonas de riesgo vial"
          >
            <AlertTriangle size={18} />
          </button>
        </main>

        <MobileNav activePanel={activePanel} onTogglePanel={togglePanel} />
      </div>
    </div>
    <ChatWidget activeModule={activePanel} />
  </>
  );
}
