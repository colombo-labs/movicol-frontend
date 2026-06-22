import { useCallback, useEffect, useState } from "react";
import { api } from "@shared/api/http-client";
import type { Station } from "@shared/types";

export function useStations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get<Station[]>("/graph/stations?limit=500");
      setStations(data);
    } catch {
      setStations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  return { stations, isLoading, refetch: fetchStations };
}
