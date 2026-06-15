/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef } from "react";
import { Marker, useMap } from "react-leaflet";
import L from "leaflet";

export function makeIcon(color: string, size = 32, label?: string) {
  return L.divIcon({
    className: "",
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    html: `<div style="position:relative;width:${size}px;height:${size + 8}px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 1C7.58 1 4 4.58 4 9c0 6.25 8 14 8 14s8-7.75 8-14c0-4.42-3.58-8-8-8z" fill="${color}" stroke="#fff" stroke-width="2"/>
        <circle cx="12" cy="9" r="3" fill="#fff"/>
        ${label ? `<text x="12" y="10.5" text-anchor="middle" font-size="5" font-weight="bold" fill="${color}">${label}</text>` : ""}
      </svg>
    </div>`,
  });
}

// Draggable Marker component

export function DraggableMarker({
  position,
  icon,
  onDragEnd,
}: Readonly<{
  position: [number, number];
  icon: L.DivIcon;
  onDragEnd: (lat: number, lng: number) => void;
}>) {
  const markerRef = useRef<L.Marker>(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker) {
          const { lat, lng } = marker.getLatLng();
          onDragEnd(lat, lng);
        }
      },
    }),
    [onDragEnd],
  );
  return (
    <Marker
      draggable
      position={position}
      icon={icon}
      eventHandlers={eventHandlers}
      ref={markerRef}
    />
  );
}

// SITP bus stops layer

export function FitRouteBounds({
  prediction,
  tripPoints,
}: {
  prediction: any;
  tripPoints: any[];
}) {
  const map = useMap();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    try {
      if (prediction?.risk_segments?.length > 0) {
        const allCoords: [number, number][] = [];
        prediction.risk_segments.forEach((s: any) => {
          if (s.coordinates) {
            s.coordinates.forEach((c: [number, number]) => {
              if (
                c &&
                c.length >= 2 &&
                c[0] > 4 &&
                c[0] < 5 &&
                c[1] < -73 &&
                c[1] > -75
              ) {
                allCoords.push(c);
              }
            });
          }
        });
        if (allCoords.length > 1) {
          const bounds = L.latLngBounds(allCoords);
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
          }
        }
      } else if (tripPoints.length >= 2) {
        const coords = tripPoints.map(
          (p: any) => [p.lat, p.lng] as [number, number],
        );
        if (
          coords.every((c) => Number.isFinite(c[0]) && Number.isFinite(c[1]))
        ) {
          const bounds = L.latLngBounds(coords);
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
          }
        }
      }
    } catch {
      // Silently ignore bounds errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prediction, tripPoints.length]);
  return null;
}

// Fix: invalidate map size once after initial render

export function InvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export function MapClickHandler({
  onClick,
  active,
}: {
  onClick: (lat: number, lng: number) => void;
  active: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    if (!active) return;
    const handler = (e: L.LeafletMouseEvent) =>
      onClick(e.latlng.lat, e.latlng.lng);
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [active, map, onClick]);
  return null;
}
