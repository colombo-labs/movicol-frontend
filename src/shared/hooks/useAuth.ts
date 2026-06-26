import { useEffect, useReducer } from "react";
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

// Singleton auth state — shared across all hook instances
let globalUser: User | null = null;
let globalLoading = true;
let globalSocket: Socket | null = null;
let fetchPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

async function doFetchMe() {
  try {
    // Skip auth check if no session cookie exists
    if (!document.cookie.includes('access_token')) {
      globalUser = null;
      return;
    }
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      globalUser = await res.json();
    } else {
      globalUser = null;
    }
  } catch {
    globalUser = null;
  } finally {
    globalLoading = false;
    notify();
  }
}

// Fetch only once on app load
function initAuth() {
  fetchPromise ??= doFetchMe();

  return fetchPromise;
}

export function useAuth() {
  const [, forceRender] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    const cb = () => forceRender();
    listeners.add(cb);
    initAuth();
    return () => {
      listeners.delete(cb);
    };
  }, []);

  // WebSocket for real-time updates
  useEffect(() => {
    if (!globalUser || globalSocket) return;

    const socket = io(`${API_URL}/ws`, { transports: ["websocket"] });
    globalSocket = socket;

    socket.on("connect", () => {
      socket.emit("user:join", { userId: globalUser!.id });
    });

    socket.on("user:updated", () => {
      fetchPromise = null;
      doFetchMe();
    });

    socket.on("user:force_logout", () => {
      fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      document.cookie = "access_token=; Max-Age=0; path=/";
      globalUser = null;
      globalSocket?.disconnect();
      globalSocket = null;
      notify();
    });

    return () => {
      socket.disconnect();
      globalSocket = null;
    };
  }, [globalUser?.id]);

  const login = () => {
    globalThis.location.href = `${API_URL}/auth/google`;
  };

  const logout = async () => {
    globalSocket?.disconnect();
    globalSocket = null;
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    document.cookie = "access_token=; Max-Age=0; path=/";
    globalUser = null;
    fetchPromise = null;
    notify();
  };

  const can = (permission: string) =>
    globalUser?.permissions?.includes(permission) ?? false;

  const refetch = () => {
    fetchPromise = null;
    doFetchMe();
  };

  return {
    user: globalUser,
    isAuthenticated: !!globalUser,
    isLoading: globalLoading,
    login,
    logout,
    can,
    refetch,
  };
}
