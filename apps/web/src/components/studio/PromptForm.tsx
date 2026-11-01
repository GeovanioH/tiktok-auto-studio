import { useState } from "react";
import { 
  Sparkles, 
  Wand2, 
  Image as ImageIcon, 
  Film, 
  Layers, 
  Flame, 
  TrendingUp, 
  CheckCircle2, 
  Sliders, 
  Mic, 
  Music, 
  ChevronDown, 
  ChevronUp,
  Shuffle,
  Compass
} from "lucide-react";

interface PromptFormProps {
  onSubmit: (prompt: string, mode: "PHOTO_CAROUSEL" | "OMNI_NATIVE_VIDEO" | "COMPOSITE_STUDIO_VIDEO") => void;
  isLoading: boolean;
  currentStep?: number; // 1 à 4
}

const TEMPLATES = [
  {
    category: "Erreurs",
    icon: "⚠️",
    label: "Top 3 Erreurs",
    prompt: "3 erreurs fatales commises par les freelances qui détruisent leur rentabilité en 2026...",
  },
  {
    category: "Mythe",
    icon: "❓",
    label: "Mythe vs Vérité",
    prompt: "Pourquoi 90% des gens se trompent totalement sur le deep work en télétravail...",
  },
  {
    category: "Méthode",
    icon: "🚀",
    label: "Méthode 3 Étapes",
    prompt: "La méthode secrète en 3 étapes pour doubler sa productivité sans burnout...",
  },
  {
    category: "Story",
    icon: "⏳",
    label: "Storytime Choc",
    prompt: "Ce qui m'est arrivé quand j'ai arrêté de travailler après 18h pendant 30 jours...",
  },
  {
    category: "Stat",
    icon: "📊",
    label: "Choc Statistique",
    prompt: "92% des créateurs échouent sur TikTok en 2026 à cause de cette seule erreur de rétention...",
  },
];

