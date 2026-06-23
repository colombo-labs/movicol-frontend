import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  es: {
    translation: {
      nav: {
        planificar: "Planificar viaje",
        rutas: "Rutas",
        accesibilidad: "Accesibilidad",
        metricas: "Métricas",
        admin: "Admin",
      },
      auth: {
        login: "Iniciar sesión",
        logout: "Cerrar sesión",
        profile: "Mi perfil",
        settings: "Configuración",
      },
      admin: {
        title: "Panel de Administración",
        users: "Usuarios",
        roles: "Roles",
        permissions: "Permisos",
        back: "Volver al mapa",
        create: "Crear",
        save: "Guardar cambios",
        cancel: "Cancelar",
        delete: "Eliminar",
        edit: "Editar",
        search: "Buscar",
        active: "Activo",
        inactive: "Inactivo",
      },
      common: {
        loading: "Cargando...",
        error: "Error",
        noData: "Sin datos",
        confirm: "Confirmar",
      },
    },
  },
  en: {
    translation: {
      nav: {
        planificar: "Plan trip",
        rutas: "Routes",
        accesibilidad: "Accessibility",
        metricas: "Metrics",
        admin: "Admin",
      },
      auth: {
        login: "Sign in",
        logout: "Sign out",
        profile: "My profile",
        settings: "Settings",
      },
      admin: {
        title: "Administration Panel",
        users: "Users",
        roles: "Roles",
        permissions: "Permissions",
        back: "Back to map",
        create: "Create",
        save: "Save changes",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        search: "Search",
        active: "Active",
        inactive: "Inactive",
      },
      common: {
        loading: "Loading...",
        error: "Error",
        noData: "No data",
        confirm: "Confirm",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: navigator.language.startsWith("en") ? "en" : "es",
  fallbackLng: "es",
  interpolation: { escapeValue: false },
});

export default i18n;
