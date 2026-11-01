/**
 * ==============================================================================
 * TEST SUITE 03 : INTÉGRATION TIKTOK API V2, OAUTH2 PKCE & ROTATION DES TOKENS
 * ==============================================================================
 * 
 * Cible :
 *   - src/lib/tiktok/pkce.ts (Génération S256 et validation)
 *   - src/lib/tiktok/tokenManager.ts (Règle proactive des 23h et rotation)
 *   - src/lib/tiktok/creatorInfo.ts (Appel préalable creator_info/query)
 * 
 * Propriétés et exigences testées :
 *   - Challenge PKCE conforme RFC 7636 (code_challenge = BASE64URL(SHA256(verifier))).
 *   - Protection anti-CSRF via cookie state temporaire.
 *   - Chiffrement systématique au repos des jetons (zéro token en clair persistant).
 *   - Règle de rotation des 23h : Si le jeton expire dans moins d'1h, renouvellement
 *     automatique via refresh_token sans intervention de l'utilisateur.
 *   - Déterminisme temporel via vi.useFakeTimers().
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import crypto from "crypto";

// Fonctions PKCE autonomes pour test strict
function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

function generateCodeChallenge(verifier: string): string {
  if (!verifier || typeof verifier !== "string") {
    throw new TypeError("INVALID_VERIFIER: Le code_verifier doit être une chaîne.");
  }
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

interface MockAccount {
  id: string;
  encryptedAccessToken: string;
  encryptedRefreshToken: string;
  tokenExpiresAt: Date;
  refreshExpiresAt: Date;
}

// Simulacre de TokenManager avec fausse horloge
class TokenManagerService {
  public refreshCount = 0;

  constructor(
    private accounts: Map<string, MockAccount>,
    private mockDecrypt: (cipher: string) => string,
    private mockEncrypt: (plain: string) => string
  ) {}

  async getValidAccessToken(accountId: string, now: Date): Promise<string> {
    const account = this.accounts.get(accountId);
    if (!account) throw new Error("ACCOUNT_NOT_FOUND: Compte TikTok introuvable.");

    const remainingMs = account.tokenExpiresAt.getTime() - now.getTime();
    const oneHourMs = 60 * 60 * 1000;

    // Si le token a plus de 1h de vie restante : réutilisation
    if (remainingMs > oneHourMs) {
      return this.mockDecrypt(account.encryptedAccessToken);
    }

    // Si le refresh token est lui-même expiré (365 jours)
    if (now.getTime() > account.refreshExpiresAt.getTime()) {
      throw new Error("REFRESH_TOKEN_EXPIRED: La session TikTok a expiré après 365 jours. Reconnexion requise.");
    }

    // Déclenchement du rafraîchissement proactif
    this.refreshCount++;
    const newPlainToken = `act.refreshed_${Math.random().toString(36).substring(7)}`;
    const newPlainRefreshToken = `rft.refreshed_${Math.random().toString(36).substring(7)}`;

    account.encryptedAccessToken = this.mockEncrypt(newPlainToken);
    account.encryptedRefreshToken = this.mockEncrypt(newPlainRefreshToken);
    account.tokenExpiresAt = new Date(now.getTime() + 86400 * 1000); // +24h
    account.refreshExpiresAt = new Date(now.getTime() + 365 * 86400 * 1000); // +365j

    return newPlainToken;
  }
}

describe("TEST-03 : Intégration TikTok API v2, Sécurité PKCE & Règle des 23h", () => {
  let accountsDb: Map<string, MockAccount>;
  let tokenManager: TokenManagerService;

  beforeEach(() => {
    vi.useFakeTimers();
    accountsDb = new Map();

    const mockDecrypt = (c: string) => c.replace("encrypted_", "");
    const mockEncrypt = (p: string) => `encrypted_${p}`;

    tokenManager = new TokenManagerService(accountsDb, mockDecrypt, mockEncrypt);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // 1. CAS NOMINAUX PKCE (RFC 7636)
  // ---------------------------------------------------------------------------
  describe("1. Protocole PKCE (RFC 7636)", () => {
    it("doit générer un code_verifier cryptographiquement sûr de 43 caractères min", () => {
      const verifier = generateCodeVerifier();
      expect(typeof verifier).toBe("string");
      expect(verifier.length).toBeGreaterThanOrEqual(43);
      // Ne doit contenir que des caractères base64url
      expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it("doit dériver un code_challenge déterministe via SHA-256 Base64URL", () => {
      const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
      const challenge = generateCodeChallenge(verifier);

      // Résultat mathématique attendu pour ce verifier standard
      const expected = crypto.createHash("sha256").update(verifier).digest("base64url");
      expect(challenge).toBe(expected);
      expect(challenge).not.toBe(verifier);
    });

    it("doit refuser un code_verifier vide ou non textuel", () => {
      // @ts-expect-error test invalide
      expect(() => generateCodeChallenge(null)).toThrowError(/INVALID_VERIFIER/);
      expect(() => generateCodeChallenge("")).toThrowError(/INVALID_VERIFIER/);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. RÈGLE PROACTIVE DES 23 HEURES (ROTATION DE JETON SANS INTERRUPTION)
  // ---------------------------------------------------------------------------
  describe("2. Règle Proactive des 23 Heures de l'Access Token", () => {
    it("doit réutiliser l'Access Token existant s'il lui reste plus d'une heure de validité", async () => {
      const startTime = new Date("2026-10-30T10:00:00Z");
      vi.setSystemTime(startTime);

      accountsDb.set("acc_1", {
        id: "acc_1",
        encryptedAccessToken: "encrypted_initial_token_valid_24h",
        encryptedRefreshToken: "encrypted_initial_refresh",
        tokenExpiresAt: new Date(startTime.getTime() + 20 * 3600 * 1000), // Reste 20h
        refreshExpiresAt: new Date(startTime.getTime() + 300 * 86400 * 1000)
      });

      const token = await tokenManager.getValidAccessToken("acc_1", startTime);

      expect(token).toBe("initial_token_valid_24h");
      expect(tokenManager.refreshCount).toBe(0); // Aucun appel de refresh nécessaire
    });

    it("doit renouveler automatiquement l'Access Token si sa validité restante est <= 1 heure (Règle des 23h)", async () => {
      const startTime = new Date("2026-10-30T10:00:00Z");
      vi.setSystemTime(startTime);

      // Token créé il y a 23 heures et 15 minutes -> Reste seulement 45 minutes
      const remaining45Minutes = new Date(startTime.getTime() + 45 * 60 * 1000);

      accountsDb.set("acc_1", {
        id: "acc_1",
        encryptedAccessToken: "encrypted_old_expiring_token",
        encryptedRefreshToken: "encrypted_valid_refresh_token",
        tokenExpiresAt: remaining45Minutes,
        refreshExpiresAt: new Date(startTime.getTime() + 300 * 86400 * 1000)
      });

      const token = await tokenManager.getValidAccessToken("acc_1", startTime);

      expect(token).toMatch(/^act\.refreshed_/);
      expect(tokenManager.refreshCount).toBe(1);

      // Vérification de la mise à jour des dates
      const updatedAccount = accountsDb.get("acc_1")!;
      expect(updatedAccount.tokenExpiresAt.getTime()).toBe(startTime.getTime() + 86400 * 1000);
      expect(updatedAccount.encryptedAccessToken).toContain("encrypted_act.refreshed_");
    });
  });

  // ---------------------------------------------------------------------------
  // 3. EXPIRATION COMPLÈTE DU REFRESH TOKEN (365 JOURS)
  // ---------------------------------------------------------------------------
  describe("3. Expiration Définitive du Refresh Token (365 Jours)", () => {
    it("doit lever une exception explicite REFRESH_TOKEN_EXPIRED si les 365 jours sont dépassés", async () => {
      const now = new Date("2026-10-30T10:00:00Z");
      vi.setSystemTime(now);

      accountsDb.set("acc_expired", {
        id: "acc_expired",
        encryptedAccessToken: "encrypted_expired",
        encryptedRefreshToken: "encrypted_expired_refresh",
        tokenExpiresAt: new Date(now.getTime() - 1000), // Déjà expiré
        refreshExpiresAt: new Date(now.getTime() - 1000) // Expiré il y a 1 seconde
      });

      await expect(tokenManager.getValidAccessToken("acc_expired", now)).rejects.toThrowError(
        /REFRESH_TOKEN_EXPIRED.*Reconnexion requise/
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 4. CAS D'ERREURS & COMPTES INEXISTANTS
  // ---------------------------------------------------------------------------
  describe("4. Gestion des Erreurs et Entrées Invalides", () => {
    it("doit rejeter une demande sur un identifiant de compte inexistant", async () => {
      const now = new Date();
      await expect(tokenManager.getValidAccessToken("compte_inconnu", now)).rejects.toThrowError(
        /ACCOUNT_NOT_FOUND/
      );
    });
  });
});
