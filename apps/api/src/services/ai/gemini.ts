import { env } from "../../config/env";
import { GeminiScriptOutput, GeminiScriptOutputSchema, StudioGenerationMode } from "./types";

export class GeminiOmniService {
  /**
   * Génère le scénario découpé en 3 à 5 scènes avec Gemini Omni.
   */
  async generateScript(prompt: string, mode: StudioGenerationMode = "COMPOSITE_STUDIO_VIDEO"): Promise<GeminiScriptOutput> {
    if (!prompt || prompt.trim().length < 5) {
      throw new Error("INVALID_PROMPT: Le prompt doit contenir au moins 5 caractères.");
    }

    // Réponse déterministe typée Zod pour isolation ou fallback si clé de dev
    if (env.GEMINI_API_KEY === "AIzaSy_dev_key" || env.NODE_ENV === "test") {
      const sanitizedTitle = prompt.length > 50 ? `${prompt.substring(0, 47)}...` : prompt;
      return GeminiScriptOutputSchema.parse({
        title: sanitizedTitle,
        hook: `Arrête tout ! Voici ce que personne ne te dit sur : ${prompt.substring(0, 40)}`,
        mode,
        scenes: [
          {
            sceneNumber: 1,
            spokenText: "Le premier secret que les experts gardent sous silence.",
            imagePrompt: `Plan cinématique vertical 9:16 très contrasté illustrant ${prompt}`,
            videoPrompt: "Travelling avant immersif vers le sujet principal",
            textOverlay: "SECRET #1"
          },
          {
            sceneNumber: 2,
            spokenText: "Pourquoi 95% des gens échouent en ignorant cette étape cruciale.",
            imagePrompt: `Illustration moderne et réaliste 9:16 avec éclairage dramatique`,
            videoPrompt: "Mouvement fluide de caméra en contre-plongée",
            textOverlay: "L'ERREUR FATALE"
          },
          {
            sceneNumber: 3,
            spokenText: "Applique cette méthode dès aujourd'hui pour transformer tes résultats.",
            imagePrompt: `Visuel triomphant et lumineux au ratio vertical 9:16`,
            videoPrompt: "Ralenti cinématique avec bokeh d'arrière-plan",
            textOverlay: "PASSE À L'ACTION"
          }
        ],
        caption: `${prompt} 🚀 Découvre les 3 étapes essentielles pour réussir dès maintenant ! #conseils #astuces #viral`,
        hashtags: ["#conseils", "#astuces", "#viral"]
      });
    }

    // Appel API Gemini officiel
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Tu es le meilleur scénariste TikTok au monde. Rédige un script viral pour: "${prompt}". Réponds STRICTEMENT en JSON conforme au schéma.`
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      }
    );

    const data = (await response.json()) as any;
    const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawJson);
    return GeminiScriptOutputSchema.parse(parsed);
  }
}

export const geminiOmniService = new GeminiOmniService();
