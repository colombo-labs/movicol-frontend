import { useTranslation } from "react-i18next";
import { Moon, Sun, Bus } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@shared/hooks/useTheme";
import { ConfigModal } from "./ConfigModal";
import { ProfileModal } from "./ProfileModal";
import { AuthButton } from "./AuthButton";
import {
  NotificationsDropdown,
  NotificationsModal,
} from "./NotificationsModal";

export function Header() {
  const { t } = useTranslation();
  const { theme, toggle } = useTheme();
  const [configOpen, setConfigOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);

  return (
    <>
      <header className="h-12 md:h-14 flex items-center justify-between px-3 md:px-5 border-b border-divider bg-background backdrop-blur-xl relative z-[1100]">
        {/* Logo mobile */}
        <span className="flex items-center gap-2 md:hidden">
          <span className="w-9 h-9 rounded-xl bg-[#2d8a5e] flex items-center justify-center shadow-sm">
            <Bus size={16} className="dark:text-black text-white" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-foreground">
              Movi<span className="text-[#2d8a5e]">Col</span>
            </span>
            <span className="text-[9px] text-default-400">
              {t("app.subtitle")}
            </span>
          </span>
        </span>
        <div className="flex items-center gap-1.5 md:gap-2 md:ml-auto">
          <button
            onClick={toggle}
            className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center hover:bg-default-100 transition-all duration-200 text-default-500 hover:text-foreground active:scale-90"
            title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <NotificationsDropdown onExpand={() => setNotifsOpen(true)} />
          <AuthButton
            onConfigOpen={() => setConfigOpen(true)}
            onProfileOpen={() => setProfileOpen(true)}
          />
        </div>
      </header>
      <ConfigModal isOpen={configOpen} onClose={() => setConfigOpen(false)} />
      <NotificationsModal
        isOpen={notifsOpen}
        onClose={() => setNotifsOpen(false)}
      />
      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </>
  );
}