export function PromptForm({ onSubmit, isLoading, currentStep = 1 }: PromptFormProps) {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"PHOTO_CAROUSEL" | "OMNI_NATIVE_VIDEO" | "COMPOSITE_STUDIO_VIDEO">(
    "PHOTO_CAROUSEL"
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tone, setTone] = useState<"PUNCHY" | "STORY" | "EXPERT" | "PROVOCATEUR">("PUNCHY");
  const [voice, setVoice] = useState<"THOMAS" | "CAMILLE" | "ALEX">("THOMAS");
  const [musicBgm, setMusicBgm] = useState<"LOFI" | "SYNTHWAVE" | "DRILL" | "NONE">("LOFI");

  // Rétro-ingénierie REA : Algorithme prédictif de rétention et viralité
  const calculateViralScore = (text: string) => {
    if (!text.trim()) return { score: 45, label: "En attente d'accroche", color: "text-zinc-500", bar: "bg-zinc-700", type: "Standard" };
    let score = 52;
    if (/\d+/.test(text)) score += 14; // Présence de chiffres (Top 3, 5 étapes)
    if (/pourquoi|secret|erreur|comment|détruire|vérité|astuce|jamais|attention|stop/i.test(text)) score += 20; // Mots déclencheurs
    if (text.length >= 35) score += 10;
    if (text.includes("?")) score += 4;
    score = Math.min(97, score);

    if (score >= 82) return { score, label: "Accroche Ultra-Virale", color: "text-emerald-400", bar: "bg-gradient-to-r from-emerald-400 to-cyan-400", type: "Curiosity Gap (Forte rétention 3s)" };
    if (score >= 68) return { score, label: "Bonne Dynamique Narrative", color: "text-cyan-400", bar: "bg-gradient-to-r from-cyan-400 to-blue-500", type: "Listicle Engageant" };
    return { score, label: "Rétention Initiale Moyenne", color: "text-amber-400", bar: "bg-amber-400", type: "Descriptif Linéaire" };
  };

  const viralAnalysis = calculateViralScore(prompt);

  // Générateur de 3 variations d'accroches alternatives
  const generateAlternateHooks = () => {
    if (!prompt.trim()) return;
    const base = prompt.replace(/\.\.\.$/, "");
    const variations = [
      `Stop ! Si vous faites cette erreur fatale en 2026 : ${base}...`,
      `Ce que personne ne vous dit jamais sur : ${base}...`,
      `Le secret contre-intuitif qui change absolument tout : ${base}...`,
    ];
    const picked = variations[Math.floor(Math.random() * variations.length)];
    setPrompt(picked);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSubmit(prompt.trim(), mode);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-cyan-400" />
            <span>Studio Créatif Multimodal IA</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Génération de scripts viraux, visuels 9:16 ultra-HD et montage avec audio ducking.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
            showAdvanced
              ? "bg-cyan-950/60 border-cyan-500/80 text-cyan-300"
              : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Options Pro</span>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Sélecteur de Format TikTok 9:16 */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
          <span>Format de publication TikTok :</span>
          <span className="text-[10px] text-zinc-500 font-mono">1080x1920 (9:16)</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setMode("PHOTO_CAROUSEL")}
            disabled={isLoading}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col gap-1.5 ${
              mode === "PHOTO_CAROUSEL"
                ? "bg-cyan-950/40 border-cyan-500/80 text-white shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/30"
                : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-xs">
              <ImageIcon className={`w-4 h-4 ${mode === "PHOTO_CAROUSEL" ? "text-cyan-400" : "text-zinc-400"}`} />
              <span>Carrousel Photos</span>
            </div>
            <p className="text-[11px] text-zinc-500">3-5 diapositives JPEG 95% 1080x1920</p>
          </button>

          <button
            type="button"
            onClick={() => setMode("OMNI_NATIVE_VIDEO")}
            disabled={isLoading}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col gap-1.5 ${
              mode === "OMNI_NATIVE_VIDEO"
                ? "bg-pink-950/40 border-pink-500/80 text-white shadow-lg shadow-pink-950/30 ring-1 ring-pink-500/30"
                : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-xs">
              <Film className={`w-4 h-4 ${mode === "OMNI_NATIVE_VIDEO" ? "text-pink-400" : "text-zinc-400"}`} />
              <span>Vidéo Native Omni</span>
            </div>
            <p className="text-[11px] text-zinc-500">Vidéo pure IA générée nativement</p>
          </button>

          <button
            type="button"
            onClick={() => setMode("COMPOSITE_STUDIO_VIDEO")}
            disabled={isLoading}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col gap-1.5 ${
              mode === "COMPOSITE_STUDIO_VIDEO"
                ? "bg-indigo-950/40 border-indigo-500/80 text-white shadow-lg shadow-indigo-950/30 ring-1 ring-indigo-500/30"
                : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-xs">
              <Layers className={`w-4 h-4 ${mode === "COMPOSITE_STUDIO_VIDEO" ? "text-indigo-400" : "text-zinc-400"}`} />
              <span>Composite Studio</span>
            </div>
            <p className="text-[11px] text-zinc-500">FFmpeg Ken Burns + Voix + Karaoké</p>
          </button>
        </div>
      </div>

      {/* Templates Viraux Rapides */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-zinc-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Templates de scripts prouvés (1 Clic) :</span>
          </label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => setPrompt(tmpl.prompt)}
              className="text-left p-2.5 rounded-xl bg-zinc-950/90 hover:bg-zinc-800 border border-zinc-800/80 hover:border-cyan-500/40 transition group"
            >
              <span className="text-base block mb-0.5">{tmpl.icon}</span>
              <p className="text-xs font-bold text-zinc-300 group-hover:text-white truncate">
                {tmpl.label}
              </p>
              <p className="text-[10px] text-zinc-500 truncate">{tmpl.category}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Tiroir d'Options Avancées (Tonalité, Voix Off, Musique) */}
      {showAdvanced && (
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Tonalité */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Tonalité de la narration :</span>
              </label>
              <select
                value={tone}
                onChange={(e: any) => setTone(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="PUNCHY">⚡ Énergique & Rapide (Hooks 3s)</option>
                <option value="STORY">⏳ Storytelling Captivant</option>
                <option value="EXPERT">🎓 Pédagogique & Expert</option>
                <option value="PROVOCATEUR">🔥 Provocateur / Opinion tranchée</option>
              </select>
            </div>

            {/* Voix-off IA */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-400 flex items-center gap-1">
                <Mic className="w-3.5 h-3.5 text-pink-400" />
                <span>Voix Off (ElevenLabs / TTS) :</span>
              </label>
              <select
                value={voice}
                onChange={(e: any) => setVoice(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="THOMAS">Thomas — Voix Homme Dynamique</option>
                <option value="CAMILLE">Camille — Voix Femme Posée</option>
                <option value="ALEX">Alex — Voix Grave & Directe</option>
              </select>
            </div>

            {/* Musique de fond */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-400 flex items-center gap-1">
                <Music className="w-3.5 h-3.5 text-cyan-400" />
                <span>Fond Musical & Ducking :</span>
              </label>
              <select
                value={musicBgm}
                onChange={(e: any) => setMusicBgm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="LOFI">Lo-Fi Chill (Atténuation -14dB)</option>
                <option value="SYNTHWAVE">Tech Synthwave (Atténuation -16dB)</option>
                <option value="DRILL">Drill Punchy (Atténuation -18dB)</option>
                <option value="NONE">Aucun son de fond (Voix pure)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire & Stepper de génération */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Idée de départ ou consigne créative :
            </label>
            {prompt.trim() && (
              <button
                type="button"
                onClick={generateAlternateHooks}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition"
                title="Générer une variation de hook"
              >
                <Shuffle className="w-3 h-3" />
                <span>Varier l'accroche</span>
              </button>
            )}
          </div>
          <textarea
            name="prompt"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
            placeholder="Ex: Explique les 3 erreurs de gestion du temps commises par les freelances avec un ton punchy et captivant..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition resize-none"
            required
          />
        </div>

        {/* Widget Rétro-Ingénierie REA : Prédicteur de Viralité & Rétention 3s */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-bold text-zinc-300">
              <Flame className="w-4 h-4 text-pink-500" />
              <span>Score Viral Estimé</span>
            </span>
            <div className="flex items-center gap-2">
              <span className={`font-mono font-bold text-xs ${viralAnalysis.color}`}>
                {viralAnalysis.score}/100
              </span>
              <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full font-medium">
                {viralAnalysis.label}
              </span>
            </div>
          </div>

          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${viralAnalysis.bar} transition-all duration-500 rounded-full`}
              style={{ width: `${viralAnalysis.score}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Format : <strong className="text-zinc-300">{viralAnalysis.type}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audio Ducking : <strong className="text-zinc-300">{musicBgm !== "NONE" ? "-14dB Actif" : "Désactivé"}</strong></span>
            </div>
          </div>
        </div>

        {/* Stepper d'inférence si en chargement */}
        {isLoading && (
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
              <span>Génération en cours : Pipeline Multimodal Gemini & Imagen 3...</span>
              <span className="text-cyan-400 font-bold">Étape {currentStep}/4</span>
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
                      ? "bg-gradient-to-r from-cyan-400 to-pink-500"
                      : "bg-zinc-800"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-pink-500 via-rose-500 to-cyan-500 hover:from-pink-400 hover:via-rose-400 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isLoading ? "Génération en cours..." : "Générer avec l'IA"}</span>
        </button>
      </form>
    </div>
  );
}