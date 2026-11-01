import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface TikTokAccountDto {
  id: string;
  openId: string;
  unionId?: string;
  displayName?: string;
  avatarUrl?: string;
  tokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  scopes: string[];
  createdAt: string;
}

export interface PostDto {
  id: string;
  accountId: string;
  postType: "DIRECT_POST" | "MEDIA_UPLOAD";
  mediaType: "PHOTO" | "VIDEO";
  title?: string;
  caption: string;
  mediaUrls: string[];
  status: "DRAFT" | "SCHEDULED" | "PROCESSING" | "PUBLISHED" | "FAILED" | "MISSED";
  scheduledFor?: string;
  publishedAt?: string;
  tiktokPublishId?: string;
  failureReason?: string;
  isAigc: boolean;
  privacyLevel: "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FRIENDS" | "SELF_ONLY";
  createdAt: string;
  updatedAt: string;
}

export interface GenerateAiPayload {
  mode: "PHOTO_CAROUSEL" | "OMNI_NATIVE_VIDEO" | "COMPOSITE_STUDIO_VIDEO";
  prompt: string;
  durationSeconds?: number;
  voiceStyle?: string;
  accountId: string;
}

export interface GenerateAiResponse {
  success: boolean;
  post: PostDto;
}
