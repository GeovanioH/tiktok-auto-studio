import { Worker, Job } from "bullmq";
import { prisma, PostStatus } from "../services/db/prisma";
import { executeTikTokPublish } from "../services/tiktok/publisher";
import { acquireRedlock, releaseRedlock } from "../services/queue/redlock";
import { getRedisConnection, PublishJobData, QUEUE_NAME } from "../services/queue/publishQueue";

export function createPublishWorker(): Worker<PublishJobData> {
  const connection = getRedisConnection();

  return new Worker<PublishJobData>(
    QUEUE_NAME,
    async (job: Job<PublishJobData>) => {
      const { postId } = job.data;
      const lockKey = `lock:post:${postId}`;
      const lockToken = await acquireRedlock(lockKey, 120 * 1000);

      if (!lockToken) {
        console.warn(`[WORKER] Lock non obtenu pour le post ${postId}, exécution ignorée.`);
        return;
      }

      try {
        // 1. Passage en statut PROCESSING
        await prisma.post.update({
          where: { id: postId },
          data: { status: PostStatus.PROCESSING }
        });

        // 2. Publication TikTok v2
        const publishId = await executeTikTokPublish(postId);

        // 3. Clôture en statut PUBLISHED
        await prisma.post.update({
          where: { id: postId },
          data: {
            status: PostStatus.PUBLISHED,
            publishedAt: new Date(),
            tiktokPublishId: publishId,
            failureReason: null
          }
        });

        // 4. Log d'audit
        await prisma.publishAuditLog.create({
          data: {
            postId,
            eventType: "PUBLISH_CONFIRMED",
            httpStatusCode: 200,
            rawResponse: { publishId }
          }
        });

        console.log(`[WORKER] Post ${postId} publié avec succès sur TikTok (ID: ${publishId}).`);
      } catch (error: any) {
        console.error(`[WORKER] Erreur lors de la publication du post ${postId}:`, error.message);

        const isLastAttempt = job.attemptsMade + 1 >= (job.opts.attempts || 3);

        if (isLastAttempt) {
          await prisma.post.update({
            where: { id: postId },
            data: {
              status: PostStatus.FAILED,
              failureReason: error.message
            }
          });
        }

        await prisma.publishAuditLog.create({
          data: {
            postId,
            eventType: isLastAttempt ? "FINAL_FAILURE" : "RETRY_ATTEMPT",
            rawResponse: { error: error.message, attempt: job.attemptsMade + 1 }
          }
        });

        throw error; // Déclenche le backoff BullMQ si tentatives restantes
      } finally {
        await releaseRedlock(lockKey, lockToken);
      }
    },
    {
      connection,
      concurrency: 5
    }
  );
}

export const publishWorker = createPublishWorker();
