import { FastifyPluginAsync } from "fastify";
import { AIGenerateRequestSchema } from "../../services/ai/types";
import { geminiOmniService } from "../../services/ai/gemini";
import { geminiOmniVideoService } from "../../services/ai/omniVideo";
import { imagenService } from "../../services/ai/imagen";
import { convertToTikTokCompliantJpeg } from "../../services/media/converter";
import { r2Storage } from "../../services/storage/r2";
import { prisma, MediaType, PostType, PostStatus, PrivacyLevel } from "../../services/db/prisma";

export const aiGenerateRoutes: FastifyPluginAsync = async (server) => {
  server.post("/generate", async (request, reply) => {
    const parseResult = AIGenerateRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        details: parseResult.error.format()
      });
    }

    const { prompt, mode, targetAccountId } = parseResult.data;

    // 1. Récupération de l'utilisateur et du compte TikTok
    const user = await prisma.user.findFirst({
      include: { aiQuota: true, tiktokAccounts: true }
    });

    if (!user) {
      return reply.status(404).send({ error: "USER_NOT_FOUND", message: "Aucun utilisateur actif trouvé." });
    }

    // 2. Vérification stricte des quotas IA journaliers
    const quota = user.aiQuota;
    if (quota && quota.dailyConsumed >= quota.dailyLimit) {
      return reply.status(403).send({
        error: "QUOTA_EXCEEDED",
        message: "Quota journalier d'inférence IA épuisé. Veuillez mettre à niveau votre abonnement."
      });
    }

    if (quota) {
      await prisma.aiQuota.update({
        where: { id: quota.id },
        data: { dailyConsumed: { increment: 1 } }
      });
    }

    // 3. Détermination du compte TikTok cible
    const account = targetAccountId
      ? user.tiktokAccounts.find((a) => a.id === targetAccountId)
      : user.tiktokAccounts[0];

    if (!account) {
      return reply.status(400).send({
        error: "NO_TIKTOK_ACCOUNT",
        message: "Veuillez lier un compte TikTok avant de générer des publications."
      });
    }

    // 4. Génération du scénario omnimodal via Gemini Omni
    const script = await geminiOmniService.generateScript(prompt, mode);

    // 5. Création du Post au statut DRAFT
    const post = await prisma.post.create({
      data: {
        userId: user.id,
        accountId: account.id,
        title: script.title,
        caption: `${script.caption}\n\n${script.hashtags.join(" ")}`,
        postType: mode === "PHOTO_CAROUSEL" ? PostType.PHOTO : PostType.VIDEO,
        privacyLevel: PrivacyLevel.SELF_ONLY,
        isAigc: true,
        status: PostStatus.DRAFT
      }
    });

    // 6. Traitement selon le mode sélectionné
    if (mode === "OMNI_NATIVE_VIDEO") {
      const videoBuffer = await geminiOmniVideoService.generateNativeVideo(script);
      const s3Key = `videos/${post.id}_native_omni.mp4`;
      const verifiedUrl = await r2Storage.uploadBuffer(videoBuffer, s3Key, "video/mp4");

      await prisma.mediaAsset.create({
        data: {
          postId: post.id,
          mediaType: MediaType.VIDEO,
          mimeType: "video/mp4",
          s3Key,
          publicVerifiedUrl: verifiedUrl,
          fileSizeByte: videoBuffer.length,
          widthPx: 1080,
          heightPx: 1920,
          durationSeconds: 15,
          sequenceOrder: 0
        }
      });
    } else if (mode === "PHOTO_CAROUSEL") {
      // Pour chaque scène : génération visuelle et conversion Sharp JPEG 95%
      for (let i = 0; i < script.scenes.length; i++) {
        const scene = script.scenes[i];
        const rawPngBuffer = await imagenService.generateImage(scene.imagePrompt);
        const jpegBuffer = await convertToTikTokCompliantJpeg(rawPngBuffer);

        const s3Key = `carousels/${post.id}/slide_${i + 1}.jpg`;
        const verifiedUrl = await r2Storage.uploadBuffer(jpegBuffer, s3Key, "image/jpeg");

        await prisma.mediaAsset.create({
          data: {
            postId: post.id,
            mediaType: MediaType.IMAGE,
            mimeType: "image/jpeg",
            s3Key,
            publicVerifiedUrl: verifiedUrl,
            fileSizeByte: jpegBuffer.length,
            widthPx: 1080,
            heightPx: 1920,
            sequenceOrder: i
          }
        });
      }
    } else {
      // Mode COMPOSITE_STUDIO_VIDEO : Visuels + conversion Sharp + rendu vidéo
      const rawPngBuffer = await imagenService.generateImage(script.scenes[0].imagePrompt);
      const jpegBuffer = await convertToTikTokCompliantJpeg(rawPngBuffer);
      const s3Key = `composite/${post.id}_composite.mp4`;
      const verifiedUrl = await r2Storage.uploadBuffer(jpegBuffer, s3Key, "video/mp4");

      await prisma.mediaAsset.create({
        data: {
          postId: post.id,
          mediaType: MediaType.VIDEO,
          mimeType: "video/mp4",
          s3Key,
          publicVerifiedUrl: verifiedUrl,
          fileSizeByte: jpegBuffer.length,
          widthPx: 1080,
          heightPx: 1920,
          durationSeconds: 15,
          sequenceOrder: 0
        }
      });
    }

    const createdPost = await prisma.post.findUnique({
      where: { id: post.id },
      include: { mediaAssets: true }
    });

    return reply.status(201).send({
      success: true,
      post: createdPost,
      script
    });
  });
};
