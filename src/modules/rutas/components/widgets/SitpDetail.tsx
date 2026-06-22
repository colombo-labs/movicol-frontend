import { RutaDetail } from "./RutaDetail";
import type { SitpRuta } from "../../models/types";

interface Props {
  readonly ruta: SitpRuta;
  readonly onBack: () => void;
}

export function SitpDetail({ ruta, onBack }: Props) {
  return (
    <RutaDetail
      iconSrc="/icons/sitp-logo.svg"
      codigo={ruta.ruta}
      subtitulo={`Cenefa: ${ruta.cenefa}`}
      origen={ruta.paraderos[0]?.nombre || ""}
      destino={ruta.paraderos[ruta.paraderos.length - 1]?.nombre || ""}
      paradas={ruta.paraderos}
      badgeLabel={`${ruta.paraderos.length} paradas`}
      badgeColor="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
      accentColor="blue"
      onBack={onBack}
    />
  );
}
