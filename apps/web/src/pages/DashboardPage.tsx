import { Link } from "react-router-dom";
import { Sparkles, Calendar, ListVideo, ShieldCheck, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

export function DashboardPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Studio Multimodal Autonome v2.0</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Pilotez votre présence TikTok sans jamais ouvrir l'application.
          </h1>
          <p className="text-sm text-zinc-400">
            Génération par IA (Gemini Pro & Imagen 3), montage vertical 9:16 conforme, sous-titres animés et programmation officielle via l'API TikTok Direct Publishing v2.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/studio"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-pink-500 via-rose-500 to-cyan-500 hover:opacity-90 transition shadow-lg shadow-pink-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Créer en 3 Clics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/calendar"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-zinc-300 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 transition"
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

      {/* Cartes d'Indicateurs Clés */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Posts Programmés</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white">4</p>
          <p className="text-[11px] text-zinc-500">Prochaine publication à 18h30</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Vidéos Publiées</span>
            <ListVideo className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">28</p>
          <p className="text-[11px] text-emerald-400/80 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            100% succès API v2
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Quota IA Restant</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">18 / 20</p>
          <p className="text-[11px] text-zinc-500">Inférences Gemini disponibles</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Sécurité & Conformité</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-sm font-bold text-white mt-1">AES-256-GCM</p>
          <p className="text-[11px] text-blue-400/80">Chiffrement zéro fuite actif</p>
        </div>
      </div>
    </div>
  );
}
