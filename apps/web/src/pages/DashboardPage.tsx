import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  Calendar, 
  ListVideo, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  Clock,
  Plus,
  Video
} from "lucide-react";
import { ShinyText } from "../components/ui/ShinyText";
import { Squares } from "../components/ui/Squares";
import { BrandLogo } from "../components/ui/BrandLogo";
import { api, type PostDto, type TikTokAccountDto } from "../lib/api";

export function DashboardPage() {
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [account, setAccount] = useState<TikTokAccountDto | null>(null);

  useEffect(() => {
    // Récupération des données réelles sans simulation artificielle
    api
      .get("/posts")
      .then((res) => {
        if (res.data && Array.isArray(res.data.posts)) {
          setPosts(res.data.posts);
        } else {
          setPosts([]);
        }
      })
      .catch(() => {
        // Zéro activité simulée par défaut
        setPosts([]);
      });

    api
      .get("/auth/tiktok/status")
      .then((res) => {
        if (res.data && res.data.account) {
          setAccount(res.data.account);
        } else {
          setAccount(null);
        }
      })
      .catch(() => {
        setAccount(null);
      });
  }, []);

  const scheduledCount = posts.filter((p) => p.status === "SCHEDULED").length;
  const publishedCount = posts.filter((p) => p.status === "PUBLISHED").length;
  const todayStr = new Date().toDateString();
  const quotaUsedToday = posts.filter((p) => new Date(p.createdAt).toDateString() === todayStr).length;

  // Dernier post programmé ou publié
  const activePost = posts.find((p) => p.status === "SCHEDULED" || p.status === "PUBLISHED");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Strip Réel & Neutre (Sans simulation de SLA / Latence) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-low px-4 py-2.5 rounded-2xl border border-surface-container-highest shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-secondary-fixed"></span>
          <span className="text-xs font-mono font-semibold text-on-surface">
            Studio TikTok IA — Prêt pour la création
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-secondary-fixed" />
            <span>Sécurité AES-256-GCM</span>
          </span>
          <span className="hidden sm:inline text-[11px] text-on-surface-variant/80">
            TikTok Direct Publishing v2
          </span>
        </div>
      </div>

      {/* Hero Banner avec Grille Animée Squares & Snapshot Studio */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-container-low border border-surface-container-highest p-6 sm:p-8 shadow-2xl">
        <Squares
          speed={0.25}
          squareSize={48}
          direction="diagonal"
          borderColor="#222A40"
          hoverFillColor="rgba(53, 251, 245, 0.12)"
          className="opacity-30"
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-surface-container-high text-secondary text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-secondary-fixed" />
              <span>Studio Multimodal Autonome</span>
            </div>

            <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight sm:text-4xl">
              Pilotez votre présence TikTok{" "}
              <ShinyText text="sans jamais ouvrir l'application." speed={3.5} className="font-headline font-black text-primary-container" />
            </h1>

            <p className="text-sm text-on-surface-variant leading-relaxed max-w-xl">
              Génération par IA, montage vertical 9:16 avec sous-titres karaoké animés et diffusion programmée sur l'API officielle TikTok Direct Publishing v2.
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

          {/* Carte Instantanée Réelle (Sans fausse activité si vide) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="w-full max-w-sm rounded-2xl bg-surface-container border border-surface-container-high p-5 shadow-2xl backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between border-b border-surface-container-highest pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-surface-container-highest shadow-sm flex items-center justify-center flex-shrink-0">
                    <BrandLogo size={32} className="w-full h-full" withGlow={false} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">
                      {account ? account.displayName || `@${account.openId.substring(0, 8)}` : "Compte TikTok"}
                    </p>
                    <p className="text-[10px] text-on-surface-variant font-mono">
                      {account ? "✓ Compte Connecté" : "Non lié"}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-surface-container-highest text-on-surface-variant px-2 py-0.5 rounded-full">
                  {activePost ? "1 Post Actif" : "0 Post Actif"}
                </span>
              </div>

              {/* Aperçu : Post Réel ou État Vierge Réel */}
              {activePost ? (
                <div className="relative rounded-xl overflow-hidden bg-black aspect-[16/9] border border-surface-container-highest flex items-center justify-center p-4">
                  {activePost.mediaUrls[0] && (
                    <img
                      src={activePost.mediaUrls[0]}
                      alt="Aperçu post"
                      className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="relative z-10 w-full space-y-1">
                    <span className="text-[10px] font-mono bg-primary-container text-white px-2 py-0.5 rounded">
                      {activePost.status}
                    </span>
                    <p className="text-xs font-bold text-white line-clamp-2">
                      {activePost.caption}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-surface-container-highest bg-surface-container-lowest/50 aspect-[16/9] flex flex-col items-center justify-center p-4 text-center space-y-2">
                  <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Aucune publication active</p>
                    <p className="text-[10px] text-on-surface-variant max-w-[200px] mt-0.5">
                      Générez votre premier contenu dans le Studio pour afficher les métriques en direct.
                    </p>
                  </div>
                </div>
              )}

              {/* Actions rapides contextuelles */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-on-surface-variant text-[11px] font-mono">
                  {activePost ? "Programmé" : "En attente"}
                </span>
                <Link
                  to="/studio"
                  className="font-bold text-xs text-secondary-fixed hover:text-secondary flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nouveau Post</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Glow décoratif */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 bottom-0 -mb-10 w-80 h-80 bg-primary-container/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Cartes KPI Réelles (Initialisées à 0 par défaut) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="spotlight-card p-5 rounded-2xl bg-surface-container-low border border-surface-container-highest space-y-2 shadow-sm hover:border-secondary/40 transition">
          <div className="flex items-center justify-between text-on-surface-variant text-xs">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Posts Programmés</span>
            <Calendar className="w-4 h-4 text-secondary-fixed" />
          </div>
          <p className="text-3xl font-headline font-black text-on-surface">{scheduledCount}</p>
          <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
            <Clock className="w-3 h-3 text-secondary" />
            {scheduledCount > 0 ? `${scheduledCount} post(s) en file d'attente` : "Aucune publication en attente"}
          </p>
        </div>

        <div className="spotlight-card p-5 rounded-2xl bg-surface-container-low border border-surface-container-highest space-y-2 shadow-sm hover:border-primary-container/40 transition">
          <div className="flex items-center justify-between text-on-surface-variant text-xs">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Vidéos Publiées</span>
            <ListVideo className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-headline font-black text-on-surface">{publishedCount}</p>
          <p className="text-[11px] text-on-surface-variant flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3 h-3 text-secondary-fixed" />
            {publishedCount > 0 ? `${publishedCount} vidéo(s) en ligne` : "0 vidéo diffusée"}
          </p>
        </div>

        <div className="spotlight-card p-5 rounded-2xl bg-surface-container-low border border-surface-container-highest space-y-2 shadow-sm hover:border-tertiary/40 transition">
          <div className="flex items-center justify-between text-on-surface-variant text-xs">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Quota IA Quotidien</span>
            <Zap className="w-4 h-4 text-tertiary" />
          </div>
          <p className="text-3xl font-headline font-black text-on-surface">{quotaUsedToday} / 20</p>
          <p className="text-[11px] text-on-surface-variant">
            {quotaUsedToday === 0 ? "0 génération effectuée aujourd'hui" : `${quotaUsedToday} inférence(s) consommée(s)`}
          </p>
        </div>

        <div className="spotlight-card p-5 rounded-2xl bg-surface-container-low border border-surface-container-highest space-y-2 shadow-sm hover:border-secondary/40 transition">
          <div className="flex items-center justify-between text-on-surface-variant text-xs">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Sécurité & Chiffrement</span>
            <ShieldCheck className="w-4 h-4 text-secondary-fixed" />
          </div>
          <p className="text-base font-bold text-on-surface mt-1">AES-256-GCM</p>
          <p className="text-[11px] text-secondary font-mono">Coffre cryptographique prêt</p>
        </div>
      </div>

      {/* Bento Grid : Pipeline Multimodal & Sécurité ByteDance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bento Carte 1 : Architecture du Pipeline Multimodal */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-surface-container-low border border-surface-container-highest space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary-fixed"></span>
              <h3 className="text-sm font-headline font-bold text-on-surface uppercase tracking-wider">
                Pipeline IA & Traitement Studio
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-surface-container text-secondary border border-surface-container-highest px-2 py-0.5 rounded-full">
              Gemini + Sharp + FFmpeg
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              { label: "1. Scripting", tool: "Gemini 1.5 Pro", status: "Prêt", border: "border-secondary/30" },
              { label: "2. Visuels 9:16", tool: "Sharp 1080x1920", status: "Prêt", border: "border-primary-container/30" },
              { label: "3. Audio & Voix", tool: "TTS + Ducking", status: "Prêt", border: "border-tertiary/30" },
              { label: "4. Incrustation", tool: "Karaoké Safe Area", status: "Prêt", border: "border-secondary-fixed/30" },
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
            Validation Zod stricte sur chaque payload avant déclenchement de la publication TikTok.
          </p>
        </div>

        {/* Bento Carte 2 : Radar de Conformité TikTok v2 */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-surface-container-low border border-surface-container-highest space-y-4 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-headline font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-secondary-fixed" />
                <span>Sécurité ByteDance</span>
              </h3>
              <span className="text-[10px] font-mono text-on-surface-variant">API v2</span>
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
                <span className="text-on-surface-variant">Statut du Compte :</span>
                <span className={`font-bold font-mono ${account ? "text-secondary-fixed" : "text-on-surface-variant"}`}>
                  {account ? "Connecté" : "Non Lié"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-on-surface-variant border-t border-surface-container-highest flex items-center justify-between">
            <Link to="/api-keys" className="text-secondary-fixed hover:text-secondary font-semibold transition flex items-center gap-1">
              <span>Tester les clés API</span> →
            </Link>
            <Link to="/accounts" className="text-primary hover:text-primary-container font-semibold transition">
              {account ? "Gérer le compte →" : "Lier un compte →"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
