import L from "leaflet";

/** Direction arrow icon for route polylines */
export function makeArrowIcon(angle: number, color: string) {
  return L.divIcon({
    className: "",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    html: `<div style="width:16px;height:16px;display:flex;align-items:center;justify-content:center;transform:rotate(${angle}deg);">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M6 1L10 6L6 11" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>
    </div>`,
  });
}

/** GPS user location icon with direction cone */
export function makeUserGpsIcon(heading: number | null) {
  const rotation = heading !== null ? heading : 0;
  const showCone = heading !== null;
  return L.divIcon({
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    html: `<div style="width:40px;height:40px;position:relative;display:flex;align-items:center;justify-content:center;">
      ${
        showCone
          ? `<div style="position:absolute;width:40px;height:40px;transform:rotate(${rotation - 90}deg);">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <path d="M20 4 L32 20 L20 14 L8 20 Z" fill="#3b82f6" opacity="0.25"/>
        </svg>
      </div>`
          : ""
      }
      <div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 3px rgba(59,130,246,0.3),0 2px 8px rgba(0,0,0,0.3);"></div>
    </div>`,
  });
}

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

/** Larger TM/SITP icon for route start/end markers */
export function makeTransitEndpointIcon(
  mode: "transmilenio" | "sitp",
  isStart: boolean,
  size = 34,
) {
  const logo = mode === "transmilenio" ? "tm-logo.svg" : "sitp-logo.svg";
  const logoWidth = mode === "transmilenio" ? 18 : 21;
  const borderColor = isStart ? "#22c55e" : "#ef4444";

  return L.divIcon({
    className: "",
    iconSize: [size, size + 12],
    iconAnchor: [size / 2, size + 12],
    popupAnchor: [0, -(size + 12)],
    html: `<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.4));">
      <div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;border:3px solid ${borderColor};border-radius:9999px;background:#fff;">
        <img src="/icons/${logo}" alt="" style="display:block;width:${logoWidth}px;height:18px;object-fit:contain;" />
      </div>
      <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${borderColor};"></div>
    </div>`,
  });
}
