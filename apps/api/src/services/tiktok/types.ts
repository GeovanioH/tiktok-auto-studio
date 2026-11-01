export interface TikTokOAuthTokenResponse {
  access_token: string;
  expires_in: number;
  open_id: string;
  refresh_token: string;
  refresh_expires_in: number;
  scope: string;
  token_type: string;
}

export interface TikTokUserInfo {
  open_id: string;
  union_id?: string;
  avatar_url: string;
  display_name: string;
  username: string;
}

export interface TikTokCreatorInfo {
  creator_avatar_url?: string;
  creator_nickname?: string;
  creator_username?: string;
  privacy_level_options: string[];
  comment_disabled: boolean;
  duet_disabled: boolean;
  stitch_disabled: boolean;
  max_video_post_duration_sec: number;
}

export interface TikTokApiResponse<T> {
  data: T;
  error?: {
    code: string;
    message: string;
    log_id: string;
  };
}
