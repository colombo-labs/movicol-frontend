import { useCallback, useEffect, useRef, useState } from 'react';
import type { Station } from '../models';

export function useStationSearch() {
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading] = useState(false);
  const [query, setQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const search = useCallback(async (_q: string) => {
    // TODO: call map API
    setStations([]);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  return { stations, isLoading, query, setQuery };
}
