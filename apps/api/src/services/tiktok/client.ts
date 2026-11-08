import { env } from "../../config/env";
import {
  TikTokApiResponse,
  TikTokCreatorInfo,
  TikTokOAuthTokenResponse,
  TikTokUserInfo
} from "./types";

export class TikTokApiException extends Error {
  constructor(
    public readonly endpoint: string,
    public readonly statusCode: number,
    public readonly apiCode?: string,
    message?: string
  ) {
    super(`TIKTOK_API_ERROR [${endpoint} - HTTP ${statusCode}] ${apiCode ? `(${apiCode}): ` : ""}${message || "Unknown error"}`);
    this.name = "TikTokApiException";
  }
}

export class TikTokClient {
  private readonly baseUrl = "https://open.tiktokapis.com/v2";
  private readonly authBaseUrl = "https://www.tiktok.com/v2/auth/authorize/";

  /**
   * Construit l'URL de consentement officielle TikTok v2 avec PKCE et scopes requis.
   */
  getAuthorizationUrl(state: string, codeChallenge: string, customScopes?: string[], redirectUri?: string): string {
    const scopes = (customScopes && customScopes.length > 0 ? customScopes : ["user.info.basic", "video.publish", "video.upload"]).join(",");
    const params = new URLSearchParams({
      client_key: env.TIKTOK_CLIENT_KEY,
      scope: scopes,
      response_type: "code",
      redirect_uri: redirectUri || env.TIKTOK_REDIRECT_URI,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256"
    });

    return `${this.authBaseUrl}?${params.toString()}`;
  }

  /**
   * Échange le code d'autorisation contre des jetons d'accès et de rafraîchissement.
   */
  async exchangeCodeForToken(code: string, codeVerifier: string, redirectUri?: string): Promise<TikTokOAuthTokenResponse> {
    const body = new URLSearchParams({
      client_key: env.TIKTOK_CLIENT_KEY,
      client_secret: env.TIKTOK_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri || env.TIKTOK_REDIRECT_URI,
      code_verifier: codeVerifier
    });

    const response = await fetch(`${this.baseUrl}/oauth/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache"
      },
      body: body.toString()
    });

    const json = (await response.json()) as TikTokApiResponse<TikTokOAuthTokenResponse> & TikTokOAuthTokenResponse;

    if (!response.ok || (json.error && json.error.code !== "ok")) {
      throw new TikTokApiException("/oauth/token/", response.status, json.error?.code, json.error?.message);
    }

    return json.data || json;
  }

  /**
   * Renouvelle proactivement l'Access Token à partir d'un Refresh Token.
   */
  async refreshAccessToken(refreshToken: string): Promise<TikTokOAuthTokenResponse> {
    const body = new URLSearchParams({
      client_key: env.TIKTOK_CLIENT_KEY,
      client_secret: env.TIKTOK_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken
    });

    const response = await fetch(`${this.baseUrl}/oauth/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache"
      },
      body: body.toString()
    });

    const json = (await response.json()) as TikTokApiResponse<TikTokOAuthTokenResponse> & TikTokOAuthTokenResponse;

    if (!response.ok || (json.error && json.error.code !== "ok")) {
      throw new TikTokApiException("/oauth/token/refresh", response.status, json.error?.code, json.error?.message);
    }

    return json.data || json;
  }

  /**
   * Récupère le profil de base de l'utilisateur TikTok connecté.
   */
  async getUserInfo(accessToken: string): Promise<TikTokUserInfo> {
    // Champs officiels autorisés par user.info.basic (username exige user.info.profile)
    const fields = ["open_id", "union_id", "avatar_url", "display_name"].join(",");
    const response = await fetch(`${this.baseUrl}/user/info/?fields=${fields}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const json = (await response.json()) as TikTokApiResponse<{ user: TikTokUserInfo }>;

    if (!response.ok || (json.error && json.error.code !== "ok")) {
      throw new TikTokApiException("/user/info/", response.status, json.error?.code, json.error?.message);
    }

    const user = json.data.user;
    return {
      ...user,
      username: user?.username || user?.display_name || "createur_tiktok"
    };
  }

  /**
   * Interroge les restrictions et fonctionnalités autorisées pour le créateur (creator_info/query).
   */
  async getCreatorInfo(accessToken: string): Promise<TikTokCreatorInfo> {
    const response = await fetch(`${this.baseUrl}/post/publish/creator_info/query/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8"
      }
    });

    const json = (await response.json()) as TikTokApiResponse<TikTokCreatorInfo>;

    if (!response.ok || (json.error && json.error.code !== "ok")) {
      throw new TikTokApiException("/post/publish/creator_info/query/", response.status, json.error?.code, json.error?.message);
    }

    return json.data;
  }

  /**
   * Révoque les droits d'accès consentis à l'application.
   */
  async revokeAccess(accessToken: string): Promise<boolean> {
    const body = new URLSearchParams({
      client_key: env.TIKTOK_CLIENT_KEY,
      client_secret: env.TIKTOK_CLIENT_SECRET,
      token: accessToken
    });

    const response = await fetch(`${this.baseUrl}/oauth/revoke/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body.toString()
    });

    return response.ok;
  }
}

export const tiktokClient = new TikTokClient();
