import { prisma } from "../db/prisma";
import { getValidAccessToken } from "./tokenManager";
import { env } from "../../config/env";

/**
 * Exécute la publication d'un post vers l'API TikTok v2.
 * Retourne le publish_id attribué par ByteDance.
 */
export async function executeTikTokPublish(postId: string): Promise<string> {
  const post = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
    include: {
      account: true,
      mediaAssets: { orderBy: { sequenceOrder: "asc" } }
    }
  });

  // 1. Récupération d'un Access Token valide (règle des 23h appliquée)
  const accessToken = await getValidAccessToken(post.accountId);

  // 2. Détermination du privacy_level (forcé à SELF_ONLY en pré-audit)
  const privacyLevel =
    env.TIKTOK_AUDIT_APPROVED === "true"
      ? post.privacyLevel
      : "SELF_ONLY";

  // 3. Traitement Carrousel Photo vs Vidéo
  if (post.postType === "PHOTO") {
    const photoUrls = post.mediaAssets.map((asset) => asset.publicVerifiedUrl);

    // Contrôle d'intégrité du domaine vérifié
    const invalidDomain = photoUrls.some(
      (url) => !url.startsWith(env.S3_PUBLIC_VERIFIED_DOMAIN)
    );
    if (invalidDomain) {
      throw new Error(`CRITICAL_DOMAIN_ERROR: Les photos doivent pointer vers ${env.S3_PUBLIC_VERIFIED_DOMAIN}`);
    }

    const payload = {
      post_mode: "DIRECT_POST",
      media_type: "PHOTO",
      post_info: {
        title: post.title,
        description: post.caption,
        privacy_level: privacyLevel,
        disable_comment: post.disableComments,
        is_aigc: true,
        auto_add_music: true
      },
      source_info: {
        source: "PULL_FROM_URL",
        photo_images: photoUrls,
        photo_cover_index: 0
      }
    };

    if (env.NODE_ENV === "test" || env.TIKTOK_CLIENT_KEY === "dev_tiktok_key") {
      return `pub_photo_${post.id}_${Date.now()}`;
    }

    const response = await fetch("https://open.tiktokapis.com/v2/post/publish/content/init/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = (await response.json()) as any;
    if (!response.ok || result.error?.code !== "ok") {
      throw new Error(`TIKTOK_API_ERROR: ${result.error?.message || response.statusText}`);
    }

    return result.data.publish_id;
  } else {
    // Pipeline Vidéo Directe
    const videoAsset = post.mediaAssets[0];
    if (!videoAsset) {
      throw new Error("Aucun média vidéo associé à ce post.");
    }

    if (env.NODE_ENV === "test" || env.TIKTOK_CLIENT_KEY === "dev_tiktok_key") {
      return `pub_video_${post.id}_${Date.now()}`;
    }

    const initPayload = {
      post_info: {
        title: post.caption,
        privacy_level: privacyLevel,
        disable_comment: post.disableComments,
        disable_duet: post.disableDuet,
        disable_stitch: post.disableStitch,
        is_aigc: true
      },
      source_info: {
        source: "FILE_UPLOAD",
        video_size: videoAsset.fileSizeByte,
        chunk_size: videoAsset.fileSizeByte,
        total_chunk_count: 1
      }
    };

    const initRes = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(initPayload)
    });

    const initData = (await initRes.json()) as any;
    if (!initRes.ok || initData.error?.code !== "ok") {
      throw new Error(`TIKTOK_VIDEO_INIT_ERROR: ${initData.error?.message || initRes.statusText}`);
    }

    const { publish_id, upload_url } = initData.data;

    // Téléversement binaire vers le CDN TikTok
    const videoStream = await fetch(videoAsset.publicVerifiedUrl);
    const videoBuffer = await videoStream.arrayBuffer();

    const uploadRes = await fetch(upload_url, {
      method: "PUT",
      headers: {
        "Content-Type": "video/mp4",
        "Content-Range": `bytes 0-${videoAsset.fileSizeByte - 1}/${videoAsset.fileSizeByte}`
      },
      body: videoBuffer
    });

    if (!uploadRes.ok) {
      throw new Error(`TIKTOK_VIDEO_UPLOAD_ERROR: Échec du téléversement vers le CDN TikTok`);
    }

    return publish_id;
  }
}
