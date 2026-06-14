import { useState } from "react";
import { TRONCAL_COLORS } from "./TroncalesLayer";

const DISPLAY_NAMES: Record<string, string> = {
  "AUTOPISTA NORTE": "Autopista Norte",
  CARACAS: "Caracas",
  "CALLE 80": "Calle 80",
  AMERICAS: "Américas",
  "NQS CENTRAL": "NQS Central",
  "NQS SUR": "NQS Sur",
  SUBA: "Suba",
  "CALLE 26": "Calle 26",
  "EJE AMBIENTAL": "Eje Ambiental",
  "CARRERA 7": "Carrera 7",
  "CARRERA 10": "Carrera 10",
};

interface Props {
  showTroncales: boolean;
  showEstaciones: boolean;
  onToggleTroncales: () => void;
  onToggleEstaciones: () => void;
  panelOpen?: boolean;
}

export function TroncalesLegend({
  showTroncales,
  showEstaciones,
  onToggleTroncales,
  onToggleEstaciones,
  panelOpen,
}: Props) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div
      className={`absolute ${panelOpen ? "bottom-16 md:bottom-24 right-3" : "bottom-16 md:bottom-24 right-3 sm:bottom-3 sm:left-3 sm:right-auto"} z-[1000] select-none`}
    >
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="sm:hidden bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-lg px-2.5 py-1.5 text-[10px] text-white/90 font-semibold flex items-center gap-1.5"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Capas
        </button>
      )}

      <div
        className={`${collapsed ? "hidden sm:block" : "block"} bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-lg p-2.5 text-[10px] max-h-[220px] overflow-y-auto w-[170px]`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-semibold text-[11px] text-white/90">
            Capas del sistema
          </span>
          <button
            onClick={() => setCollapsed(true)}
            className="sm:hidden text-white/50 text-[14px] leading-none"
          >
            &times;
          </button>
        </div>

        <div className="flex flex-col gap-1 mb-1.5 pb-1.5 border-b border-white/20">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showTroncales}
              onChange={onToggleTroncales}
              className="w-3 h-3 rounded accent-emerald-400"
            />
            <span className="text-white/80">Troncales</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showEstaciones}
              onChange={onToggleEstaciones}
              className="w-3 h-3 rounded accent-emerald-400"
            />
            <span className="text-white/80">Estaciones</span>
          </label>
        </div>

        {showTroncales && (
          <div className="flex flex-col gap-0.5">
            {Object.entries(TRONCAL_COLORS)
              .filter(([key]) => DISPLAY_NAMES[key])
              .map(([key, color]) => (
                <div key={key} className="flex items-center gap-1.5 py-0.5">
                  <span
                    className="w-4 h-1 rounded-full inline-block flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-white/70 truncate">
                    {DISPLAY_NAMES[key]}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
