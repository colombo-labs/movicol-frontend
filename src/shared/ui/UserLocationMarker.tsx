import { Circle, CircleMarker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import { useGeolocation } from "@shared/hooks/useGeolocation";

interface UserLocationProps {
  followUser?: boolean;
}

/**
 * Muestra la ubicación del usuario en tiempo real con un pulso azul.
 * Opcionalmente centra el mapa en la ubicación.
 */
export function UserLocationMarker({ followUser = false }: UserLocationProps) {
  const { position } = useGeolocation();
  const map = useMap();

  useEffect(() => {
    if (position && followUser) {
      map.setView([position.lat, position.lng], 15);
    }
  }, [position, followUser, map]);

  if (!position) return null;

  return (
    <>
      {/* Accuracy circle */}
      <Circle
        center={[position.lat, position.lng]}
        radius={position.accuracy}
        pathOptions={{
          color: "#3b82f6",
          fillColor: "#3b82f6",
          fillOpacity: 0.1,
          weight: 1,
        }}
      />
      {/* User dot */}
      <CircleMarker
        center={[position.lat, position.lng]}
        radius={8}
        pathOptions={{
          color: "#ffffff",
          fillColor: "#3b82f6",
          fillOpacity: 1,
          weight: 3,
        }}
      >
        <Popup>Mi ubicación</Popup>
      </CircleMarker>
    </>
  );
}
