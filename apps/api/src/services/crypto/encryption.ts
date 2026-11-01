import crypto from "crypto";

export const ALGORITHM = "aes-256-gcm";
export const IV_LENGTH = 12;
export const AUTH_TAG_LENGTH = 16;
export const DEFAULT_MASTER_KEY_HEX = "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90"; // 32 octets / 256 bits

export class SecurityIntegrityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecurityIntegrityError";
    Object.setPrototypeOf(this, SecurityIntegrityError.prototype);
  }
}

/**
 * Récupère et valide la clé maîtresse AES-256 (32 octets).
 */
export function getMasterKey(): Buffer {
  const hex = process.env.ENCRYPTION_MASTER_KEY || DEFAULT_MASTER_KEY_HEX;
  if (!hex || hex.length !== 64 || !/^[0-9a-fA-F]+$/.test(hex)) {
    throw new Error("ENCRYPTION_MASTER_KEY doit contenir exactement 64 caractères hexadécimaux.");
  }
  return Buffer.from(hex, "hex");
}

/**
 * Chiffre un token TikTok en clair avec AES-256-GCM.
 * Format sérialisé : base64(iv):base64(authTag):base64(ciphertext)
 */
export function encryptToken(plainText: string): string {
  if (plainText === null || plainText === undefined || typeof plainText !== "string") {
    throw new TypeError("INVALID_INPUT: Le token doit être une chaîne de caractères définie.");
  }
  if (plainText.trim().length === 0) {
    throw new Error("INVALID_INPUT: Le token à chiffrer ne peut pas être vide.");
  }

  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  let encrypted = cipher.update(plainText, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag();

  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
}

/**
 * Déchiffre et vérifie l'intégrité cryptographique d'un payload AES-256-GCM.
 * Lève SecurityIntegrityError en cas de tampering, tag corrompu ou format invalide.
 */
export function decryptToken(serialized: string): string {
  if (serialized === null || serialized === undefined || typeof serialized !== "string") {
    throw new TypeError("INVALID_INPUT: Le payload chiffré doit être une chaîne définie.");
  }
  if (serialized.trim().length === 0) {
    throw new Error("INVALID_INPUT: Le payload chiffré ne peut pas être vide.");
  }

  const parts = serialized.split(":");
  if (parts.length !== 3) {
    throw new SecurityIntegrityError("SECURITY_INTEGRITY_ERROR: Format sérialisé invalide (attendu: iv:tag:ciphertext).");
  }

  const [ivBase64, tagBase64, cipherTextBase64] = parts;
  if (!ivBase64 || !tagBase64 || !cipherTextBase64) {
    throw new SecurityIntegrityError("SECURITY_INTEGRITY_ERROR: Segments manquants dans le payload chiffré.");
  }

  const iv = Buffer.from(ivBase64, "base64");
  const authTag = Buffer.from(tagBase64, "base64");

  if (iv.length !== IV_LENGTH) {
    throw new SecurityIntegrityError(`SECURITY_INTEGRITY_ERROR: Longueur d'IV invalide (${iv.length} au lieu de ${IV_LENGTH}).`);
  }
  if (authTag.length !== AUTH_TAG_LENGTH) {
    throw new SecurityIntegrityError(`SECURITY_INTEGRITY_ERROR: Longueur d'Auth Tag invalide (${authTag.length} au lieu de ${AUTH_TAG_LENGTH}).`);
  }

  const key = getMasterKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  try {
    let decrypted = decipher.update(cipherTextBase64, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    throw new SecurityIntegrityError("SECURITY_INTEGRITY_ERROR: Échec d'authentification des données chiffrées (Auth Tag mismatch).");
  }
}
