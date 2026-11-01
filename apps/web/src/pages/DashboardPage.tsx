import { Link } from "react-router-dom";
import { 
  Sparkles, 
  Calendar, 
  ListVideo, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  Heart, 
  MessageCircle, 
  Share2, 
  Music,
  Lock,
  Clock,
  Cpu
} from "lucide-react";
import { ShinyText } from "../components/ui/ShinyText";
import { Squares } from "../components/ui/Squares";

export function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top HUD Telemetry Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-low px-4 py-2.5 rounded-2xl border border-surface-container-highest shadow-xs">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 rounded-full bg-secondary-fixed animate-ping"></span>
          <span className="text-xs font-mono font-bold text-secondary uppercase tracking-wider">
            Système Opérationnel : 99.98% SLA
          </span>
          <span className="text-[10px] font-mono bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant hidden sm:inline">
            Cortex-TikTok-v4.9
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-primary-container" />
            <span>Fastify API : <strong className="text-secondary-fixed">142ms</strong></span>
          </span>
          <span className="hidden md:flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-secondary" />
            <span>AES-256-GCM : <strong className="text-secondary-fixed">Actif</strong></span>
          </span>
        </div>
      </div>

      {/* Hero Banner avec Grille Animée Squares & Snapshot Studio */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-container-low border border-surface-container-highest p-6 sm:p-8 shadow-2xl">
        <Squares
          speed={0.25}
          squareSize={48}
          direction="diagonal"
          borderColor="#282a2f"
          hoverFillColor="rgba(53, 251, 245, 0.12)"
          className="opacity-30"
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-surface-container-high text-secondary text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-secondary-fixed" />
              <span>Studio Multimodal Autonome v2.5</span>
            </div>

            <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight sm:text-4xl">
              Pilotez votre présence TikTok{" "}
              <ShinyText text="sans jamais ouvrir l'application." speed={3.5} className="font-headline font-black text-primary-container" />
            </h1>

            <p className="text-sm text-on-surface-variant leading-relaxed max-w-xl">
              Génération par IA (Gemini Pro & Imagen 3), montage vertical 9:16 avec sous-titres karaoké animés et diffusion programmée sur l'API officielle TikTok Direct Publishing v2.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/studio"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-on-primary-container bg-primary-container hover:bg-primary transition shadow-lg shadow-primary-container/20 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Créer en 3 Clics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/calendar"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-on-surface bg-surface-container hover:bg-surface-container-high border border-surface-container-highest transition active:scale-95"
              >
                <Calendar className="w-4 h-4 text-secondary-fixed" />
                <span>Planification & Batch 7 Jours</span>
              </Link>
            </div>
          </div>

          {/* Carte Instantanée TikTok Studio - Mockup interactif */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="w-full max-w-sm rounded-2xl bg-surface-container border border-surface-container-high p-5 shadow-2xl backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between border-b border-surface-container-highest pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-container to-secondary-fixed flex items-center justify-center text-black font-black text-xs">
                    TT
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface flex items-center gap-1">
                      <span>@studio_createur</span>
                      <span className="w-3 h-3 rounded-full bg-secondary-fixed text-black flex items-center justify-center text-[8px] font-black">✓</span>
                    </p>
                    <p className="text-[10px] text-secondary flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                      <span>TikTok API v2 Validée</span>
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-primary-container/15 text-primary border border-primary/30 px-2 py-0.5 rounded-full">
                  Post Actif
                </span>
              </div>

              {/* Mockup miniature du post vertical */}
              <div className="relative rounded-xl overflow-hidden bg-black aspect-[16/9] border border-surface-container-highest flex items-center justify-center p-4 group">
                <img
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"
                  alt="Aperçu post"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                <div className="relative z-10 w-full space-y-1.5">
                  <div className="inline-flex items-center gap-1 text-[9px] font-bold bg-primary-container text-on-primary-container px-2 py-0.5 rounded-md">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Score Viral 92/100</span>
                  </div>
                  <p className="text-xs font-extrabold text-white line-clamp-2 drop-shadow">
                    "3 erreurs de productivité qui détruisent votre focus en télétravail..."
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-300 pt-1">
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-pink-400" /> 18.2k</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-cyan-400" /> 489</span>
                    <span className="flex items-center gap-1"><Share2 className="w-3 h-3 text-emerald-400" /> 630</span>
                  </div>
                </div>
              </div>

              {/* Actions rapides contextuelles */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-on-surface-variant text-[11px] flex items-center gap-1 font-mono">
                  <Music className="w-3 h-3 text-secondary-fixed" />
                  <span>Ducking -14dB Actif</span>
                </span>
                <Link
                  to="/studio"
                  className="font-bold text-xs text-secondary-fixed hover:text-secondary flex items-center gap-1 transition"
                >
                  <span>Éditer dans le Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Glow décoratif */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 bottom-0 -mb-10 w-80 h-80 bg-primary-container/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Cartes KPI (Stitch Bento Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-highest space-y-2 shadow-sm hover:border-secondary/40 transition">
          <div className="flex items-center justify-between text-on-surface-variant text-xs">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Posts Programmés</span>
            <Calendar className="w-4 h-4 text-secondary-fixed" />
          </div>
          <p className="text-3xl font-headline font-black text-on-surface">4</p>
          <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
            <Clock className="w-3 h-3 text-secondary" />
            Prochaine publication à 18h30
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-highest space-y-2 shadow-sm hover:border-primary-container/40 transition">
          <div className="flex items-center justify-between text-on-surface-variant text-xs">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Vidéos Publiées</span>
            <ListVideo className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-headline font-black text-on-surface">28</p>
          <p className="text-[11px] text-secondary flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3 h-3" />
            100% succès API v2
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-highest space-y-2 shadow-sm hover:border-tertiary/40 transition">
          <div className="flex items-center justify-between text-on-surface-variant text-xs">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Quota IA Quotidien</span>
            <Zap className="w-4 h-4 text-tertiary" />
          </div>
          <p className="text-3xl font-headline font-black text-on-surface">18 / 20</p>
          <p className="text-[11px] text-on-surface-variant">Inférences Gemini 1.5 disponibles</p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-highest space-y-2 shadow-sm hover:border-secondary/40 transition">
          <div className="flex items-center justify-between text-on-surface-variant text-xs">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Sécurité & Chiffrement</span>
            <ShieldCheck className="w-4 h-4 text-secondary-fixed" />
          </div>
          <p className="text-base font-bold text-on-surface mt-1">AES-256-GCM</p>
          <p className="text-[11px] text-secondary font-mono">Zéro fuite mémoire certifiée</p>
        </div>
      </div>

      {/* Bento Grid : Pipeline Multimodal & Sécurité ByteDance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bento Carte 1 (7 cols) : Moniteur du Pipeline Multimodal */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-surface-container-low border border-surface-container-highest space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary-fixed animate-ping"></span>
              <h3 className="text-sm font-headline font-bold text-on-surface uppercase tracking-wider">
                Pipeline IA & Traitement en Temps Réel
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-surface-container text-secondary border border-surface-container-highest px-2 py-0.5 rounded-full">
              Gemini Omni + FFmpeg
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              { label: "1. Scripting", tool: "Gemini 1.5 Pro", status: "Actif", border: "border-secondary/30" },
              { label: "2. Visuels 9:16", tool: "Imagen 3 + Sharp", status: "1080x1920", border: "border-primary-container/30" },
              { label: "3. Audio & Voix", tool: "TTS + Ducking", status: "-14dB Music", border: "border-tertiary/30" },
              { label: "4. Incrustation", tool: "Karaoké .ass", status: "Centré Safe", border: "border-secondary-fixed/30" },
            ].map((step, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl bg-surface-container border ${step.border} space-y-1 hover:border-on-surface-variant transition`}
              >
                <p className="text-[11px] font-bold text-on-surface">{step.label}</p>
                <p className="text-[10px] text-on-surface-variant font-mono truncate">{step.tool}</p>
                <span className="inline-block text-[9px] font-semibold text-secondary-fixed bg-surface-container-high px-1.5 py-0.2 rounded font-mono">
                  {step.status}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-on-surface-variant pt-1 leading-relaxed">
            Chaque génération est vérifiée par les schémas Zod stricts avant tout assemblage vidéo pour garantir une publication TikTok zéro défaut.
          </p>
        </div>

        {/* Bento Carte 2 (5 cols) : Radar de Conformité TikTok v2 */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-surface-container-low border border-surface-container-highest space-y-4 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-headline font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-secondary-fixed" />
                <span>Sécurité ByteDance</span>
              </h3>
              <span className="text-[10px] font-mono text-on-surface-variant">Sandbox v2</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-surface-container border border-surface-container-high">
                <span className="text-on-surface-variant">Visibilité Pré-Audit :</span>
                <span className="text-tertiary font-bold font-mono">SELF_ONLY Forcé</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-surface-container border border-surface-container-high">
                <span className="text-on-surface-variant">Tagging Légal AIGC :</span>
                <span className="text-secondary-fixed font-bold font-mono">is_aigc: true</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-surface-container border border-surface-container-high">
                <span className="text-on-surface-variant">Chiffrement AES-256 :</span>
                <span className="text-primary font-bold font-mono">Galois/Counter Mode</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-surface-container border border-surface-container-high">
                <span className="text-on-surface-variant">Rotation des Jetons :</span>
                <span className="text-secondary font-bold font-mono">Règle des 23h Active</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-on-surface-variant border-t border-surface-container-highest flex items-center justify-between">
            <Link to="/api-keys" className="text-secondary-fixed hover:text-secondary font-semibold transition flex items-center gap-1">
              <span>Tester l'intégrité AES-256</span> →
            </Link>
            <Link to="/accounts" className="text-primary hover:text-primary-container font-semibold transition">
              Détails OAuth →
            </Link>
          </div>
        </div>
      </div>

      {/* Section Analytics & Rétention Prédictive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Heatmap Heures de Pointe TikTok */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-surface-container-low border border-surface-container-highest space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-headline font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                <span>Heures de Prime-Time & Portée Estimée</span>
                <span className="text-[10px] font-mono bg-surface-container text-secondary border border-surface-container-highest px-2 py-0.5 rounded-full">
                  Données Algorithme 2026
                </span>
              </h3>
              <p className="text-xs text-on-surface-variant">
                Créneaux à forte concentration d'audience pour maximiser la rétention des 3 premières secondes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-2">
            {[
              { day: "Lun", peak: "18h30", reach: "+210%", color: "bg-surface-container border-surface-container-high text-secondary" },
              { day: "Mar", peak: "12h30", reach: "+180%", color: "bg-surface-container border-surface-container-high text-secondary" },
              { day: "Mer", peak: "18h00", reach: "+240%", color: "bg-surface-container border-surface-container-high text-primary" },
              { day: "Jeu", peak: "19h30", reach: "+280%", color: "bg-surface-container border-surface-container-high text-primary" },
              { day: "Ven", peak: "17h00", reach: "+190%", color: "bg-surface-container border-surface-container-high text-secondary" },
              { day: "Sam", peak: "11h30", reach: "+220%", color: "bg-surface-container border-surface-container-high text-tertiary" },
              { day: "Dim", peak: "20h00", reach: "+340%", color: "bg-gradient-to-br from-primary-container/20 to-secondary/20 border-primary-container text-on-surface font-bold" },
            ].map((slot, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl border text-center space-y-1 transition hover:scale-105 ${slot.color}`}
              >
                <p className="text-[11px] font-bold text-on-surface">{slot.day}</p>
                <p className="text-[10px] font-mono text-on-surface-variant">{slot.peak}</p>
                <span className="inline-block text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-surface-container-lowest">
                  {slot.reach}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1 border-t border-surface-container-highest">
            <span>💡 Le dimanche soir (20h00) génère le taux de complétion moyen le plus élevé sur l'API v2.</span>
            <Link to="/calendar" className="text-secondary-fixed hover:text-secondary font-semibold">
              Planifier sur la grille →
            </Link>
          </div>
        </div>

        {/* Simulateur de Courbe de Rétention 3s */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-surface-container-low border border-surface-container-highest space-y-4 flex flex-col justify-between shadow-sm">
          <div className="space-y-2">
            <h3 className="text-sm font-headline font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
              <span>Impact Rétention : Hook IA vs Standard</span>
            </h3>
            <p className="text-xs text-on-surface-variant">
              Les vidéos dotées d'un Curiosity Gap Zod retiennent <strong className="text-secondary-fixed">+140%</strong> d'audience au-delà du seuil critique des 3 secondes.
            </p>

            <div className="space-y-3 pt-3">
              {/* Jauge Hook Auto-Studio */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-on-surface flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-secondary-fixed"></span>
                    <span>Hook Auto-Studio (Curiosity Gap)</span>
                  </span>
                  <span className="font-mono text-secondary-fixed font-bold">86% à 3s</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2.5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-secondary-fixed to-primary-container rounded-full w-[86%]" />
                </div>
              </div>

              {/* Jauge Format Standard */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-surface-container-highest"></span>
                    <span>Vidéo Standard (Sans accroche optimisée)</span>
                  </span>
                  <span className="font-mono text-on-surface-variant">32% à 3s</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2.5 rounded-full overflow-hidden">
                  <div className="h-full bg-surface-container rounded-full w-[32%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-on-surface-variant border-t border-surface-container-highest flex items-center justify-between">
            <span>Mesuré sur 10 000 diffusions TikTok v2</span>
            <Link to="/studio" className="text-primary-container hover:text-primary font-semibold">
              Générer une accroche virale →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}