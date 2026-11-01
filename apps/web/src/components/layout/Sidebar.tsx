import { Link, useLocation } from "react-router-dom";
import { Sparkles, Calendar, ListVideo, UserCheck, LayoutDashboard, Zap } from "lucide-react";
import { ShinyText } from "../ui/ShinyText";

interface SidebarProps {
  quotaUsed?: number;
  quotaMax?: number;
  activeAccountName?: string;
}

export function Sidebar({
  quotaUsed = 2,
  quotaMax = 20,
  activeAccountName = "@studio_createur",
}: SidebarProps) {
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Vue d'ensemble", icon: LayoutDashboard },
    { to: "/studio", label: "Studio IA 3-Clics", icon: Sparkles },
    { to: "/calendar", label: "Calendrier & Horaires", icon: Calendar },
    { to: "/posts", label: "Historique & Relances", icon: ListVideo },
    { to: "/accounts", label: "Comptes TikTok v2", icon: UserCheck },
  ];

  const quotaPercent = Math.min(100, Math.round((quotaUsed / quotaMax) * 100));

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950/90 backdrop-blur flex flex-col justify-between p-4 flex-shrink-0">
      <div className="space-y-6">
        {/* Brand Header */}
        <Link to="/" className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg shadow-pink-500/20">
            TT
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
              <ShinyText text="Auto-Studio" speed={4} className="font-extrabold" />
              <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.2 rounded font-mono">
                v2
              </span>
            </h1>
            <p className="text-[11px] text-zinc-500">TikTok Direct Publishing</p>
          </div>
        </Link>

        {/* Compte Actif */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {activeAccountName.replace("@", "").charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{activeAccountName}</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Connecté (v2)
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-gradient-to-r from-zinc-800 to-zinc-900 text-white border border-zinc-700/80 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-cyan-400" : "text-zinc-500 group-hover:text-zinc-300"
                  }`}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Quota Inférence */}
      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Quota IA Quotidien
          </span>
          <span className="font-bold text-white">
            {quotaUsed}/{quotaMax}
          </span>
        </div>
        <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full transition-all duration-300"
            style={{ width: `${quotaPercent}%` }}
          />
        </div>
        <p className="text-[10px] text-zinc-500">Réinitialisation quotidienne à 00:00 UTC</p>
      </div>
    </aside>
  );
}
