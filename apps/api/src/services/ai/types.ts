import { z } from "zod";

export const StudioGenerationModeSchema = z.enum([
  "PHOTO_CAROUSEL",        // Carrousel photos 9:16 (Gemini Omni / Imagen 3 + Sharp)
  "OMNI_NATIVE_VIDEO",     // Vidéo directe générée nativement par Gemini Omni
  "COMPOSITE_STUDIO_VIDEO" // Vidéo montée via FFmpeg (images + voix TTS + Ken Burns + .ass)
]);

export type StudioGenerationMode = z.infer<typeof StudioGenerationModeSchema>;

export const SceneSchema = z.object({
  sceneNumber: z.number().int().min(1).max(5),
  spokenText: z.string().min(5).max(300),
  imagePrompt: z.string().min(10).max(500),
  videoPrompt: z.string().min(10).max(500).optional(),
  textOverlay: z.string().max(60).optional()
});

export type Scene = z.infer<typeof SceneSchema>;

export const GeminiScriptOutputSchema = z.object({
  title: z.string().min(5).max(100),
  hook: z.string().min(5).max(150),
  mode: StudioGenerationModeSchema.default("COMPOSITE_STUDIO_VIDEO"),
  scenes: z.array(SceneSchema).min(3).max(5),
  caption: z.string().min(10).max(2200),
  hashtags: z.array(z.string().regex(/^#[a-zA-Z0-9_]+$/, "Hashtag invalide")).min(3).max(10)
});

export type GeminiScriptOutput = z.infer<typeof GeminiScriptOutputSchema>;

export const AIGenerateRequestSchema = z.object({
  prompt: z.string().min(5, "L'idée doit contenir au moins 5 caractères.").max(1000),
  mode: StudioGenerationModeSchema.default("COMPOSITE_STUDIO_VIDEO"),
  targetAccountId: z.string().uuid().optional(),
  voiceId: z.string().optional()
});

export type AIGenerateRequest = z.infer<typeof AIGenerateRequestSchema>;
