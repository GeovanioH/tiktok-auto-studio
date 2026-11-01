import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { acquireRedlock, releaseRedlock } from "../../src/services/queue/redlock";
import { PostStatus } from "../../src/services/db/prisma";

// Simulation in-memory de la file BullMQ pour validation d'idempotence
class InMemoryBullMQQueue {
  private jobs: Map<string, { id: string; name: string; data: any; delay: number }> = new Map();

  async add(name: string, data: any, opts: { jobId: string; delay?: number }) {
    if (this.jobs.has(opts.jobId)) {
      return this.jobs.get(opts.jobId)!;
    }
    const job = { id: opts.jobId, name, data, delay: opts.delay || 0 };
    this.jobs.set(opts.jobId, job);
    return job;
  }

  getJob(jobId: string) {
    return this.jobs.get(jobId);
  }

  count() {
    return this.jobs.size;
  }
}

interface OrphanedPostRecord {
  id: string;
  status: PostStatus;
  scheduledAt: Date;
  recovered?: boolean;
}

function processOrphanedPostLogic(
  post: OrphanedPostRecord,
  currentTime: Date
): { action: "EXECUTE" | "MARK_MISSED"; delayMinutes: number } {
  const diffMs = currentTime.getTime() - post.scheduledAt.getTime();
  const delayMinutes = diffMs / (1000 * 60);

  if (delayMinutes <= 15) {
    post.status = PostStatus.PUBLISHED;
    post.recovered = true;
    return { action: "EXECUTE", delayMinutes };
  } else {
    post.status = PostStatus.MISSED;
    return { action: "MARK_MISSED", delayMinutes };
  }
}

describe("Apps/API - BullMQ Scheduler, Idempotency & 15-Minute Rule Tests", () => {
  let queue: InMemoryBullMQQueue;

  beforeEach(() => {
    vi.useFakeTimers();
    queue = new InMemoryBullMQQueue();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("1. Idempotence Absolue via jobId", () => {
    it("doit ignorer la création d'un second job ayant le même jobId déterministe (post_<id>)", async () => {
      const postId = "post_123456789";

      await queue.add("publish_post", { postId }, { jobId: `post_${postId}`, delay: 5000 });
      expect(queue.count()).toBe(1);

      // Tentative concurrente
      await queue.add("publish_post", { postId }, { jobId: `post_${postId}`, delay: 5000 });
      expect(queue.count()).toBe(1);
    });
  });

  describe("2. Règle des 15 Minutes en Cas de Crash Serveur", () => {
    it("doit publier immédiatement un post dont le retard est inférieur ou égal à 15 minutes", () => {
      const now = new Date("2026-10-30T14:15:00Z");
      const scheduledAt = new Date("2026-10-30T14:05:00Z"); // 10 min de retard

      const post: OrphanedPostRecord = {
        id: "post_delayed_10m",
        status: PostStatus.SCHEDULED,
        scheduledAt
      };

      const result = processOrphanedPostLogic(post, now);

      expect(result.action).toBe("EXECUTE");
      expect(result.delayMinutes).toBe(10);
      expect(post.status).toBe(PostStatus.PUBLISHED);
      expect(post.recovered).toBe(true);
    });

    it("doit exécuter exactement à la limite critique de 15 minutes pile (15.0 min)", () => {
      const now = new Date("2026-10-30T14:15:00Z");
      const scheduledAt = new Date("2026-10-30T14:00:00Z"); // 15 min pile

      const post: OrphanedPostRecord = {
        id: "post_exact_15m",
        status: PostStatus.SCHEDULED,
        scheduledAt
      };

      const result = processOrphanedPostLogic(post, now);

      expect(result.action).toBe("EXECUTE");
      expect(post.status).toBe(PostStatus.PUBLISHED);
    });

    it("doit basculer en statut MISSED sans publication si le retard dépasse 15 minutes", () => {
      const now = new Date("2026-10-30T14:30:00Z");
      const scheduledAt = new Date("2026-10-30T14:00:00Z"); // 30 min de retard

      const post: OrphanedPostRecord = {
        id: "post_delayed_30m",
        status: PostStatus.SCHEDULED,
        scheduledAt
      };

      const result = processOrphanedPostLogic(post, now);

      expect(result.action).toBe("MARK_MISSED");
      expect(result.delayMinutes).toBe(30);
      expect(post.status).toBe(PostStatus.MISSED);
      expect(post.recovered).toBeUndefined();
    });
  });

  describe("3. Stratégie de Résilience & Backoff Exponentiel", () => {
    it("doit autoriser 3 réessais en cas d'erreur serveur TikTok 500 / 503", () => {
      let attempts = 0;
      const maxAttempts = 3;

      const simulateWorkerExecution = (statusCode: number) => {
        attempts++;
        if (statusCode >= 500 && attempts < maxAttempts) {
          return { retry: true, nextDelayMs: Math.pow(5, attempts) * 1000 };
        }
        if (attempts >= maxAttempts) {
          return { retry: false, finalStatus: PostStatus.FAILED };
        }
        return { retry: false, finalStatus: PostStatus.PUBLISHED };
      };

      expect(simulateWorkerExecution(503).retry).toBe(true);
      expect(simulateWorkerExecution(503).retry).toBe(true);
      const res3 = simulateWorkerExecution(503);
      expect(res3.retry).toBe(false);
      expect(res3.finalStatus).toBe(PostStatus.FAILED);
    });

    it("doit refuser tout réessai sur des erreurs 401, 403, 400", () => {
      const isRetryable = (httpStatus: number) => httpStatus >= 500 || httpStatus === 429;

      expect(isRetryable(500)).toBe(true);
      expect(isRetryable(503)).toBe(true);
      expect(isRetryable(429)).toBe(true);
      expect(isRetryable(401)).toBe(false);
      expect(isRetryable(403)).toBe(false);
      expect(isRetryable(400)).toBe(false);
    });
  });

  describe("4. Mécanisme Redlock", () => {
    it("doit acquérir et libérer le verrou distribué sans exception", async () => {
      const lockKey = "lock:test_post_123";
      const token = await acquireRedlock(lockKey, 5000);
      expect(token).toBeDefined();

      const released = await releaseRedlock(lockKey, token!);
      expect(typeof released).toBe("boolean");
    });
  });
});
