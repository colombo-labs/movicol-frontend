import { Train, Bus, Bike, Footprints, Car } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type TransportMode =
  | "transmilenio"
  | "sitp"
  | "bicicleta"
  | "apie"
  | "vehiculo";

interface ModeDef {
  id: TransportMode;
  icon: LucideIcon;
  label: string;
}

const modes: ModeDef[] = [
  { id: "transmilenio", icon: Train, label: "TransMilenio" },
  { id: "sitp", icon: Bus, label: "SITP" },
  { id: "bicicleta", icon: Bike, label: "Bicicleta" },
  { id: "apie", icon: Footprints, label: "A pie" },
  { id: "vehiculo", icon: Car, label: "Carro/Moto" },
];

interface TransportModeSelectorProps {
  activeMode: TransportMode;
  onSelect: (mode: TransportMode) => void;
}

export function TransportModeSelector({
  activeMode,
  onSelect,
}: TransportModeSelectorProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-background/95 backdrop-blur-xl rounded-2xl px-3 py-2 border border-divider shadow-xl">
      {modes.map((m) => {
        const Icon = m.icon;
        const isActive = activeMode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            title={`Ir en ${m.label}`}
            aria-label={`Modo de transporte: ${m.label}`}
            aria-pressed={isActive}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 select-none ${
              isActive
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                : "text-default-500 hover:text-foreground hover:bg-default-100 active:scale-95"
            }`}
          >
            <Icon size={14} />
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
