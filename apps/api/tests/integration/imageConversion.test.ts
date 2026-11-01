import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { convertToTikTokCompliantJpeg, getImageMetadata } from "../../src/services/media/converter";
import { r2Storage } from "../../src/services/storage/r2";
import {
  StudioGenerationModeSchema,
  GeminiScriptOutputSchema
} from "../../src/services/ai/types";
import { generateAssSubtitles, formatAssTime } from "../../src/services/ffmpeg/subtitles";

describe("Apps/API - Sharp Image Conversion & Multimodal Studio Tests", () => {
  describe("1. Conversion Sharp PNG -> JPEG 95% 1080x1920", () => {
    it("doit convertir un buffer PNG transparent en JPEG 95% aux dimensions 1080x1920", async () => {
      // Création d'une image PNG source 500x500
      const pngSource = await sharp({
        create: {
          width: 500,
          height: 500,
          channels: 4,
          background: { r: 255, g: 0, b: 0, alpha: 0.5 }
        }
      })
        .png()
        .toBuffer();

      const jpegBuffer = await convertToTikTokCompliantJpeg(pngSource);

      expect(Buffer.isBuffer(jpegBuffer)).toBe(true);
      expect(jpegBuffer.length).toBeGreaterThan(0);

      const meta = await getImageMetadata(jpegBuffer);
      expect(meta.format).toBe("jpeg");
      expect(meta.width).toBe(1080);
      expect(meta.height).toBe(1920);
    });

    it("doit rejeter un buffer vide", async () => {
      // @ts-expect-error test buffer vide
      await expect(convertToTikTokCompliantJpeg(null)).rejects.toThrowError(/INVALID_INPUT/);
      await expect(convertToTikTokCompliantJpeg(Buffer.alloc(0))).rejects.toThrowError(/INVALID_INPUT/);
    });
  });

  describe("2. Conformité du Domaine Vérifié Cloudflare R2", () => {
    it("doit générer une URL publique pointant impérativement sur le domaine vérifié", async () => {
      const dummyBuffer = Buffer.from("dummy_image_content");
      const key = "carousels/post_123/slide_1.jpg";

      const publicUrl = await r2Storage.uploadBuffer(dummyBuffer, key, "image/jpeg");

      expect(publicUrl).toBe("https://assets.mondomaine-verifie.com/carousels/post_123/slide_1.jpg");
      expect(publicUrl.startsWith("https://assets.mondomaine-verifie.com")).toBe(true);
    });
  });

  describe("3. Validation des Schémas Omnimodaux Zod", () => {
    it("doit valider les 3 modes distincts", () => {
      expect(StudioGenerationModeSchema.parse("PHOTO_CAROUSEL")).toBe("PHOTO_CAROUSEL");
      expect(StudioGenerationModeSchema.parse("OMNI_NATIVE_VIDEO")).toBe("OMNI_NATIVE_VIDEO");
      expect(StudioGenerationModeSchema.parse("COMPOSITE_STUDIO_VIDEO")).toBe("COMPOSITE_STUDIO_VIDEO");
    });

    it("doit valider un scénario omnimodal valide", () => {
      const validPayload = {
        title: "Titre Valide",
        hook: "Accroche virale",
        mode: "OMNI_NATIVE_VIDEO",
        scenes: [
          { sceneNumber: 1, spokenText: "Scène 1 texte", imagePrompt: "Prompt visuel scène 1", videoPrompt: "Motion fluide caméra 1" },
          { sceneNumber: 2, spokenText: "Scène 2 texte", imagePrompt: "Prompt visuel scène 2", videoPrompt: "Motion fluide caméra 2" },
          { sceneNumber: 3, spokenText: "Scène 3 texte", imagePrompt: "Prompt visuel scène 3", videoPrompt: "Motion fluide caméra 3" }
        ],
        caption: "Légende pour TikTok #viral #focus #ai",
        hashtags: ["#viral", "#focus", "#ai"]
      };

      const result = GeminiScriptOutputSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });
  });

  describe("4. Formatage des Sous-titres .ass", () => {
    it("doit formater les timestamps au format h:mm:ss.cs", () => {
      expect(formatAssTime(0)).toBe("0:00:00.00");
      expect(formatAssTime(4.5)).toBe("0:00:04.50");
      expect(formatAssTime(65.25)).toBe("0:01:05.25");
    });

    it("doit générer les lignes de dialogue en majuscules", () => {
      const cues = [
        { startSec: 0, endSec: 2.5, text: "Bienvenue sur le studio" }
      ];
      const ass = generateAssSubtitles(cues);
      expect(ass).toContain("BIENVENUE SUR LE STUDIO");
      expect(ass).toContain("TikTokStyle");
    });
  });
});
