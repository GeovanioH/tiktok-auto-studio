import { env } from "../../config/env";

export class SupabaseStorageService {
  private readonly publicDomain: string;

  constructor() {
    this.publicDomain = env.S3_PUBLIC_VERIFIED_DOMAIN.replace(/\/+$/, "");
  }

  /**
   * Téléverse un buffer binaire sur Supabase Storage (REST API native ou S3 compatible).
   * Retourne l'URL publique absolue pointant sur le domaine vérifié TikTok.
   */
  async uploadBuffer(buffer: Buffer, key: string, contentType: string): Promise<string> {
    const cleanKey = key.replace(/^\/+/, "");

    // 1. Priorité: API REST Supabase Storage native
    if (
      env.NODE_ENV !== "test" &&
      env.SUPABASE_SECRET_KEY &&
      env.SUPABASE_SECRET_KEY !== "dev_supabase_secret_key" &&
      env.SUPABASE_URL &&
      !env.SUPABASE_URL.includes("example.supabase.co")
    ) {
      try {
        const uploadUrl = `${env.SUPABASE_URL.replace(/\/+$/, "")}/storage/v1/object/${env.S3_BUCKET_NAME}/${cleanKey}`;
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": contentType,
            "apikey": env.SUPABASE_SECRET_KEY,
            "Authorization": `Bearer ${env.SUPABASE_SECRET_KEY}`,
            "x-upsert": "true"
          },
          body: new Uint8Array(buffer)
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn("[SupabaseStorageService] Erreur Supabase Storage :", response.status, errText);
        }
      } catch (err) {
        console.warn("[SupabaseStorageService] Exception lors du téléversement REST :", err);
      }
    }
    // 2. Fallback: S3 compatible
    else if (env.NODE_ENV !== "test" && env.S3_ACCESS_KEY_ID !== "dev_access_key") {
      try {
        const uploadUrl = `${env.S3_ENDPOINT.replace(/\/+$/, "")}/${env.S3_BUCKET_NAME}/${cleanKey}`;
        await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": contentType,
            "Content-Length": buffer.length.toString(),
            ...(env.S3_ACCESS_KEY_ID && env.S3_ACCESS_KEY_ID !== "dev_access_key"
              ? { "x-amz-content-sha256": "UNSIGNED-PAYLOAD" }
              : {})
          },
          body: new Uint8Array(buffer)
        });
      } catch (err) {
        console.warn("[SupabaseStorageService] Erreur lors du téléversement S3 :", err);
      }
    }

    return `${this.publicDomain}/${cleanKey}`;
  }

  getPublicUrl(key: string): string {
    const cleanKey = key.replace(/^\/+/, "");
    return `${this.publicDomain}/${cleanKey}`;
  }
}

export const supabaseStorage = new SupabaseStorageService();
// Rétrocompatibilité totale pour le code existant et les tests
export const r2Storage = supabaseStorage;
export const R2StorageService = SupabaseStorageService;
