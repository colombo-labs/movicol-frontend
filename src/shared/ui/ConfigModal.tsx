import { AppModal } from "@shared/ui/AppModal";
import { useTheme } from "@shared/hooks/useTheme";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfigModal({ isOpen, onClose }: Props) {
  const { theme, toggle } = useTheme();

  return (
    <AppModal isOpen={isOpen} onClose={onClose} title="Configuración" size="md">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Tema</p>
            <p className="text-xs text-default-400">
              Apariencia de la aplicación
            </p>
          </div>
          <button
            onClick={toggle}
            className="px-3 py-1.5 rounded-lg bg-default-100 text-xs font-semibold hover:bg-default-200 transition-colors"
          >
            {theme === "dark" ? "🌙 Oscuro" : "☀️ Claro"}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Idioma</p>
            <p className="text-xs text-default-400">Idioma de la interfaz</p>
          </div>
          <span className="text-xs text-default-500">Español</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Notificaciones</p>
            <p className="text-xs text-default-400">
              Alertas de rutas y tráfico
            </p>
          </div>
          <span className="text-xs text-success">Activadas</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Versión</p>
            <p className="text-xs text-default-400">MoviCol</p>
          </div>
          <span className="text-xs text-default-500">0.1.0</span>
        </div>
      </div>
    </AppModal>
  );
}
