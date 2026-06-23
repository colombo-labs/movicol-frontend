import { useEffect, useState, useCallback } from "react";
import { Trash2, X, Search, Shield, Edit2 } from "lucide-react";
import { useEscClose } from "../hooks/useEscClose";

interface Permission {
  id: number;
  key: string;
  module: string;
  action: string;
  description?: string;
}

interface Role {
  id: number;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: Permission[];
}

export function RolesTab({
  showCreate,
  onCloseCreate,
}: {
  readonly showCreate: boolean;
  readonly onCloseCreate: () => void;
}) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPerms, setAllPerms] = useState<Permission[]>([]);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editing, setEditing] = useState(false);
  const [draftPerms, setDraftPerms] = useState<number[]>([]);


  const closeRoleModal = useCallback(() => setSelectedRole(null), []);
  useEscClose(!!selectedRole, closeRoleModal);
  useEscClose(showCreate, onCloseCreate);

  const load = () => {
    fetch("/api/admin/roles").then((r) => (r.ok ? r.json() : [])).then(setRoles);
    fetch("/api/admin/permissions").then((r) => (r.ok ? r.json() : [])).then(setAllPerms);
  };

  useEffect(() => { load(); }, []);

  const createRole = async () => {
    if (!newName.trim()) return;
    await fetch("/api/admin/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() || undefined }),
    });
    setNewName("");
    setNewDesc("");
    onCloseCreate();
    load();
  };

  const openRole = (role: Role) => {
    setSelectedRole(role);
    setEditing(false);
    setDraftPerms(role.permissions.map((p) => p.id));
  };

  const saveChanges = async () => {
    if (!selectedRole) return;
    await fetch(`/api/admin/roles/${selectedRole.id}/permissions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissionIds: draftPerms }),
    });
    setEditing(false);
    load();
  };

  const deleteRole = async () => {
    if (!selectedRole) return;
    await fetch(`/api/admin/roles/${selectedRole.id}`, { method: "DELETE" });
    setSelectedRole(null);
    load();
  };

  const filtered = roles.filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()));
  const modules = [...new Set(allPerms.map((p) => p.module))];

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-4">
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-lg md:text-xl font-bold text-primary">{roles.length}</p>
          <p className="text-[9px] text-primary/70">Total roles</p>
        </div>
        <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
          <p className="text-lg md:text-xl font-bold text-warning">{roles.filter((r) => r.isSystem).length}</p>
          <p className="text-[9px] text-warning/70">Del sistema</p>
        </div>
        <div className="p-3 rounded-xl bg-success/10 border border-success/20">
          <p className="text-lg md:text-xl font-bold text-success">{allPerms.length}</p>
          <p className="text-[9px] text-success/70">Permisos disponibles</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-[150px]">
          <p className="text-[9px] font-medium text-default-500 mb-1">Buscar</p>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-default-100 border border-divider">
            <Search size={13} className="text-default-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nombre del rol..." className="flex-1 bg-transparent text-[11px] outline-none" />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        <p className="text-[9px] text-default-400">{filtered.length} roles</p>
        {filtered.map((role) => (
          <div
            key={role.id}
            onClick={() => openRole(role)}
            className="flex items-center gap-3 px-3 md:px-4 py-3 rounded-xl border border-divider hover:border-primary/30 hover:bg-default-50 cursor-pointer transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Shield size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold capitalize">{role.name}</p>
              <p className="text-[9px] text-default-400 truncate">{role.description || "Sin descripción"}</p>
            </div>
            {role.isSystem && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-warning/20 text-warning hidden md:inline">Sistema</span>}
            <span className="text-[9px] text-default-500">{role.permissions.length} permisos</span>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <button type="button" className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCloseCreate} aria-label="Cerrar" />
          <div className="relative w-full max-w-sm mx-4 bg-background border border-divider rounded-2xl shadow-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Crear Rol</h3>
              <button onClick={onCloseCreate} className="p-1 rounded hover:bg-default-100 text-default-400"><X size={14} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[9px] font-medium text-default-500 mb-1">Nombre</p>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre del rol" className="w-full text-[11px] px-3 py-2 rounded-lg bg-default-100 border border-divider outline-none" />
              </div>
              <div>
                <p className="text-[9px] font-medium text-default-500 mb-1">Descripción</p>
                <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Descripción (opcional)" className="w-full text-[11px] px-3 py-2 rounded-lg bg-default-100 border border-divider outline-none" />
              </div>
              <button onClick={createRole} className="w-full py-2 rounded-lg bg-primary text-white text-[11px] font-medium">Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRole && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <button type="button" className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedRole(null)} aria-label="Cerrar" />
          <div className="relative w-full max-w-lg mx-4 bg-background border border-divider rounded-2xl shadow-2xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-divider shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold capitalize">{selectedRole.name}</p>
                  <p className="text-[10px] text-default-400">{selectedRole.description || "Sin descripción"}</p>
                </div>
              </div>
              <div className="flex gap-1">
                {!editing && !selectedRole.isSystem && (
                  <button onClick={() => { setEditing(true); setDraftPerms(selectedRole.permissions.map((p) => p.id)); }} className="p-1.5 rounded-lg hover:bg-default-100 text-default-400">
                    <Edit2 size={14} />
                  </button>
                )}
                {!selectedRole.isSystem && (
                  <button onClick={deleteRole} className="p-1.5 rounded-lg hover:bg-danger/10 text-default-400 hover:text-danger">
                    <Trash2 size={14} />
                  </button>
                )}
                <button onClick={() => setSelectedRole(null)} className="p-1.5 rounded-lg hover:bg-default-100 text-default-400"><X size={14} /></button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              <p className="text-[10px] font-semibold text-default-500 mb-3">Permisos asignados</p>
              {modules.map((mod) => (
                <div key={mod} className="mb-3">
                  <p className="text-[9px] font-bold text-default-400 uppercase mb-1.5">{mod}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    {allPerms.filter((p) => p.module === mod).map((perm) => (
                      <label key={perm.id} className="flex items-center gap-2 text-[10px] px-2 py-1.5 rounded-lg hover:bg-default-50">
                        <input
                          type="checkbox"
                          checked={draftPerms.includes(perm.id)}
                          disabled={!editing}
                          onChange={() => setDraftPerms((prev) => prev.includes(perm.id) ? prev.filter((id) => id !== perm.id) : [...prev, perm.id])}
                          className="w-3 h-3 rounded accent-primary"
                        />
                        {perm.description || perm.action}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            {editing && (
              <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-divider shrink-0">
                <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg text-[11px] font-medium text-default-500 border border-divider hover:bg-default-100">Cancelar</button>
                <button onClick={saveChanges} className="px-4 py-2 rounded-lg text-[11px] font-medium text-white bg-primary hover:bg-primary/90">Guardar cambios</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
