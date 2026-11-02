import { useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  User, 
  ShieldCheck, 
  Key, 
  LogOut, 
  Sparkles, 
  Smartphone, 
  ListVideo, 
  ChevronRight
} from "lucide-react";
import { api, type TikTokAccountDto } from "../../lib/api";

interface UserMenuPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  account: TikTokAccountDto | null;
  onDisconnect?: () => void;
}

export function UserMenuPopover({ isOpen, onClose, account, onDisconnect }: UserMenuPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fermeture clic extérieur / Escape
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

  const handleLogout = async () => {
    try {
      await api.post("/auth/tiktok/revoke");
    } catch {
      // Ignorer
    }
    if (onDisconnect) {
      onDisconnect();
    }
    onClose();
    navigate("/accounts");
  };

  const displayName = account?.displayName || (account?.openId ? `@${account.openId.substring(0, 8)}` : "Créateur Invité");

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-surface-container border border-surface-container-high shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Header Profil */}
      <div className="p-4 border-b border-surface-container-highest bg-surface-container-low/60 flex items-center gap-3">
        {account?.avatarUrl ? (
          <img
            src={account.avatarUrl}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover border border-surface-container-highest shadow-sm"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-secondary/20 to-primary/20 border border-secondary/30 flex items-center justify-center text-secondary-fixed">
            <User className="w-5 h-5" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-on-surface truncate flex items-center gap-1.5">
            <span>{displayName}</span>
            {account && (
              <span className="w-3 h-3 rounded-full bg-secondary-fixed text-black flex items-center justify-center text-[7px] font-black">
                ✓
              </span>
            )}
          </p>
          <p className="text-[10px] text-on-surface-variant font-mono mt-0.5 flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${account ? "bg-secondary-fixed" : "bg-on-surface-variant/40"}`} />
            <span>{account ? "TikTok v2 Actif" : "Non connecté"}</span>
          </p>
        </div>
      </div>

      {/* Quota IA Quotidien */}
      <div className="p-3 bg-surface-container-highest/20 border-b border-surface-container-highest">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="text-on-surface-variant flex items-center gap-1 font-semibold">
            <Sparkles className="w-3 h-3 text-secondary-fixed" />
            Quota IA Quotidien
          </span>
          <span className="text-on-surface font-mono font-bold">0 / 20</span>
        </div>
        <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-secondary-fixed to-primary-container h-full w-[0%]" />
        </div>
      </div>

      {/* Raccourcis Navigation */}
      <div className="p-1.5 space-y-0.5">
        <Link
          to="/accounts"
          onClick={onClose}
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container-high transition group"
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-secondary-fixed" />
            <span>Comptes TikTok & Sécurité</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant group-hover:translate-x-0.5 transition" />
        </Link>

        <Link
          to="/api-keys"
          onClick={onClose}
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container-high transition group"
        >
          <div className="flex items-center gap-2.5">
            <Key className="w-4 h-4 text-tertiary" />
            <span>Clés API & Coffre AES-256</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant group-hover:translate-x-0.5 transition" />
        </Link>

        <Link
          to="/simulator"
          onClick={onClose}
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container-high transition group"
        >
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-primary-container" />
            <span>Simulateur 9:16 iPhone 15</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant group-hover:translate-x-0.5 transition" />
        </Link>

        <Link
          to="/posts"
          onClick={onClose}
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container-high transition group"
        >
          <div className="flex items-center gap-2.5">
            <ListVideo className="w-4 h-4 text-secondary" />
            <span>Historique des Publications</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant group-hover:translate-x-0.5 transition" />
        </Link>
      </div>

      {/* Action Basse (Connexion / Déconnexion) */}
      <div className="p-2 border-t border-surface-container-highest bg-surface-container-low/40">
        {account ? (
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-primary-container hover:bg-primary-container/10 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnecter le compte TikTok</span>
          </button>
        ) : (
          <Link
            to="/accounts"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-on-primary-container bg-primary-container hover:bg-primary transition shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Lier un compte TikTok officiel</span>
          </Link>
        )}
      </div>
    </div>
  );
}
