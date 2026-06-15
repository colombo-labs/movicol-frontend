import { useState, useCallback } from "react";

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
import { useRoutePredict } from "@modules/predicciones/hooks/useRoutePredict";
import type { Coordinates } from "@modules/predicciones/models";
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

export function Layout() {
  const [activePanel, setActivePanel] = useState<PanelId>(null);
  const [showTroncales, setShowTroncales] = useState(false);
  const [showEstaciones, setShowEstaciones] = useState(false);
  const [showSitpOnMap, setShowSitpOnMap] = useState(false);
  const [selectedTroncal, setSelectedTroncal] = useState<string | null>(null);
  const [sitpRouteCoords, setSitpRouteCoords] = useState<{
    coords: [number, number][];
    stops: { lat: number; lon: number; nombre: string }[];
  } | null>(null);
  const [tripPoints, setTripPoints] = useState<TripPoint[]>([]);
  const [routeFilter, setRouteFilter] = useState<"all" | "tm" | "sitp">("all");
  const [showRoutesOnMap, setShowRoutesOnMap] = useState(false);
  const [showCongestion] = useState(false);
  const { predict, prediction, isLoading, error, clear } = useRoutePredict();

  const togglePanel = useCallback((id: PanelId) => {
    setActivePanel(id);
  }, []);

  // Click on map => add point with reverse geocoding
  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (activePanel !== "planificar") return;
      const newIndex = tripPoints.length;
      setTripPoints((prev) => [...prev, { lat, lng, label: "Buscando..." }]);
      updateLabel(setTripPoints, newIndex, lat, lng);
    },
    [activePanel, tripPoints.length],
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
  }, []);

  // Use my location for a specific index (or append)
  const handleUseMyLocation = useCallback((index?: number) => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const pt: TripPoint = { lat, lng, label: "Obteniendo dirección..." };
        setTripPoints((prev) => {
          if (index !== undefined && index < prev.length) {
            return prev.map((p, i) => (i === index ? pt : p));
          }
          return [pt, ...prev];
        });
        const targetIdx = index !== undefined ? index : 0;
        updateLabel(setTripPoints, targetIdx, lat, lng);
      },
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

  const handleClearPrediction = useCallback(() => {
    setTripPoints([]);
    clear();
  }, [clear]);

  const handlePredict = useCallback(
    (
      orig: Coordinates,
      dest: Coordinates,
      mode: "transmilenio" | "sitp" | "vehiculo",
      departureTime: string,
    ) => {
      predict({ origin: orig, destination: dest, departureTime, mode });
    },
    [predict],
  );

  return (
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
              onPredict={handlePredict}
              prediction={prediction}
              isLoading={isLoading}
              error={error}
              tripPoints={tripPoints}
              onRemovePoint={handleRemovePoint}
              onUseMyLocation={handleUseMyLocation}
              onSwapPoints={handleSwapPoints}
              onClear={handleClearPrediction}
              onAddPoint={handleAddPoint}
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
            sitpRouteCoords={sitpRouteCoords || undefined}
            onMapClick={handleMapClick}
            predictionMode={activePanel === "planificar"}
            showRouteFilters={showRoutesOnMap}
            routeFilter={routeFilter}
            prediction={prediction}
            tripPoints={tripPoints}
            onMovePoint={handleMovePoint}
            showCongestion={showCongestion}
          />
        </main>

        <MobileNav activePanel={activePanel} onTogglePanel={togglePanel} />
      </div>
      <ChatWidget />
    </div>
  );
}
