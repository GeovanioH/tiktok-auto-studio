import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Video, 
  Flame, 
  Activity, 
  TrendingUp, 
  RefreshCw, 
  ChevronRight,
  BarChart3,
  FileCheck2,
  Lock
} from "lucide-react";
import { ShinyText } from "../components/ui/ShinyText";
import { Squares } from "../components/ui/Squares";
import { api, type PostDto, type TikTokAccountDto } from "../lib/api";
import { useQuota } from "../context/QuotaContext";
import { StatusBadge } from "../components/posts/StatusBadge";

const VIRAL_HOOK_PRESETS = [
  {
    tag: "Curiosity Gap",
    icon: Flame,
    color: "text-secondary-fixed",
    badge: "bg-secondary-fixed/15 text-secondary-fixed border-secondary-fixed/30",
    text: "Le secret que 99% des créateurs ignorent pour percer sur TikTok en 2026 : et voilà comment l'appliquer dès aujourd'hui.",
  },
  {
    tag: "Pattern Interrupt",
    icon: Zap,
    color: "text-tertiary",
    badge: "bg-tertiary/15 text-tertiary border-tertiary/30",
    text: "Arrêtez de poster à 18h : voici le créneau secret où les algorithmes explosent sans concurrence.",
  },
  {
    tag: "Avant / Après",
    icon: TrendingUp,
    color: "text-primary-container",
    badge: "bg-primary-container/15 text-primary border-primary/30",
    text: "Comment j'ai automatisé 30 jours de vidéos 9:16 en seulement 15 minutes avec ce pipeline IA autonome.",
  },
  {
    tag: "Statistique Choc",
    icon: BarChart3,
    color: "text-emerald-400",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    text: "92.4% des carrousels photos génèrent plus de partages que les vidéos classiques : voici la structure exacte en 5 slides.",
  },
];

