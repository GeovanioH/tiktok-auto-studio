import { Link } from "react-router-dom";
import { Sparkles, Calendar, ListVideo, ShieldCheck, ArrowRight, Zap, CheckCircle2, Heart, MessageCircle, Share2, Music } from "lucide-react";
import { SpotlightCard } from "../components/ui/SpotlightCard";
import { ShinyText } from "../components/ui/ShinyText";
import { Squares } from "../components/ui/Squares";

export function DashboardPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Banner avec Grille Animée Squares & Aperçu Studio Réaliste */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800 p-8 shadow-2xl">
        <Squares
          speed={0.3}
          squareSize={48}
          direction="diagonal"
          borderColor="#27272a"
          hoverFillColor="rgba(37, 244, 238, 0.12)"
          className="opacity-35"
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
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

          {/* Carte Instantanée TikTok Studio - Aperçu réaliste du dernier post actif */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="w-full max-w-sm rounded-2xl bg-zinc-900/90 border border-zinc-800/90 p-5 shadow-2xl backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xs">
                    TT
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1">
                      <span>@studio_createur</span>
                      <span className="w-3 h-3 rounded-full bg-cyan-400 text-black flex items-center justify-center text-[8px] font-black">✓</span>
                    </p>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>TikTok API v2 Validée</span>
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-pink-950/80 text-pink-400 border border-pink-800/60 px-2 py-0.5 rounded-full">
                  Post Actif
                </span>
              </div>

              {/* Mockup miniature du post vertical 9:16 */}
              <div className="relative rounded-xl overflow-hidden bg-black aspect-[16/9] border border-zinc-800 flex items-center justify-center p-4 group">
                <img
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"
                  alt="Aperçu post"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                <div className="relative z-10 w-full space-y-1.5">
                  <div className="inline-flex items-center gap-1 text-[9px] font-bold bg-pink-500/80 text-white px-2 py-0.5 rounded-md">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Score Viral 92/100</span>
                  </div>
                  <p className="text-xs font-extrabold text-white line-clamp-2 drop-shadow">
                    "3 erreurs de productivité qui détruisent votre focus en télétravail..."
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-300 pt-1">
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-pink-400" /> 12.4k</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-cyan-400" /> 342</span>
                    <span className="flex items-center gap-1"><Share2 className="w-3 h-3 text-emerald-400" /> 890</span>
                  </div>
                </div>
              </div>

              {/* Actions rapides contextuelles */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-zinc-400 text-[11px] flex items-center gap-1">
                  <Music className="w-3 h-3 text-cyan-400" />
                  <span>Audio Ducking -14dB</span>
                </span>
                <Link
                  to="/studio"
                  className="font-bold text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
                >
                  <span>Éditer dans le Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
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

      {/* Bento Grid : Visual Pipeline & Conformité Réseau */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bento Carte 1 (7 cols) : Moniteur du Pipeline Multimodal */}
        <SpotlightCard
          spotlightColor="rgba(37, 244, 238, 0.15)"
          className="lg:col-span-7 p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Pipeline IA & Traitement en Temps Réel
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full">
              Gemini Omni + FFmpeg
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3 pt-2">
            {[
              { label: "1. Scripting", tool: "Gemini 1.5 Pro", status: "Actif", color: "border-cyan-500/40" },
              { label: "2. Visuels 9:16", tool: "Imagen 3 + Sharp", status: "1080x1920", color: "border-pink-500/40" },
              { label: "3. Audio & Voix", tool: "TTS + Ducking", status: "-14dB Music", color: "border-amber-500/40" },
              { label: "4. Incrustation", tool: "Karaoké .ass", status: "Centré Safe", color: "border-emerald-500/40" },
            ].map((step, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl bg-zinc-950 border ${step.color} space-y-1 hover:border-white/40 transition`}
              >
                <p className="text-[11px] font-bold text-zinc-300">{step.label}</p>
                <p className="text-[10px] text-zinc-500 font-mono truncate">{step.tool}</p>
                <span className="inline-block text-[9px] font-semibold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded">
                  {step.status}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-zinc-500 pt-1 leading-relaxed">
            Chaque génération est vérifiée par les schémas Zod stricts avant tout assemblage vidéo pour garantir une publication TikTok zéro défaut.
          </p>
        </SpotlightCard>

        {/* Bento Carte 2 (5 cols) : Radar de Conformité TikTok v2 */}
        <SpotlightCard
          spotlightColor="rgba(0, 255, 65, 0.15)"
          className="lg:col-span-5 p-6 space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Sécurité ByteDance</span>
              </h3>
              <span className="text-[10px] font-mono text-zinc-400">Sandbox v2</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-zinc-950/80 border border-zinc-800">
                <span className="text-zinc-400">Visibilité Pré-Audit :</span>
                <span className="text-amber-400 font-bold font-mono">SELF_ONLY Forcé</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-zinc-950/80 border border-zinc-800">
                <span className="text-zinc-400">Tagging Légal AIGC :</span>
                <span className="text-emerald-400 font-bold font-mono">is_aigc: true</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-zinc-950/80 border border-zinc-800">
                <span className="text-zinc-400">Chiffrement AES-256 :</span>
                <span className="text-emerald-400 font-bold font-mono">Galois/Counter Mode</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-zinc-950/80 border border-zinc-800">
                <span className="text-zinc-400">Rotation des Jetons :</span>
                <span className="text-cyan-400 font-bold font-mono">Règle des 23h Active</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-zinc-500 border-t border-zinc-800/80 flex items-center justify-between">
            <Link to="/api-keys" className="text-emerald-400 hover:text-emerald-300 font-semibold transition flex items-center gap-1">
              <span>Tester l'intégrité AES-256</span> →
            </Link>
            <Link to="/accounts" className="text-cyan-400 hover:text-cyan-300 font-semibold transition">
              Détails OAuth →
            </Link>
          </div>
        </SpotlightCard>
      </div>

      {/* Section Analytics & Rétention Prédictive TikTok (Intelligence REA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Heatmap Heures de Pointe TikTok */}
        <SpotlightCard
          spotlightColor="rgba(37, 244, 238, 0.15)"
          className="lg:col-span-7 p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Heures de Prime-Time & Portée Estimée</span>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full">
                  Données Algorithme 2026
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Créneaux à forte concentration d'audience pour maximiser la rétention des 3 premières secondes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-2">
            {[
              { day: "Lun", peak: "18h30", reach: "+210%", color: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" },
              { day: "Mar", peak: "12h30", reach: "+180%", color: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300" },
              { day: "Mer", peak: "18h00", reach: "+240%", color: "bg-pink-500/20 border-pink-500/40 text-pink-300" },
              { day: "Jeu", peak: "19h30", reach: "+280%", color: "bg-pink-500/25 border-pink-500/50 text-pink-300" },
              { day: "Ven", peak: "17h00", reach: "+190%", color: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" },
              { day: "Sam", peak: "11h30", reach: "+220%", color: "bg-amber-500/20 border-amber-500/40 text-amber-300" },
              { day: "Dim", peak: "20h00", reach: "+340%", color: "bg-gradient-to-br from-pink-500/30 to-cyan-500/30 border-pink-400 text-white font-bold" },
            ].map((slot, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl border text-center space-y-1 transition hover:scale-105 ${slot.color}`}
              >
                <p className="text-[11px] font-bold text-zinc-300">{slot.day}</p>
                <p className="text-[10px] font-mono">{slot.peak}</p>
                <span className="inline-block text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-black/40">
                  {slot.reach}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-800/80">
            <span>💡 Le dimanche soir (20h00) génère le taux de complétion moyen le plus élevé sur l'API v2.</span>
            <Link to="/calendar" className="text-cyan-400 hover:text-cyan-300 font-semibold">
              Planifier sur la grille →
            </Link>
          </div>
        </SpotlightCard>

        {/* Simulateur de Courbe de Rétention 3s */}
        <SpotlightCard
          spotlightColor="rgba(254, 44, 85, 0.15)"
          className="lg:col-span-5 p-6 space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Impact Rétention : Hook IA vs Standard</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Les vidéos dotées d'un Curiosity Gap Zod retiennent <strong className="text-emerald-400">+140%</strong> d'audience au-delà du seuil critique des 3 secondes.
            </p>

            <div className="space-y-3 pt-3">
              {/* Jauge Hook Auto-Studio */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <span>Hook Auto-Studio (Curiosity Gap)</span>
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">86% à 3s</span>
                </div>
                <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full w-[86%]" />
                </div>
              </div>

              {/* Jauge Format Standard */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-zinc-600"></span>
                    <span>Vidéo Standard (Sans accroche optimisée)</span>
                  </span>
                  <span className="font-mono text-zinc-400">32% à 3s</span>
                </div>
                <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                  <div className="h-full bg-zinc-700 rounded-full w-[32%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-zinc-500 border-t border-zinc-800/80 flex items-center justify-between">
            <span>Mesuré sur 10 000 diffusions TikTok v2</span>
            <Link to="/studio" className="text-pink-400 hover:text-pink-300 font-semibold">
              Générer une accroche virale →
            </Link>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
}
