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
  ChevronRight,
  Smartphone
} from "lucide-react";
import { ShinyText } from "../ui/ShinyText";
import { BrandLogo } from "../ui/BrandLogo";

interface SidebarProps {
  quotaUsed?: number;
  quotaMax?: number;
  activeAccountName?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  quotaUsed = 0,
  quotaMax = 20,
  activeAccountName,
  isCollapsed: externalCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const location = useLocation();
  const [internalCollapsed, setInternalCollapsed] = useState(false);

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
    { to: "/simulator", label: "Simulateur 9:16", icon: Smartphone },
    { to: "/calendar", label: "Planification & Automatisation", icon: Calendar },
    { to: "/posts", label: "Historique & Relances", icon: ListVideo },
    { to: "/accounts", label: "Comptes & Sécurité v2", icon: UserCheck },
    { to: "/api-keys", label: "Clés API & Setup", icon: KeyRound },
  ];

  const quotaPercent = Math.min(100, Math.round((quotaUsed / quotaMax) * 100));

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
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition flex items-center justify-center"
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
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition flex-shrink-0 ml-1"
              aria-label="Replier la barre latérale"
              title="Replier la barre latérale"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="h-px w-full bg-surface-container-highest opacity-60" />

        {/* Compte Actif ou État Non Lié */}
        {!isCollapsed ? (
          <Link
            to="/accounts"
            className="bg-surface-container border border-surface-container-high hover:border-secondary/40 rounded-xl p-2.5 flex items-center justify-between shadow-xs transition group"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-surface-container-highest border border-surface-container-high flex items-center justify-center text-on-surface text-xs font-bold flex-shrink-0">
                {activeAccountName ? activeAccountName.replace("@", "").charAt(0).toUpperCase() : "—"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-on-surface truncate group-hover:text-secondary-fixed transition">
                  {activeAccountName || "Aucun compte lié"}
                </p>
                <p className="text-[10px] text-on-surface-variant flex items-center gap-1 font-mono">
                  {activeAccountName ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed"></span>
                      <span>TikTok API v2</span>
                    </>
                  ) : (
                    <span>Cliquer pour lier</span>
                  )}
                </p>
              </div>
            </div>
          </Link>
        ) : (
          <Link to="/accounts" className="flex justify-center" title={activeAccountName || "Lier un compte"}>
            <div
              className="w-8 h-8 rounded-full bg-surface-container-highest border border-surface-container-high flex items-center justify-center text-on-surface text-xs font-bold shadow-sm"
            >
              {activeAccountName ? activeAccountName.replace("@", "").charAt(0).toUpperCase() : "+"}
            </div>
          </Link>
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
                    ? "bg-primary-container text-on-primary-container shadow-md shadow-primary-container/20 font-bold"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                } ${isCollapsed ? "justify-center px-0" : ""}`}
                title={isCollapsed ? link.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-on-primary-container" : ""}`} />
                {!isCollapsed && <span className="truncate">{link.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Quota Inférence */}
      <div className="px-3">
        {!isCollapsed ? (
          <div className="bg-surface-container border border-surface-container-high rounded-xl p-3 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs">
              <span className="text-on-surface-variant flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-tertiary" />
                Quota Génération
              </span>
              <span className="font-mono text-secondary-fixed font-bold text-xs">
                {quotaUsed}/{quotaMax}
              </span>
            </div>
            <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-container rounded-full transition-all duration-300"
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-on-surface-variant/80">Reset quotidien 00:00 UTC</p>
          </div>
        ) : (
          <div
            className="w-10 h-10 rounded-xl bg-surface-container border border-surface-container-high flex items-center justify-center mx-auto text-tertiary"
            title={`Quota: ${quotaUsed}/${quotaMax}`}
          >
            <Zap className="w-4 h-4" />
          </div>
        )}
      </div>
    </aside>
  );
}