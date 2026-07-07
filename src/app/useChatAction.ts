import { useCallback } from "react";
import type { ChatAction } from "@modules/chat/hooks/useChatWs";
import type { TripPoint } from "./Layout";
import type { PanelId } from "@shared/ui/Sidebar";

type SetTripPoints = React.Dispatch<React.SetStateAction<TripPoint[]>>;
type TogglePanel = (id: PanelId) => void;

interface UseChatActionOptions {
  setTripPoints: SetTripPoints;
  togglePanel: TogglePanel;
}

async function geocodeQuery(query: string) {
  const { geocodeAddress } = await import("@shared/utils/geocode");
  const normalized = query.toLowerCase().includes("bogot")
    ? query
    : `${query} Bogotá`;
  return geocodeAddress(normalized);
}

function updateOriginLabel(
  setTripPoints: SetTripPoints,
  lat: number,
  lng: number,
) {
  import("@shared/utils/reverseGeocode").then(({ reverseGeocode }) =>
    reverseGeocode(lat, lng).then((addr) =>
      setTripPoints((prev) =>
        prev.map((p, i) => (i === 0 ? { ...p, label: addr } : p)),
      ),
    ),
  );
}

function onGeoSuccess(
  pos: GeolocationPosition,
  dest: { lat: number; lng: number; label: string },
  setTripPoints: SetTripPoints,
  togglePanel: TogglePanel,
) {
  const { latitude, longitude } = pos.coords;
  setTripPoints([
    { lat: latitude, lng: longitude, label: "Mi ubicación" },
    { lat: dest.lat, lng: dest.lng, label: dest.label },
  ]);
  togglePanel("planificar");
  updateOriginLabel(setTripPoints, latitude, longitude);
}

function requestGeolocationRoute(
  dest: { lat: number; lng: number; label: string },
  setTripPoints: SetTripPoints,
  togglePanel: TogglePanel,
) {
  navigator.geolocation.getCurrentPosition(
    (pos) => onGeoSuccess(pos, dest, setTripPoints, togglePanel),
    () => {
      setTripPoints([{ lat: dest.lat, lng: dest.lng, label: dest.label }]);
      togglePanel("planificar");
    },
    { enableHighAccuracy: true, timeout: 10000 },
  );
}

async function handlePlanRoute(
  action: ChatAction,
  setTripPoints: SetTripPoints,
  togglePanel: TogglePanel,
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
    requestGeolocationRoute(dest, setTripPoints, togglePanel);
    return;
  }

  const origResults = await geocodeQuery(origin);
  togglePanel("planificar");
  await new Promise((r) => setTimeout(r, 100));

  const orig = origResults.length > 0 ? origResults[0] : null;
  const points: TripPoint[] = orig
    ? [
        { lat: orig.lat, lng: orig.lng, label: orig.label },
        { lat: dest.lat, lng: dest.lng, label: dest.label },
      ]
    : [{ lat: dest.lat, lng: dest.lng, label: dest.label }];

  setTripPoints(points);
}

function handleShowStation(
  action: ChatAction,
  setTripPoints: SetTripPoints,
  togglePanel: TogglePanel,
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

export function useChatAction({
  setTripPoints,
  togglePanel,
}: UseChatActionOptions) {
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
