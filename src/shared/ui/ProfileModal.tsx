import { AppModal } from "@shared/ui/AppModal";
import { User } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: Props) {
  return (
    <AppModal isOpen={isOpen} onClose={onClose} title="Mi perfil" size="md">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
            <User size={28} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold">Usuario MoviCol</p>
            <p className="text-xs text-default-400">usuario@movicol.co</p>
          </div>
        </div>
        <div className="space-y-2 pt-2 border-t border-divider">
          <div className="flex justify-between text-xs">
            <span className="text-default-500">Viajes planificados</span>
            <span className="font-semibold">24</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-default-500">Rutas favoritas</span>
            <span className="font-semibold">3</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-default-500">Modo preferido</span>
            <span className="font-semibold">TransMilenio</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-default-500">Miembro desde</span>
            <span className="font-semibold">Mayo 2026</span>
          </div>
        </div>
        <button className="w-full py-2 rounded-xl bg-danger/20 text-danger text-xs font-semibold hover:bg-danger/30 transition-colors">
          Cerrar sesión
        </button>
      </div>
    </AppModal>
  );
}
