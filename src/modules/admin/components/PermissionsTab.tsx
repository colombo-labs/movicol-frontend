import { useTranslation } from "react-i18next";
import { useEffect, useState, useCallback } from "react";
import { Key, Search, X } from "lucide-react";
import { Select, SelectItem } from "@heroui/react";
import { useEscClose } from "../hooks/useEscClose";

interface Permission {
  id: number;
  key: string;
  module: string;
  action: string;
  description?: string;
}

export function PermissionsTab({
  showCreate,
  onCloseCreate,
}: {
  readonly showCreate: boolean;
  readonly onCloseCreate: () => void;
}) {
  const { t } = useTranslation();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [search, setSearch] = useState("");
  const [filterModule, setFilterModule] = useState<string>("all");
  const [module, setModule] = useState("");
  const [action, setAction] = useState("");
  const [description, setDescription] = useState("");

  const [selectedPerm, setSelectedPerm] = useState<Permission | null>(null);
  const [editingPerm, setEditingPerm] = useState(false);
  const [draftDesc, setDraftDesc] = useState("");

  const closePermModal = useCallback(() => setSelectedPerm(null), []);
  useEscClose(!!selectedPerm, closePermModal);
  useEscClose(showCreate, onCloseCreate);

  const load = () => {
    fetch("/api/admin/permissions")
      .then((r) => (r.ok ? r.json() : []))
      .then(setPermissions);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!module.trim() || !action.trim()) return;
    await fetch("/api/admin/permissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        module: module.trim(),
        action: action.trim(),
        description: description.trim() || undefined,
      }),
    });
    setModule("");
    setAction("");
    setDescription("");
    onCloseCreate();
    load();
  };

  const remove = async (id: number) => {
    await fetch(`/api/admin/permissions/${id}`, { method: "DELETE" });
    load();
  };

  const allModules = [...new Set(permissions.map((p) => p.module))];

  const filtered = permissions.filter((p) => {
    if (
      search &&
      !p.key.toLowerCase().includes(search.toLowerCase()) &&
      !(p.description || "").toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (filterModule !== "all" && p.module !== filterModule) return false;
    return true;
  });
  const modules = [...new Set(filtered.map((p) => p.module))];

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-4">
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-lg md:text-xl font-bold text-primary">
            {permissions.length}
          </p>
          <p className="text-[9px] text-primary/70">{t("admin.permissions")}</p>
        </div>
        <div className="p-3 rounded-xl bg-success/10 border border-success/20">
          <p className="text-lg md:text-xl font-bold text-success">
            {new Set(permissions.map((p) => p.module)).size}
          </p>
          <p className="text-[9px] text-success/70">{t("admin.modules")}</p>
        </div>
        <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
          <p className="text-lg md:text-xl font-bold text-warning">
            {new Set(permissions.map((p) => p.action)).size}
          </p>
          <p className="text-[9px] text-warning/70">
            {t("admin.uniqueActions")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-[150px]">
          <p className="text-[9px] font-medium text-default-500 mb-1">
            {t("admin.search")}
          </p>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-default-100 border border-divider">
            <Search size={13} className="text-default-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              name="admin-search-perms"
              placeholder={t("admin.searchPermPlaceholder")}
              className="flex-1 bg-transparent text-[11px] outline-none"
            />
          </div>
        </div>
        <div className="w-[140px]">
          <p className="text-[9px] font-medium text-default-500 mb-1">
            {t("admin.module")}
          </p>
          <Select
            aria-label="Filtro de módulo"
            size="sm"
            variant="bordered"
            selectedKeys={[filterModule]}
            onChange={(e) => setFilterModule(e.target.value)}
            classNames={{ trigger: "h-9 min-h-9", value: "text-[10px]" }}
            items={[
              { id: "all", name: t("admin.total") },
              ...allModules.map((m) => ({ id: m, name: m })),
            ]}
          >
            {(item) => <SelectItem key={item.id}>{item.name}</SelectItem>}
          </Select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        <p className="text-[9px] text-default-400">
          {filtered.length} {t("admin.permissions")}
        </p>
        {modules.map((mod) => (
          <div key={mod}>
            <p className="text-[9px] font-bold text-default-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Key size={10} /> {mod}
            </p>
            <div className="space-y-1.5">
              {filtered
                .filter((p) => p.module === mod)
                .map((perm) => (
                  <button
                    type="button"
                    key={perm.id}
                    onClick={() => {
                      setSelectedPerm(perm);
                      setEditingPerm(false);
                      setDraftDesc(perm.description || "");
                    }}
                    className="flex items-center gap-3 px-3 md:px-4 py-2.5 rounded-xl border border-divider/50 hover:border-primary/30 hover:bg-default-50 cursor-pointer transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-default-100 flex items-center justify-center shrink-0">
                      <Key size={13} className="text-default-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-foreground">
                        {perm.description || perm.key}
                      </p>
                      <p className="text-[9px] text-default-400">{perm.key}</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedPerm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedPerm(null)}
            aria-label="Cerrar"
          />
          <div className="relative w-full max-w-sm mx-4 bg-background border border-divider rounded-2xl shadow-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Key size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold">
                    {selectedPerm.key}
                  </p>
                  <p className="text-[9px] text-default-400">
                    {selectedPerm.module} → {selectedPerm.action}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPerm(null)}
                className="p-1 rounded hover:bg-default-100 text-default-400"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[9px] font-medium text-default-500 mb-1">
                  {t("admin.description")}
                </p>
                {editingPerm ? (
                  <input
                    value={draftDesc}
                    onChange={(e) => setDraftDesc(e.target.value)}
                    className="w-full text-[11px] px-3 py-2 rounded-lg bg-default-100 border border-divider outline-none"
                  />
                ) : (
                  <p className="text-[11px] text-foreground">
                    {selectedPerm.description || "Sin descripción"}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[9px] font-medium text-default-500 mb-1">
                  {t("admin.module")}
                </p>
                <p className="text-[11px]">{selectedPerm.module}</p>
              </div>
              <div>
                <p className="text-[9px] font-medium text-default-500 mb-1">
                  {t("admin.action")}
                </p>
                <p className="text-[11px]">{selectedPerm.action}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-divider">
              <button
                onClick={() => {
                  remove(selectedPerm.id);
                  setSelectedPerm(null);
                }}
                className="px-3 py-1.5 rounded-lg text-[10px] font-medium text-danger bg-danger/10 hover:bg-danger/20 transition-all"
              >
                {t("admin.delete")}
              </button>
              {editingPerm ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingPerm(false)}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-medium text-default-500 border border-divider"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      setEditingPerm(false);
                    }}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-medium text-white bg-primary"
                  >
                    Guardar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingPerm(true)}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-medium text-primary border border-primary/30 hover:bg-primary/10"
                >
                  {t("admin.edit")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onCloseCreate}
            aria-label="Cerrar"
          />
          <div className="relative w-full max-w-sm mx-4 bg-background border border-divider rounded-2xl shadow-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Crear Permiso</h3>
              <button
                onClick={onCloseCreate}
                className="p-1 rounded hover:bg-default-100 text-default-400"
              >
                <X size={14} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[9px] font-medium text-default-500 mb-1">
                  {t("admin.module")}
                </p>
                <input
                  value={module}
                  onChange={(e) => setModule(e.target.value)}
                  name="perm-module"
                  placeholder="ej: rutas"
                  className="w-full text-[11px] px-3 py-2 rounded-lg bg-default-100 border border-divider outline-none"
                />
              </div>
              <div>
                <p className="text-[9px] font-medium text-default-500 mb-1">
                  {t("admin.action")}
                </p>
                <input
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  name="perm-action"
                  placeholder="ej: crear"
                  className="w-full text-[11px] px-3 py-2 rounded-lg bg-default-100 border border-divider outline-none"
                />
              </div>
              <div>
                <p className="text-[9px] font-medium text-default-500 mb-1">
                  {t("admin.description")}
                </p>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  name="perm-desc"
                  placeholder="ej: Crear rutas nuevas"
                  className="w-full text-[11px] px-3 py-2 rounded-lg bg-default-100 border border-divider outline-none"
                />
              </div>
              <p className="text-[9px] text-default-400">
                Key:{" "}
                <strong>
                  {module || "modulo"}.{action || "accion"}
                </strong>
              </p>
              <button
                onClick={create}
                className="w-full py-2.5 rounded-lg bg-primary text-white text-[11px] font-medium"
              >
                Crear permiso
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
