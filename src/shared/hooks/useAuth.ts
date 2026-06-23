import { useCallback, useEffect, useState } from "react";
import { API_URL } from "@/shared/config";

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: { name: string };
  createdAt?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      // Use proxy path so cookies are same-origin
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        setUser(await res.json());
      } else if (res.status === 401) {
        // Try refresh token
        const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
        if (refreshRes.ok) {
          const retry = await fetch("/api/auth/me");
          if (retry.ok) { setUser(await retry.json()); return; }
        }
        setUser(null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (window.location.search.includes("auth=success")) {
      window.history.replaceState({}, "", window.location.pathname);
    }
    fetchMe();
  }, [fetchMe]);

  const login = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };
}
