import { useState } from "react";
import { Users, Shield, Key, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { UsersTab } from "../components/UsersTab";
import { RolesTab } from "../components/RolesTab";
import { PermissionsTab } from "../components/PermissionsTab";

type Tab = "users" | "roles" | "permissions";

export function AdminPanel() {
  const [tab, setTab] = useState<Tab>("users");
  const [showCreate, setShowCreate] = useState(false);
  const { t } = useTranslation();

  const tabs = [
    { id: "users" as Tab, label: t("admin.users"), icon: Users },
    { id: "roles" as Tab, label: t("admin.roles"), icon: Shield },
    { id: "permissions" as Tab, label: t("admin.permissions"), icon: Key },
  ];

  const createLabel =
    tab === "roles"
      ? t("admin.create") + " " + t("admin.roles").toLowerCase()
      : tab === "permissions"
        ? t("admin.create") + " " + t("admin.permissions").toLowerCase()
        : null;

  return (
    <div className="h-full flex flex-col border border-divider rounded-xl overflow-hidden bg-background">
      {/* Tabs + Create button */}
      <div className="flex items-center border-b border-divider shrink-0">
        <div className="flex overflow-x-auto flex-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setShowCreate(false);
              }}
              className={`flex items-center gap-1.5 px-3 md:px-4 py-2.5 md:py-3 text-[10px] md:text-[11px] font-medium border-b-2 transition-all whitespace-nowrap ${
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-default-400 hover:text-foreground"
              }`}
            >
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
        </div>
        {createLabel && (
          <button
            onClick={() => setShowCreate(true)}
            className="mr-3 px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-medium flex items-center gap-1 shrink-0"
          >
            <Plus size={12} /> {createLabel}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        {tab === "users" && <UsersTab />}
        {tab === "roles" && (
          <RolesTab
            showCreate={showCreate}
            onCloseCreate={() => setShowCreate(false)}
          />
        )}
        {tab === "permissions" && (
          <PermissionsTab
            showCreate={showCreate}
            onCloseCreate={() => setShowCreate(false)}
          />
        )}
      </div>
    </div>
  );
}
