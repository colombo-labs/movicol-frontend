import { Moon, Sun, Globe, Bell, Info, LogIn } from "lucide-react";
import { AppModal } from "@shared/ui/AppModal";
import { useTheme } from "@shared/hooks/useTheme";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/shared/hooks/useAuth";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfigModal({ isOpen, onClose }: Readonly<Props>) {
  const { theme, toggle } = useTheme();
  const { t, i18n } = useTranslation();
  const { isAuthenticated, login } = useAuth();

  const handleLogin = () => {
    onClose();
    setTimeout(() => login(), 200);
  };

  const toggleLang = () => {
    const langs = ["es", "en", "fr", "pt"];
    const current = langs.indexOf(i18n.language);
    i18n.changeLanguage(langs[(current + 1) % langs.length]);
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={t("config.title")}
      size="md"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-default-100 transition-colors">
          <div className="flex items-center gap-3">
            {theme === "dark" ? (
              <Moon size={16} className="text-warning" />
            ) : (
              <Sun size={16} className="text-warning" />
            )}
            <div>
              <p className="text-sm font-medium">{t("config.theme")}</p>
              <p className="text-[10px] text-default-400">
                {t("config.themeDesc")}
              </p>
            </div>
          </div>
          <button
            onClick={toggle}
            className="px-3 py-1.5 rounded-lg bg-default-100 text-xs font-semibold hover:bg-default-200 transition-colors"
          >
            {theme === "dark" ? t("config.dark") : t("config.light")}
          </button>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-default-100 transition-colors">
          <div className="flex items-center gap-3">
            <Globe size={16} className="text-primary" />
            <div>
              <p className="text-sm font-medium">{t("config.language")}</p>
              <p className="text-[10px] text-default-400">
                {t("config.languageDesc")}
              </p>
            </div>
          </div>
          <button
            onClick={toggleLang}
            className="px-3 py-1.5 rounded-lg bg-default-100 text-xs font-semibold hover:bg-default-200 transition-colors"
          >
            {{
              es: "Español",
              en: "English",
              fr: "Français",
              pt: "Português",
            }[i18n.language] ?? "Español"}
          </button>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-default-100 transition-colors">
          <div className="flex items-center gap-3">
            <Bell size={16} className="text-success" />
            <div>
              <p className="text-sm font-medium">{t("config.notifications")}</p>
              <p className="text-[10px] text-default-400">
                {isAuthenticated
                  ? t("config.notificationsDesc")
                  : t("chat.loginForNotifications")}
              </p>
            </div>
          </div>
          {isAuthenticated ? (
            <span className="text-xs text-success font-medium">
              {t("config.enabled")}
            </span>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-[10px] text-primary font-medium hover:bg-primary/20 transition-colors"
            >
              <LogIn size={12} />
              Iniciar sesión
            </button>
          )}
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-default-100 transition-colors">
          <div className="flex items-center gap-3">
            <Info size={16} className="text-default-400" />
            <div>
              <p className="text-sm font-medium">{t("config.version")}</p>
              <p className="text-[10px] text-default-400">MoviCol</p>
            </div>
          </div>
          <span className="text-xs text-default-500">0.1.0</span>
        </div>
      </div>
    </AppModal>
  );
}
