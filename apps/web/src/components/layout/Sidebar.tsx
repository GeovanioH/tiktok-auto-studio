import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Sparkles, 
  Calendar, 
  ListVideo, 
  UserCheck, 
  LayoutDashboard, 
  Zap, 
  KeyRound, 
  ChevronLeft, 
  ChevronRight
} from "lucide-react";
import { ShinyText } from "../ui/ShinyText";
import { BrandLogo } from "../ui/BrandLogo";
import { useQuota } from "../../context/QuotaContext";

interface SidebarProps {
  quotaUsed?: number;
  quotaMax?: number;
  activeAccountName?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  quotaUsed: propQuotaUsed,
  quotaMax: propQuotaMax,
  activeAccountName: _activeAccountName,
  isCollapsed: externalCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const location = useLocation();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const { quotaUsed: ctxQuotaUsed, quotaMax: ctxQuotaMax } = useQuota();

  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  const navLinks = [
    { to: "/", label: "Tableau de Bord & Analytics", icon: LayoutDashboard },
    { to: "/studio", label: "Studio Créatif IA", icon: Sparkles },
    { to: "/calendar", label: "Planification & Automatisation", icon: Calendar },
    { to: "/posts", label: "Historique & Relances", icon: ListVideo },
    { to: "/accounts", label: "Comptes & Sécurité v2", icon: UserCheck },
    { to: "/api-keys", label: "Clés API & Setup", icon: KeyRound },
  ];

  // Priorité au contexte réactif global, avec fallback sur les props
  const quotaUsed = propQuotaUsed !== undefined ? propQuotaUsed : ctxQuotaUsed;
  const quotaMax = propQuotaMax !== undefined ? propQuotaMax : ctxQuotaMax;
  const quotaPercent = Math.min(100, Math.round((quotaUsed / quotaMax) * 100));
  const remaining = Math.max(0, quotaMax - quotaUsed);

  return (
    <aside
      className={`fixed left-0 top-0 h-full ${
        isCollapsed ? "w-20" : "w-72"
      } bg-surface-container-low border-r border-surface-container-highest shadow-2xl z-50 flex flex-col justify-between py-4 transition-all duration-300 ease-in-out`}
    >
      <div className="flex flex-col gap-4 px-3">
        {/* Brand Header */}
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Link to="/" className="flex items-center justify-center p-1 group" title="TikTok Studio IA">
              <BrandLogo size={34} className="w-8.5 h-8.5 group-hover:scale-105 transition-transform" withGlow={false} />
            </Link>
            <button
              type="button"
              onClick={handleToggle}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-slate-400/20 dark:hover:bg-white/10 transition flex items-center justify-center"
              aria-label="Déplier la barre latérale"
              title="Déplier la barre latérale"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-1">
            <Link to="/" className="flex items-center gap-2.5 overflow-hidden group flex-1 min-w-0">
              <BrandLogo size={36} className="w-9 h-9 group-hover:scale-105 transition-transform flex-shrink-0" withGlow={false} />
              <div className="flex flex-col overflow-hidden min-w-0">
                <h1 className="text-sm font-extrabold text-on-surface tracking-tight flex items-center gap-1 leading-tight truncate">
                  <ShinyText text="TikTok Studio" speed={3.5} className="font-extrabold" />
                </h1>
                <span className="text-[10px] text-secondary font-mono tracking-wider uppercase truncate">
                  IA Pro Suite v2
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={handleToggle}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-slate-400/20 dark:hover:bg-white/10 transition flex-shrink-0 ml-1"
              aria-label="Replier la barre latérale"
              title="Replier la barre latérale"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 pt-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-primary-container text-white shadow-md shadow-primary-container/20 font-bold"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-slate-400/20 dark:hover:bg-white/10"
                } ${isCollapsed ? "justify-center px-0" : ""}`}
                title={isCollapsed ? link.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : ""}`} />
                {!isCollapsed && <span className="truncate">{link.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Quota Génération Interactif */}
      <div className="px-3">
        {!isCollapsed ? (
          <Link
            to="/studio"
            className="block bg-surface-container border border-surface-container-high hover:border-secondary/50 rounded-xl p-3 space-y-2 shadow-xs transition group cursor-pointer"
            title="Cliquez pour ouvrir le Studio de Génération IA"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-on-surface-variant group-hover:text-on-surface flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider transition">
                <Zap className="w-3.5 h-3.5 text-secondary-fixed fill-secondary-fixed/20 animate-pulse" />
                Quota Génération
              </span>
              <span className="font-mono text-secondary-fixed font-bold text-xs">
                {quotaUsed}/{quotaMax}
              </span>
            </div>
            <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-secondary-fixed via-cyan-400 to-primary-container rounded-full transition-all duration-500 ease-out shadow-xs"
                style={{ width: `${Math.max(quotaUsed > 0 ? 6 : 0, quotaPercent)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-on-surface-variant/80 font-mono">
              <span>Reset 00:00 UTC</span>
              <span className="text-secondary font-medium">
                {remaining === 0 ? "Épuisé aujourd'hui" : `${remaining} restant${remaining > 1 ? "s" : ""}`}
              </span>
            </div>
          </Link>
        ) : (
          <Link
            to="/studio"
            className="w-10 h-10 rounded-xl bg-surface-container border border-surface-container-high hover:border-secondary/40 flex items-center justify-center mx-auto text-secondary-fixed transition group cursor-pointer relative"
            title={`Quota Génération: ${quotaUsed}/${quotaMax} (${remaining} restants) - Reset 00:00 UTC. Cliquez pour ouvrir le Studio.`}
          >
            <Zap className="w-4 h-4 fill-secondary-fixed/20 group-hover:scale-110 transition-transform" />
            {quotaUsed > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-secondary-fixed border border-surface-container" />
            )}
          </Link>
        )}
      </div>
    </aside>
  );
}
