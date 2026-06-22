import { RutaDetail } from "./RutaDetail";
import type { TmRuta } from "../../models/types";

interface Props {
  readonly ruta: TmRuta;
  readonly onBack: () => void;
}

export function TmRutaDetail({ ruta, onBack }: Props) {
  return (
    <RutaDetail
      iconSrc="/icons/tm-logo.svg"
      codigo={ruta.codigo}
      subtitulo={`Bus: ${ruta.tipo_bus}`}
      origen={ruta.origen}
      destino={ruta.destino}
      extra={`L-V: ${ruta.horario_lv} | Sáb: ${ruta.horario_sab} | ${ruta.estado}`}
      paradas={ruta.estaciones}
      badgeLabel={`${ruta.estaciones.length} estaciones`}
      badgeColor="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
      accentColor="emerald"
      onBack={onBack}
    />
  );
}
