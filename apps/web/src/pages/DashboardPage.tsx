import { Link } from "react-router-dom";
import { Sparkles, Calendar, ListVideo, ShieldCheck, ArrowRight, Zap, CheckCircle2 } from "lucide-react";
import { SpotlightCard } from "../components/ui/SpotlightCard";
import { ShinyText } from "../components/ui/ShinyText";
import { Squares } from "../components/ui/Squares";

export function DashboardPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Banner avec Grille Animée Squares (React Bits) */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800 p-8 shadow-2xl">
        <Squares
          speed={0.3}
          squareSize={48}
          direction="diagonal"
          borderColor="#27272a"
          hoverFillColor="rgba(37, 244, 238, 0.12)"
          className="opacity-35"
        />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Studio Multimodal Autonome v2.0</span>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Pilotez votre présence TikTok{" "}
            <ShinyText text="sans jamais ouvrir l'application." speed={3.5} className="font-black" />
          </h1>

          <p className="text-sm text-zinc-400 leading-relaxed">
            Génération par IA (Gemini Pro & Imagen 3), montage vertical 9:16 avec sous-titres karaoké animés et diffusion programmée sur l'API officielle TikTok Direct Publishing v2.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/studio"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-pink-500 via-rose-500 to-cyan-500 hover:opacity-90 transition shadow-lg shadow-pink-500/20 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Créer en 3 Clics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/calendar"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-zinc-300 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 transition active:scale-95"
            >
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Voir le Calendrier</span>
            </Link>
          </div>
        </div>

        {/* Glow décoratif */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 bottom-0 -mb-10 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Cartes d'Indicateurs Clés avec SpotlightCard (React Bits) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SpotlightCard
          spotlightColor="rgba(37, 244, 238, 0.2)"
          className="p-5 space-y-2"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Posts Programmés</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white">4</p>
          <p className="text-[11px] text-zinc-500">Prochaine publication à 18h30</p>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.2)"
          className="p-5 space-y-2"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Vidéos Publiées</span>
            <ListVideo className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">28</p>
          <p className="text-[11px] text-emerald-400/80 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            100% succès API v2
          </p>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.2)"
          className="p-5 space-y-2"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Quota IA Restant</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">18 / 20</p>
          <p className="text-[11px] text-zinc-500">Inférences Gemini disponibles</p>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="rgba(254, 44, 85, 0.2)"
          className="p-5 space-y-2"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Sécurité & Conformité</span>
            <ShieldCheck className="w-4 h-4 text-pink-500" />
          </div>
          <p className="text-sm font-bold text-white mt-1">AES-256-GCM</p>
          <p className="text-[11px] text-pink-400/80">Chiffrement zéro fuite actif</p>
        </SpotlightCard>
      </div>
    </div>
  );
}
