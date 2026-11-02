import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, Zap, User } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";
import { BrandLogo } from "../ui/BrandLogo";
import { api } from "../../lib/api";

interface NavbarProps {
  title?: string;
}

export function Navbar({ title = "TikTok Studio IA Pro" }: NavbarProps) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Vérification réelle du statut TikTok sans simulation
    api
      .get("/auth/tiktok/status")
      .then((res) => {
        if (res.data && res.data.account) {
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      })
      .catch(() => {
        // En cas d'erreur ou d'absence de backend : 0 compte connecté par défaut
        setIsConnected(false);
      });
  }, []);

  return (
    <header className="h-16 border-b border-surface-container-highest bg-surface/85 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between flex-shrink-0 transition-colors duration-300 z-40 sticky top-0">
      {/* Titre & Logo */}
      <div className="flex items-center gap-3 overflow-hidden">
        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <BrandLogo size={28} className="w-7 h-7 group-hover:scale-105 transition-transform" withGlow={false} />
          <h2 className="text-sm font-headline font-bold text-on-surface tracking-tight truncate hidden sm:block">
            {title}
          </h2>
        </Link>
      </div>

      {/* Raccourcis et Actions réelles de droite */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Raccourci Batch 7 Jours */}
        <Link to="/calendar" className="border-beam-btn shadow-md shadow-primary-container/20 hover:scale-105 transition-all">
          <div className="border-beam-inner text-white font-bold text-xs">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Batch 7 Jours</span>
          </div>
        </Link>

        {/* Statut TikTok OAuth réel (Sans simulation) */}
        <Link
          to="/accounts"
          className="flex items-center gap-1.5 px-3 py-1 bg-surface-container border border-surface-container-high rounded-full hover:border-secondary-fixed/40 transition"
          title={isConnected ? "Compte TikTok actif" : "Aucun compte TikTok connecté — Cliquez pour lier"}
        >
          <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-secondary-fixed" : "bg-on-surface-variant/40"}`} />
          <span className="text-[11px] font-mono text-on-surface hidden md:inline">
            {isConnected ? "TikTok Connecté" : "TikTok Non Lié"}
          </span>
        </Link>

        {/* Toggle Mode Fond Blanc / Sombre */}
        <ThemeToggle showLabels={false} />

        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* User avatar réel */}
        <Link
          to="/accounts"
          className="w-8 h-8 rounded-full bg-surface-container border border-surface-container-high text-on-surface-variant hover:text-on-surface hover:border-secondary-fixed transition flex items-center justify-center text-xs shadow-xs"
          title="Mon Compte"
        >
          <User className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
