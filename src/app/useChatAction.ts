import { useCallback } from "react";
import type { ChatAction } from "@modules/chat/hooks/useChatWs";
import type { TripPoint } from "./Layout";

interface UseChatActionOptions {
  setTripPoints: React.Dispatch<React.SetStateAction<TripPoint[]>>;
  togglePanel: (id: string) => void;
}

async function geocodeQuery(query: string) {
  const { geocodeAddress } = await import("@shared/utils/geocode");
  const normalized = query.toLowerCase().includes("bogot")
    ? query
    : `${query} Bogotá`;
  return geocodeAddress(normalized);
}

function setPointsWithGeolocation(
  dest: { lat: number; lng: number; label: string },
  setTripPoints: React.Dispatch<React.SetStateAction<TripPoint[]>>,
  togglePanel: (id: string) => void,
) {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      setTripPoints([
        { lat: latitude, lng: longitude, label: "Mi ubicación" },
        { lat: dest.lat, lng: dest.lng, label: dest.label },
      ]);
      togglePanel("planificar");
      import("@shared/utils/reverseGeocode").then(({ reverseGeocode }) => {
        reverseGeocode(latitude, longitude).then((addr) => {
          setTripPoints((prev) =>
            prev.map((p, i) => (i === 0 ? { ...p, label: addr } : p)),
          );
        });
      });
    },
    () => {
      setTripPoints([{ lat: dest.lat, lng: dest.lng, label: dest.label }]);
      togglePanel("planificar");
    },
    { enableHighAccuracy: true, timeout: 10000 },
  );
}

async function handlePlanRoute(
  action: ChatAction,
  setTripPoints: React.Dispatch<React.SetStateAction<TripPoint[]>>,
  togglePanel: (id: string) => void,
) {
  const { origin, destination } = action.data as {
    origin?: string;
    destination?: string;
  };

  if (!destination) return;

  const destResults = await geocodeQuery(destination);
  if (destResults.length === 0) {
    togglePanel("planificar");
    return;
  }

  const dest = destResults[0];

  if (!origin || origin === "tu ubicacion") {
    setPointsWithGeolocation(dest, setTripPoints, togglePanel);
    return;
  }

  // Geocode both origin and destination
  const origResults = await geocodeQuery(origin);
  togglePanel("planificar");
  await new Promise((r) => setTimeout(r, 100));

  if (origResults.length > 0) {
    const orig = origResults[0];
    setTripPoints([
      { lat: orig.lat, lng: orig.lng, label: orig.label },
      { lat: dest.lat, lng: dest.lng, label: dest.label },
    ]);
  } else {
    setTripPoints([{ lat: dest.lat, lng: dest.lng, label: dest.label }]);
  }
}

function handleShowStation(
  action: ChatAction,
  setTripPoints: React.Dispatch<React.SetStateAction<TripPoint[]>>,
  togglePanel: (id: string) => void,
) {
  const { lat, lon, name } = action.data as {
    lat?: number;
    lon?: number;
    name?: string;
  };
  if (lat && lon) {
    setTripPoints([{ lat, lng: lon, label: name || "Estación" }]);
  }
  togglePanel("rutas");
}

export function useChatAction({ setTripPoints, togglePanel }: UseChatActionOptions) {
  return useCallback(
    async (action: ChatAction) => {
      switch (action.type) {
        case "plan_route":
          await handlePlanRoute(action, setTripPoints, togglePanel);
          break;
        case "show_station":
          handleShowStation(action, setTripPoints, togglePanel);
          break;
        case "show_congestion":
          togglePanel("metricas");
          break;
        default:
          break;
      }
    },
    [setTripPoints, togglePanel],
  );
}
