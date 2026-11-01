import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

// Charger .env.local en priorité si présent, sinon .env (support monorepo et sous-dossiers)
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "..", "..", ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), "..", "..", ".env") });

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000), // Port API Node.js
  API_URL: z.string().url().default("http://localhost:4000"),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"), // Origine React Vite

  // Persistance & Cache
  DATABASE_URL: z.string().url().default("postgresql://postgres:postgres_password@localhost:5432/tiktok_studio?schema=public"),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),

  // Sécurité & Crypto (Exactement 64 caractères hexadécimaux = 32 octets)
  ENCRYPTION_MASTER_KEY: z.string().length(64, {
    message: "ENCRYPTION_MASTER_KEY doit contenir exactement 64 caractères hexadécimaux (256 bits)."
  }).regex(/^[0-9a-fA-F]+$/, {
    message: "ENCRYPTION_MASTER_KEY doit être une chaîne hexadécimale valide."
  }).default("a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90"),
  JWT_SECRET: z.string().min(32, {
    message: "JWT_SECRET doit contenir au moins 32 caractères."
  }).default("super_secret_jwt_key_pour_sessions_http_only_32_caracteres"),

  // TikTok API v2
  TIKTOK_CLIENT_KEY: z.string().default("dev_tiktok_key"),
  TIKTOK_CLIENT_SECRET: z.string().default("dev_tiktok_secret"),
  TIKTOK_REDIRECT_URI: z.string().url().default("http://localhost:4000/api/auth/tiktok/callback"),
  TIKTOK_AUDIT_APPROVED: z.enum(["true", "false"]).default("false"),

  // Cloudflare R2 / S3
  S3_ENDPOINT: z.string().url().default("https://example.r2.cloudflarestorage.com"),
  S3_ACCESS_KEY_ID: z.string().default("dev_access_key"),
  S3_SECRET_ACCESS_KEY: z.string().default("dev_secret_key"),
  S3_BUCKET_NAME: z.string().default("tiktok-media-dev"),
  S3_PUBLIC_VERIFIED_DOMAIN: z.string().url().default("https://assets.mondomaine-verifie.com"),

  // Fournisseurs IA
  GEMINI_API_KEY: z.string().default("dev_gemini_key"),
  ELEVENLABS_API_KEY: z.string().default("dev_elevenlabs_key")
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(customEnv?: Record<string, unknown>): Env {
  const result = envSchema.safeParse(customEnv || process.env);
  if (!result.success) {
    if (process.env.NODE_ENV !== "test") {
      console.error("❌ ERREUR CRITIQUE DE CONFIGURATION ENVIRONNEMENTALE :");
      console.error(JSON.stringify(result.error.format(), null, 2));
      process.exit(1);
    }
    throw result.error;
  }
  return result.data;
}

export const env: Env = validateEnv();
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = env.DATABASE_URL;
}
