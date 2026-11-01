import { tiktokClient } from "./client";
import { TikTokCreatorInfo } from "./types";

/**
 * Récupère et normalise les permissions créateur TikTok.
 */
export async function fetchAndValidateCreatorPermissions(accessToken: string): Promise<TikTokCreatorInfo> {
  const creatorInfo = await tiktokClient.getCreatorInfo(accessToken);

  // Valeurs par défaut sécurisées si la réponse est partielle
  return {
    creator_avatar_url: creatorInfo.creator_avatar_url,
    creator_nickname: creatorInfo.creator_nickname,
    creator_username: creatorInfo.creator_username,
    privacy_level_options: creatorInfo.privacy_level_options || ["SELF_ONLY"],
    comment_disabled: Boolean(creatorInfo.comment_disabled),
    duet_disabled: Boolean(creatorInfo.duet_disabled),
    stitch_disabled: Boolean(creatorInfo.stitch_disabled),
    max_video_post_duration_sec: creatorInfo.max_video_post_duration_sec || 600
  };
}
