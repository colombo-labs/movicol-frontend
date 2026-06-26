import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";

interface Favorite {
  id: string;
  type: string;
  label: string;
  data: Record<string, unknown>;
  createdAt: string;
}

export function useFavorites() {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    const res = await fetch("/api/user/favorites");
    if (res.ok) setFavorites(await res.json());
  }, [isAuthenticated]);

  useEffect(() => {
    load();
  }, [load]);

  const addFavorite = async (
    type: string,
    label: string,
    data: Record<string, unknown>,
  ) => {
    if (!isAuthenticated) return null;
    const res = await fetch("/api/user/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, label, data }),
    });
    if (res.ok) {
      load();
      return true;
    }
    return false;
  };

  const removeFavorite = async (id: string) => {
    await fetch(`/api/user/favorites/${id}`, { method: "DELETE" });
    load();
  };

  return { favorites, addFavorite, removeFavorite, isAuthenticated };
}
