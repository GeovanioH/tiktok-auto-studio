/**
 * Handlers de mock pour l'API officielle TikTok v2
 * Utilisables par MSW ou fetch mock standard dans les tests d'intégration et E2E
 */

export interface TikTokMockConfig {
  verifiedDomain: string;
  defaultOpenId: string;
}

export const defaultMockConfig: TikTokMockConfig = {
  verifiedDomain: "https://assets.mondomaine-verifie.com",
  defaultOpenId: "open_id_test_verified_123",
};

export const tiktokMockResponses = {
  // 1. Échange de code & rafraîchissement OAuth2 PKCE
  oauthTokenSuccess: {
    data: {
      access_token: "act.tiktok_mock_access_token_valid_24h",
      expires_in: 86400,
      open_id: "open_id_test_verified_123",
      refresh_token: "rft.tiktok_mock_refresh_token_valid_365d",
      refresh_expires_in: 31536000,
      scope: "user.info.basic,video.publish,video.upload",
      token_type: "Bearer",
    },
    error: {
      code: "ok",
      message: "",
      log_id: "log_mock_oauth_success_001",
    },
  },

  // 2. Requête préalable obligatoire creator_info/query
  creatorInfoSuccess: {
    data: {
      creator_avatar_url: "https://assets.mondomaine-verifie.com/avatars/creator.jpg",
      creator_nickname: "Studio Créateur Officiel",
      creator_username: "studio_createur",
      duet_disabled: false,
      stitch_disabled: false,
      comment_disabled: false,
      max_video_post_duration_sec: 600,
      privacy_level_options: ["PUBLIC_TO_EVERYONE", "MUTUAL_FOLLOW_FRIENDS", "SELF_ONLY"],
    },
    error: {
      code: "ok",
      message: "",
      log_id: "log_mock_creator_info_002",
    },
  },

  // 3. Initialisation de publication Direct Post Carrousel Photo
  photoContentInitSuccess: {
    data: {
      publish_id: "pub_photo_carousel_mock_777",
    },
    error: {
      code: "ok",
      message: "",
      log_id: "log_mock_content_init_003",
    },
  },

  // 4. Initialisation de publication Vidéo (Upload chunked)
  videoInitSuccess: {
    data: {
      publish_id: "pub_video_native_mock_888",
      upload_url: "https://open-upload.tiktokapis.com/video/upload/chunk_mock_url",
    },
    error: {
      code: "ok",
      message: "",
      log_id: "log_mock_video_init_004",
    },
  },

  // 5. Statut de publication
  statusFetchPublished: {
    data: {
      status: "PUBLISH_COMPLETE",
      fail_reason: "",
      publically_available_post_id: ["7298374928374928374"],
    },
    error: {
      code: "ok",
      message: "",
      log_id: "log_mock_status_fetch_005",
    },
  },

  // 6. Révocation des jetons
  revokeSuccess: {
    data: {},
    error: {
      code: "ok",
      message: "",
      log_id: "log_mock_revoke_006",
    },
  },
};
