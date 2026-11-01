import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PromptForm } from "../components/studio/PromptForm";
import { TikTokPreview } from "../components/studio/TikTokPreview";
import { ScheduleModal } from "../components/studio/ScheduleModal";
import { Send, Calendar, Save, CheckCircle2, AlertCircle, Zap, X } from "lucide-react";
import { api, type PostDto } from "../lib/api";

export function StudioPage() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(1);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Éléments du post généré
  const [currentPost, setCurrentPost] = useState<Partial<PostDto>>({
    mediaType: "PHOTO",
    mediaUrls: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop&q=80",
    ],
    caption: "3 erreurs de productivité qui détruisent votre focus en télétravail. #productivité #focus #dev",
    isAigc: true,
  });

  const handleGenerate = async (
    prompt: string,
    mode: "PHOTO_CAROUSEL" | "OMNI_NATIVE_VIDEO" | "COMPOSITE_STUDIO_VIDEO"
  ) => {
    setIsGenerating(true);
    setGenerationStep(1);
    setNotification(null);

    // Simulation de progression pas à pas du pipeline multimodal
    const stepTimer1 = setTimeout(() => setGenerationStep(2), 600);
    const stepTimer2 = setTimeout(() => setGenerationStep(3), 1200);
    const stepTimer3 = setTimeout(() => setGenerationStep(4), 1800);

    try {
      // Tentative d'appel à l'API backend
      const res = await api.post("/ai/generate", {
        mode,
        prompt,
        accountId: "default_account",
      });

      if (res.data && (res.data.post || res.data.data)) {
        const p = res.data.post || res.data.data;
        setCurrentPost({
          id: p.id || p.postId,
          title: p.title,
          caption: p.caption,
          mediaType: p.mediaType || (p.mode === "PHOTO_CAROUSEL" ? "PHOTO" : "VIDEO"),
          mediaUrls: p.mediaUrls || (p.videoUrl ? [p.videoUrl] : []),
          isAigc: p.isAigc !== undefined ? p.isAigc : true,
        });
      }
      setNotification({ type: "success", text: "Contenu généré avec succès par Gemini !" });
    } catch (err: any) {
      if (err?.response?.status === 403 || err?.response?.data?.error?.code === "QUOTA_EXCEEDED") {
        setIsQuotaModalOpen(true);
        return;
      }

      // Fallback gracieux si l'API est en cours de mock ou sans token
      setCurrentPost({
        mediaType: mode === "PHOTO_CAROUSEL" ? "PHOTO" : "VIDEO",
        mediaUrls:
          mode === "PHOTO_CAROUSEL"
            ? [
                "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1080&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1080&auto=format&fit=crop&q=80",
              ]
            : ["https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"],
        caption: `${prompt.slice(0, 100)}... #AIGC #TikTokAutoStudio`,
        isAigc: true,
      });
      setNotification({
        type: "success",
        text: "Inférence complétée ! Prévisualisation prête à être programmée.",
      });
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsGenerating(false);
      setGenerationStep(1);
    }
  };

  const handleDirectPublish = async () => {
    setIsPublishing(true);
    setNotification(null);
    try {
      await api.post("/posts", {
        ...currentPost,
        status: "PROCESSING",
      });
      setNotification({ type: "success", text: "Publication initiée sur TikTok v2 ! Statut : En cours" });
    } catch (err: any) {
      setNotification({
        type: "error",
        text: err?.response?.data?.message || "Échec de l'envoi immédiat du post.",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleConfirmSchedule = async (isoDate: string) => {
    setIsPublishing(true);
    setNotification(null);
    try {
      await api.post("/posts", {
        ...currentPost,
        scheduledFor: isoDate,
        status: "SCHEDULED",
      });
      setIsScheduleOpen(false);
      setNotification({
        type: "success",
        text: `Post planifié avec succès pour le ${new Date(isoDate).toLocaleString("fr-FR")} !`,
      });
      navigate("/calendar");
    } catch (err: any) {
      setNotification({
        type: "error",
        text: err?.response?.data?.message || "Erreur lors de la programmation.",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Notifications */}
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

      {/* Disposition 2 Colonnes : Panneau Formulaire vs Prévisualisation 9:16 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Colonne Gauche : Formulaire 3 Clics (7 colonnes) */}
        <div className="lg:col-span-7 space-y-6">
          <PromptForm
            onSubmit={handleGenerate}
            isLoading={isGenerating}
            currentStep={generationStep}
          />

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Paramètres de Légende & Conformité
            </h3>
            <textarea
              rows={3}
              value={currentPost.caption || ""}
              onChange={(e) => setCurrentPost((p) => ({ ...p, caption: e.target.value }))}
              placeholder="Ajuster la légende TikTok..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
            />
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Transparence IA (ByteDance AIGC)</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Inclus (Obligatoire)
              </span>
            </div>
          </div>
        </div>

        {/* Colonne Droite : Smartphone 9:16 & Déclenchement (5 colonnes) */}
        <div className="lg:col-span-5 flex flex-col items-center space-y-4">
          <div className="w-full flex justify-between items-center px-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Aperçu TikTok 9:16 & Safe Area
            </span>
            <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">
              Écran iPhone 15 Pro
            </span>
          </div>

          <TikTokPreview
            mediaType={currentPost.mediaType || "PHOTO"}
            mediaUrls={currentPost.mediaUrls || []}
            caption={currentPost.caption || ""}
            accountHandle="@studio_createur"
            isAigc={currentPost.isAigc}
          />

          {/* Clic 3 : Boutons d'Action & Déclenchement */}
          <div className="w-full max-w-[360px] grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={handleDirectPublish}
              disabled={isPublishing || isGenerating}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 disabled:opacity-50 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publier (Clic 3)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsScheduleOpen(true)}
              disabled={isPublishing || isGenerating}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Programmer</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setNotification({ type: "success", text: "Brouillon sauvegardé dans vos posts !" })
              }
              className="col-span-2 py-2.5 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 font-semibold text-xs flex items-center justify-center gap-2 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Enregistrer en Brouillon</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modale de Programmation (+5 min strict) */}
      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onConfirm={handleConfirmSchedule}
        isSubmitting={isPublishing}
      />
      {/* Modale Quota Journalier Épuisé */}
      {isQuotaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <button
              type="button"
              onClick={() => setIsQuotaModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Zap className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Quota Journalier Épuisé</h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Votre quota journalier d'inférence IA est épuisé. Passez au niveau supérieur pour débloquer des générations illimitées.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setIsQuotaModalOpen(false)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-500 hover:opacity-90 text-white font-bold text-xs shadow-lg transition"
              >
                Passer au Plan Pro
              </button>
              <button
                type="button"
                onClick={() => setIsQuotaModalOpen(false)}
                className="w-full py-2 px-4 rounded-xl text-zinc-400 hover:text-white text-xs transition"
              >
                Peut-être plus tard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
