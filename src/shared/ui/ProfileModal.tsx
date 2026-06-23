import { useTranslation } from "react-i18next";
import { AppModal } from "@shared/ui/AppModal";
import { User, Mail, Shield, Calendar, MapPin } from "lucide-react";
import { useAuth } from "@/shared/hooks/useAuth";
import { useEffect, useState } from "react";

interface Props {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const [city, setCity] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
          );
          const data = await res.json();
          const loc =
            data.address?.city ||
            data.address?.town ||
            data.address?.state ||
            "";
          setCity(loc);
        } catch {
          setCity("");
        }
      },
      () => setCity(""),
      { timeout: 5000 },
    );
  }, [isOpen]);

  return (
    <AppModal isOpen={isOpen} onClose={onClose} title={t("auth.profile")} size="md">
      <div className="space-y-4">
        {/* Avatar + Name */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-14 h-14 rounded-full border-2 border-primary/30"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
              <User size={28} className="text-primary" />
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-foreground">
              {user?.name || "Usuario MoviCol"}
            </p>
            <p className="text-xs text-default-400">
              {user?.email || "Sin sesión iniciada"}
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2.5 pt-3 border-t border-divider">
          <div className="flex items-center gap-2 text-xs">
            <Mail size={13} className="text-default-400" />
            <span className="text-default-500">{t("auth.email")}</span>
            <span className="ml-auto font-medium text-foreground">
              {user?.email || "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Shield size={13} className="text-default-400" />
            <span className="text-default-500">{t("auth.role")}</span>
            <span className="ml-auto font-medium text-foreground capitalize">
              {user?.role?.name || "—"}
            </span>
          </div>
          {city && (
            <div className="flex items-center gap-2 text-xs">
              <MapPin size={13} className="text-default-400" />
              <span className="text-default-500">{t("auth.city")}</span>
              <span className="ml-auto font-medium text-foreground">
                {city}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs">
            <Calendar size={13} className="text-default-400" />
            <span className="text-default-500">{t("auth.memberSince")}</span>
            <span className="ml-auto font-medium text-foreground">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("es-CO", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-divider">
          <div className="text-center p-2 rounded-lg bg-default-100">
            <p className="text-sm font-bold text-foreground">0</p>
            <p className="text-[9px] text-default-400">{t("auth.trips")}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-default-100">
            <p className="text-sm font-bold text-foreground">0</p>
            <p className="text-[9px] text-default-400">{t("auth.favorites")}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-default-100">
            <p className="text-sm font-bold text-foreground">0</p>
            <p className="text-[9px] text-default-400">{t("auth.reports")}</p>
          </div>
        </div>

        {/* Logout */}
        {isAuthenticated && (
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-danger/10 text-danger text-xs font-semibold hover:bg-danger/20 transition-colors"
          >
            {t("auth.logout")}
          </button>
        )}
      </div>
    </AppModal>
  );
}
