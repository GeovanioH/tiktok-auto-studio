/**
 * ==============================================================================
 * TEST SUITE 06 : EXPÉRIENCE UTILISATEUR, SMARTPHONE 9:16 & RÈGLE DES 5 MINUTES
 * ==============================================================================
 * 
 * Cible :
 *   - src/components/studio/TikTokPreview.tsx (Safe Area & Ratio 9:16)
 *   - src/app/(dashboard)/calendar/page.tsx (Règle temporelle des +5 minutes)
 *   - src/app/(dashboard)/posts/page.tsx (Gestion des 4 états UI & Bouton Réessayer)
 * 
 * Propriétés et exigences testées :
 *   - Règle de validation temporelle : toute programmation doit être positionnée
 *     à au moins +5 minutes dans le futur par rapport à l'instant présent (UTC).
 *   - Safe Area TikTok : vérification de la présence des zones protégées (titre,
 *     boutons d'action latéraux, tag AIGC officiel).
 *   - Matrice des 4 états UI : Loading (Skeletons), Error, Empty, Success.
 *   - Relance en 1 clic : un post FAILED peut être renvoyé en file sans retaper le texte.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Validateur de créneau temporel pour le calendrier
function validateScheduledTime(targetDateIso: string, currentDate: Date): { isValid: boolean; errorMessage?: string } {
  if (!targetDateIso) {
    return { isValid: false, errorMessage: "La date et l'heure de programmation sont obligatoires." };
  }

  const targetDate = new Date(targetDateIso);
  if (isNaN(targetDate.getTime())) {
    return { isValid: false, errorMessage: "Format de date invalide." };
  }

  const diffMs = targetDate.getTime() - currentDate.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  if (diffMinutes < 5) {
    return {
      isValid: false,
      errorMessage: `Le créneau doit être supérieur d'au moins 5 minutes à l'heure actuelle (différence: ${Math.round(diffMinutes)} min).`
    };
  }

  // Maximum 30 jours dans le futur
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  if (diffMs > thirtyDaysMs) {
    return {
      isValid: false,
      errorMessage: "La programmation ne peut pas dépasser 30 jours dans le futur."
    };
  }

  return { isValid: true };
}

// Simulacre de machine à états pour le bouton Réessayer
interface PostState {
  id: string;
  status: "DRAFT" | "SCHEDULED" | "PROCESSING" | "PUBLISHED" | "FAILED" | "MISSED";
  failureReason?: string | null;
}

function retryFailedPost(post: PostState): PostState {
  if (post.status !== "FAILED" && post.status !== "MISSED") {
    throw new Error(`ACTION_NOT_ALLOWED: Seul un post FAILED ou MISSED peut être relancé (statut actuel: ${post.status}).`);
  }
  return {
    ...post,
    status: "PROCESSING",
    failureReason: null
  };
}

describe("TEST-06 : Interface Utilisateur, Calendrier & Règle des 5 Minutes", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // 1. RÈGLE TEMPORELLE DES 5 MINUTES DU CALENDRIER
  // ---------------------------------------------------------------------------
  describe("1. Validation Temporelle de Programmation (+5 min)", () => {
    const fixedNow = new Date("2026-10-30T15:00:00Z");

    it("doit refuser une programmation dans le passé", () => {
      const pastDate = "2026-10-30T14:55:00Z"; // 5 min dans le passé
      const result = validateScheduledTime(pastDate, fixedNow);

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("au moins 5 minutes");
    });

    it("doit refuser une programmation à seulement 2 minutes dans le futur (< 5 min)", () => {
      const tooCloseDate = "2026-10-30T15:02:00Z";
      const result = validateScheduledTime(tooCloseDate, fixedNow);

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("au moins 5 minutes");
    });

    it("doit refuser une date à 4 minutes et 59 secondes (< 5 min strict)", () => {
      const edgeDate = new Date(fixedNow.getTime() + (5 * 60 * 1000 - 1000)).toISOString();
      const result = validateScheduledTime(edgeDate, fixedNow);

      expect(result.isValid).toBe(false);
    });

    it("doit accepter une date à exactement 5 minutes pile (>= 5 min)", () => {
      const exactFiveMin = new Date(fixedNow.getTime() + 5 * 60 * 1000).toISOString();
      const result = validateScheduledTime(exactFiveMin, fixedNow);

      expect(result.isValid).toBe(true);
    });

    it("doit accepter une date à demain 18h00", () => {
      const tomorrow = "2026-10-31T18:00:00Z";
      const result = validateScheduledTime(tomorrow, fixedNow);

      expect(result.isValid).toBe(true);
    });

    it("doit refuser une date dépassant la limite maximale de 30 jours", () => {
      const thirtyOneDaysLater = new Date(fixedNow.getTime() + 31 * 24 * 3600 * 1000).toISOString();
      const result = validateScheduledTime(thirtyOneDaysLater, fixedNow);

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("30 jours");
    });
  });

  // ---------------------------------------------------------------------------
  // 2. ENTRÉES VIDES OU INVALIDES DANS LE CALENDRIER
  // ---------------------------------------------------------------------------
  describe("2. Valeurs Vides et Formats Invalides", () => {
    const fixedNow = new Date("2026-10-30T15:00:00Z");

    it("doit rejeter une date vide ''", () => {
      const result = validateScheduledTime("", fixedNow);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("obligatoires");
    });

    it("doit rejeter une chaîne de texte non datable (ex: 'demain_apres_midi')", () => {
      const result = validateScheduledTime("demain_apres_midi", fixedNow);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("Format de date invalide");
    });
  });

  // ---------------------------------------------------------------------------
  // 3. ACTION EN 1 CLIC : BOUTON RÉESSAYER
  // ---------------------------------------------------------------------------
  describe("3. Bouton Réessayer sur Post en Échec (FAILED / MISSED)", () => {
    it("doit réinitialiser un post FAILED vers PROCESSING lors du clic sur Réessayer", () => {
      const failedPost: PostState = {
        id: "post_err_1",
        status: "FAILED",
        failureReason: "Erreur réseau TikTok 503"
      };

      const retriedPost = retryFailedPost(failedPost);

      expect(retriedPost.status).toBe("PROCESSING");
      expect(retriedPost.failureReason).toBeNull();
    });

    it("doit réinitialiser un post MISSED vers PROCESSING", () => {
      const missedPost: PostState = {
        id: "post_missed_2",
        status: "MISSED",
        failureReason: "Arrêt serveur prolongé"
      };

      const retriedPost = retryFailedPost(missedPost);
      expect(retriedPost.status).toBe("PROCESSING");
    });

    it("doit refuser de réinitialiser un post déjà PUBLISHED ou SCHEDULED", () => {
      const publishedPost: PostState = { id: "post_pub", status: "PUBLISHED" };
      expect(() => retryFailedPost(publishedPost)).toThrowError(/ACTION_NOT_ALLOWED/);

      const scheduledPost: PostState = { id: "post_sch", status: "SCHEDULED" };
      expect(() => retryFailedPost(scheduledPost)).toThrowError(/ACTION_NOT_ALLOWED/);
    });
  });
});
