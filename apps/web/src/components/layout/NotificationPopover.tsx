import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  X, 
  BellOff, 
  ExternalLink 
} from "lucide-react";
import { useNotifications, type AppNotification } from "../../context/NotificationContext";

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPopover({ isOpen, onClose }: NotificationPopoverProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fermeture lors d'un clic en dehors ou sur touche Échap
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.read;
    return true;
  });

  const getIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />;
      case "error":
        return <XCircle className="w-4 h-4 text-primary-container flex-shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-secondary-fixed flex-shrink-0" />;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return "À l'instant";
      if (diffMins < 60) return `Il y a ${diffMins} min`;
      if (diffHours < 24) return `Il y a ${diffHours} h`;
      return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    } catch {
      return "";
    }
  };

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-surface-container border border-surface-container-high shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-surface-container-highest flex items-center justify-between bg-surface-container-low/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface">
            <Bell className="w-3.5 h-3.5 text-secondary-fixed" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-primary-container text-white text-[10px] font-mono font-bold">
                  {unreadCount}
                </span>
              )}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition"
              title="Tout marquer comme lu"
            >
              <CheckCheck className="w-3.5 h-3.5" />
            </button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="p-1 rounded text-on-surface-variant hover:text-primary-container hover:bg-surface-container transition"
              title="Vider toutes les notifications"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition ml-1"
            title="Fermer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Onglets Filtres */}
      {notifications.length > 0 && (
        <div className="flex border-b border-surface-container-highest px-3 pt-2 text-xs">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`pb-1.5 px-2 border-b-2 font-semibold transition ${
              filter === "ALL"
                ? "border-secondary-fixed text-on-surface font-bold"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Toutes ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("UNREAD")}
            className={`pb-1.5 px-2 border-b-2 font-semibold transition ${
              filter === "UNREAD"
                ? "border-secondary-fixed text-on-surface font-bold"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Non lues ({unreadCount})
          </button>
        </div>
      )}

      {/* Liste des Notifications */}
      <div className="max-h-80 overflow-y-auto divide-y divide-surface-container-highest/60">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 transition flex items-start gap-2.5 relative group ${
                notif.read ? "bg-surface-container hover:bg-surface-container-high/60" : "bg-surface-container-high/40 hover:bg-surface-container-high"
              }`}
            >
              <div className="pt-0.5">{getIcon(notif.type)}</div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs ${notif.read ? "font-semibold text-on-surface" : "font-bold text-on-surface"}`}>
                    {notif.title}
                  </p>
                  <span className="text-[10px] text-on-surface-variant/70 font-mono flex-shrink-0">
                    {formatTime(notif.timestamp)}
                  </span>
                </div>

                <p className="text-[11px] text-on-surface-variant leading-relaxed line-clamp-2">
                  {notif.message}
                </p>

                {notif.link && (
                  <div className="pt-1">
                    <Link
                      to={notif.link}
                      onClick={() => {
                        markAsRead(notif.id);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-secondary-fixed hover:text-secondary transition"
                    >
                      <span>{notif.actionLabel || "Voir les détails"}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Bouton supprimer / marquer comme lu */}
              <div className="flex flex-col gap-1 items-center opacity-0 group-hover:opacity-100 transition">
                {!notif.read && (
                  <button
                    type="button"
                    onClick={() => markAsRead(notif.id)}
                    className="p-1 rounded text-on-surface-variant hover:text-secondary-fixed transition"
                    title="Marquer comme lu"
                  >
                    <CheckCheck className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeNotification(notif.id)}
                  className="p-1 rounded text-on-surface-variant hover:text-primary-container transition"
                  title="Supprimer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Dot indicateur non lu */}
              {!notif.read && (
                <span className="absolute left-1 top-4 w-1.5 h-1.5 rounded-full bg-secondary-fixed" />
              )}
            </div>
          ))
        ) : (
          <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant/50">
              <BellOff className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface">
                {filter === "UNREAD" ? "Aucune notification non lue" : "Aucune notification"}
              </p>
              <p className="text-[11px] text-on-surface-variant max-w-[220px] mt-0.5">
                Vos alertes de publication, rappels de quota et avertissements de sécurité s'afficheront ici.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-2 border-t border-surface-container-highest bg-surface-container-low/40 text-center">
          <span className="text-[10px] text-on-surface-variant/70 font-mono">
            Système d'Alertes TikTok Auto Studio
          </span>
        </div>
      )}
    </div>
  );
}
