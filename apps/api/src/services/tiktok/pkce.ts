import crypto from "crypto";

/**
 * Génère un code_verifier cryptographiquement sûr conforme RFC 7636 (min 43 caractères base64url).
 */
export function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Dérive le code_challenge déterministe via SHA-256 Base64URL conforme RFC 7636.
 */
export function generateCodeChallenge(verifier: string, format: "hex" | "base64url" = "hex"): string {
  if (!verifier || typeof verifier !== "string" || verifier.trim().length === 0) {
    throw new TypeError("INVALID_VERIFIER: Le code_verifier doit être une chaîne non vide.");
  }
  return crypto.createHash("sha256").update(verifier).digest(format);
}

/**
 * Génère un jeton state cryptographique anti-CSRF.
 */
export function generateStateToken(): string {
  return crypto.randomBytes(16).toString("hex");
}
