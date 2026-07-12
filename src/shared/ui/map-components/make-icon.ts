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

export function makeTransitStopIcon(
  mode: "transmilenio" | "sitp",
  accentColor: string,
  size = 24,
) {
  const logo = mode === "transmilenio" ? "tm-logo.svg" : "sitp-logo.svg";
  const logoWidth = mode === "transmilenio" ? 15 : 18;

  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `<div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;border:2px solid #475569;border-radius:9999px;background:#fff;box-shadow:0 0 0 2px ${accentColor},0 2px 5px rgba(0,0,0,0.4);">
      <img src="/icons/${logo}" alt="" style="display:block;width:${logoWidth}px;height:16px;object-fit:contain;" />
    </div>`,
  });
}
