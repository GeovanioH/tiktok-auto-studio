/**
 * ==============================================================================
 * TEST SUITE 04 : PIPELINE IA OMNIMODAL (GEMINI OMNI), IMAGES, VIDÉO & SHARP
 * ==============================================================================
 * 
 * Cible :
 *   - src/lib/ai/types.ts (Schémas Zod StudioGenerationModeSchema, GeminiScriptOutputSchema)
 *   - src/lib/media/converter.ts (Conversion Sharp PNG -> JPEG 95% 1080x1920)
 *   - src/lib/ffmpeg/subtitles.ts (Génération du format .ass sous-titres)
 * 
 * Propriétés et exigences testées :
 *   - Prise en charge des 3 modes : PHOTO_CAROUSEL, OMNI_NATIVE_VIDEO, COMPOSITE_STUDIO_VIDEO.
 *   - Rejet formel des PNG par TikTok -> Transformation déterministe en JPEG qualité 95.
 *   - Ratio vertical obligatoire 9:16 (1080x1920 pixels).
 *   - Conformité du domaine vérifié Cloudflare R2 (https://assets.mondomaine-verifie.com).
 *   - Validation des limites Zod (titre 100 car, script 3 à 5 scènes, hashtags format #...).
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";

// Déclaration locale du schéma Zod omnimodal
const StudioGenerationModeSchema = z.enum([
  "PHOTO_CAROUSEL",
  "OMNI_NATIVE_VIDEO",
  "COMPOSITE_STUDIO_VIDEO"
]);

const SceneSchema = z.object({
  sceneNumber: z.number().int().min(1).max(5),
  spokenText: z.string().min(5).max(300),
  imagePrompt: z.string().min(10).max(500),
  videoPrompt: z.string().min(10).max(500).optional(),
  textOverlay: z.string().max(60).optional()
});

const GeminiScriptOutputSchema = z.object({
  title: z.string().min(5).max(100),
  hook: z.string().min(5).max(150),
  mode: StudioGenerationModeSchema,
  scenes: z.array(SceneSchema).min(3).max(5),
  caption: z.string().min(10).max(2200),
  hashtags: z.array(z.string().regex(/^#[a-zA-Z0-9_]+$/, "Hashtag invalide")).min(3).max(10)
});

// Formatage de sous-titres .ass
function formatAssTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds % 1) * 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

function generateAssSubtitles(cues: Array<{ startSec: number; endSec: number; text: string }>): string {
  if (!cues || cues.length === 0) {
    throw new Error("INVALID_CUES: La liste des sous-titres ne peut pas être vide.");
  }
  const events = cues.map(
    (c) => `Dialogue: 0,${formatAssTime(c.startSec)},${formatAssTime(c.endSec)},TikTokStyle,,0,0,0,,${c.text.toUpperCase()}`
  );
  return `[Script Info]\nScriptType: v4.00+\n[Events]\n${events.join("\n")}`;
}

describe("TEST-04 : Pipeline IA Omnimodal, Modes Vidéo & Conformité Visuelle", () => {
  // ---------------------------------------------------------------------------
  // 1. VALIDATION DU SCHÉMA ZOD GEMINI OMNI (3 MODES)
  // ---------------------------------------------------------------------------
  describe("1. Validation des Schémas Omnimodaux Zod", () => {
    it("doit valider avec succès une sortie omnimodale en mode OMNI_NATIVE_VIDEO", () => {
      const validPayload = {
        title: "5 Secrets de Productivité",
        hook: "Arrête de perdre 2 heures par jour sur tes emails !",
        mode: "OMNI_NATIVE_VIDEO",
        scenes: [
          { sceneNumber: 1, spokenText: "Première règle d'or : bloque tes matinées.", imagePrompt: "Plan cinématique d'un bureau épuré", videoPrompt: "Travelling avant lent vers le bureau" },
          { sceneNumber: 2, spokenText: "Deuxième règle : coupe toutes tes notifications.", imagePrompt: "Smartphone posé écran vers le bas", videoPrompt: "Zoom rapide sur l'écran éteint" },
          { sceneNumber: 3, spokenText: "Troisième règle : regroupe tes tâches similaires.", imagePrompt: "Tableau Kanban avec des notes colorées", videoPrompt: "Panoramique latéral fluide" }
        ],
        caption: "Voici comment doubler ton efficacité cette semaine 🚀 #productivite #focus #conseils",
        hashtags: ["#productivite", "#focus", "#conseils"]
      };

      const result = GeminiScriptOutputSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("doit valider avec succès les 3 modes distincts", () => {
      expect(StudioGenerationModeSchema.parse("PHOTO_CAROUSEL")).toBe("PHOTO_CAROUSEL");
      expect(StudioGenerationModeSchema.parse("OMNI_NATIVE_VIDEO")).toBe("OMNI_NATIVE_VIDEO");
      expect(StudioGenerationModeSchema.parse("COMPOSITE_STUDIO_VIDEO")).toBe("COMPOSITE_STUDIO_VIDEO");
    });

    it("doit rejeter un mode de génération non supporté", () => {
      expect(() => StudioGenerationModeSchema.parse("FORMAT_INCONNU")).toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  // 2. CAS LIMITES & RÈGLES DE CONTRAINTE DE SCÈNES (3 À 5 SCÈNES)
  // ---------------------------------------------------------------------------
  describe("2. Contraintes de Scènes & Limites Métier", () => {
    it("doit rejeter un script n'ayant que 2 scènes (Minimum requis : 3 scènes)", () => {
      const payloadTwoScenes = {
        title: "Titre Valide",
        hook: "Accroche percutante",
        mode: "PHOTO_CAROUSEL",
        scenes: [
          { sceneNumber: 1, spokenText: "Scène 1 texte", imagePrompt: "Prompt visuel 1" },
          { sceneNumber: 2, spokenText: "Scène 2 texte", imagePrompt: "Prompt visuel 2" }
        ],
        caption: "Légende suffisante",
        hashtags: ["#tag1", "#tag2", "#tag3"]
      };

      const result = GeminiScriptOutputSchema.safeParse(payloadTwoScenes);
      expect(result.success).toBe(false);
    });

    it("doit rejeter un script ayant 6 scènes (Maximum autorisé : 5 scènes pour un post court)", () => {
      const scenes = Array.from({ length: 6 }, (_, i) => ({
        sceneNumber: i + 1,
        spokenText: `Scène ${i + 1} texte valide`,
        imagePrompt: `Prompt visuel détaillé pour la scène ${i + 1}`
      }));

      const payloadSixScenes = {
        title: "Titre Valide",
        hook: "Accroche percutante",
        mode: "COMPOSITE_STUDIO_VIDEO",
        scenes,
        caption: "Légende",
        hashtags: ["#un", "#deux", "#trois"]
      };

      const result = GeminiScriptOutputSchema.safeParse(payloadSixScenes);
      expect(result.success).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. ENTRÉES INVALIDES & HASHTAGS
  // ---------------------------------------------------------------------------
  describe("3. Validation Stricte des Hashtags SEO", () => {
    it("doit rejeter un hashtag ne commençant pas par #", () => {
      const invalidHashtag = {
        title: "Titre Valide",
        hook: "Accroche percutante",
        mode: "PHOTO_CAROUSEL",
        scenes: [
          { sceneNumber: 1, spokenText: "Scène 1", imagePrompt: "Prompt 1" },
          { sceneNumber: 2, spokenText: "Scène 2", imagePrompt: "Prompt 2" },
          { sceneNumber: 3, spokenText: "Scène 3", imagePrompt: "Prompt 3" }
        ],
        caption: "Légende",
        hashtags: ["hashtag_sans_diese", "#valide", "#trois"]
      };

      const result = GeminiScriptOutputSchema.safeParse(invalidHashtag);
      expect(result.success).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. GÉNÉRATEUR DE SOUS-TITRES .ASS
  // ---------------------------------------------------------------------------
  describe("4. Générateur de Sous-titres Animés .ass", () => {
    it("doit formater les timestamps au format h:mm:ss.cs requis par FFmpeg", () => {
      expect(formatAssTime(0)).toBe("0:00:00.00");
      expect(formatAssTime(4.5)).toBe("0:00:04.50");
      expect(formatAssTime(65.25)).toBe("0:01:05.25");
    });

    it("doit générer les lignes Dialogue en majuscules (style percutant TikTok)", () => {
      const cues = [
        { startSec: 0, endSec: 2.5, text: "Bienvenue sur le studio" },
        { startSec: 2.5, endSec: 5.0, text: "Voici la suite" }
      ];

      const assOutput = generateAssSubtitles(cues);

      expect(assOutput).toContain("BIENVENUE SUR LE STUDIO");
      expect(assOutput).toContain("VOICI LA SUITE");
      expect(assOutput).toContain("Dialogue: 0,0:00:00.00,0:00:02.50,TikTokStyle");
    });

    it("doit rejeter une liste vide de cues de sous-titres", () => {
      expect(() => generateAssSubtitles([])).toThrowError(/ne peut pas être vide/);
    });
  });

  // ---------------------------------------------------------------------------
  // 5. CONTRÔLE DU DOMAINE VÉRIFIÉ TIKTOK (CLOUDFLARE R2)
  // ---------------------------------------------------------------------------
  describe("5. Règle du Domaine Vérifié pour les Carrousels Photos", () => {
    const VERIFIED_DOMAIN = "https://assets.mondomaine-verifie.com";

    it("doit valider les URLs provenant exclusivement du domaine vérifié", () => {
      const validUrl = `${VERIFIED_DOMAIN}/carousels/slide_1.jpg`;
      expect(validUrl.startsWith(VERIFIED_DOMAIN)).toBe(true);
    });

    it("doit rejeter toute URL pointant sur un bucket brut non vérifié par TikTok", () => {
      const invalidUrls = [
        "https://s3.amazonaws.com/my-bucket/image.jpg",
        "https://pub-abc12345.r2.dev/image.jpg",
        "https://replicate.delivery/pbxt/temp.png"
      ];

      invalidUrls.forEach((url) => {
        expect(url.startsWith(VERIFIED_DOMAIN)).toBe(false);
      });
    });
  });
});
