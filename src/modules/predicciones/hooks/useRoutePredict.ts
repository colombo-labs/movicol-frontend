import { useCallback, useState } from 'react';
import type { PredictionResponse } from '../models';

interface PredictParams { origin: string; destination: string; mode: string; }

export function useRoutePredict() {
  const [prediction] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const predict = useCallback(async (_params: PredictParams) => {
    setIsLoading(true);
    // TODO: call predictions API
    setTimeout(() => { setIsLoading(false); }, 1000);
  }, []);

  return { predict, prediction, isLoading };
}
