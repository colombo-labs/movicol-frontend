import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";

interface SavedRoute {
  id: string;
  originLabel: string;
  originLat: number;
  originLng: number;
  destLabel: string;
  destLat: number;
  destLng: number;
  estimatedMinutes?: number;
  mode?: string;
  createdAt: string;
}

export function useSavedRoutes() {
  const { isAuthenticated } = useAuth();
  const [routes, setRoutes] = useState<SavedRoute[]>([]);

  const fetch_ = useCallback(async () => {
    if (!isAuthenticated) return;
    const res = await fetch("/api/saved-routes");
    if (res.ok) {
      const data = await res.json();
      setRoutes(
        data.map((r: Record<string, string>) => ({
          ...r,
          originLat: +r.originLat,
          originLng: +r.originLng,
          destLat: +r.destLat,
          destLng: +r.destLng,
        })),
      );
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  const save = async (data: Omit<SavedRoute, "id" | "createdAt">) => {
    const res = await fetch("/api/saved-routes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const saved = await res.json();
      setRoutes((prev) => [saved, ...prev].slice(0, 20));
      return saved;
    }
    return null;
  };

  const remove = async (id: string) => {
    await fetch(`/api/saved-routes/${id}`, { method: "DELETE" });
    setRoutes((prev) => prev.filter((r) => r.id !== id));
  };

  return { routes, save, remove, refetch: fetch_ };
}
