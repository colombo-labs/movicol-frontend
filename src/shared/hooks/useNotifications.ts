import { authFetch } from "@/shared/api/auth-fetch";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchAll = useCallback(async () => {
    if (!isAuthenticated) return;
    const res = await authFetch("/notifications");
    if (res.ok) {
      const data = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter((n: AppNotification) => !n.read).length);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const markRead = async (id: string) => {
    await fetch(`${API_URL}/notifications/${id}/read`, { method: "PATCH" });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await fetch(`${API_URL}/notifications/read-all`, { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clear = async () => {
    await fetch(`${API_URL}/notifications`, { method: "DELETE" });
    setNotifications([]);
    setUnreadCount(0);
  };

  const remove = async (id: string) => {
    await fetch(`${API_URL}/notifications/${id}`, { method: "DELETE" });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  return {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    clear,
    remove,
    refetch: fetchAll,
  };
}
