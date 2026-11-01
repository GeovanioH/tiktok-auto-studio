import { prisma, PostStatus } from "../services/db/prisma";
import { executeTikTokPublish } from "../services/tiktok/publisher";

export interface RecoveryScanResult {
  recoveredCount: number;
  failedCount: number;
}

/**
 * Règle des 15 Minutes : Réconciliation des publications lors du redémarrage d'un serveur.
 * - Si retard <= 15 minutes : Exécution immédiate (RECOVERED_EXECUTION)
 * - Si retard > 15 minutes : Bascule en statut MISSED sans publication intempestive.
 */
export async function runCrashRecoveryScan(referenceTime?: Date): Promise<RecoveryScanResult> {
  const now = referenceTime || new Date();
  console.log(`[RECOVERY] Démarrage du scan de réconciliation à ${now.toISOString()}...`);

  let orphanedPosts: any[] = [];
  try {
    orphanedPosts = await prisma.post.findMany({
      where: {
        status: PostStatus.SCHEDULED,
        scheduledAt: { lt: now }
      }
    });
  } catch (err: any) {
    console.warn(`[RECOVERY] Serveur PostgreSQL hors-ligne (scan offline) : ${err.message}`);
    return { recoveredCount: 0, failedCount: 0 };
  }

  let recoveredCount = 0;
  let failedCount = 0;

  for (const post of orphanedPosts) {
    if (!post.scheduledAt) continue;

    const delayMinutes = (now.getTime() - post.scheduledAt.getTime()) / (1000 * 60);

    if (delayMinutes <= 15) {
      console.log(`[RECOVERY] Post ${post.id} en retard de ${delayMinutes.toFixed(1)}m (<= 15m). Exécution immédiate.`);
      await prisma.publishAuditLog.create({
        data: {
          postId: post.id,
          eventType: "RECOVERED_EXECUTION",
          rawResponse: { delayMinutes }
        }
      });

      try {
        const publishId = await executeTikTokPublish(post.id);
        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: PostStatus.PUBLISHED,
            publishedAt: new Date(),
            tiktokPublishId: publishId
          }
        });
        recoveredCount++;
      } catch (err: any) {
        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: PostStatus.FAILED,
            failureReason: err.message
          }
        });
        failedCount++;
      }
    } else {
      console.warn(`[RECOVERY] Post ${post.id} en retard critique de ${delayMinutes.toFixed(1)}m (> 15m). Bascule en statut MISSED.`);
      await prisma.post.update({
        where: { id: post.id },
        data: {
          status: PostStatus.MISSED,
          failureReason: `Échéance dépassée de ${Math.round(delayMinutes)} minutes suite à un arrêt serveur.`
        }
      });
      failedCount++;
    }
  }

  console.log(`[RECOVERY] Scan terminé : ${recoveredCount} récupéré(s), ${failedCount} manqué(s)/échoué(s).`);
  return { recoveredCount, failedCount };
}
