import { useCallback, useEffect, useRef, useState } from "react";

const BACKEND_URL = import.meta.env.VITE_API_URL || "";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  severity: string;
  lat?: number;
  lng?: number;
  route_codes?: string[];
  read: boolean;
  created_at: string;
  source: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const readIdsRef = useRef(
    new Set<string>(
      JSON.parse(localStorage.getItem("movicol_read_notifs") || "[]"),
    ),
  );
  const readIds = readIdsRef.current;

  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/notifications?hours=6`);
      if (res.ok) {
        const data = await res.json();
        const items: AppNotification[] = data.map(
          (n: Record<string, unknown>) => ({
            ...n,
            read: readIds.has(n.id as string),
            created_at: n.created_at as string,
          }),
        );
        setNotifications(items);
        setUnreadCount(items.filter((n) => !n.read).length);
      }
    } catch {
      /* offline */
    }
  }, [readIds]);

  useEffect(() => {
    fetchAll();
    // Poll every 60s for new notifications
    const interval = setInterval(fetchAll, 60000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const markRead = (id: string) => {
    readIds.add(id);
    localStorage.setItem("movicol_read_notifs", JSON.stringify([...readIds]));
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = () => {
    notifications.forEach((n) => readIds.add(n.id));
    localStorage.setItem("movicol_read_notifs", JSON.stringify([...readIds]));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const remove = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  return {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    clear: markAllRead,
    remove,
    refetch: fetchAll,
  };
}
