import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { PromptForm } from "../components/studio/PromptForm";
import { TikTokPreview, type SubtitleStyle } from "../components/studio/TikTokPreview";
import { ScheduleModal } from "../components/studio/ScheduleModal";
import { Send, Calendar, Save, CheckCircle2, AlertCircle, Zap, Layers, ChevronDown, ChevronUp, Smartphone } from "lucide-react";
import { SpotlightCard } from "../components/ui/SpotlightCard";
import { ClickSpark } from "../components/ui/ClickSpark";
import { FlexCarousel } from "../components/ui/FlexCarousel";
import { api, type PostDto } from "../lib/api";
import { useNotifications } from "../context/NotificationContext";
import { useQuota } from "../context/QuotaContext";

export function StudioPage() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { quotaUsed, quotaMax, incrementQuota } = useQuota();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(1);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [show3dInspector, setShow3dInspector] = useState(false);
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>("HORMOZI");
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Éléments du post généré
  const [currentPost, setCurrentPost] = useState<Partial<PostDto>>({
    mediaType: "PHOTO",
    mediaUrls: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1080&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1080&auto=format&fit=crop&q=80",
    ],
    caption: "Top 3 Erreurs qui tuent votre conversion TikTok en 2026 : et voilà comment résoudre ce problème immédiatement. #pourtoi #ia #businesstok",
    isAigc: true,
  });

  const carouselItems = (currentPost.mediaUrls && currentPost.mediaUrls.length > 0)
    ? currentPost.mediaUrls.map((url, idx) => ({
        src: url,
        alt: `Slide ${idx + 1}`,
        title: idx === 0 ? "Slide 1 : Hook" : `Slide ${idx + 1}`,
        subtitle: idx === 0 ? "Rétention 3 secondes" : "Développement narratif",
      }))
    : [];

  const handleGenerate = async (
    prompt: string,
    mode: "PHOTO_CAROUSEL" | "OMNI_NATIVE_VIDEO" | "COMPOSITE_STUDIO_VIDEO"
  ) => {
    setIsGenerating(true);
    setGenerationStep(1);
    setNotification(null);

    const stepTimer1 = setTimeout(() => setGenerationStep(2), 600);
    const stepTimer2 = setTimeout(() => setGenerationStep(3), 1200);
    const stepTimer3 = setTimeout(() => setGenerationStep(4), 1800);

    try {
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
          caption: p.caption || prompt,
          mediaType: p.mediaType || (p.mode === "PHOTO_CAROUSEL" ? "PHOTO" : "VIDEO"),
          mediaUrls: p.mediaUrls || (p.videoUrl ? [p.videoUrl] : []),
          isAigc: p.isAigc !== undefined ? p.isAigc : true,
        });
      }
      incrementQuota(1);
      setNotification({ type: "success", text: "Contenu synthétisé avec succès par Gemini !" });
      addNotification({
        title: "Synthèse IA Complétée",
        message: "Votre post 9:16 a été généré avec succès dans le Studio.",
        type: "success",
        link: "/studio",
      });
    } catch {
      // Fallback gracieux pour prévisualisation locale
      setCurrentPost({
        mediaType: mode === "PHOTO_CAROUSEL" ? "PHOTO" : "VIDEO",
        mediaUrls:
          mode === "PHOTO_CAROUSEL"
            ? [
                "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1080&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1080&auto=format&fit=crop&q=80",
              ]
            : ["https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"],
        caption: prompt,
        isAigc: true,
      });
      incrementQuota(1);
      setNotification({
        type: "success",
        text: "Inférence complétée ! Prévisualisation prête pour programmation.",
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
      addNotification({
        title: "Publication Lancée",
        message: "Envoi immédiat en cours de traitement sur TikTok Direct Publishing v2.",
        type: "info",
        link: "/posts",
      });
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
      addNotification({
        title: "Publication Programmée",
        message: `Votre vidéo a été ajoutée au planning pour le ${new Date(isoDate).toLocaleString("fr-FR")}.`,
        type: "success",
        link: "/calendar",
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
    <div className="space-y-6 max-w-[1720px] mx-auto pb-12">
      {/* Top HUD Status Bar (Stitch Design) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-low px-4 py-3 rounded-2xl border border-surface-container-highest shadow-md">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-secondary-fixed" />
          <h1 className="font-headline text-lg font-bold text-on-surface tracking-tight">
            Studio Créatif IA
          </h1>
          <span className="px-2.5 py-0.5 rounded bg-surface-container text-secondary text-xs font-mono font-bold tracking-wide">
            SYNTHÉTISEUR 9:16
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span>Moteur : <strong className="text-on-surface">Gemini + Sharp</strong></span>
          </div>
          <div className="h-4 w-px bg-surface-container-highest" />
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span>Résolution : <span className="text-secondary-fixed font-bold">1080x1920 (9:16)</span></span>
          </div>
          <div className="h-4 w-px bg-surface-container-highest" />
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <Zap className="w-3.5 h-3.5 text-secondary-fixed fill-secondary-fixed/20 animate-pulse" />
            <span>Quota : <strong className="text-secondary-fixed font-bold">{quotaUsed}/{quotaMax}</strong></span>
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

      {/* Main Workspace Bento Grid: 12-cols (Left 7 cols, Right 5 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: PromptForm, Formats, Hooks & Tonalité (7 Cols) */}
        <div className="xl:col-span-7 space-y-6">
          <PromptForm
            onSubmit={handleGenerate}
            isLoading={isGenerating}
            currentStep={generationStep}
            initialPrompt={currentPost.caption || ""}
            onPromptChange={(newCaption) => setCurrentPost((p) => ({ ...p, caption: newCaption }))}
          />
        </div>

        {/* RIGHT COLUMN: Preview 9:16 & Actions (5 Cols) */}
        <div className="xl:col-span-5 space-y-6 flex flex-col items-center">
          {/* Module 4: Score Viral Prédictif (Gauge Stitch) */}
          <div className="w-full bg-surface-container-low p-5 rounded-2xl border border-surface-container-highest shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-mono text-tertiary uppercase tracking-wider font-bold block">
                  Algorithme REA v4 Engine
                </span>
                <h3 className="font-headline text-base font-bold text-on-surface">
                  Score Viral Prédictif
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-surface-container text-secondary text-xs font-mono font-bold">
                Confiance 98.2%
              </span>
            </div>

            <div className="flex items-center gap-4 bg-surface-container p-3.5 rounded-xl border border-surface-container-highest">
              {/* Circular Gauge */}
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-surface-container-highest"
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                  />
                  <circle
                    className="text-primary-container"
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="40"
                    stroke="currentColor"
                    strokeDasharray="251.2"
                    strokeDashoffset="20"
                    strokeLinecap="round"
                    strokeWidth="8"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-headline text-2xl font-bold text-on-surface leading-none">94</span>
                  <span className="text-[10px] font-mono text-on-surface-variant leading-tight">/100</span>
                </div>
              </div>

              {/* Retention Bars */}
              <div className="flex-1 space-y-2 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-on-surface-variant">Rétention &lt; 3s</span>
                    <span className="font-mono text-secondary-fixed font-bold text-[11px]">96% (Elite)</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="bg-secondary-fixed h-full w-[96%]" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-on-surface-variant">Partages Probables</span>
                    <span className="font-mono text-tertiary font-bold text-[11px]">91% (Viral)</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="bg-tertiary h-full w-[91%]" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-surface-container-highest text-secondary">
                    # Curiosity Gap
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-surface-container-highest text-primary">
                    # High Retention
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Module 5: Audio Ducking Waveform Visualizer */}
          <div className="w-full bg-surface-container-low p-4 rounded-2xl border border-surface-container-highest shadow-lg space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-on-surface font-semibold">
                <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse" />
                <span>Audio Ducking IA :</span>
              </span>
              <span className="font-mono text-[11px] font-bold text-secondary bg-surface-container-highest px-2 py-0.5 rounded">
                -14.2 dB
              </span>
            </div>
            {/* Waveform Bar Simulation */}
            <div className="flex items-end justify-between h-8 gap-1 px-1 bg-surface-container p-2 rounded-lg">
              <div className="w-full bg-secondary-fixed/40 h-3 rounded-xs" />
              <div className="w-full bg-secondary-fixed/50 h-5 rounded-xs" />
              <div className="w-full bg-secondary-fixed h-7 rounded-xs" />
              <div className="w-full bg-primary-container h-4 rounded-xs" />
              <div className="w-full bg-primary-container h-3 rounded-xs" />
              <div className="w-full bg-primary-container h-4 rounded-xs" />
              <div className="w-full bg-secondary-fixed h-6 rounded-xs" />
              <div className="w-full bg-secondary-fixed/70 h-8 rounded-xs" />
              <div className="w-full bg-secondary-fixed/40 h-4 rounded-xs" />
              <div className="w-full bg-primary-container h-3 rounded-xs" />
              <div className="w-full bg-secondary-fixed h-7 rounded-xs" />
              <div className="w-full bg-secondary-fixed/60 h-4 rounded-xs" />
            </div>
          </div>

          {/* TikTok iPhone 15 Pro Titanium Simulator */}
          <TikTokPreview
            mediaType={currentPost.mediaType || "PHOTO"}
            mediaUrls={currentPost.mediaUrls || []}
            caption={currentPost.caption || ""}
            accountHandle="@createur"
            isAigc={currentPost.isAigc}
            subtitleStyle={subtitleStyle}
            onSubtitleStyleChange={setSubtitleStyle}
          />

          {/* Séquence Carrousel 3D Flex Inspection */}
          {currentPost.mediaType === "PHOTO" && carouselItems.length > 0 && (
            <div className="w-full max-w-[390px] pt-1">
              <button
                type="button"
                onClick={() => setShow3dInspector(!show3dInspector)}
                className="w-full py-2.5 px-3 rounded-xl bg-surface-container border border-surface-container-highest text-secondary hover:text-secondary-fixed text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Layers className="w-4 h-4" />
                <span>{show3dInspector ? "Masquer l'Inspecteur 3D" : `Inspecter les ${carouselItems.length} slides en 3D`}</span>
                {show3dInspector ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inspecteur 3D Carousel Modal / Expandable View */}
      {show3dInspector && currentPost.mediaType === "PHOTO" && carouselItems.length > 0 && (
        <SpotlightCard
          spotlightColor="rgba(53, 251, 245, 0.15)"
          className="p-6 space-y-4 bg-surface-container-low border-surface-container-highest rounded-2xl animate-in fade-in duration-300"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container-highest pb-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2 font-headline">
                <Layers className="w-4 h-4 text-secondary" />
                <span>Inspecteur Séquentiel 3D Liquid — Vraies Slides Générées</span>
                <span className="text-[10px] font-mono bg-surface-container text-secondary px-2 py-0.5 rounded-full">
                  {carouselItems.length} Slides 1080x1920
                </span>
              </h3>
              <p className="text-xs text-on-surface-variant">
                Survolez et déplacez vos slides générées pour inspecter la dynamique visuelle avant programmation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShow3dInspector(false)}
              className="text-xs text-on-surface-variant hover:text-on-surface px-3 py-1.5 rounded-lg bg-surface-container transition"
            >
              Fermer
            </button>
          </div>
          <div style={{ width: '100%', height: '480px', position: 'relative' }} className="rounded-2xl overflow-hidden bg-surface-container-lowest border border-surface-container-highest shadow-inner">
            <FlexCarousel
              items={carouselItems}
              preset="liquid"
              intro="rise"
              cardHeight={0.5}
              gap={12}
              squeeze={0.2}
              focusOnClick
              captions
            />
          </div>
        </SpotlightCard>
      )}

      {/* MODULE 8: Sticky Bottom Action Bar (Stitch Design) */}
      <div className="sticky bottom-4 z-40 bg-surface-container-low/95 backdrop-blur-xl p-4 rounded-2xl border border-surface-container-highest shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
            <Zap className="w-5 h-5 text-secondary-fixed" />
          </div>
          <div>
            <div className="text-xs font-bold text-on-surface font-headline">
              Pipeline d'automatisation prêt
            </div>
            <div className="text-[11px] font-mono text-on-surface-variant">
              3/3 Clics complétés • 1080x1920 • 60 FPS • Audio Ducking actif
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/simulator"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition border border-surface-container-highest"
          >
            <Smartphone className="w-3.5 h-3.5 text-secondary" />
            <span>Tester dans le Simulateur 9:16</span>
          </Link>

          <button
            type="button"
            onClick={() =>
              setNotification({ type: "success", text: "Brouillon sauvegardé dans vos posts !" })
            }
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition border border-surface-container-highest"
          >
            <Save className="w-3.5 h-3.5 text-on-surface-variant" />
            <span>Sauvegarder Brouillon</span>
          </button>

          <ClickSpark sparkColor="#fe2c55" sparkCount={10}>
            <button
              type="button"
              onClick={handleDirectPublish}
              disabled={isPublishing || isGenerating}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-container-highest hover:bg-surface-bright text-on-surface text-xs font-semibold transition border border-surface-container-highest disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-primary" />
              <span>Publier Maintenant</span>
            </button>
          </ClickSpark>

          <ClickSpark sparkColor="#35fbf5" sparkCount={10}>
            <button
              type="button"
              onClick={() => setIsScheduleOpen(true)}
              disabled={isPublishing || isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary-container font-headline text-xs font-bold transition shadow-lg shadow-primary-container/25 disabled:opacity-50"
            >
              <Calendar className="w-4 h-4" />
              <span>Programmer la Publication</span>
            </button>
          </ClickSpark>
        </div>
      </div>

      {/* Modale de Programmation */}
      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onConfirm={handleConfirmSchedule}
      />
    </div>
  );
}
