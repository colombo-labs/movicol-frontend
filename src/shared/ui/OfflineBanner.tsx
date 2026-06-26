import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";

export function OfflineBanner() {
  const { t } = useTranslation();
  const [offline, setOffline] = useState(!globalThis.navigator.onLine);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    globalThis.addEventListener("online", on);
    globalThis.addEventListener("offline", off);
    return () => {
      globalThis.removeEventListener("online", on);
      globalThis.removeEventListener("offline", off);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 py-2 bg-danger text-white text-xs font-medium">
      <WifiOff size={14} /> {t("common.offline")}
    </div>
  );
}
