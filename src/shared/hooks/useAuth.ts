import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { API_URL } from "@/shared/config";

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: { name: string };
  createdAt?: string;
  permissions?: string[];
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        setUser(await res.json());
      } else if (res.status === 401) {
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

  // WebSocket: listen for role changes and force logout
  useEffect(() => {
    if (!user) return;

    const socket = io(`${API_URL}/ws`, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("user:join", { userId: user.id });
    });

    socket.on("user:updated", () => {
      // Re-fetch user data to get updated role/permissions
      fetchMe();
    });

    socket.on("user:force_logout", () => {
      // Force logout — clear everything
      fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      setUser(null);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id, fetchMe]);

  const login = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const logout = async () => {
    // Disconnect WS first
    socketRef.current?.disconnect();
    // Clear server session + cookies
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    // Clear cookies client-side as fallback
    document.cookie = "access_token=; Max-Age=0; path=/";
    // Clear local state
    setUser(null);
  };

  const can = (permission: string) => user?.permissions?.includes(permission) ?? false;

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    can,
  };
}