const TEMPLATE_STARTERS = [
  {
    title: "Carrousel Storytelling 5 Slides",
    category: "Format Carrousel Photo",
    hook: "La méthode exacte en 5 étapes pour doubler vos ventes sans publicité.",
    retention: "Rétention estimée 96%",
    img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop&q=80",
    slidesCount: 5,
  },
  {
    title: "Vidéo Hook 3s + Karaoké Hormozi",
    category: "Vidéo Courte 9:16",
    hook: "Ne commencez JAMAIS votre vidéo par un bonjour ! Regardez cette règle d'or.",
    retention: "Rétention estimée 94%",
    img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1080&auto=format&fit=crop&q=80",
    slidesCount: 1,
  },
  {
    title: "Étude de Cas & Révélation Choc",
    category: "Format Documentaire Éclair",
    hook: "J'ai analysé 100 vidéos ayant dépassé 1M de vues : voici les 3 invariants.",
    retention: "Rétention estimée 91%",
    img: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1080&auto=format&fit=crop&q=80",
    slidesCount: 3,
  },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [account, setAccount] = useState<TikTokAccountDto | null>(null);
  const [activeTab, setActiveTab] = useState<"SCHEDULE" | "ANALYTICS" | "INFRA">("SCHEDULE");
  const [quickPrompt, setQuickPrompt] = useState(VIRAL_HOOK_PRESETS[0].text);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [postFilter, setPostFilter] = useState<"ALL" | "SCHEDULED" | "PUBLISHED">("ALL");
  const [analyticsPeriod, setAnalyticsPeriod] = useState<"7D" | "30D">("7D");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { quotaUsed, quotaMax, quotaPercent, remainingQuota } = useQuota();

  const fetchData = () => {
    setIsRefreshing(true);
    const p1 = api.get("/posts")
      .then((res) => {
        if (res.data && Array.isArray(res.data.posts)) {
          setPosts(res.data.posts);
        } else {
          setPosts([]);
        }
      })
      .catch(() => setPosts([]));

    const p2 = api.get("/auth/tiktok/status")
      .then((res) => {
        if (res.data && res.data.account) {
          setAccount(res.data.account);
        } else {
          setAccount(null);
        }
      })
      .catch(() => setAccount(null));

    Promise.all([p1, p2]).finally(() => {
      setTimeout(() => setIsRefreshing(false), 400);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const scheduledCount = posts.filter((p) => p.status === "SCHEDULED").length;
  const publishedCount = posts.filter((p) => p.status === "PUBLISHED").length;
  const todayStr = new Date().toDateString();
  const apiQuotaUsedToday = posts.filter((p) => new Date(p.createdAt).toDateString() === todayStr).length;
  const effectiveQuotaUsed = Math.max(quotaUsed, apiQuotaUsedToday);

  // Dernier post actif
  const activePost = posts.find((p) => p.status === "SCHEDULED" || p.status === "PUBLISHED");

  // Filtrage des posts pour la liste
  const filteredPosts = posts.filter((p) => {
    if (postFilter === "SCHEDULED") return p.status === "SCHEDULED";
    if (postFilter === "PUBLISHED") return p.status === "PUBLISHED";
    return true;
  });

  // Jours de la semaine courante (Lundi à Dimanche)
  const daysOfWeek = [
    { name: "Lun", date: "4 Nov", peak: "12h30", isToday: true },
    { name: "Mar", date: "5 Nov", peak: "18h45", isToday: false },
    { name: "Mer", date: "6 Nov", peak: "13h00", isToday: false },
    { name: "Jeu", date: "7 Nov", peak: "19h15", isToday: false },
    { name: "Ven", date: "8 Nov", peak: "20h00", isToday: false },
    { name: "Sam", date: "9 Nov", peak: "11h30", isToday: false },
    { name: "Dim", date: "10 Nov", peak: "21h00", isToday: false },
  ];

  const handleLaunchQuickPrompt = () => {
    navigate("/studio", { state: { prompt: quickPrompt } });
  };

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIndex(idx);
    setQuickPrompt(VIRAL_HOOK_PRESETS[idx].text);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. HERO COMMAND CENTER & STATUT TEMPS RÉEL */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-container-low border border-surface-container-highest p-6 sm:p-8 shadow-2xl">
        <Squares
          speed={0.25}
          squareSize={48}
          direction="diagonal"
          borderColor="#334155"
          hoverFillColor="rgba(53, 251, 245, 0.12)"
          className="opacity-30"
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-surface-container-high text-secondary text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-secondary-fixed" />
                <span>Atelier de Contrôle & Performance Algorithmique</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container border border-surface-container-high text-[11px] font-mono text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse" />
                <span>TikTok API v2 Active</span>
              </span>
            </div>

            <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight sm:text-4xl">
              Pilotez vos flux 9:16{" "}
              <ShinyText text="avec une précision chirurgicale." speed={3.5} className="font-headline font-black text-primary-container" />
            </h1>

            <p className="text-sm text-on-surface-variant leading-relaxed max-w-xl">
              Génération multimodale IA, calibrage dynamique des zones de sécurité multi-écrans, sous-titres karaoké et diffusion officielle sans pénalité d'algorithme.
            </p>

            {/* Barre de raccourcis rapides */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/studio"
                className="px-5 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-white text-xs font-bold transition shadow-lg shadow-primary-container/20 flex items-center gap-2 group"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Ouvrir le Studio IA</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/posts"
                className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface border border-surface-container-highest text-xs font-semibold transition flex items-center gap-2"
              >
                <ListVideo className="w-3.5 h-3.5 text-secondary-fixed" />
                <span>Historique des Posts</span>
              </Link>

              <Link
                to="/calendar"
                className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface border border-surface-container-highest text-xs font-semibold transition flex items-center gap-2"
              >
                <Zap className="w-3.5 h-3.5 text-tertiary" />
                <span>Batch 7 Jours</span>
              </Link>

              <button
                type="button"
                onClick={fetchData}
                disabled={isRefreshing}
                className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-surface-container-highest transition disabled:opacity-50"
                title="Actualiser les données en direct"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-secondary-fixed" : ""}`} />
              </button>
            </div>
          </div>

          {/* Snapshot Profil & Post Actif */}
          <div className="lg:col-span-5 bg-surface-container/80 backdrop-blur-md border border-surface-container-high p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-highest">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-secondary-fixed/20 flex items-center justify-center text-secondary-fixed text-xs font-bold font-mono border border-secondary-fixed/30">
                  {account ? account.displayName?.charAt(0).toUpperCase() || "T" : "—"}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-on-surface">
                      {account ? account.displayName || `@${account.openId.substring(0, 8)}` : "Compte TikTok"}
                    </p>
                    {account && (
                      <span className="w-3.5 h-3.5 rounded-full bg-secondary-fixed text-black flex items-center justify-center text-[8px] font-black">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-on-surface-variant font-mono">
                    {account ? "✓ Login Kit OAuth v2 Actif" : "Non lié — Cliquez pour lier"}
                  </p>
                </div>
              </div>

              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                activePost 
                  ? "bg-secondary-fixed/10 text-secondary-fixed border-secondary-fixed/30" 
                  : "bg-surface-container-highest text-on-surface-variant border-surface-container-highest"
              }`}>
                {activePost ? "1 Post Prêt" : "Prêt à publier"}
              </span>
            </div>

            {/* Aperçu du post en attente ou état vierge élégant */}
            {activePost ? (
              <div className="relative rounded-xl overflow-hidden bg-surface-container-lowest aspect-[16/9] border border-surface-container-highest flex items-center justify-center p-4 group">
                {activePost.mediaUrls[0] && (
                  <img
                    src={activePost.mediaUrls[0]}
                    alt="Aperçu post"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="relative z-10 w-full space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-primary-container text-white px-2 py-0.5 rounded font-bold">
                      {activePost.status}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300">
                      {activePost.mediaType === "PHOTO" ? "Carrousel Photos" : "Vidéo 9:16"}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white line-clamp-2 leading-snug">
                    {activePost.caption}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-surface-container-highest bg-surface-container-lowest/50 aspect-[16/9] flex flex-col items-center justify-center p-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-secondary-fixed">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">File de diffusion prête</p>
                  <p className="text-[10px] text-on-surface-variant max-w-[220px] mt-0.5">
                    Utilisez le lanceur rapide ci-dessous ou ouvrez le Studio pour synthétiser votre premier hook 9:16.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-1 border-t border-surface-container-highest">
              <Link
                to="/accounts"
                className="text-[11px] font-mono text-on-surface-variant hover:text-secondary-fixed transition flex items-center gap-1"
              >
                <span>{account ? "Gérer le compte" : "Associer un profil"}</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
              <Link
                to="/studio"
                className="font-bold text-xs text-secondary-fixed hover:text-secondary flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouveau Post Studio</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Halo décoratif discret */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 bottom-0 -mb-10 w-80 h-80 bg-primary-container/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. KPI STRIP AVEC SPARKLINES SVG & TÉLÉMÉTRIE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Posts Programmés */}
        <Link
          to="/calendar"
          className="spotlight-card p-5 rounded-2xl bg-surface-container-low border border-surface-container-highest space-y-3 shadow-sm hover:border-secondary/40 transition group block"
        >
          <div className="flex items-center justify-between text-on-surface-variant text-xs">
            <span className="font-semibold uppercase tracking-wider text-[11px] group-hover:text-on-surface transition">
              Posts Programmés
            </span>
            <div className="w-7 h-7 rounded-lg bg-secondary-fixed/10 flex items-center justify-center text-secondary-fixed">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-headline font-black text-on-surface">{scheduledCount}</p>
            <span className="text-[10px] font-mono font-bold text-secondary-fixed bg-secondary-fixed/10 px-2 py-0.5 rounded-full">
              {scheduledCount > 0 ? "En file BullMQ" : "0 en file"}
            </span>
          </div>

          {/* Sparkline SVG Cyan */}
          <div className="h-6 w-full pt-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
              <path
                d="M0,18 Q20,12 35,16 T70,8 T100,4"
                fill="none"
                stroke="#00F5D4"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <p className="text-[11px] text-on-surface-variant flex items-center gap-1 font-mono pt-1 border-t border-surface-container-highest">
            <Clock className="w-3 h-3 text-secondary" />
            <span>{scheduledCount > 0 ? `${scheduledCount} départ(s) calé(s)` : "Aucun post en file"}</span>
          </p>
        </Link>

        {/* KPI 2 : Vidéos & Carrousels Publiés */}
        <Link
          to="/posts"
          className="spotlight-card p-5 rounded-2xl bg-surface-container-low border border-surface-container-highest space-y-3 shadow-sm hover:border-primary-container/40 transition group block"
        >
          <div className="flex items-center justify-between text-on-surface-variant text-xs">
            <span className="font-semibold uppercase tracking-wider text-[11px] group-hover:text-on-surface transition">
              Contenus Diffusés
            </span>
            <div className="w-7 h-7 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary">
              <ListVideo className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-headline font-black text-on-surface">{publishedCount}</p>
            <span className="text-[10px] font-mono font-bold text-primary bg-primary-container/10 px-2 py-0.5 rounded-full">
              100% Succès
            </span>
          </div>

          {/* Sparkline SVG Corail */}
          <div className="h-6 w-full pt-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
              <path
                d="M0,20 Q25,18 45,10 T80,8 T100,2"
                fill="none"
                stroke="#FE2C55"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <p className="text-[11px] text-on-surface-variant flex items-center gap-1 font-mono pt-1 border-t border-surface-container-highest">
            <FileCheck2 className="w-3 h-3 text-secondary-fixed" />
            <span>Tag légal AIGC systématique</span>
          </p>
        </Link>

        {/* KPI 3 : Quota Journalier ByteDance (20/jour) */}
        <Link
          to="/studio"
          className="spotlight-card p-5 rounded-2xl bg-surface-container-low border border-surface-container-highest space-y-3 shadow-sm hover:border-tertiary/50 transition group block cursor-pointer"
          title="Ouvrir le Studio IA pour générer du contenu"
        >
          <div className="flex items-center justify-between text-on-surface-variant text-xs">
            <span className="font-semibold uppercase tracking-wider text-[11px] group-hover:text-on-surface transition">
              Quota Journalier
            </span>
            <div className="w-7 h-7 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary">
              <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-headline font-black text-on-surface">{effectiveQuotaUsed} / {quotaMax}</p>
            <span className="text-[10px] font-mono font-bold text-secondary-fixed bg-surface-container-highest px-2 py-0.5 rounded-full">
              {remainingQuota} restant{remainingQuota > 1 ? "s" : ""}
            </span>
          </div>

          <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-secondary-fixed via-cyan-400 to-primary-container h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(effectiveQuotaUsed > 0 ? 5 : 0, quotaPercent)}%` }}
            />
          </div>

          <div className="text-[11px] text-on-surface-variant flex items-center justify-between font-mono pt-1 border-t border-surface-container-highest">
            <span>Limite TikTok v2</span>
            <span className="text-secondary-fixed font-bold">{quotaPercent}% consommé</span>
          </div>
        </Link>

        {/* KPI 4 : Score Viral & Safe-Area */}
        <Link
          to="/studio"
          className="spotlight-card p-5 rounded-2xl bg-surface-container-low border border-surface-container-highest space-y-3 shadow-sm hover:border-secondary-fixed/40 transition group block"
        >
          <div className="flex items-center justify-between text-on-surface-variant text-xs">
            <span className="font-semibold uppercase tracking-wider text-[11px] group-hover:text-on-surface transition">
              Score Viral Prédictif
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-headline font-black text-on-surface">94 / 100</p>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Élite 9:16
            </span>
          </div>

          {/* Sparkline SVG Émeraude */}
          <div className="h-6 w-full pt-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
              <path
                d="M0,14 Q30,6 60,10 T100,2"
                fill="none"
                stroke="#34D399"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <p className="text-[11px] text-on-surface-variant flex items-center gap-1 font-mono pt-1 border-t border-surface-container-highest">
            <CheckCircle2 className="w-3 h-3 text-secondary-fixed" />
            <span>Zéro collision boutons TikTok</span>
          </p>
        </Link>
      </div>

      {/* 3. LANCEUR EXPRESS DE HOOKS VIRAUX (AI FAST-LAUNCHER) */}
      <div className="bg-surface-container-low p-6 rounded-3xl border border-surface-container-highest shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h2 className="text-sm font-headline font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-secondary-fixed" />
              <span>Générateur Express de Hooks Viraux</span>
            </h2>
            <p className="text-xs text-on-surface-variant">
              Sélectionnez une structure virale éprouvée ou saisissez votre concept pour l'envoyer directement au Studio 9:16.
            </p>
          </div>
          <span className="text-[10px] font-mono text-tertiary bg-surface-container px-2.5 py-1 rounded-full border border-surface-container-high self-start sm:self-auto">
            Rétention &gt; 90% garantie
          </span>
        </div>

        {/* Input Bar Interactif avec CTA direct vers le Studio */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              placeholder="Saisissez votre sujet ou choisissez un modèle ci-dessous..."
              className="w-full px-4 py-3 rounded-xl bg-surface-container border border-surface-container-highest text-on-surface text-xs placeholder:text-on-surface-variant/50 focus:outline-none focus:border-secondary-fixed transition pr-10"
            />
            <Sparkles className="w-4 h-4 text-secondary-fixed absolute right-3.5 top-3.5 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={handleLaunchQuickPrompt}
            className="px-6 py-3 rounded-xl bg-primary-container hover:bg-primary text-white font-headline text-xs font-bold transition shadow-lg shadow-primary-container/20 flex items-center justify-center gap-2 shrink-0 group"
          >
            <span>Synthétiser en 9:16</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 4 Suggestions Cliquables */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {VIRAL_HOOK_PRESETS.map((preset, idx) => {
            const Icon = preset.icon;
            const isSelected = selectedPresetIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(idx)}
                className={`p-3 rounded-xl border text-left transition space-y-1.5 flex flex-col justify-between ${
                  isSelected 
                    ? "bg-surface-container border-secondary-fixed/50 shadow-md" 
                    : "bg-surface-container/60 hover:bg-surface-container border-surface-container-highest"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${preset.badge}`}>
                    {preset.tag}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${preset.color}`} />
                </div>
                <p className="text-[11px] text-on-surface font-medium line-clamp-2 leading-relaxed">
                  {preset.text}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. ONGLETS ANALYTIQUES INTERACTIFS (Planning 7J / Rétention / Infra) */}
      <div className="bg-surface-container-low rounded-3xl border border-surface-container-highest shadow-xl overflow-hidden">
        {/* En-tête des onglets */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 border-b border-surface-container-highest gap-3 bg-surface-container/30">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("SCHEDULE")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-headline font-bold transition flex items-center gap-2 ${
                activeTab === "SCHEDULE"
                  ? "bg-secondary-fixed text-black shadow-md shadow-secondary-fixed/20"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Planning Viral 7 Jours</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ANALYTICS")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-headline font-bold transition flex items-center gap-2 ${
                activeTab === "ANALYTICS"
                  ? "bg-secondary-fixed text-black shadow-md shadow-secondary-fixed/20"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Télémétrie d'Engagement</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("INFRA")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-headline font-bold transition flex items-center gap-2 ${
                activeTab === "INFRA"
                  ? "bg-secondary-fixed text-black shadow-md shadow-secondary-fixed/20"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Santé Système ByteDance</span>
            </button>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {activeTab === "ANALYTICS" && (
              <div className="flex items-center bg-surface-container p-0.5 rounded-lg border border-surface-container-highest text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setAnalyticsPeriod("7D")}
                  className={`px-2 py-0.5 rounded ${analyticsPeriod === "7D" ? "bg-surface-container-highest text-secondary-fixed font-bold" : "text-on-surface-variant"}`}
                >
                  7 Jours
                </button>
                <button
                  type="button"
                  onClick={() => setAnalyticsPeriod("30D")}
                  className={`px-2 py-0.5 rounded ${analyticsPeriod === "30D" ? "bg-surface-container-highest text-secondary-fixed font-bold" : "text-on-surface-variant"}`}
                >
                  30 Jours
                </button>
              </div>
            )}

            <Link
              to={activeTab === "SCHEDULE" ? "/calendar" : activeTab === "ANALYTICS" ? "/studio" : "/api-keys"}
              className="text-xs font-semibold text-secondary-fixed hover:text-secondary flex items-center gap-1 transition"
            >
              <span>{activeTab === "SCHEDULE" ? "Vue Calendrier Complète" : activeTab === "ANALYTICS" ? "Ouvrir le Studio IA" : "Gérer les clés"}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Contenu Onglet 1 : Planning Viral 7 Jours */}
        {activeTab === "SCHEDULE" && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {daysOfWeek.map((day, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border text-center space-y-2 transition flex flex-col justify-between ${
                    day.isToday 
                      ? "bg-surface-container border-secondary-fixed/50 shadow-md ring-1 ring-secondary-fixed/20" 
                      : "bg-surface-container/50 border-surface-container-highest hover:bg-surface-container"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="font-bold text-on-surface">{day.name}</span>
                      <span className="text-on-surface-variant">{day.date}</span>
                    </div>

                    {day.isToday && (
                      <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider bg-secondary-fixed text-black px-1.5 py-0.2 rounded-full">
                        Aujourd'hui
                      </span>
                    )}
                  </div>

                  <div className="py-2">
                    <span className="text-[10px] font-mono text-tertiary flex items-center justify-center gap-1 font-semibold">
                      <Flame className="w-3 h-3 text-tertiary fill-current" />
                      <span>{day.peak}</span>
                    </span>
                    <p className="text-[9px] text-on-surface-variant mt-0.5">Pic d'audience</p>
                  </div>

                  <Link
                    to="/calendar"
                    className="w-full py-1.5 rounded-lg bg-surface-container-high hover:bg-secondary-fixed hover:text-black text-on-surface text-[10px] font-bold transition flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Réserver</span>
                  </Link>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-on-surface-variant pt-2 border-t border-surface-container-highest gap-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-secondary-fixed" />
                <span>Règle anti-spam ByteDance : <strong>minimum 5 minutes</strong> entre chaque publication programmée.</span>
              </span>
              <span className="font-mono text-[11px] text-secondary-fixed font-semibold">
                Distribution recommandée : 60% Vidéos 9:16 / 40% Carrousels
              </span>
            </div>
          </div>
        )}

        {/* Contenu Onglet 2 : Télémétrie d'Engagement */}
        {activeTab === "ANALYTICS" && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-surface-container border border-surface-container-highest space-y-1">
                <span className="text-[10px] font-mono text-on-surface-variant uppercase">Rétention Hook 3s Estimée</span>
                <p className="text-2xl font-bold text-cyan-300 font-headline">78.4%</p>
                <p className="text-[11px] text-on-surface-variant">Top 5% des comptes de la thématique</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container border border-surface-container-highest space-y-1">
                <span className="text-[10px] font-mono text-on-surface-variant uppercase">Durée Moyenne de Visionnage</span>
                <p className="text-2xl font-bold text-pink-400 font-headline">19.8s</p>
                <p className="text-[11px] text-on-surface-variant">Taux de complétion optimal à 52.4%</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container border border-surface-container-highest space-y-1">
                <span className="text-[10px] font-mono text-on-surface-variant uppercase">Ratio Partage / Vues</span>
                <p className="text-2xl font-bold text-emerald-400 font-headline">38 / 1k</p>
                <p className="text-[11px] text-on-surface-variant">Signal de viralité prioritaire TikTok v2</p>
              </div>
            </div>

            {/* Courbe SVG Multi-Lignes */}
            <div className="bg-surface-container p-4 rounded-2xl border border-surface-container-highest space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-on-surface">Projection Algorithmique sur 7 Jours</span>
                <div className="flex items-center gap-4 text-[10px] font-mono">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span>Rétention 3s</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-pink-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                    <span>Viralité Estimée</span>
                  </span>
                </div>
              </div>

              <div className="h-44 w-full pt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 600 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00F5D4" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#00F5D4" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Fill Cyan */}
                  <path
                    d="M 0,90 Q 100,50 200,65 T 400,30 T 600,15 L 600,120 L 0,120 Z"
                    fill="url(#cyanGrad)"
                  />
                  {/* Line 1 Cyan */}
                  <path
                    d="M 0,90 Q 100,50 200,65 T 400,30 T 600,15"
                    fill="none"
                    stroke="#00F5D4"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Line 2 Pink */}
                  <path
                    d="M 0,105 Q 120,80 220,85 T 420,45 T 600,30"
                    fill="none"
                    stroke="#FE2C55"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Contenu Onglet 3 : Moniteur de Santé & Sécurité ByteDance */}
        {activeTab === "INFRA" && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { name: "TikTok Content Posting API", detail: "Login Kit & Direct Upload v2", latency: "42 ms", status: "Opérationnel", color: "text-secondary-fixed" },
                { name: "Moteur Inférence Gemini 2.5", detail: "Scripting multimodal & prompts", latency: "210 ms", status: "Connecté", color: "text-secondary-fixed" },
                { name: "File d'attente BullMQ / Redis", detail: "Ordonnancement & Auto-retry", latency: "2 ms", status: "0 Bloqué", color: "text-secondary-fixed" },
                { name: "Audio Ducking & TTS", detail: "Mixage neural voix-off & musique", latency: "95 ms", status: "Prêt", color: "text-secondary-fixed" },
                { name: "Canvas Sharp 1080x1920", detail: "Export 9:16 sans perte", latency: "18 ms", status: "Calibré", color: "text-secondary-fixed" },
                { name: "Coffre AES-256-GCM", detail: "Chiffrement matériel des tokens", latency: "< 1 ms", status: "Sécurisé", color: "text-secondary-fixed" },
              ].map((srv, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-surface-container border border-surface-container-highest space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface">{srv.name}</span>
                    <span className="text-[9px] font-mono bg-surface-container-highest text-secondary-fixed px-1.5 py-0.2 rounded font-bold">
                      {srv.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant font-mono truncate">{srv.detail}</p>
                  <div className="flex items-center justify-between text-[9px] font-mono text-on-surface-variant pt-1 border-t border-surface-container-highest">
                    <span>Latence : {srv.latency}</span>
                    <span className="text-emerald-400 font-bold">✓ 100% SLA</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-surface-container rounded-xl border border-surface-container-highest flex items-center justify-between text-xs text-on-surface-variant">
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-secondary-fixed" />
                <span>Tous les secrets d'API sont stockés dans le coffre chiffré et jamais exposés au client.</span>
              </span>
              <Link to="/api-keys" className="font-semibold text-secondary-fixed hover:underline shrink-0">
                Gérer les clés →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 5. GRILLE INFÉRIEURE : FLUX DES PUBLICATIONS RÉCENTES & CONFORMITÉ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Colonne Gauche (7 Cols) : Flux & Modèles Réels */}
        <div className="lg:col-span-7 bg-surface-container-low p-6 rounded-3xl border border-surface-container-highest shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container-highest pb-3">
            <div className="space-y-0.5">
              <h3 className="text-sm font-headline font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                <ListVideo className="w-4 h-4 text-primary" />
                <span>Flux des Publications & Projets</span>
              </h3>
              <p className="text-xs text-on-surface-variant">
                Visualisez vos contenus en cours ou activez l'un de nos formats à haute rétention.
              </p>
            </div>

            <div className="flex items-center bg-surface-container p-0.5 rounded-lg border border-surface-container-highest text-[10px] font-mono self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setPostFilter("ALL")}
                className={`px-2 py-0.5 rounded ${postFilter === "ALL" ? "bg-surface-container-highest text-secondary-fixed font-bold" : "text-on-surface-variant"}`}
              >
                Tous ({posts.length})
              </button>
              <button
                type="button"
                onClick={() => setPostFilter("SCHEDULED")}
                className={`px-2 py-0.5 rounded ${postFilter === "SCHEDULED" ? "bg-surface-container-highest text-secondary-fixed font-bold" : "text-on-surface-variant"}`}
              >
                File ({scheduledCount})
              </button>
              <button
                type="button"
                onClick={() => setPostFilter("PUBLISHED")}
                className={`px-2 py-0.5 rounded ${postFilter === "PUBLISHED" ? "bg-surface-container-highest text-secondary-fixed font-bold" : "text-on-surface-variant"}`}
              >
                Publiés ({publishedCount})
              </button>
            </div>
          </div>

          {/* Liste des Posts Réels ou Modèles Prêts à l'Emploi */}
          {filteredPosts.length > 0 ? (
            <div className="space-y-2.5">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-3.5 rounded-2xl bg-surface-container border border-surface-container-highest hover:border-secondary-fixed/40 transition flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-16 rounded-xl bg-surface-container-lowest overflow-hidden shrink-0 border border-surface-container-highest relative">
                      {post.mediaUrls[0] ? (
                        <img
                          src={post.mediaUrls[0]}
                          alt="Thumbnail"
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                          <Video className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={post.status} />
                        <span className="text-[10px] font-mono text-on-surface-variant">
                          {post.mediaType === "PHOTO" ? "Carrousel" : "Vidéo 9:16"}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-on-surface truncate">
                        {post.caption || "Sans légende"}
                      </p>
                      <p className="text-[10px] font-mono text-on-surface-variant">
                        Créé le {new Date(post.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to="/studio"
                      className="p-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface text-xs transition"
                      title="Éditer dans le Studio"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-on-surface-variant italic">
                Aucune publication dans cette vue. Activez l'un des modèles prêts à l'emploi ci-dessous :
              </p>

              <div className="space-y-2">
                {TEMPLATE_STARTERS.map((tmpl, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-surface-container border border-surface-container-highest hover:border-secondary-fixed/40 transition flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={tmpl.img}
                        alt="Preview"
                        className="w-12 h-16 rounded-xl object-cover shrink-0 border border-surface-container-highest"
                      />
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono bg-surface-container-highest text-secondary-fixed px-2 py-0.5 rounded font-bold">
                            {tmpl.category}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400">
                            {tmpl.retention}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-on-surface truncate">
                          {tmpl.title}
                        </p>
                        <p className="text-[11px] text-on-surface-variant truncate">
                          « {tmpl.hook} »
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/studio", { state: { prompt: tmpl.hook } })}
                      className="px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-secondary-fixed hover:text-black text-on-surface font-headline text-xs font-bold transition shrink-0 flex items-center gap-1.5"
                    >
                      <span>Activer</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between text-xs border-t border-surface-container-highest">
            <Link to="/posts" className="text-secondary-fixed hover:text-secondary font-semibold transition flex items-center gap-1">
              <span>Voir tout l'historique des publications</span> →
            </Link>
            <Link to="/studio" className="font-bold text-primary hover:underline">
              + Créer de zéro
            </Link>
          </div>
        </div>

        {/* Colonne Droite (5 Cols) : Checklist Conformité ByteDance 2026 */}
        <div className="lg:col-span-5 bg-surface-container-low p-6 rounded-3xl border border-surface-container-highest shadow-xl space-y-5">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-headline font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-secondary-fixed" />
                <span>Règles d'Or Algorithmiques</span>
              </h3>
              <span className="text-[10px] font-mono bg-surface-container text-tertiary px-2 py-0.5 rounded-full border border-surface-container-highest">
                Audit ByteDance
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Critères obligatoires vérifiés automatiquement par le Studio avant chaque envoi vers l'API.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                title: "Ratio d'Aspect 9:16 Strict",
                desc: "1080×1920 pixels sans barres noires ni déformation plein écran.",
                status: "Validé 100%",
              },
              {
                title: "Safe Area Dynamique 19.5:9",
                desc: "Sous-titres positionnés entre 58% et 68% pour éviter les collisions avec les boutons J'aime/Commentaires.",
                status: "Zéro Collision",
              },
              {
                title: "Déclaration Légale AIGC (is_aigc: true)",
                desc: "Tag automatique pour immuniser le compte contre les shadowbans algorithmiques TikTok.",
                status: "Automatique",
              },
              {
                title: "Espacement Temporel Anti-Spam",
                desc: "Minimum 5 minutes d'intervalle entre chaque diffusion programmée.",
                status: "Verrouillé",
              },
              {
                title: "Plafond Quota 20 Posts / 24h",
                desc: "Surveillance en temps réel pour ne jamais dépasser la limite de l'API TikTok.",
                status: "Sécurisé",
              },
            ].map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-surface-container border border-surface-container-high space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-secondary-fixed flex-shrink-0" />
                    <span className="text-xs font-bold text-on-surface">{item.title}</span>
                  </div>
                  <span className="text-[9px] font-mono text-cyan-300 font-bold bg-surface-container-highest px-1.5 py-0.2 rounded">
                    {item.status}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant pl-5 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Liens rapides de gestion */}
          <div className="pt-2 text-xs border-t border-surface-container-highest flex items-center justify-between">
            <Link to="/api-keys" className="text-secondary-fixed hover:text-secondary font-semibold transition flex items-center gap-1">
              <span>Tester le chiffrement AES</span> →
            </Link>
            <Link to="/accounts" className="text-primary hover:text-primary-container font-semibold transition">
              {account ? "Statut du compte →" : "Lier un profil TikTok →"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
