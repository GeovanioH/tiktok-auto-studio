import { z } from "zod";

// ==============================================================================
// ENUMS & TYPES MULTIMODAUX
// ==============================================================================
export const GenerationModeSchema = z.enum(["OMNI_DIRECT", "OMNI_CAROUSEL", "OMNI_COMPOSITE"]);
export type GenerationMode = z.infer<typeof GenerationModeSchema>;

export const PostStatusSchema = z.enum([
  "DRAFT",
  "GENERATING",
  "SCHEDULED",
  "PUBLISHING",
  "PUBLISHED",
  "FAILED"
]);
export type PostStatus = z.infer<typeof PostStatusSchema>;

export const TikTokPrivacyLevelSchema = z.enum([
  "PUBLIC_TO_EVERYONE",
  "MUTUAL_FOLLOW_FRIENDS",
  "FOLLOWER_OF_CREATOR",
  "SELF_ONLY"
]);
export type TikTokPrivacyLevel = z.infer<typeof TikTokPrivacyLevelSchema>;

// ==============================================================================
// SCHEMAS DTO : CRÉATION DE POST & IA GÉNÉRATIVE
// ==============================================================================
export const CreateGenerationJobSchema = z.object({
  tiktokAccountId: z.string().uuid(),
  mode: GenerationModeSchema,
  prompt: z.string().min(5, "Le prompt d'IA doit comporter au moins 5 caractères.").max(2000),
  topic: z.string().min(2).max(100),
  scheduledTime: z.string().datetime().optional(),
  privacyLevel: TikTokPrivacyLevelSchema.default("SELF_ONLY"),
  allowComment: z.boolean().default(true),
  allowDuet: z.boolean().default(false),
  allowStitch: z.boolean().default(false),
  isAigc: z.literal(true).default(true),
  carouselCaptions: z.array(z.string()).optional()
});
export type CreateGenerationJobDTO = z.infer<typeof CreateGenerationJobSchema>;

// ==============================================================================
// SCHEMAS DTO : AUDIT & STATUT TIKTOK
// ==============================================================================
export const TikTokAuditStatusSchema = z.object({
  isApproved: z.boolean(),
  allowedPrivacyLevels: z.array(TikTokPrivacyLevelSchema),
  maxDailyPosts: z.number().int().positive(),
  warningMessage: z.string().optional()
});
export type TikTokAuditStatusDTO = z.infer<typeof TikTokAuditStatusSchema>;
