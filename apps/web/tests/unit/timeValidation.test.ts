import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { validateScheduledTime, retryFailedPost, type PostState } from "../../src/lib/utils";

describe("Web Unit Tests : Time Validation & Post Recovery State", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("Validation temporelle du calendrier (+5 min strict)", () => {
    const fixedNow = new Date("2026-10-30T15:00:00Z");

    it("rejette les dates dans le passé", () => {
      const res = validateScheduledTime("2026-10-30T14:50:00Z", fixedNow);
      expect(res.isValid).toBe(false);
      expect(res.errorMessage).toContain("au moins 5 minutes");
    });

    it("rejette un créneau planifié à +3 minutes", () => {
      const res = validateScheduledTime("2026-10-30T15:03:00Z", fixedNow);
      expect(res.isValid).toBe(false);
    });

    it("accepte un créneau exactement à +5 minutes", () => {
      const fiveMinLater = new Date(fixedNow.getTime() + 5 * 60 * 1000).toISOString();
      const res = validateScheduledTime(fiveMinLater, fixedNow);
      expect(res.isValid).toBe(true);
    });

    it("rejette les dates au-delà de 30 jours", () => {
      const thirtyOneDays = new Date(fixedNow.getTime() + 31 * 24 * 3600 * 1000).toISOString();
      const res = validateScheduledTime(thirtyOneDays, fixedNow);
      expect(res.isValid).toBe(false);
      expect(res.errorMessage).toContain("30 jours");
    });

    it("rejette une chaîne de date vide", () => {
      const res = validateScheduledTime("", fixedNow);
      expect(res.isValid).toBe(false);
      expect(res.errorMessage).toContain("obligatoires");
    });
  });

  describe("Relance de post (retryFailedPost)", () => {
    it("relance un post FAILED vers PROCESSING en vidant failureReason", () => {
      const failedPost: PostState = {
        id: "post_f1",
        status: "FAILED",
        failureReason: "TikTok API error 500",
      };
      const retried = retryFailedPost(failedPost);
      expect(retried.status).toBe("PROCESSING");
      expect(retried.failureReason).toBeNull();
    });

    it("relance un post MISSED vers PROCESSING", () => {
      const missedPost: PostState = {
        id: "post_m1",
        status: "MISSED",
        failureReason: "Serveur éteint pendant 30m",
      };
      const retried = retryFailedPost(missedPost);
      expect(retried.status).toBe("PROCESSING");
      expect(retried.failureReason).toBeNull();
    });

    it("interdit la relance d'un post déjà PUBLISHED", () => {
      const pub: PostState = { id: "post_ok", status: "PUBLISHED" };
      expect(() => retryFailedPost(pub)).toThrowError(/ACTION_NOT_ALLOWED/);
    });
  });
});
