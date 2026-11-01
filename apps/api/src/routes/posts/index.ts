import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma, PostStatus } from "../../services/db/prisma";
import { schedulePostJob } from "../../services/queue/publishQueue";
import { executeTikTokPublish } from "../../services/tiktok/publisher";

const ScheduleRequestSchema = z.object({
  postId: z.string().uuid(),
  scheduledAt: z.string().datetime({ message: "Format de date ISO 8601 requis." })
});

export const postsRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /api/posts
   * Liste les publications avec filtres optionnels.
   */
  server.get("/", async (request) => {
    const query = request.query as { status?: PostStatus };
    const where = query.status ? { status: query.status } : {};

    return await prisma.post.findMany({
      where,
      include: {
        mediaAssets: { orderBy: { sequenceOrder: "asc" } },
        scheduleJob: true
      },
      orderBy: { createdAt: "desc" }
    });
  });

  /**
   * POST /api/posts/schedule
   * Planifie un post avec validation temporelle stricte (+5 minutes) et idempotence BullMQ.
   */
  server.post("/schedule", async (request, reply) => {
    const parseResult = ScheduleRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        details: parseResult.error.format()
      });
    }

    const { postId, scheduledAt } = parseResult.data;
    const targetDate = new Date(scheduledAt);
    const minAllowedDate = new Date(Date.now() + 5 * 60 * 1000); // Règle des +5 minutes

    if (targetDate.getTime() < minAllowedDate.getTime()) {
      return reply.status(400).send({
        error: "INVALID_SCHEDULE_TIME",
        message: "L'horaire de programmation doit être fixé à au moins 5 minutes dans le futur."
      });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return reply.status(404).send({ error: "POST_NOT_FOUND" });
    }

    // Ajout dans BullMQ avec clé d'idempotence
    const jobId = await schedulePostJob(postId, targetDate);

    // Mise à jour BDD
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: PostStatus.SCHEDULED,
        scheduledAt: targetDate
      }
    });

    await prisma.scheduleJob.upsert({
      where: { postId },
      update: {
        bullmqJobId: jobId,
        nextAttemptAt: targetDate
      },
      create: {
        postId,
        bullmqJobId: jobId,
        nextAttemptAt: targetDate
      }
    });

    return reply.status(200).send({
      success: true,
      jobId,
      scheduledAt: targetDate.toISOString()
    });
  });

  /**
   * POST /api/posts/:id/retry
   * Relance manuelle immédiate d'un post échoué.
   */
  server.post("/:id/retry", async (request, reply) => {
    const { id } = request.params as { id: string };

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return reply.status(404).send({ error: "POST_NOT_FOUND" });
    }

    try {
      await prisma.post.update({
        where: { id },
        data: { status: PostStatus.PROCESSING }
      });

      const publishId = await executeTikTokPublish(id);

      const updated = await prisma.post.update({
        where: { id },
        data: {
          status: PostStatus.PUBLISHED,
          publishedAt: new Date(),
          tiktokPublishId: publishId,
          failureReason: null
        }
      });

      return reply.send({ success: true, post: updated });
    } catch (err: any) {
      const failed = await prisma.post.update({
        where: { id },
        data: {
          status: PostStatus.FAILED,
          failureReason: err.message
        }
      });

      return reply.status(500).send({
        error: "PUBLISH_RETRY_FAILED",
        message: err.message,
        post: failed
      });
    }
  });
};
