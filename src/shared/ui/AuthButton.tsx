import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import { LogIn, LogOut, User, Settings } from "lucide-react";

export function AuthButton({
  onConfigOpen,
  onProfileOpen,
}: {
  readonly onConfigOpen?: () => void;
  readonly onProfileOpen?: () => void;
}) {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <button
        onClick={login}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-default-100 border border-divider text-[11px] font-medium text-default-600 hover:bg-default-200 transition-all"
      >
        <LogIn size={14} />
        {t("auth.login")}
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full hover:ring-2 hover:ring-primary/30 transition-all"
      >
        <img
          src={
            user!.avatarUrl ||
            `https://ui-avatars.com/api/?name=${user!.name}&size=28&background=random`
          }
          alt={user!.name}
          referrerPolicy="no-referrer"
          className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-divider object-cover"
        />
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-56 rounded-xl border border-divider bg-background shadow-xl z-[9999] overflow-hidden">
          <div className="px-4 py-3 border-b border-divider">
            <p className="text-[12px] font-semibold text-foreground truncate">
              {user!.name}
            </p>
            <p className="text-[10px] text-default-400 truncate">
              {user!.email}
            </p>
          </div>
          <div className="py-1">
            <button
              onClick={() => {
                onProfileOpen?.();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-[11px] text-default-600 hover:bg-default-100 transition-all"
            >
              <User size={14} />
              {t("auth.profile")}
            </button>
            <button
              onClick={() => {
                onConfigOpen?.();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-[11px] text-default-600 hover:bg-default-100 transition-all"
            >
              <Settings size={14} />
              {t("auth.settings")}
            </button>
            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-[11px] text-danger hover:bg-danger/10 transition-all"
            >
              <LogOut size={14} />
              {t("auth.logout")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
