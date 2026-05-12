import { Moon, Sun, Settings, User } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@shared/hooks/useTheme';
import { ConfigModal } from './ConfigModal';
import { ProfileModal } from './ProfileModal';

export function Header() {
  const { theme, toggle } = useTheme();
  const [configOpen, setConfigOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      <header className="h-14 flex items-center justify-between px-5 border-b border-divider bg-background backdrop-blur-xl">
        <span className="text-xs text-default-400 font-medium tracking-wide uppercase">
          Bogotá — Movilidad en tiempo real
        </span>
        <div className="flex items-center gap-2">
          <button onClick={toggle} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-default-100 transition-all duration-200 text-default-500 hover:text-foreground active:scale-90" title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setConfigOpen(true)} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-default-100 transition-all duration-200 text-default-500 hover:text-foreground active:scale-90" title="Configuración">
            <Settings size={18} />
          </button>
          <button onClick={() => setProfileOpen(true)} className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-all duration-200 active:scale-90" title="Mi perfil">
            <User size={16} className="text-primary" />
          </button>
        </div>
      </header>
      <ConfigModal isOpen={configOpen} onClose={() => setConfigOpen(false)} />
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
