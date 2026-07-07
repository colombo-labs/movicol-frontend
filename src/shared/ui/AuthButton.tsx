import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import { LogIn, LogOut, User, Settings } from "lucide-react";

export function AuthButton({
  onConfigOpen,
  onProfileOpen,
}: {
  readonly onConfigOpen?: () => void;
  readonly onProfileOpen?: () => void;
}) {
  const { user, isAuthenticated, login, logout } = useAuth();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const avatarElement =
    isAuthenticated && user ? (
      <img
        src={
          user.avatarUrl ||
          `https://ui-avatars.com/api/?name=${user.name}&size=28&background=random`
        }
        alt={user.name}
        referrerPolicy="no-referrer"
        className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-divider object-cover"
      />
    ) : (
      <div className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-divider bg-default-100 flex items-center justify-center">
        <User size={16} className="text-default-400" />
      </div>
    );

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-[9990] w-full h-full bg-transparent border-none cursor-default"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          tabIndex={-1}
        />
      )}

      <div className="relative z-[9991]">
        <button
          onClick={() => setOpen(!open)}
          className="rounded-full hover:ring-2 hover:ring-primary/30 transition-all"
        >
          {avatarElement}
        </button>

        {open && (
          <div className="absolute right-0 top-11 w-56 rounded-xl border border-divider bg-background shadow-xl overflow-hidden">
            {isAuthenticated && user && (
              <div className="px-4 py-3 border-b border-divider">
                <p className="text-[12px] font-semibold text-foreground truncate">
                  {user.name}
                </p>
                <p className="text-[10px] text-default-400 truncate">
                  {user.email}
                </p>
              </div>
            )}
            <div className="py-1">
              {!isAuthenticated && (
                <button
                  onClick={() => {
                    setOpen(false);
                    login();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-default-600 hover:bg-default-100 transition-all"
                >
                  <LogIn size={14} />
                  {t("auth.login")}
                </button>
              )}
              {isAuthenticated && (
                <button
                  onClick={() => {
                    setOpen(false);
                    onProfileOpen?.();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-[11px] text-default-600 hover:bg-default-100 transition-all"
                >
                  <User size={14} />
                  {t("auth.profile")}
                </button>
              )}
              <button
                onClick={() => {
                  setOpen(false);
                  onConfigOpen?.();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-[11px] text-default-600 hover:bg-default-100 transition-all"
              >
                <Settings size={14} />
                {t("auth.settings")}
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-[11px] text-danger hover:bg-danger/10 transition-all"
                >
                  <LogOut size={14} />
                  {t("auth.logout")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
