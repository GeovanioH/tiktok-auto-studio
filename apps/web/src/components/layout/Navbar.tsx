import { Link } from "react-router-dom";
import { Bell, Zap } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";
import { BrandLogo } from "../ui/BrandLogo";

interface NavbarProps {
  title?: string;
}

export function Navbar({ title = "TikTok Studio IA Pro" }: NavbarProps) {
  return (
    <header className="h-16 border-b border-surface-container-highest bg-surface/85 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between flex-shrink-0 transition-colors duration-300 z-40 sticky top-0">
      {/* Titre & Télémétrie HUD de gauche */}
      <div className="flex items-center gap-3 overflow-hidden">
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <BrandLogo size={28} className="w-7 h-7 group-hover:scale-105 transition-transform" />
          <h2 className="text-sm font-headline font-bold text-on-surface tracking-tight truncate hidden lg:block">
            {title}
          </h2>
        </Link>

        {/* Status Chips HUD (Stitch Design) */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container rounded-full border border-surface-container-high flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
            <span className="text-[11px] font-mono text-on-surface font-medium">Fastify API :4000</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container rounded-full border border-surface-container-high flex-shrink-0 hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
            <span className="text-[11px] font-mono text-on-surface font-medium">BullMQ Redis</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container rounded-full border border-surface-container-high flex-shrink-0 hidden md:flex">
            <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
            <span className="text-[11px] font-mono text-on-surface font-medium">Gemini Omni v4.2</span>
          </div>

          {/* AIGC Stream Audio Spectrum Bars (Stitch Spec) */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-surface-container rounded-full border border-surface-container-high group flex-shrink-0" title="Flux Audio/Vidéo TikTok IA Synth Active">
            <span className="text-[10px] font-mono text-on-surface-variant group-hover:text-secondary-fixed transition-colors">AIGC Stream</span>
            <div className="flex items-end gap-0.5 h-4 px-1">
              <div className="spectrum-bar" />
              <div className="spectrum-bar" />
              <div className="spectrum-bar" />
              <div className="spectrum-bar" />
              <div className="spectrum-bar" />
            </div>
          </div>
        </div>
      </div>

      {/* Raccourcis et Actions rapides de droite */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Raccourci Batch 7 Jours (Border Beam Uiverse / ReactBits) */}
        <Link to="/calendar" className="border-beam-btn shadow-md shadow-primary-container/20 hover:scale-105 transition-all">
          <div className="border-beam-inner text-white font-bold text-xs">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Batch 7 Jours</span>
          </div>
        </Link>

        {/* TikTok v2 OAuth status pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container border border-surface-container-high rounded-full">
          <span className="w-2 h-2 rounded-full bg-tertiary"></span>
          <span className="text-[11px] font-mono text-on-surface hidden md:inline">TikTok v2 Validé</span>
        </div>

        {/* Toggle Mode Fond Blanc / Sombre (Uiverse.io) */}
        <ThemeToggle showLabels={false} />

        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary-fixed" />
        </button>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-black flex items-center justify-center text-xs shadow-xs">
          TT
        </div>
      </div>
    </header>
  );
}