import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import { useTheme } from '@shared/hooks/useTheme';
import 'leaflet/dist/leaflet.css';

const tiles = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
};

export function MapView() {
  const { theme } = useTheme();

  return (
    <MapContainer
      center={[4.6097, -74.0817]}
      zoom={12}
      zoomControl={false}
      className="w-full h-full z-0"
      attributionControl={false}
    >
      <TileLayer key={theme} url={tiles[theme]} />
      <ZoomControl position="topright" />
    </MapContainer>
  );
}
