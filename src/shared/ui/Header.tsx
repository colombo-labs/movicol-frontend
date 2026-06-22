import { Moon, Sun, Settings, User, Bus } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@shared/hooks/useTheme";
import { ConfigModal } from "./ConfigModal";
import { ProfileModal } from "./ProfileModal";

export function Header() {
  const { theme, toggle } = useTheme();
  const [configOpen, setConfigOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      <header className="h-12 md:h-14 flex items-center justify-between px-3 md:px-5 border-b border-divider bg-background backdrop-blur-xl">
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
              Transporte inteligente
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
          <button
            onClick={() => setConfigOpen(true)}
            className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center hover:bg-default-100 transition-all duration-200 text-default-500 hover:text-foreground active:scale-90"
            title="Configuración"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={() => setProfileOpen(true)}
            className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-all duration-200 active:scale-90"
            title="Mi perfil"
          >
            <User size={14} className="text-primary" />
          </button>
        </div>
      </header>
      <ConfigModal isOpen={configOpen} onClose={() => setConfigOpen(false)} />
      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </>
  );
}
