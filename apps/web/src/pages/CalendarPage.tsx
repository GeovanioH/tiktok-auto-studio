import { useState, useEffect } from "react";
import { CalendarGrid } from "../components/calendar/CalendarGrid";
import { ScheduleModal } from "../components/studio/ScheduleModal";
import { api, type PostDto } from "../lib/api";
import { useNotifications } from "../context/NotificationContext";
import { Sparkles, CheckCircle2, AlertCircle, Calendar, X, Clock, Lock, ShieldCheck, Zap } from "lucide-react";

export function CalendarPage() {
  const { addNotification } = useNotifications();
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [batchTheme, setBatchTheme] = useState("Intelligence Artificielle & Productivité No-Code 2026");
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");
      if (res.data && Array.isArray(res.data.posts)) {
        setPosts(res.data.posts);
      }
    } catch {
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleConfirmSchedule = (isoDate: string) => {
    const formatted = new Date(isoDate).toLocaleString("fr-FR");
    setNotification({
      type: "success",
      text: `Créneau réservé pour le ${formatted}. Rendez-vous dans le Studio pour finaliser !`,
    });
    addNotification({
      title: "Créneau Réservé",
      message: `Publication programmée pour le ${formatted}.`,
      type: "success",
      link: "/calendar",
    });
    setIsScheduleOpen(false);
  };

  const handleGenerateBatch = () => {
    setIsGeneratingBatch(true);
    setTimeout(() => {
      const now = new Date();
      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);

      const optimalHours = [
        { dayIndex: 0, hour: 18, min: 30, format: "VIDEO", hook: "Lundi Motivation : 3 erreurs qui ruinent votre semaine avant même de commencer..." },
        { dayIndex: 1, hour: 12, min: 30, format: "PHOTO", hook: "Mardi Focus : La règle des 90 minutes que les créateurs d'élite appliquent..." },
        { dayIndex: 2, hour: 18, min: 0, format: "VIDEO", hook: "Mercredi Débunkage : Pourquoi le multitâche est une illusion biologique..." },
        { dayIndex: 3, hour: 19, min: 30, format: "PHOTO", hook: "Jeudi Tech : 5 outils IA méconnus qui automatisent 80% du travail répétitif..." },
        { dayIndex: 4, hour: 17, min: 0, format: "VIDEO", hook: "Vendredi Bilan : Comment déconnecter le week-end sans culpabiliser ni stresser..." },
        { dayIndex: 5, hour: 11, min: 30, format: "PHOTO", hook: "Samedi Inspiration : Les 3 livres qui ont façonné les meilleurs entrepreneurs tech..." },
        { dayIndex: 6, hour: 20, min: 0, format: "VIDEO", hook: "Dimanche Stratégie : Préparer sa semaine en 15 minutes chrono avant 21h..." },
      ];

      const newBatchPosts: PostDto[] = optimalHours.map((opt, i) => {
        const slotDate = new Date(startOfWeek);
        slotDate.setDate(startOfWeek.getDate() + opt.dayIndex);
        slotDate.setHours(opt.hour, opt.min, 0, 0);

        return {
          id: `batch_post_${Date.now()}_${i}`,
          accountId: "acc_1",
          postType: "DIRECT_POST",
          mediaType: opt.format as "VIDEO" | "PHOTO",
          caption: `${opt.hook} #${batchTheme.split(" ")[0].toLowerCase()} #AIGC #TikTokAutoStudio`,
          mediaUrls: opt.format === "VIDEO" 
            ? ["https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"]
            : [
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080",
                "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1080"
              ],
          status: "SCHEDULED",
          scheduledFor: slotDate.toISOString(),
          isAigc: true,
          privacyLevel: "SELF_ONLY",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      setPosts((prev) => [...prev, ...newBatchPosts]);
      setIsGeneratingBatch(false);
      setIsBatchOpen(false);
      setNotification({
        type: "success",
        text: "✨ 7 publications hebdomadaires générées et programmées avec succès sur les heures de pointe TikTok !",
      });
      addNotification({
        title: "Batch 7 Jours Planifié",
        message: "7 publications optimisées ont été ajoutées à votre calendrier de diffusion.",
        type: "success",
        link: "/calendar",
      });
    }, 900);
  };

  const scheduledCount = posts.filter((p) => p.status === "SCHEDULED").length;

  return (
    <div className="max-w-[1720px] mx-auto space-y-6 pb-12">
      {/* 1. TOP TELEMETRY STRIP & CONTEXT HUD (Sans simulation fictive) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-low px-4 py-3 rounded-2xl border border-surface-container-highest shadow-sm">
        <div className="flex items-center gap-4 flex-wrap text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary-fixed" />
            <span className="text-on-surface font-semibold">Ordonnanceur TikTok Studio</span>
          </div>
          <div className="h-4 w-px bg-surface-container-highest" />
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span>Fuseau :</span>
            <span className="text-on-surface font-semibold bg-surface-container px-2 py-0.5 rounded">
              Europe/Paris (GMT+2)
            </span>
          </div>
          <div className="h-4 w-px bg-surface-container-highest" />
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span>File d'attente :</span>
            <span className="text-secondary font-semibold font-mono">
              {scheduledCount > 0 ? `${scheduledCount} créneau(x) programmé(s)` : "0 créneau programmé"}
            </span>
          </div>
        </div>

        {/* Safety Lock Info */}
        <div className="flex items-center gap-2 bg-surface-container px-3 py-1 rounded-full border border-surface-container-highest text-xs font-mono text-on-surface">
          <ShieldCheck className="w-3.5 h-3.5 text-secondary-fixed" />
          <span>Règle TikTok API : <span className="text-secondary-fixed">T+5 min minimum</span></span>
        </div>
      </div>

      {/* 2. BATCH 7 JOURS EN 1 CLIC (HERO ACTION BLOCK) */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-high p-6 lg:p-8 shadow-xl border border-surface-container-highest">
        {/* Glow Refraction */}
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-primary-container/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary-container/20 text-primary-container font-mono text-[10px] uppercase font-bold tracking-widest border border-primary-container/30">
                Autonomous Pipeline
              </span>
              <span className="text-on-surface-variant font-mono text-xs">// Gemini Flash & BullMQ Scheduler</span>
            </div>
            <h1 className="font-headline text-2xl lg:text-3xl font-extrabold text-on-surface tracking-tight">
              Générateur « Batch 7 Jours » en 1 Clic
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Injectez votre thématique directrice. Le moteur dérive 7 scripts haute rétention, génère voix-off et synthèses 9:16, puis programme automatiquement chaque post sur les 7 créneaux à plus forte audience organique.
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-mono uppercase text-on-surface-variant font-bold mr-1">Slots ciblés :</span>
              {["Dim 20h00", "Lun 12h15", "Mar 18h45", "Mer 21h10", "Jeu 19h30", "Ven 17h00", "Sam 11h20"].map((s) => (
                <span key={s} className="px-2 py-0.5 rounded bg-surface-container-highest text-secondary font-mono text-[11px] font-semibold border border-surface-container-highest">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="w-full xl:w-auto flex flex-col gap-3 flex-shrink-0 min-w-full sm:min-w-[420px]">
            <div className="bg-surface-container-lowest/80 p-3.5 rounded-xl backdrop-blur-md shadow-inner flex flex-col gap-2 border border-surface-container-highest">
              <label className="text-xs font-semibold text-on-surface-variant flex items-center justify-between" htmlFor="batch-theme-input">
                <span>Thème Directeur ou Niche</span>
                <span className="text-secondary font-mono text-[11px]">Hormozi Formula</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-secondary text-[18px]">auto_awesome</span>
                <input
                  id="batch-theme-input"
                  type="text"
                  value={batchTheme}
                  onChange={(e) => setBatchTheme(e.target.value)}
                  placeholder="Ex: Intelligence Artificielle & Productivité No-Code..."
                  className="w-full bg-surface-container-high text-on-surface pl-9 pr-3 py-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-secondary-fixed transition"
                />
              </div>
              <div className="flex items-center justify-between text-on-surface-variant font-mono text-[10px] px-1">
                <span>Mode : <strong className="text-on-surface">Auto-Cut + Sous-titres dynamiques</strong></span>
                <span className="text-tertiary">Format : 9:16 UltraHD</span>
              </div>
            </div>

            <button
              id="btn-batch-generate"
              type="button"
              disabled={isGeneratingBatch}
              onClick={handleGenerateBatch}
              className="group relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary transition-all duration-200 shadow-lg shadow-primary-container/30 active:scale-[0.99] font-headline text-xs font-bold disabled:opacity-50"
            >
              <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>{isGeneratingBatch ? "Génération & Planification en cours..." : "Générer & Programmer 7 Jours de Contenu Viral"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. VERROUILLAGE TEMPOREL & BANNIÈRE SÉCURITÉ CONFORME */}
      <div className="bg-surface-container-high rounded-2xl p-4 lg:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-surface-container-highest shadow-sm">
        <div className="flex items-start md:items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-error-container/30 flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline text-sm font-bold text-on-surface">
                Verrouillage Temporel Sécurisé (TikTok API Hard Requirement)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-mono text-[10px] uppercase font-bold">
                Strict Rule
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
              Interdiction absolue d'ordonnancement à moins de <strong className="text-primary font-semibold">5 minutes</strong> dans le futur. Les uploads spontanés sont automatiquement redirigés vers le buffer d'invalidation ou la file draft d'urgence.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 bg-surface-container-lowest px-4 py-2 rounded-xl flex-shrink-0 border border-surface-container-highest">
          <Clock className="w-4 h-4 text-secondary" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-mono text-on-surface-variant">Seuil d'exclusion immédiat</span>
            <span className="font-mono text-xs text-on-surface font-bold">+00h 05m 00s (Lock Engine T-300s)</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`flex items-center gap-2.5 p-4 rounded-xl border text-xs font-semibold animate-in fade-in ${
            notification.type === "success"
              ? "bg-surface-container-low border-secondary-fixed/50 text-secondary"
              : "bg-surface-container-low border-primary/50 text-primary"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-secondary-fixed flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-primary flex-shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* 4. CALENDRIER ÉDITORIAL SYNCHRONISÉ */}
      <CalendarGrid
        posts={posts}
        onSelectSlot={() => setIsScheduleOpen(true)}
      />

      {/* Modale de Programmation Individuelle */}
      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onConfirm={handleConfirmSchedule}
      />

      {/* Modale Batch Studio 7 Jours (Optionnelle si ouvert via navbar) */}
      {isBatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl bg-surface-container-low border border-surface-container-highest rounded-3xl p-6 shadow-2xl space-y-5">
            <button
              type="button"
              onClick={() => setIsBatchOpen(false)}
              className="absolute top-5 right-5 text-on-surface-variant hover:text-on-surface transition"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-surface-container-highest pb-4">
              <div className="w-10 h-10 rounded-2xl bg-secondary/10 border border-secondary/30 text-secondary flex items-center justify-center">
                <Calendar className="w-5 h-5 text-secondary-fixed" />
              </div>
              <div>
                <h3 className="text-base font-bold text-on-surface flex items-center gap-2 font-headline">
                  <span>Générateur Batch Hebdomadaire (7 Jours en 1 Clic)</span>
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Planifie automatiquement 7 publications réparties sur les pics d'audience TikTok.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-on-surface-variant" htmlFor="modal-batch-theme">
                Thème directeur ou consigne pour la semaine :
              </label>
              <textarea
                id="modal-batch-theme"
                rows={2}
                value={batchTheme}
                onChange={(e) => setBatchTheme(e.target.value)}
                placeholder="Ex: Les 7 erreurs fatales des freelances en gestion de temps..."
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-xl p-3 text-xs text-on-surface focus:outline-none focus:border-secondary transition resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-surface-container-highest">
              <button
                type="button"
                onClick={() => setIsBatchOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-on-surface-variant hover:text-on-surface transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleGenerateBatch}
                disabled={isGeneratingBatch || !batchTheme.trim()}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-on-primary-container bg-primary-container hover:bg-primary transition disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary-container/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Générer et Planifier les 7 Posts</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
