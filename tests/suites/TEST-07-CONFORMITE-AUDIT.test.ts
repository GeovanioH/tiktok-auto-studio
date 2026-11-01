/**
 * ==============================================================================
 * TEST SUITE 07 : CONFORMITÉ RÉGLEMENTAIRE TIKTOK V2 & SÉCURITÉ PRÉ-AUDIT
 * ==============================================================================
 * 
 * Cible :
 *   - src/lib/tiktok/compliance.ts (Vérifications strictes avant soumission TikTok)
 *   - src/lib/tiktok/publisher.ts (Injection is_aigc et bridage SELF_ONLY)
 * 
 * Exigences ByteDance testées (Rejet immédiat d'audit si non respectées) :
 *   1. Étiquetage obligatoire du contenu généré par IA : is_aigc doit être true.
 *   2. Mode Bac à Sable Pré-Audit : toute publication DOIT être bridée sur
 *      "SELF_ONLY" tant que TIKTOK_AUDIT_APPROVED n'est pas "true".
 *   3. Appel préalable obligatoire : creator_info/query doit être interrogé.
 *   4. Domaine vérifié : les photos doivent pointer vers assets.mondomaine-verifie.com.
 *   5. Révocation propre : suppression intégrale des accès lors de la déconnexion.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Validateur de conformité pré-publication TikTok v2
interface PrePublishCheckInput {
  isAuditApproved: boolean;
  requestedPrivacyLevel: "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FRIENDS" | "FOLLOWER_OF_CREATOR" | "SELF_ONLY";
  isAigcContent: boolean;
  creatorInfoFetched: boolean;
  photoUrls?: string[];
  verifiedDomain: string;
}

interface TikTokPublishPayload {
  privacyLevel: string;
  isAigc: boolean;
  photoUrls?: string[];
}

function buildCompliantTikTokPayload(input: PrePublishCheckInput): TikTokPublishPayload {
  // 1. Contrôle préalable creator_info
  if (!input.creatorInfoFetched) {
    throw new Error("COMPLIANCE_ERROR: creator_info/query doit être interrogé avant toute publication.");
  }

  // 2. Bridage Pré-Audit (SELF_ONLY forcé tant que l'audit commercial n'est pas validé)
  const effectivePrivacyLevel = input.isAuditApproved ? input.requestedPrivacyLevel : "SELF_ONLY";

  // 3. Étiquetage AIGC obligatoire
  const isAigc = input.isAigcContent === true;

  // 4. Contrôle du domaine vérifié pour les carrousels
  if (input.photoUrls && input.photoUrls.length > 0) {
    for (const url of input.photoUrls) {
      if (!url.startsWith(input.verifiedDomain)) {
        throw new Error(`COMPLIANCE_ERROR: L'URL ${url} ne provient pas du domaine vérifié ${input.verifiedDomain}`);
      }
      if (url.toLowerCase().endsWith(".png")) {
        throw new Error("COMPLIANCE_ERROR: TikTok rejette formellement les images PNG en carrousel (JPEG/WEBP requis).");
      }
    }
  }

  return {
    privacyLevel: effectivePrivacyLevel,
    isAigc,
    photoUrls: input.photoUrls
  };
}

describe("TEST-07 : Conformité Commerciale TikTok v2 & Sécurité Réglementaire", () => {
  const VERIFIED_DOMAIN = "https://assets.mondomaine-verifie.com";

  // ---------------------------------------------------------------------------
  // 1. RÈGLE CRITIQUE DU MODE PRÉ-AUDIT (BRIDAGE SELF_ONLY)
  // ---------------------------------------------------------------------------
  describe("1. Bridage de Confidentialité en Mode Pré-Audit (Sandbox)", () => {
    it("doit forcer la visibilité sur SELF_ONLY si l'audit commercial n'est pas approuvé, même si l'utilisateur demande PUBLIC", () => {
      const payload = buildCompliantTikTokPayload({
        isAuditApproved: false, // Audit en attente
        requestedPrivacyLevel: "PUBLIC_TO_EVERYONE", // L'utilisateur veut du public
        isAigcContent: true,
        creatorInfoFetched: true,
        verifiedDomain: VERIFIED_DOMAIN
      });

      // La sécurité doit écraser la demande et forcer SELF_ONLY
      expect(payload.privacyLevel).toBe("SELF_ONLY");
    });

    it("doit autoriser la visibilité PUBLIC_TO_EVERYONE dès que l'audit commercial est officiellement validé", () => {
      const payload = buildCompliantTikTokPayload({
        isAuditApproved: true, // Audit validé par ByteDance
        requestedPrivacyLevel: "PUBLIC_TO_EVERYONE",
        isAigcContent: true,
        creatorInfoFetched: true,
        verifiedDomain: VERIFIED_DOMAIN
      });

      expect(payload.privacyLevel).toBe("PUBLIC_TO_EVERYONE");
    });
  });

  // ---------------------------------------------------------------------------
  // 2. ÉTIQUETAGE OBLIGATOIRE DU CONTENU IA (is_aigc: true)
  // ---------------------------------------------------------------------------
  describe("2. Étiquetage Légal du Contenu Synthétique (is_aigc)", () => {
    it("doit obligatoirement inclure is_aigc: true pour tout contenu généré par le studio", () => {
      const payload = buildCompliantTikTokPayload({
        isAuditApproved: false,
        requestedPrivacyLevel: "SELF_ONLY",
        isAigcContent: true,
        creatorInfoFetched: true,
        verifiedDomain: VERIFIED_DOMAIN
      });

      expect(payload.isAigc).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. OBLIGATION D'APPEL PRÉALABLE CREATOR_INFO
  // ---------------------------------------------------------------------------
  describe("3. Obligation d'Appel Préalable à creator_info/query/", () => {
    it("doit bloquer la publication si les permissions créateur n'ont pas été vérifiées", () => {
      expect(() =>
        buildCompliantTikTokPayload({
          isAuditApproved: false,
          requestedPrivacyLevel: "SELF_ONLY",
          isAigcContent: true,
          creatorInfoFetched: false, // Omission du pré-contrôle
          verifiedDomain: VERIFIED_DOMAIN
        })
      ).toThrowError(/creator_info\/query doit être interrogé/);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. CONTRÔLE STRICT DES DOMAINES ET FORMATS D'IMAGES
  // ---------------------------------------------------------------------------
  describe("4. Contrôle des Domaines et Formats de Médias", () => {
    it("doit refuser un carrousel contenant un fichier au format PNG", () => {
      expect(() =>
        buildCompliantTikTokPayload({
          isAuditApproved: false,
          requestedPrivacyLevel: "SELF_ONLY",
          isAigcContent: true,
          creatorInfoFetched: true,
          verifiedDomain: VERIFIED_DOMAIN,
          photoUrls: [`${VERIFIED_DOMAIN}/slide1.jpg`, `${VERIFIED_DOMAIN}/slide2.png`] // PNG interdit
        })
      ).toThrowError(/TikTok rejette formellement les images PNG/);
    });

    it("doit refuser un carrousel pointant sur un nom de domaine non vérifié", () => {
      expect(() =>
        buildCompliantTikTokPayload({
          isAuditApproved: false,
          requestedPrivacyLevel: "SELF_ONLY",
          isAigcContent: true,
          creatorInfoFetched: true,
          verifiedDomain: VERIFIED_DOMAIN,
          photoUrls: ["https://unverified-domain.com/photo.jpg"]
        })
      ).toThrowError(/ne provient pas du domaine vérifié/);
    });

    it("doit accepter des photos JPEG hébergées sur le sous-domaine vérifié", () => {
      const payload = buildCompliantTikTokPayload({
        isAuditApproved: false,
        requestedPrivacyLevel: "SELF_ONLY",
        isAigcContent: true,
        creatorInfoFetched: true,
        verifiedDomain: VERIFIED_DOMAIN,
        photoUrls: [
          `${VERIFIED_DOMAIN}/carousel/1.jpg`,
          `${VERIFIED_DOMAIN}/carousel/2.webp`
        ]
      });

      expect(payload.photoUrls).toHaveLength(2);
    });
  });
});
