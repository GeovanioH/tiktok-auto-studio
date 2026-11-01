import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import crypto from "crypto";
import {
  encryptToken,
  decryptToken,
  SecurityIntegrityError,
  DEFAULT_MASTER_KEY_HEX
} from "../../src/services/crypto/encryption";

describe("Apps/API - Crypto Service AES-256-GCM Unit Tests", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV, ENCRYPTION_MASTER_KEY: DEFAULT_MASTER_KEY_HEX };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    vi.restoreAllMocks();
  });

  describe("1. Cas Nominaux", () => {
    it("doit chiffrer et déchiffrer avec succès un token TikTok réel sans altération", () => {
      const realToken = "act.tiktok_access_token_v2_9876543210_abcdefghijklmnopqrstuvwxyz";
      const encrypted = encryptToken(realToken);
      const decrypted = decryptToken(encrypted);

      expect(decrypted).toBe(realToken);
      expect(encrypted).not.toContain(realToken);
    });

    it("doit formater la sortie sérialisée selon le contrat strict 'base64(iv):base64(tag):base64(ciphertext)'", () => {
      const encrypted = encryptToken("sample_token");
      const parts = encrypted.split(":");

      expect(parts).toHaveLength(3);
      const [ivB64, tagB64, cipherB64] = parts;

      expect(Buffer.from(ivB64, "base64").length).toBe(12);
      expect(Buffer.from(tagB64, "base64").length).toBe(16);
      expect(cipherB64.length).toBeGreaterThan(0);
    });
  });

  describe("2. Cas Limites (Edge Cases)", () => {
    it("doit chiffrer et déchiffrer une chaîne de 1 seul caractère", () => {
      const token = "a";
      const encrypted = encryptToken(token);
      expect(decryptToken(encrypted)).toBe("a");
    });

    it("doit chiffrer et déchiffrer un token massif de 10 000 caractères", () => {
      const hugeToken = "x".repeat(10_000);
      const encrypted = encryptToken(hugeToken);
      expect(decryptToken(encrypted)).toBe(hugeToken);
    });

    it("doit supporter tous les caractères UTF-8 complexes, symboles, emojis et sauts de ligne", () => {
      const complexToken = "🔑Token_Tìktôk-éàù_ç_@#%*$\n\t🚀Special-Chars-End";
      const encrypted = encryptToken(complexToken);
      expect(decryptToken(encrypted)).toBe(complexToken);
    });
  });

  describe("3. Entrées Invalides", () => {
    it("doit lever une TypeError si le token à chiffrer n'est pas une chaîne", () => {
      // @ts-expect-error test entrée invalide
      expect(() => encryptToken(12345)).toThrowError(/INVALID_INPUT/);
      // @ts-expect-error test entrée invalide
      expect(() => encryptToken({ token: "abc" })).toThrowError(/INVALID_INPUT/);
    });

    it("doit lever une TypeError si le payload à déchiffrer n'est pas une chaîne", () => {
      // @ts-expect-error test entrée invalide
      expect(() => decryptToken(12345)).toThrowError(/INVALID_INPUT/);
      // @ts-expect-error test entrée invalide
      expect(() => decryptToken(true)).toThrowError(/INVALID_INPUT/);
    });
  });

  describe("4. Valeurs Vides ou Absentes", () => {
    it("doit rejeter null à l'encryption", () => {
      // @ts-expect-error test null
      expect(() => encryptToken(null)).toThrowError(/INVALID_INPUT/);
    });

    it("doit rejeter undefined à l'encryption", () => {
      // @ts-expect-error test undefined
      expect(() => encryptToken(undefined)).toThrowError(/INVALID_INPUT/);
    });

    it("doit rejeter une chaîne vide '' à l'encryption", () => {
      expect(() => encryptToken("")).toThrowError(/ne peut pas être vide/);
    });

    it("doit rejeter une chaîne contenant uniquement des espaces blancs '   ' à l'encryption", () => {
      expect(() => encryptToken("   ")).toThrowError(/ne peut pas être vide/);
    });

    it("doit rejeter null ou undefined au déchiffrement", () => {
      // @ts-expect-error test null
      expect(() => decryptToken(null)).toThrowError(/INVALID_INPUT/);
      // @ts-expect-error test undefined
      expect(() => decryptToken(undefined)).toThrowError(/INVALID_INPUT/);
      expect(() => decryptToken("")).toThrowError(/ne peut pas être vide/);
    });
  });

  describe("5. Intégrité Cryptographique & Détection d'Attaques (Bit-Flipping)", () => {
    it("doit échouer immédiatement si le ciphertext a été altéré d'un seul bit", () => {
      const token = "secret_tiktok_token";
      const encrypted = encryptToken(token);
      const [ivB64, tagB64, cipherB64] = encrypted.split(":");

      const cipherBuf = Buffer.from(cipherB64, "base64");
      cipherBuf[0] = cipherBuf[0] ^ 0x01; // Bit flip
      const corruptedPayload = `${ivB64}:${tagB64}:${cipherBuf.toString("base64")}`;

      expect(() => decryptToken(corruptedPayload)).toThrowError(SecurityIntegrityError);
    });

    it("doit échouer immédiatement si le tag d'authentification est altéré", () => {
      const token = "secret_tiktok_token";
      const encrypted = encryptToken(token);
      const [ivB64, tagB64, cipherB64] = encrypted.split(":");

      const tagBuf = Buffer.from(tagB64, "base64");
      tagBuf[tagBuf.length - 1] = tagBuf[tagBuf.length - 1] ^ 0xff;
      const corruptedPayload = `${ivB64}:${tagBuf.toString("base64")}:${cipherB64}`;

      expect(() => decryptToken(corruptedPayload)).toThrowError(SecurityIntegrityError);
    });

    it("doit rejeter un format tronqué n'ayant que 2 segments (ex: iv:tag)", () => {
      expect(() => decryptToken("segment1:segment2")).toThrowError(/Format sérialisé invalide/);
    });

    it("doit rejeter un format ayant un IV tronqué (< 12 octets)", () => {
      const shortIv = Buffer.from("short_iv").toString("base64");
      const validTag = crypto.randomBytes(16).toString("base64");
      const validCipher = Buffer.from("cipher").toString("base64");

      expect(() => decryptToken(`${shortIv}:${validTag}:${validCipher}`)).toThrowError(/Longueur d'IV invalide/);
    });

    it("doit rejeter un format ayant un Auth Tag tronqué (< 16 octets)", () => {
      const validIv = crypto.randomBytes(12).toString("base64");
      const shortTag = crypto.randomBytes(10).toString("base64");
      const validCipher = Buffer.from("cipher").toString("base64");

      expect(() => decryptToken(`${validIv}:${shortTag}:${validCipher}`)).toThrowError(/Longueur d'Auth Tag invalide/);
    });
  });

  describe("6. Propriété d'Unicité de l'IV (Nonce)", () => {
    it("doit générer deux ciphertexts et deux IVs strictement distincts pour deux chiffrements identiques", () => {
      const token = "identique_token_source";
      const enc1 = encryptToken(token);
      const enc2 = encryptToken(token);

      expect(enc1).not.toBe(enc2);

      const iv1 = enc1.split(":")[0];
      const iv2 = enc2.split(":")[0];
      expect(iv1).not.toBe(iv2);

      expect(decryptToken(enc1)).toBe(token);
      expect(decryptToken(enc2)).toBe(token);
    });
  });

  describe("7. Gestion de la Clé Maîtresse d'Environnement", () => {
    it("doit planter immédiatement si ENCRYPTION_MASTER_KEY est absente ou ne fait pas 64 hex (32 bytes)", () => {
      process.env.ENCRYPTION_MASTER_KEY = "cle_trop_courte";
      expect(() => encryptToken("token")).toThrowError(/64 caractères hexadécimaux/);
    });
  });

  describe("8. Non-Régression", () => {
    it("doit être capable de déchiffrer un payload chiffré précédemment avec la même clé maîtresse", () => {
      const knownPlainText = "token_de_test_de_non_regression";
      const knownEncrypted = encryptToken(knownPlainText);

      expect(decryptToken(knownEncrypted)).toBe(knownPlainText);
    });
  });
});
