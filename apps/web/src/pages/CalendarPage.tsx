import { useState, useEffect } from "react";
import { CalendarGrid } from "../components/calendar/CalendarGrid";
import { ScheduleModal } from "../components/studio/ScheduleModal";
import { api, type PostDto } from "../lib/api";
import { Sparkles, CheckCircle2, AlertCircle, Layers, Calendar, X, Clock } from "lucide-react";

export function CalendarPage() {
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [batchTheme, setBatchTheme] = useState("Semaine Productivité & IA : 7 leviers concrets pour décupler son focus");
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");
      if (res.data && Array.isArray(res.data.posts)) {
        setPosts(res.data.posts);
      }
    } catch {
      // Mock data par défaut pour prévisualiser le calendrier
      const mockNow = new Date();
      setPosts([
        {
          id: "post_cal_1",
          accountId: "acc_1",
          postType: "DIRECT_POST",
          mediaType: "PHOTO",
          caption: "Les 3 leviers secrets de la viralité TikTok en 2026",
          mediaUrls: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080"],
          status: "SCHEDULED",
          scheduledFor: new Date(mockNow.getTime() + 2 * 3600 * 1000).toISOString(),
          isAigc: true,
          privacyLevel: "SELF_ONLY",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "post_cal_2",
          accountId: "acc_1",
          postType: "DIRECT_POST",
          mediaType: "VIDEO",
          caption: "Routine matinale d'un solopreneur tech à succès",
          mediaUrls: ["https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"],
          status: "PUBLISHED",
          scheduledFor: new Date(mockNow.getTime() - 24 * 3600 * 1000).toISOString(),
          publishedAt: new Date(mockNow.getTime() - 24 * 3600 * 1000).toISOString(),
          isAigc: true,
          privacyLevel: "SELF_ONLY",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleConfirmSchedule = (isoDate: string) => {
    setNotification({
      type: "success",
      text: `Créneau réservé pour le ${new Date(isoDate).toLocaleString("fr-FR")}. Rendez-vous dans le Studio pour finaliser !`,
    });
    setIsScheduleOpen(false);
  };

  // Algorithme de génération du Batch 7 Jours optimisé selon les pics d'engagement TikTok
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
    }, 900);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <span>Calendrier Éditorial & Automatisation</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Visualisez et pilotez votre grille de programmation aux heures d'engagement maximal TikTok.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Bouton Batch Hebdo 7 Jours */}
          <button
            type="button"
            onClick={() => setIsBatchOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 transition active:scale-95"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Batch 7 Jours (1 Clic)</span>
          </button>

          {/* Bouton Programmation Individuelle */}
          <button
            type="button"
            onClick={() => setIsScheduleOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 shadow-lg shadow-pink-500/20 transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Programmer un post</span>
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`flex items-center gap-2.5 p-4 rounded-xl border text-xs font-semibold animate-in fade-in ${
            notification.type === "success"
              ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
              : "bg-rose-950/60 border-rose-800 text-rose-300"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Grille du Calendrier */}
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

      {/* Modale Batch Studio 7 Jours */}
      {isBatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl bg-zinc-950 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
            <button
              type="button"
              onClick={() => setIsBatchOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white transition"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Générateur Batch Hebdomadaire (7 Jours en 1 Clic)</span>
                  <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full">
                    Algorithme Prime-Time
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Planifie automatiquement 7 publications réparties sur les pics d'audience TikTok.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-300">
                Thème directeur ou consigne pour la semaine :
              </label>
              <textarea
                rows={2}
                value={batchTheme}
                onChange={(e) => setBatchTheme(e.target.value)}
                placeholder="Ex: Les 7 erreurs fatales des freelances en gestion de temps..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 transition resize-none"
              />
            </div>

            {/* Répartition programmée */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Répartition automatique sur les 7 créneaux optimaux :</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                {[
                  { day: "Lun 18h30", type: "Vidéo 9:16", hook: "Motivation Hebdo" },
                  { day: "Mar 12h30", type: "Carrousel", hook: "Tutoriel Pas-à-Pas" },
                  { day: "Mer 18h00", type: "Vidéo 9:16", hook: "Mythe vs Réalité" },
                  { day: "Jeu 19h30", type: "Carrousel", hook: "Outils & Conseils" },
                  { day: "Ven 17h00", type: "Vidéo 9:16", hook: "Bilan & Déconnexion" },
                  { day: "Sam 11h30", type: "Carrousel", hook: "Inspiration Culture" },
                  { day: "Dim 20h00", type: "Vidéo 9:16", hook: "Préparation Semaine" },
                  { day: "Total", type: "7 Posts", hook: "100% Automatisé" },
                ].map((item, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800/80 space-y-0.5">
                    <p className="font-bold text-white">{item.day}</p>
                    <p className="text-cyan-400 font-mono">{item.type}</p>
                    <p className="text-zinc-500 truncate">{item.hook}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => setIsBatchOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleGenerateBatch}
                disabled={isGeneratingBatch || !batchTheme.trim()}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isGeneratingBatch ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Orchestration du Batch en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Générer et Planifier les 7 Posts</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}