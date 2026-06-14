import { Autocomplete, AutocompleteItem } from "@heroui/react";

import { useStationSearch } from "@modules/mapa/hooks/useStationSearch";

interface StationAutocompleteProps {
  label: string;
  placeholder?: string;
  icon?: "origin" | "destination";
  value: string;
  onChange: (stationId: string) => void;
}

/**
 * Reusable station autocomplete input.
 * Searches stations from the backend API with debounce.
 */
export function StationAutocomplete({
  label,
  placeholder = "Buscar estación...",
  icon = "origin",
  value,
  onChange,
}: StationAutocompleteProps) {
  const { stations, isLoading, query, setQuery } = useStationSearch();

  const iconColor = icon === "origin" ? "text-green-400" : "text-red-400";
  const iconSymbol = icon === "origin" ? "◉" : "◎";

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-default-500">{label}</label>
      <Autocomplete
        placeholder={placeholder}
        isLoading={isLoading}
        inputValue={query}
        onInputChange={setQuery}
        selectedKey={value}
        onSelectionChange={(key) => onChange(key as string)}
        startContent={
          <span className={`${iconColor} text-lg`}>{iconSymbol}</span>
        }
        variant="bordered"
        classNames={{
          base: "w-full",
          listboxWrapper: "max-h-[200px]",
        }}
      >
        {stations.map((station) => (
          <AutocompleteItem key={station.id} textValue={station.name}>
            <div className="flex flex-col">
              <span className="text-sm">{station.name}</span>
              <span className="text-xs text-default-400">
                {station.route || "Sin ruta"}
              </span>
            </div>
          </AutocompleteItem>
        ))}
      </Autocomplete>
    </div>
  );
}
