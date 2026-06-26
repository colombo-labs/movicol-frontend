import { useTranslation } from "react-i18next";
import { useEffect, useState, useCallback } from "react";
import { Search, Shield, X, Edit2 } from "lucide-react";
import { Select, SelectItem } from "@heroui/react";
import { useEscClose } from "../hooks/useEscClose";

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  isActive: boolean;
  roleId: number;
  role: { id: number; name: string };
  createdAt: string;
}

interface Role {
  id: number;
  name: string;
}

interface Permission {
  id: number;
  key: string;
  description?: string;
}

export function UsersTab() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPerms, setAllPerms] = useState<Permission[]>([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<number | "all">("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [userPerms, setUserPerms] = useState<{
    rolePermissions: Permission[];
    extraPermissions: Permission[];
  } | null>(null);

  const closeModal = useCallback(() => setSelectedUser(null), []);
  useEscClose(!!selectedUser, closeModal);

  const load = () => {
    fetch("/api/admin/users")
      .then((r) => (r.ok ? r.json() : []))
      .then(setUsers);
    fetch("/api/admin/roles")
      .then((r) => (r.ok ? r.json() : []))
      .then(setRoles);
    fetch("/api/admin/permissions")
      .then((r) => (r.ok ? r.json() : []))
      .then(setAllPerms);
  };

  useEffect(() => {
    load();
  }, []);

  const [draftRoleId, setDraftRoleId] = useState<number>(0);
  const [draftActive, setDraftActive] = useState<boolean>(true);
  const [draftExtraPerms, setDraftExtraPerms] = useState<number[]>([]);

  const openUser = async (user: User) => {
    setSelectedUser(user);
    setEditing(false);
    setDraftRoleId(user.roleId);
    setDraftActive(user.isActive);
    const res = await fetch(`/api/admin/users/${user.id}/permissions`);
    if (res.ok) {
      const data = await res.json();
      setUserPerms(data);
      setDraftExtraPerms(data.extraPermissions.map((p: Permission) => p.id));
    }
  };

  const startEditing = () => {
    if (!selectedUser) return;
    setDraftRoleId(selectedUser.roleId);
    setDraftActive(selectedUser.isActive);
    if (userPerms)
      setDraftExtraPerms(userPerms.extraPermissions.map((p) => p.id));
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
  };

  const saveChanges = async () => {
    if (!selectedUser) return;
    // Save role if changed
    if (draftRoleId !== selectedUser.roleId) {
      await fetch(`/api/admin/users/${selectedUser.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId: draftRoleId }),
      });
    }
    // Save status if changed
    if (draftActive !== selectedUser.isActive) {
      await fetch(`/api/admin/users/${selectedUser.id}/status`, {
        method: "PATCH",
      });
    }
    // Save extra perms
    await fetch(`/api/admin/users/${selectedUser.id}/permissions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissionIds: draftExtraPerms }),
    });
    setEditing(false);
    load();
    // Refresh user data
    const res = await fetch(`/api/admin/users/${selectedUser.id}/permissions`);
    if (res.ok) setUserPerms(await res.json());
    setSelectedUser((u) =>
      u
        ? {
            ...u,
            roleId: draftRoleId,
            isActive: draftActive,
            role: roles.find((r) => r.id === draftRoleId)!,
          }
        : null,
    );
  };

  const filtered = users.filter((u) => {
    if (
      search &&
      !u.name.toLowerCase().includes(search.toLowerCase()) &&
      !u.email.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (filterRole !== "all" && u.roleId !== filterRole) return false;
    if (filterStatus === "active" && !u.isActive) return false;
    if (filterStatus === "inactive" && u.isActive) return false;
    return true;
  });

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4">
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-lg md:text-xl font-bold text-primary">
            {users.length}
          </p>
          <p className="text-[9px] text-primary/70">{t("admin.totalUsers")}</p>
        </div>
        <div className="p-3 rounded-xl bg-success/10 border border-success/20">
          <p className="text-lg md:text-xl font-bold text-success">
            {users.filter((u) => u.isActive).length}
          </p>
          <p className="text-[9px] text-success/70">{t("admin.activeUsers")}</p>
        </div>
        <div className="p-3 rounded-xl bg-danger/10 border border-danger/20">
          <p className="text-lg md:text-xl font-bold text-danger">
            {users.filter((u) => !u.isActive).length}
          </p>
          <p className="text-[9px] text-danger/70">
            {t("admin.inactiveUsers")}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
          <p className="text-lg md:text-xl font-bold text-warning">
            {roles.length}
          </p>
          <p className="text-[9px] text-warning/70">{t("admin.roles")}</p>
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
              name="admin-search-users"
              placeholder={t("admin.searchPlaceholder")}
              className="flex-1 bg-transparent text-[11px] outline-none"
            />
          </div>
        </div>
        <div className="w-[140px]">
          <p className="text-[9px] font-medium text-default-500 mb-1">Rol</p>
          <Select
            aria-label="Filtro de rol"
            size="sm"
            variant="bordered"
            selectedKeys={filterRole === "all" ? ["all"] : [String(filterRole)]}
            onChange={(e) =>
              setFilterRole(
                e.target.value === "all" ? "all" : Number(e.target.value),
              )
            }
            classNames={{ trigger: "h-9 min-h-9", value: "text-[10px]" }}
            items={[
              { id: "all", name: t("admin.total") },
              ...roles.map((r) => ({ id: String(r.id), name: r.name })),
            ]}
          >
            {(item) => <SelectItem key={item.id}>{item.name}</SelectItem>}
          </Select>
        </div>
        <div className="w-[120px]">
          <p className="text-[9px] font-medium text-default-500 mb-1">Estado</p>
          <Select
            aria-label="Filtro de estado"
            size="sm"
            variant="bordered"
            selectedKeys={[filterStatus]}
            onChange={(e) =>
              setFilterStatus(e.target.value as "all" | "active" | "inactive")
            }
            classNames={{ trigger: "h-9 min-h-9", value: "text-[10px]" }}
            items={[
              { id: "all", name: t("admin.total") },
              { id: "active", name: t("admin.activeUsers") },
              { id: "inactive", name: t("admin.inactiveUsers") },
            ]}
          >
            {(item) => <SelectItem key={item.id}>{item.name}</SelectItem>}
          </Select>
        </div>
      </div>

      {/* User List */}
      <div className="space-y-2">
        <p className="text-[9px] text-default-400">
          {filtered.length} {t("admin.results")}
        </p>
        {filtered.map((user) => (
          <button
            type="button"
            key={user.id}
            onClick={() => openUser(user)}
            className="flex items-center gap-3 px-3 md:px-4 py-3 rounded-xl border border-divider hover:border-primary/30 hover:bg-default-50 cursor-pointer transition-all"
          >
            <img
              referrerPolicy="no-referrer"
              src={
                user.avatarUrl ||
                `https://ui-avatars.com/api/?name=${user.name}&size=36`
              }
              alt=""
              className="w-9 h-9 rounded-full shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold truncate">{user.name}</p>
              <p className="text-[9px] text-default-400 truncate">
                {user.email}
              </p>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-default-100 capitalize hidden md:inline">
              {user.role?.name}
            </span>
            <span
              className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${user.isActive ? "bg-success/20 text-success" : "bg-danger/20 text-danger"}`}
            >
              {user.isActive ? "Activo" : "Inactivo"}
            </span>
          </button>
        ))}
      </div>

      {/* Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
            aria-label="Cerrar"
          />
          <div className="relative w-full max-w-lg mx-4 bg-background border border-divider rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-divider shrink-0">
              <div className="flex items-center gap-3">
                <img
                  referrerPolicy="no-referrer"
                  src={
                    selectedUser.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${selectedUser.name}&size=40`
                  }
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="text-[12px] font-semibold">
                    {selectedUser.name}
                  </p>
                  <p className="text-[10px] text-default-400">
                    {selectedUser.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!editing && (
                  <button
                    onClick={startEditing}
                    className="p-1.5 rounded-lg hover:bg-default-100 text-default-400"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 rounded-lg hover:bg-default-100 text-default-400"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[9px] text-default-400 mb-1">Rol</p>
                  {editing ? (
                    <Select
                      aria-label="Filtro de estado"
                      size="sm"
                      variant="bordered"
                      selectedKeys={[String(draftRoleId)]}
                      onChange={(e) => setDraftRoleId(Number(e.target.value))}
                      classNames={{
                        trigger: "h-8 min-h-8",
                        value: "text-[11px]",
                      }}
                      items={roles.map((r) => ({
                        id: String(r.id),
                        name: r.name,
                      }))}
                    >
                      {(item) => (
                        <SelectItem key={item.id}>{item.name}</SelectItem>
                      )}
                    </Select>
                  ) : (
                    <p className="text-[11px] font-medium capitalize">
                      {selectedUser.role?.name}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[9px] text-default-400 mb-1">Estado</p>
                  {editing ? (
                    <Select
                      aria-label="Filtro de estado"
                      size="sm"
                      variant="bordered"
                      selectedKeys={[draftActive ? "active" : "inactive"]}
                      onChange={(e) =>
                        setDraftActive(e.target.value === "active")
                      }
                      classNames={{
                        trigger: `h-8 min-h-8 ${draftActive ? "border-success/50 bg-success/10" : "border-danger/50 bg-danger/10"}`,
                        value: `text-[10px] ${draftActive ? "text-success" : "text-danger"}`,
                      }}
                      items={[
                        { id: "active", name: "Activo" },
                        { id: "inactive", name: "Inactivo" },
                      ]}
                    >
                      {(item) => (
                        <SelectItem key={item.id}>{item.name}</SelectItem>
                      )}
                    </Select>
                  ) : (
                    <p
                      className={`text-[11px] font-medium ${selectedUser.isActive ? "text-success" : "text-danger"}`}
                    >
                      {selectedUser.isActive ? "Activo" : "Inactivo"}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[9px] text-default-400 mb-1">
                    Miembro desde
                  </p>
                  <p className="text-[11px]">
                    {new Date(selectedUser.createdAt).toLocaleDateString(
                      "es-CO",
                    )}
                  </p>
                </div>
              </div>

              {/* Permissions */}
              {userPerms && (
                <div>
                  <p className="text-[10px] font-semibold text-default-500 mb-2 flex items-center gap-1">
                    <Shield size={12} /> Permisos
                    {editing &&
                      allPerms.some(
                        (p) =>
                          !userPerms.rolePermissions.some(
                            (rp) => rp.id === p.id,
                          ) && !draftExtraPerms.includes(p.id),
                      ) && (
                        <span className="text-[8px] text-primary font-normal ml-1">
                          (click para agregar extras)
                        </span>
                      )}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                    {allPerms.map((perm) => {
                      const fromRole = userPerms.rolePermissions.some(
                        (p) => p.id === perm.id,
                      );
                      const isExtra = draftExtraPerms.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          className="flex items-center gap-2 text-[10px] px-2 py-1.5 rounded-lg hover:bg-default-50"
                        >
                          <input
                            type="checkbox"
                            checked={fromRole || isExtra}
                            disabled={!editing || fromRole}
                            onChange={() => {
                              if (!editing) return;
                              const id = perm.id;
                              setDraftExtraPerms((p) =>
                                p.includes(id)
                                  ? p.filter((x) => x !== id)
                                  : [...p, id],
                              );
                            }}
                            className="w-3 h-3 rounded accent-primary"
                          />
                          <span
                            className={
                              fromRole
                                ? "text-default-400"
                                : isExtra
                                  ? "text-primary font-medium"
                                  : ""
                            }
                          >
                            {perm.description || perm.key}
                          </span>
                          {fromRole && (
                            <span className="text-[7px] text-default-300 ml-auto">
                              (rol)
                            </span>
                          )}
                          {isExtra && (
                            <span className="text-[7px] text-primary ml-auto">
                              (extra)
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {editing && (
              <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-divider shrink-0">
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 rounded-lg text-[11px] font-medium text-default-500 border border-divider hover:bg-default-100 transition-all"
                >
                  {t("admin.cancel")}
                </button>
                <button
                  onClick={saveChanges}
                  className="px-4 py-2 rounded-lg text-[11px] font-medium text-white bg-primary hover:bg-primary/90 transition-all"
                >
                  {t("admin.save")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
