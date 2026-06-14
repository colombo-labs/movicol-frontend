import { useCallback, useState } from "react";

/**
 * Reusable hook for modal state management.
 * Usage: const { isOpen, open, close, data } = useModal<StationData>();
 */
export function useModal<T = unknown>() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((payload?: T) => {
    if (payload) setData(payload);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  return { isOpen, open, close, data };
}
