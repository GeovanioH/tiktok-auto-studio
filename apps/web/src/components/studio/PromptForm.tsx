import { useState } from "react";
import { 
  Sparkles, 
  Sliders, 
  Mic, 
  ChevronDown, 
  ChevronUp,
  Shuffle,
  Volume2,
  Plus
} from "lucide-react";

interface PromptFormProps {
  onSubmit: (prompt: string, mode: "PHOTO_CAROUSEL" | "OMNI_NATIVE_VIDEO" | "COMPOSITE_STUDIO_VIDEO") => void;
  isLoading: boolean;
  currentStep?: number; // 1 à 4
  initialPrompt?: string;
  onPromptChange?: (prompt: string) => void;
}

const TEMPLATES = [
  {
    category: "Erreurs",
    icon: "priority_high",
    label: "Top 3 Erreurs",
    prompt: "Top 3 Erreurs qui tuent votre conversion TikTok en 2026 : et voilà comment résoudre ce problème immédiatement.",
  },
  {
    category: "Mythe",
    icon: "flaky",
    label: "Mythe vs Vérité",
    prompt: "Mythe TikTok : Poster 5 fois par jour garantit le million de vues. Voici la vérité que personne ne révèle.",
  },
  {
    category: "Méthode",
    icon: "alt_route",
    label: "Méthode 3 Étapes",
    prompt: "Voici le protocole exact en 3 étapes pour monétiser son audience sans budget ni pub.",
  },
  {
    category: "Story",
    icon: "history_edu",
    label: "Storytime Choc",
    prompt: "J'ai perdu 45 000€ en 48h à cause de cet algorithme : voici la leçon brutale retenue.",
  },
  {
    category: "Stat",
    icon: "pie_chart",
    label: "Statistique Choc",
    prompt: "92.4% des créateurs abandonnent avant le 30ème jour sans connaître cette statistique clé...",
  },
];

const HOOK_PRESETS = [
  {
    tag: "HOOK A",
    label: "Curiosity Gap",
    dropRate: "4.8%",
    color: "text-secondary",
    badgeBg: "bg-surface-container-highest text-secondary-fixed",
    text: "« Si vous continuez de poster comme ça, l'algorithme va complètement geler votre compte dès demain matin... »",
  },
  {
    tag: "HOOK B",
    label: "Contrarian Hook",
    dropRate: "6.2%",
    color: "text-tertiary",
    badgeBg: "bg-surface-container-highest text-tertiary",
    text: "« Arrêtez immédiatement de faire des montages dynamiques : voici pourquoi le contenu brut surperforme à 400%. »",
  },
  {
    tag: "HOOK C",
    label: "Bold Claim",
    dropRate: "5.5%",
    color: "text-primary",
    badgeBg: "bg-surface-container-highest text-primary",
    text: "« J'ai généré 1.2M de vues en 72 heures avec ce script exact en 3 parties que personne n'utilise encore. »",
  },
];

