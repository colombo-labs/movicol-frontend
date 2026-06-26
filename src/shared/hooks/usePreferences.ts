import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";

interface Preferences {
  language: string;
  theme: string;
  notificationsEnabled: boolean;
}

export function usePreferences() {
  const { isAuthenticated } = useAuth();
  const [prefs, setPrefs] = useState<Preferences | null>(null);

  const fetch_ = useCallback(async () => {
    if (!isAuthenticated) return;
    const res = await fetch("/api/preferences");
    if (res.ok) setPrefs(await res.json());
  }, [isAuthenticated]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  const update = async (data: Partial<Preferences>) => {
    const res = await fetch("/api/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) setPrefs(await res.json());
  };

  return { prefs, update };
}
