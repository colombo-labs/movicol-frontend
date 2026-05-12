import { Button, Select, SelectItem } from '@heroui/react';
import { useState } from 'react';

import { GlassCard } from '@shared/ui/GlassCard';
import { StationAutocomplete } from '@shared/ui/StationAutocomplete';
import { useRoutePredict } from '../hooks/useRoutePredict';
import { InsightCard } from '../components/widgets/InsightCard';

const transportModes = [
  { key: 'troncal', label: 'TransMilenio (Troncal)' },
  { key: 'zonal', label: 'SITP (Zonal)' },
  { key: 'integrado', label: 'Integrado (TM + SITP)' },
];

/**
 * FEATURE: Panel completo de predicción de rutas.
 * Integra: selector de modo + autocompletado + botón + resultado.
 * Se usa dentro de PrediccionesPage como bloque funcional.
 */
export function RoutePredictFeature() {
  const [mode, setMode] = useState('integrado');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const { predict, prediction, isLoading } = useRoutePredict();

  const handlePredict = () => {
    if (origin && destination) predict({ origin, destination, mode });
  };

  return (
    <div className="space-y-4">
      <GlassCard>
        <Select label="Modo de transporte" selectedKeys={[mode]} onSelectionChange={(keys) => setMode([...keys][0] as string)} variant="bordered">
          {transportModes.map((m) => <SelectItem key={m.key}>{m.label}</SelectItem>)}
        </Select>
      </GlassCard>

      <GlassCard className="space-y-3">
        <StationAutocomplete label="Origen" placeholder="Ej. Portal Norte" icon="origin" value={origin} onChange={setOrigin} />
        <StationAutocomplete label="Destino" placeholder="Ej. Universidades" icon="destination" value={destination} onChange={setDestination} />
      </GlassCard>

      <Button color="primary" size="lg" className="w-full" isLoading={isLoading} isDisabled={!origin || !destination} onPress={handlePredict} startContent={!isLoading && <span>✨</span>}>
        Predecir Ruta AI
      </Button>

      {prediction && <InsightCard prediction={prediction} />}
    </div>
  );
}
