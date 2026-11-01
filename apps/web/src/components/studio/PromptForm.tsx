import { useState } from "react";
import { Sparkles, Wand2, Image as ImageIcon, Film, Layers } from "lucide-react";

interface PromptFormProps {
  onSubmit: (prompt: string, mode: "PHOTO_CAROUSEL" | "OMNI_NATIVE_VIDEO" | "COMPOSITE_STUDIO_VIDEO") => void;
  isLoading: boolean;
  currentStep?: number; // 1 à 4
}

const SUGGESTIONS = [
  "3 erreurs de productivité qui détruisent votre focus",
  "Pourquoi 90% des e-commerçants échouent en 2026",
  "5 astuces psychologiques pour captiver en 3 secondes",
  "Ce que personne ne vous dit sur le deep work en télétravail",
];

export function PromptForm({ onSubmit, isLoading, currentStep = 1 }: PromptFormProps) {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"PHOTO_CAROUSEL" | "OMNI_NATIVE_VIDEO" | "COMPOSITE_STUDIO_VIDEO">(
    "PHOTO_CAROUSEL"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSubmit(prompt.trim(), mode);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-cyan-400" />
          <span>Création Multimodale IA en 3 Clics</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Générez des scripts viraux, des visuels ultra-HD 9:16 et planifiez en toute conformité.
        </p>
      </div>

      {/* Sélecteur de Format */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-300">Format de contenu :</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setMode("PHOTO_CAROUSEL")}
            disabled={isLoading}
            className={`p-3 rounded-xl border text-left transition flex flex-col gap-1.5 ${
              mode === "PHOTO_CAROUSEL"
                ? "bg-cyan-950/40 border-cyan-500/80 text-white shadow-lg shadow-cyan-950/30"
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
            className={`p-3 rounded-xl border text-left transition flex flex-col gap-1.5 ${
              mode === "OMNI_NATIVE_VIDEO"
                ? "bg-pink-950/40 border-pink-500/80 text-white shadow-lg shadow-pink-950/30"
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
            className={`p-3 rounded-xl border text-left transition flex flex-col gap-1.5 ${
              mode === "COMPOSITE_STUDIO_VIDEO"
                ? "bg-indigo-950/40 border-indigo-500/80 text-white shadow-lg shadow-indigo-950/30"
                : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-xs">
              <Layers className={`w-4 h-4 ${mode === "COMPOSITE_STUDIO_VIDEO" ? "text-indigo-400" : "text-zinc-400"}`} />
              <span>Composite Studio</span>
            </div>
            <p className="text-[11px] text-zinc-500">FFmpeg Ken Burns + Voix-off + Sous-titres</p>
          </button>
        </div>
      </div>

      {/* Suggestions rapides */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Suggestions d'accroches virales :</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((sug, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => setPrompt(sug)}
              className="text-xs bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg transition"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Formulaire & Stepper de génération */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Idée de départ ou consigne :
          </label>
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
          className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-pink-500 via-rose-500 to-cyan-500 hover:from-pink-400 hover:via-rose-400 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isLoading ? "Génération en cours..." : "Générer avec l'IA"}</span>
        </button>
      </form>
    </div>
  );
}
