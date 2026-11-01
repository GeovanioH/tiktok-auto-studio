import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import crypto from "crypto";
import { generateCodeChallenge, generateCodeVerifier, generateStateToken } from "../../src/services/tiktok/pkce";
import { tiktokClient } from "../../src/services/tiktok/client";
import { prisma } from "../../src/services/db/prisma";
import { getValidAccessToken } from "../../src/services/tiktok/tokenManager";
import { encryptToken, decryptToken } from "../../src/services/crypto/encryption";

describe("Apps/API - TikTok OAuth2 PKCE & Token Rotation Integration Tests", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("1. Protocole PKCE (RFC 7636)", () => {
    it("doit générer un code_verifier cryptographiquement conforme de 43 caractères min", () => {
      const verifier = generateCodeVerifier();
      expect(typeof verifier).toBe("string");
      expect(verifier.length).toBeGreaterThanOrEqual(43);
      expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it("doit dériver un code_challenge déterministe via SHA-256 Base64URL", () => {
      const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
      const challenge = generateCodeChallenge(verifier);

      const expected = crypto.createHash("sha256").update(verifier).digest("base64url");
      expect(challenge).toBe(expected);
      expect(challenge).not.toBe(verifier);
    });

    it("doit refuser un code_verifier vide ou non textuel", () => {
      // @ts-expect-error test invalide
      expect(() => generateCodeChallenge(null)).toThrowError(/INVALID_VERIFIER/);
      expect(() => generateCodeChallenge("")).toThrowError(/INVALID_VERIFIER/);
    });

    it("doit générer une URL de connexion complète avec S256 et scopes requis", () => {
      const state = generateStateToken();
      const verifier = generateCodeVerifier();
      const challenge = generateCodeChallenge(verifier);

      const authUrl = tiktokClient.getAuthorizationUrl(state, challenge);

      expect(authUrl).toContain("https://www.tiktok.com/v2/auth/authorize/");
      expect(authUrl).toContain("code_challenge_method=S256");
      expect(authUrl).toContain(`code_challenge=${challenge}`);
      expect(authUrl).toContain(`state=${state}`);
      expect(authUrl).toContain("user.info.basic");
      expect(authUrl).toContain("video.publish");
    });
  });

  describe("2. Règle Proactive des 23 Heures de l'Access Token", () => {
    it("doit réutiliser l'Access Token s'il lui reste plus d'une heure de validité", async () => {
      const now = new Date("2026-10-30T10:00:00Z");
      vi.setSystemTime(now);

      const plainToken = "act.tiktok_valid_long_time";
      const plainRefresh = "rft.tiktok_valid_long_time";

      vi.spyOn(prisma.tikTokAccount, "findUnique").mockResolvedValue({
        id: "acc_active",
        userId: "usr_1",
        openId: "open_active",
        username: "active_user",
        displayName: "Active User",
        avatarUrl: "https://example.com/avatar.jpg",
        unionId: null,
        encryptedAccessToken: encryptToken(plainToken),
        encryptedRefreshToken: encryptToken(plainRefresh),
        tokenExpiresAt: new Date(now.getTime() + 20 * 3600 * 1000), // Reste 20h
        refreshExpiresAt: new Date(now.getTime() + 300 * 86400 * 1000),
        maxVideoDuration: null,
        privacyLevelsAllowed: null,
        isCreatorInfoVerified: true,
        createdAt: now,
        updatedAt: now
      });

      const refreshSpy = vi.spyOn(tiktokClient, "refreshAccessToken");

      const token = await getValidAccessToken("acc_active", now);

      expect(token).toBe(plainToken);
      expect(refreshSpy).not.toHaveBeenCalled();
    });

    it("doit renouveler automatiquement l'Access Token si sa validité restante est <= 1 heure (Règle des 23h)", async () => {
      const now = new Date("2026-10-30T10:00:00Z");
      vi.setSystemTime(now);

      const initialPlainToken = "act.tiktok_expiring_soon";
      const initialPlainRefresh = "rft.tiktok_valid_refresh";

      vi.spyOn(prisma.tikTokAccount, "findUnique").mockResolvedValue({
        id: "acc_to_refresh",
        userId: "usr_1",
        openId: "open_refresh",
        username: "refresh_user",
        displayName: "Refresh User",
        avatarUrl: "https://example.com/avatar.jpg",
        unionId: null,
        encryptedAccessToken: encryptToken(initialPlainToken),
        encryptedRefreshToken: encryptToken(initialPlainRefresh),
        tokenExpiresAt: new Date(now.getTime() + 30 * 60 * 1000), // Reste 30 minutes
        refreshExpiresAt: new Date(now.getTime() + 300 * 86400 * 1000),
        maxVideoDuration: null,
        privacyLevelsAllowed: null,
        isCreatorInfoVerified: true,
        createdAt: now,
        updatedAt: now
      });

      const refreshedMockResponse = {
        access_token: "act.tiktok_brand_new_token_123",
        refresh_token: "rft.tiktok_brand_new_refresh_456",
        expires_in: 86400,
        refresh_expires_in: 31536000,
        open_id: "open_refresh",
        scope: "user.info.basic,video.publish",
        token_type: "Bearer"
      };

      vi.spyOn(tiktokClient, "refreshAccessToken").mockResolvedValue(refreshedMockResponse);
      const updateSpy = vi.spyOn(prisma.tikTokAccount, "update").mockResolvedValue({} as any);

      const token = await getValidAccessToken("acc_to_refresh", now);

      expect(token).toBe(refreshedMockResponse.access_token);
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "acc_to_refresh" },
          data: expect.objectContaining({
            tokenExpiresAt: new Date(now.getTime() + 86400 * 1000)
          })
        })
      );
    });
  });

  describe("3. Expiration Définitive du Refresh Token (365 Jours)", () => {
    it("doit lever une exception explicite REFRESH_TOKEN_EXPIRED si les 365 jours sont dépassés", async () => {
      const now = new Date("2026-10-30T10:00:00Z");
      vi.setSystemTime(now);

      vi.spyOn(prisma.tikTokAccount, "findUnique").mockResolvedValue({
        id: "acc_expired",
        userId: "usr_1",
        openId: "open_expired",
        username: "expired_user",
        displayName: "Expired User",
        avatarUrl: "https://example.com/avatar.jpg",
        unionId: null,
        encryptedAccessToken: encryptToken("act.expired"),
        encryptedRefreshToken: encryptToken("rft.expired"),
        tokenExpiresAt: new Date(now.getTime() - 1000),
        refreshExpiresAt: new Date(now.getTime() - 1000), // Refresh token expiré
        maxVideoDuration: null,
        privacyLevelsAllowed: null,
        isCreatorInfoVerified: true,
        createdAt: now,
        updatedAt: now
      });

      await expect(getValidAccessToken("acc_expired", now)).rejects.toThrowError(
        /REFRESH_TOKEN_EXPIRED.*Reconnexion requise/
      );
    });
  });

  describe("4. Gestion des Erreurs et Entrées Invalides", () => {
    it("doit rejeter une demande sur un identifiant de compte inexistant", async () => {
      const now = new Date();
      vi.spyOn(prisma.tikTokAccount, "findUnique").mockResolvedValue(null);

      await expect(getValidAccessToken("inexistant_id", now)).rejects.toThrowError(
        /ACCOUNT_NOT_FOUND/
      );
    });
  });
});