export function PromptForm({ onSubmit, isLoading, currentStep = 1, initialPrompt = "", onPromptChange }: PromptFormProps) {
  const [prompt, setPrompt] = useState(initialPrompt || "Top 3 Erreurs qui tuent votre conversion TikTok en 2026 : et voilà comment résoudre ce problème immédiatement.");
  const [mode, setMode] = useState<"PHOTO_CAROUSEL" | "OMNI_NATIVE_VIDEO" | "COMPOSITE_STUDIO_VIDEO">(
    "PHOTO_CAROUSEL"
  );
  const [selectedHookIndex, setSelectedHookIndex] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tone, setTone] = useState<"PUNCHY" | "STORY" | "EXPERT" | "PROVOCATEUR">("PUNCHY");
  const [voice, setVoice] = useState<"THOMAS" | "CAMILLE" | "ALEX">("THOMAS");
  const [duckingEnabled, setDuckingEnabled] = useState(true);

  const handlePromptUpdate = (newVal: string) => {
    setPrompt(newVal);
    if (onPromptChange) onPromptChange(newVal);
  };

  // Algorithme prédictif de viralité
  const calculateViralScore = (text: string) => {
    if (!text.trim()) return { score: 45, label: "En attente", color: "text-on-surface-variant", bar: "bg-surface-container-highest", retention: "62%", share: "48%" };
    let score = 52;
    if (/\d+/.test(text)) score += 14;
    if (/pourquoi|secret|erreur|comment|détruire|vérité|astuce|jamais|attention|stop|protocole|abandonnent/i.test(text)) score += 20;
    if (text.length >= 35) score += 8;
    if (text.includes("?")) score += 4;
    score = Math.min(97, score);

    if (score >= 82) return { score, label: "Accroche Ultra-Virale", color: "text-secondary-fixed", bar: "bg-secondary-fixed", retention: "96% (Elite)", share: "91% (Viral)" };
    if (score >= 68) return { score, label: "Bonne Rétention", color: "text-secondary", bar: "bg-secondary", retention: "84%", share: "76%" };
    return { score, label: "Rétention Moyenne", color: "text-tertiary", bar: "bg-tertiary", retention: "71%", share: "59%" };
  };

  const viralAnalysis = calculateViralScore(prompt);

  const generateAlternateHooks = () => {
    const nextIdx = (selectedHookIndex + 1) % HOOK_PRESETS.length;
    setSelectedHookIndex(nextIdx);
    handlePromptUpdate(HOOK_PRESETS[nextIdx].text.replace(/[«»]/g, "").trim());
  };

  const applyTemplate = (tmplPrompt: string) => {
    handlePromptUpdate(tmplPrompt);
  };

  const applyHashtag = (tag: string) => {
    if (prompt.includes(tag)) return;
    handlePromptUpdate(`${prompt} ${tag}`.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSubmit(prompt.trim(), mode);
  };

  return (
    <div className="space-y-6">
      {/* MODULE 1: 3 Formats de Contenu 9:16 (Stitch Spec) */}
      <div className="bg-surface-container-low p-5 rounded-2xl border border-surface-container-highest shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-6 h-6 rounded bg-primary-container text-on-primary-container font-mono text-xs font-bold">
              01
            </span>
            <h2 className="font-headline text-base font-bold text-on-surface">Format de Contenu 9:16</h2>
          </div>
          <span className="text-[11px] font-mono text-secondary uppercase tracking-wider font-semibold">
            Conversion Auto JPEG 95%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Format 1: Carrousel */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setMode("PHOTO_CAROUSEL")}
            className={`text-left p-3.5 rounded-xl transition-all duration-200 border relative flex flex-col justify-between ${
              mode === "PHOTO_CAROUSEL"
                ? "bg-surface-container-highest border-secondary-fixed/50 shadow-md ring-1 ring-secondary-fixed/30 text-on-surface"
                : "bg-surface-container border-surface-container-highest text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="material-symbols-outlined text-secondary text-[24px]">view_carousel</span>
                <span className={`w-2.5 h-2.5 rounded-full ${mode === "PHOTO_CAROUSEL" ? "bg-secondary-fixed" : "bg-surface-container-highest"}`} />
              </div>
              <h3 className="text-xs font-bold text-on-surface font-headline">Carrousel Multi-Slides</h3>
              <p className="text-[11px] text-on-surface-variant mt-1 leading-snug">
                3 à 5 visuels 1080x1920 natifs sans PNG, compression ultra-rapide.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] text-secondary">
              <span className="material-symbols-outlined text-[13px]">auto_fix_high</span>
              <span>Optimisé Feed Swipe</span>
            </div>
          </button>

          {/* Format 2: Vidéo Native */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setMode("OMNI_NATIVE_VIDEO")}
            className={`text-left p-3.5 rounded-xl transition-all duration-200 border relative flex flex-col justify-between ${
              mode === "OMNI_NATIVE_VIDEO"
                ? "bg-surface-container-highest border-primary-container/50 shadow-md ring-1 ring-primary-container/30 text-on-surface"
                : "bg-surface-container border-surface-container-highest text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="material-symbols-outlined text-primary-container text-[24px]">videocam</span>
                <span className={`w-2.5 h-2.5 rounded-full ${mode === "OMNI_NATIVE_VIDEO" ? "bg-primary-container" : "bg-surface-container-highest"}`} />
              </div>
              <h3 className="text-xs font-bold text-on-surface font-headline">Vidéo Native IA</h3>
              <p className="text-[11px] text-on-surface-variant mt-1 leading-snug">
                Rendu cinématique vertical 60fps entièrement généré par diffusion neuronale.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] text-primary">
              <span className="material-symbols-outlined text-[13px]">motion_photos_on</span>
              <span>Ultra-Dynamique</span>
            </div>
          </button>

          {/* Format 3: Montage Composite */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setMode("COMPOSITE_STUDIO_VIDEO")}
            className={`text-left p-3.5 rounded-xl transition-all duration-200 border relative flex flex-col justify-between ${
              mode === "COMPOSITE_STUDIO_VIDEO"
                ? "bg-surface-container-highest border-tertiary/50 shadow-md ring-1 ring-tertiary/30 text-on-surface"
                : "bg-surface-container border-surface-container-highest text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="material-symbols-outlined text-tertiary text-[24px]">movie_filter</span>
                <span className={`w-2.5 h-2.5 rounded-full ${mode === "COMPOSITE_STUDIO_VIDEO" ? "bg-tertiary" : "bg-surface-container-highest"}`} />
              </div>
              <h3 className="text-xs font-bold text-on-surface font-headline">Montage Composite</h3>
              <p className="text-[11px] text-on-surface-variant mt-1 leading-snug">
                Effet Ken Burns, micro-zooms continus, voix off et kinetic typographie.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] text-tertiary">
              <span className="material-symbols-outlined text-[13px]">layers</span>
              <span>Hormozi Style</span>
            </div>
          </button>
        </div>
      </div>

      {/* MODULE 2: 5 Templates de Scripts Viraux (1 Clic) */}
      <div className="bg-surface-container-low p-5 rounded-2xl border border-surface-container-highest shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-6 h-6 rounded bg-primary-container text-on-primary-container font-mono text-xs font-bold">
              02
            </span>
            <h2 className="font-headline text-base font-bold text-on-surface">Templates de Scripts Viraux</h2>
          </div>
          <span className="text-[11px] text-on-surface-variant font-mono">1 Clic pour charger la matrice</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {TEMPLATES.map((tmpl, idx) => {
            const isMatch = prompt.includes(tmpl.label) || prompt.slice(0, 20) === tmpl.prompt.slice(0, 20);
            return (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => applyTemplate(tmpl.prompt)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm ${
                  isMatch
                    ? "bg-primary-container text-on-primary-container ring-1 ring-primary-container/40"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{tmpl.icon}</span>
                <span>{tmpl.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODULE 3: Variateur de Hooks (0-3 Sec) */}
      <div className="bg-surface-container-low p-5 rounded-2xl border border-surface-container-highest shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-6 h-6 rounded bg-primary-container text-on-primary-container font-mono text-xs font-bold">
              03
            </span>
            <h2 className="font-headline text-base font-bold text-on-surface">Variateur de Hooks (0-3 Sec)</h2>
          </div>
          <button
            type="button"
            onClick={generateAlternateHooks}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-on-secondary font-label text-xs font-bold transition-all shadow-md hover:bg-secondary-fixed"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Varier l'accroche</span>
          </button>
        </div>

        <p className="text-xs text-on-surface-variant">
          Sélectionnez le levier neuro-attentionnel calibré pour maximiser le taux de rétention après 3.5 secondes.
        </p>

        <div className="space-y-2 pt-1">
          {HOOK_PRESETS.map((h, idx) => {
            const isSelected = selectedHookIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => {
                  setSelectedHookIndex(idx);
                  handlePromptUpdate(h.text.replace(/[«»]/g, "").trim());
                }}
                className={`p-3 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? "bg-surface-container-highest border-secondary-fixed/50 shadow-md"
                    : "bg-surface-container border-transparent hover:bg-surface-container-high text-on-surface-variant"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${h.badgeBg}`}>
                      {h.tag}
                    </span>
                    <span className={`text-xs font-semibold ${h.color}`}>{h.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-tertiary">Drop Rate estimé: {h.dropRate}</span>
                    <span className={`material-symbols-outlined text-[18px] ${isSelected ? "text-primary-container opacity-100" : "text-on-surface-variant opacity-30"}`}>
                      {isSelected ? "check_circle" : "radio_button_unchecked"}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-on-surface mt-2 font-medium leading-relaxed">
                  {h.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODULE 6: Direction Artistique & Narrative */}
      <div className="bg-surface-container-low p-5 rounded-2xl border border-surface-container-highest shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-base font-bold text-on-surface">Direction Artistique & Narrative</h3>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 text-xs text-secondary hover:text-secondary-fixed font-semibold"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showAdvanced ? "Masquer" : "Afficher paramètres"}</span>
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 animate-in fade-in">
            {/* Tonalité */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant font-bold">
                Tonalité du Script
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "PUNCHY", label: "⚡ Punchy" },
                  { key: "STORY", label: "⏳ Storytelling" },
                  { key: "EXPERT", label: "🎓 Pédagogique" },
                  { key: "PROVOCATEUR", label: "🔥 Provocateur" },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTone(t.key as any)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold text-center transition-all ${
                      tone === t.key
                        ? "bg-primary-container text-on-primary-container shadow-sm font-bold"
                        : "bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Voix-off IA */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant font-bold">
                Voix Synthétique IA (FR)
              </label>
              <div className="space-y-1.5">
                {[
                  { key: "THOMAS", label: "Homme Dynamique", desc: "Français • Énergique & Positif", color: "text-secondary" },
                  { key: "CAMILLE", label: "Femme Posée", desc: "Français • Expert & Rassurant", color: "text-primary" },
                  { key: "ALEX", label: "Voix Grave Narrative", desc: "Français • Profond & Documentaire", color: "text-tertiary" },
                ].map((v) => (
                  <div
                    key={v.key}
                    onClick={() => setVoice(v.key as any)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${
                      voice === v.key
                        ? "bg-surface-container-highest border-secondary-fixed/40"
                        : "bg-surface-container border-transparent hover:bg-surface-container-high"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Mic className={`w-4 h-4 ${v.color}`} />
                      <div>
                        <div className="text-xs font-bold text-on-surface">{v.label}</div>
                        <div className="text-[10px] font-mono text-on-surface-variant">{v.desc}</div>
                      </div>
                    </div>
                    <span className={`material-symbols-outlined text-[16px] ${voice === v.key ? "text-secondary-fixed" : "text-on-surface-variant opacity-40"}`}>
                      {voice === v.key ? "radio_button_checked" : "radio_button_unchecked"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODULE 7: Légende & Hashtags Ciblés */}
      <div className="bg-surface-container-low p-5 rounded-2xl border border-surface-container-highest shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-base font-bold text-on-surface">Légende & Consigne Créative</h3>
          <div className="flex items-center gap-1.5 font-mono text-xs text-on-surface-variant">
            <span className="text-secondary font-bold">{prompt.length}</span>
            <span>/ 2 200 car.</span>
          </div>
        </div>

        {/* 1-Click Hashtags */}
        <div className="flex flex-wrap gap-1.5">
          {["#pourtoi", "#businesstok", "#ia", "#astuce", "#growth"].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => applyHashtag(tag)}
              className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-mono text-xs transition-colors flex items-center gap-1 border border-surface-container-highest"
            >
              <span>{tag}</span>
              <Plus className="w-3 h-3 text-secondary" />
            </button>
          ))}
        </div>

        {/* Textarea */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            name="prompt"
            rows={3}
            value={prompt}
            onChange={(e) => handlePromptUpdate(e.target.value)}
            disabled={isLoading}
            placeholder="Rédigez ou laissez l'IA formuler la description optimisée pour le SEO TikTok..."
            className="w-full bg-surface-container-lowest text-on-surface text-sm p-3.5 rounded-xl border border-surface-container-highest focus:ring-1 focus:ring-secondary-fixed outline-none resize-none transition"
            required
          />

          {/* Char limit bar */}
          <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className="bg-secondary-fixed h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (prompt.length / 500) * 100)}%` }}
            />
          </div>

          {/* Audio Ducking & Score Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Ducking toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-surface-container-highest">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-secondary" />
                <div>
                  <span className="text-xs font-bold text-on-surface block">Audio Ducking</span>
                  <span className="text-[10px] text-on-surface-variant font-mono">Atténuation dynamique -14.2 dB</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDuckingEnabled(!duckingEnabled)}
                className={`w-10 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                  duckingEnabled ? "bg-primary-container" : "bg-surface-container-highest"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-on-primary-container transition-transform ${
                    duckingEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Viral Gauge Preview */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-surface-container-highest">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-xs text-on-surface font-mono">
                  {viralAnalysis.score}
                </div>
                <div>
                  <span className="text-xs font-bold text-on-surface block">{viralAnalysis.label}</span>
                  <span className="text-[10px] text-secondary-fixed font-mono">Rétention: {viralAnalysis.retention}</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-secondary text-[10px] font-mono font-bold">
                {viralAnalysis.share}
              </span>
            </div>
          </div>

          {/* Stepper d'inférence si en chargement */}
          {isLoading && (
            <div className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-4 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium">
                <span>Inférence Multimodale Gemini & Imagen 3...</span>
                <span className="text-secondary-fixed font-bold font-mono">Étape {currentStep}/4</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { title: "Script", step: 1 },
                  { title: "Visuels", step: 2 },
                  { title: "Voix-off", step: 3 },
                  { title: "Montage", step: 4 },
                ].map((s) => (
                  <div
                    key={s.step}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentStep >= s.step
                        ? "bg-gradient-to-r from-secondary-fixed to-primary-container"
                        : "bg-surface-container-highest"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-on-primary-container bg-primary-container hover:bg-primary disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg shadow-primary-container/20 flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? "Synthèse IA en cours..." : "Générer avec l'IA (Cortex v4.9)"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
