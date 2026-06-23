import { useTranslation } from "react-i18next";
import { useNotifications, AppNotification } from "@shared/hooks/useNotifications";
import { useState, useRef, useEffect } from "react";
import {
  X,
  Bell,
  AlertTriangle,
  Info,
  CheckCircle2,
  Maximize2,
} from "lucide-react";


function NotifIcon({ type }: { readonly type: string }) {
  if (type === "alert")
    return <AlertTriangle size={14} className="text-warning shrink-0" />;
  if (type === "success")
    return <CheckCircle2 size={14} className="text-success shrink-0" />;
  return <Info size={14} className="text-primary shrink-0" />;
}

function NotifItem({ notif }: { readonly notif: AppNotification }) {
  return (
    <div
      className={`flex gap-2.5 px-4 py-3 border-b border-divider/30 hover:bg-default-50 transition-colors cursor-pointer ${
        !notif.read ? "bg-primary/5" : ""
      }`}
    >
      <NotifIcon type={notif.type} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-semibold text-foreground truncate">
            {notif.title}
          </p>
          {!notif.read && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
          )}
        </div>
        <p className="text-[10px] text-default-500 mt-0.5 line-clamp-1">
          {notif.body}
        </p>
        <p className="text-[9px] text-default-400 mt-0.5">{new Date(notif.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
}

// ===== DROPDOWN (mini) =====
export function NotificationsDropdown({
  onExpand,
}: {
  readonly onExpand: () => void;
}) {
  const { t } = useTranslation();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = unreadCount;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center hover:bg-default-100 transition-all duration-200 text-default-500 hover:text-foreground active:scale-90 relative"
        title={t("notifications.title")}
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-danger text-[7px] text-white flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 rounded-xl border border-divider bg-background shadow-2xl z-[9999] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-divider">
            <span className="text-[11px] font-semibold text-foreground">
              {t("notifications.title")}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setOpen(false);
                  onExpand();
                }}
                className="p-1 rounded hover:bg-default-100 text-default-400"
                title="Expandir"
              >
                <Maximize2 size={12} />
              </button>
            </div>
          </div>

          {/* List (max 3) */}
          <div className="max-h-[280px] overflow-y-auto">
            {notifications.slice(0, 3).map((n) => (
              <NotifItem key={n.id} notif={n} />
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-divider flex items-center justify-between">
            <button onClick={markAllRead} className="text-[9px] text-primary font-medium hover:underline">
              {t("notifications.markAllRead")}
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onExpand();
              }}
              className="text-[9px] text-default-400 hover:text-foreground"
            >
              {t("notifications.viewAll")} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== MODAL (expandido) =====
export function NotificationsModal({
  isOpen,
  onClose,
}: {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}) {
  const { t } = useTranslation();
  const { notifications, unreadCount, markAllRead, clear } = useNotifications();
  const [tab, setTab] = useState<"all" | "unread">("all");

  if (!isOpen) return null;

  const filtered =
    tab === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cerrar"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-background border border-divider rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-divider">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              {t("notifications.title")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-default-100 transition-all text-default-400"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-divider">
          <button
            onClick={() => setTab("all")}
            className={`flex-1 py-2.5 text-[11px] font-medium transition-all ${
              tab === "all"
                ? "text-primary border-b-2 border-primary"
                : "text-default-400"
            }`}
          >
            {t("notifications.all")} ({notifications.length})
          </button>
          <button
            onClick={() => setTab("unread")}
            className={`flex-1 py-2.5 text-[11px] font-medium transition-all ${
              tab === "unread"
                ? "text-primary border-b-2 border-primary"
                : "text-default-400"
            }`}
          >
            {t("notifications.unread")} ({unreadCount})
          </button>
        </div>

        {/* List */}
        <div className="max-h-[50vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-10 text-center">
              <Bell size={24} className="mx-auto text-default-300 mb-2" />
              <p className="text-[11px] text-default-400">
                No hay notificaciones
              </p>
            </div>
          ) : (
            filtered.map((n) => <NotifItem key={n.id} notif={n} />)
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-divider flex items-center justify-between">
          <button onClick={markAllRead} className="text-[10px] text-primary font-medium hover:underline">
            {t("notifications.markAllRead")}
          </button>
          <button onClick={clear} className="text-[10px] text-default-400 hover:text-danger">
            {t("notifications.clear")}
          </button>
        </div>
      </div>
    </div>
  );
}
