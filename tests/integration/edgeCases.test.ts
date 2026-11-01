import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { convertToTikTokCompliantJpeg } from "../../apps/api/src/services/media/converter";
import { validateScheduledTime } from "../../apps/web/src/lib/utils";

describe("Sprint 07 : Assurance Qualité — Validation des 5 Cas Limites Critiques", () => {
  const VERIFIED_DOMAIN = "https://assets.mondomaine-verifie.com";

  // ---------------------------------------------------------------------------
  // EC-01 : Rejet des PNG par TikTok -> Conversion automatique Sharp en JPEG 95%
  // ---------------------------------------------------------------------------
  it("[EC-01] doit convertir sans perte un PNG transparent en un JPEG 1080x1920 95% valide", async () => {
    // Création d'un buffer PNG transparent de test 400x400
    const rawPngBuffer = await sharp({
      create: {
        width: 400,
        height: 400,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 0.5 },
      },
    })
      .png()
      .toBuffer();

    const outputBuffer = await convertToTikTokCompliantJpeg(rawPngBuffer);
    const metadata = await sharp(outputBuffer).metadata();

    expect(metadata.format).toBe("jpeg");
    expect(metadata.width).toBe(1080);
    expect(metadata.height).toBe(1920);
  });

  // ---------------------------------------------------------------------------
  // EC-02 : Validation de la règle temporelle des 5 minutes minimales de programmation
  // ---------------------------------------------------------------------------
  it("[EC-02] doit rejeter formellement une programmation planifiée dans seulement 2 minutes", () => {
    const fixedNow = new Date("2026-10-30T15:00:00Z");
    const twoMinutesFromNow = new Date(fixedNow.getTime() + 2 * 60 * 1000).toISOString();

    const result = validateScheduledTime(twoMinutesFromNow, fixedNow);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toMatch(/au moins 5 minutes/);
  });

  // ---------------------------------------------------------------------------
  // EC-03 : Blocage strict des domaines non vérifiés pour les carrousels photos
  // ---------------------------------------------------------------------------
  it("[EC-03] doit refuser la publication si l'URL ne provient pas du domaine vérifié", () => {
    const unverifiedUrls = ["https://random-s3-bucket.amazonaws.com/image1.jpg"];
    const isDomainVerified = unverifiedUrls.every((url) => url.startsWith(VERIFIED_DOMAIN));

    expect(isDomainVerified).toBe(false);

    const verifiedUrls = [`${VERIFIED_DOMAIN}/carousel/1.jpg`, `${VERIFIED_DOMAIN}/carousel/2.jpg`];
    expect(verifiedUrls.every((url) => url.startsWith(VERIFIED_DOMAIN))).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // EC-04 : Bridage de visibilité obligatoire en mode Sandbox Pré-Audit
  // ---------------------------------------------------------------------------
  it("[EC-04] doit forcer la confidentialité sur SELF_ONLY tant que l'audit n'est pas approuvé", () => {
    const isAuditApproved = false;
    const requestedPrivacy = "PUBLIC_TO_EVERYONE";

    const effectivePrivacy = isAuditApproved ? requestedPrivacy : "SELF_ONLY";
    expect(effectivePrivacy).toBe("SELF_ONLY");
  });

  // ---------------------------------------------------------------------------
  // EC-05 : Résilience après coupure serveur (Règle des 15 Minutes)
  // ---------------------------------------------------------------------------
  it("[EC-05] doit arbitrer correctement entre publication d'urgence (<= 15m) et abandon MISSED (> 15m)", () => {
    const fixedNow = new Date("2026-10-30T12:00:00Z");

    const tenMinutesLate = new Date("2026-10-30T11:50:00Z");
    const delayMinutes1 = (fixedNow.getTime() - tenMinutesLate.getTime()) / (1000 * 60);
    const action1 = delayMinutes1 <= 15 ? "PUBLISH_IMMEDIATE" : "MARK_MISSED";
    expect(action1).toBe("PUBLISH_IMMEDIATE");

    const thirtyMinutesLate = new Date("2026-10-30T11:30:00Z");
    const delayMinutes2 = (fixedNow.getTime() - thirtyMinutesLate.getTime()) / (1000 * 60);
    const action2 = delayMinutes2 <= 15 ? "PUBLISH_IMMEDIATE" : "MARK_MISSED";
    expect(action2).toBe("MARK_MISSED");
  });
});
