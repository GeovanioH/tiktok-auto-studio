import { FastifyPluginAsync } from "fastify";
import { generateCodeChallenge, generateCodeVerifier, generateStateToken } from "../../services/tiktok/pkce";
import { tiktokClient } from "../../services/tiktok/client";
import { encryptToken, decryptToken } from "../../services/crypto/encryption";
import { prisma } from "../../services/db/prisma";
import { env } from "../../config/env";

export const tiktokAuthRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /api/auth/tiktok/login
   * Déclenche le flux PKCE OAuth2 et redirige vers TikTok Login Kit.
   */
  server.get("/login", async (request, reply) => {
    const { basicOnly } = request.query as { basicOnly?: string };
    const customScopes = basicOnly === "true" ? ["user.info.basic"] : undefined;
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateStateToken();

    reply.setCookie("oauth_state", state, {
      path: "/",
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600 // 10 minutes
    });

    reply.setCookie("code_verifier", codeVerifier, {
      path: "/",
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600
    });

    const authUrl = tiktokClient.getAuthorizationUrl(state, codeChallenge, customScopes);

    // Si demande JSON explicite
    if (request.headers.accept?.includes("application/json")) {
      return { authUrl };
    }

    return reply.redirect(authUrl);
  });

  /**
   * GET /api/auth/tiktok/callback
   * Réceptionne le code temporaire, valide le state anti-CSRF, chiffre les tokens et stocke le profil créateur.
   */
  server.get("/callback", async (request, reply) => {
    const query = request.query as { code?: string; state?: string; error?: string; error_description?: string };

    if (query.error) {
      server.log.warn({ query }, "[TikTok Callback] Error returned by TikTok OAuth");
      const errDesc = query.error_description || (query.error === "server_error" ? "Le serveur TikTok a refusé la session. Vérifiez que votre compte personnel est bien ajouté dans 'Target Users' du Sandbox." : "");
      return reply.redirect(`${env.FRONTEND_URL}/accounts?error=${encodeURIComponent(query.error)}&error_description=${encodeURIComponent(errDesc)}`);
    }

    const stateCookie = request.cookies.oauth_state;
    const verifierCookie = request.cookies.code_verifier;

    if (!query.state || !stateCookie || query.state !== stateCookie) {
      return reply.status(403).send({ error: "CSRF_STATE_MISMATCH", message: "Le jeton state OAuth2 est invalide ou expiré." });
    }

    if (!query.code || !verifierCookie) {
      return reply.status(400).send({ error: "MISSING_CODE_OR_VERIFIER", message: "Paramètres d'autorisation manquants." });
    }

    // Échange du code d'autorisation contre les tokens officiels
    const tokens = await tiktokClient.exchangeCodeForToken(query.code, verifierCookie);

    // Chiffrement militaire immédiat au repos
    const encryptedAccessToken = encryptToken(tokens.access_token);
    const encryptedRefreshToken = encryptToken(tokens.refresh_token);
    const tokenExpiresAt = new Date(Date.now() + (tokens.expires_in || 86400) * 1000);
    const refreshExpiresAt = new Date(Date.now() + (tokens.refresh_expires_in || 31536000) * 1000);

    // Récupération des données utilisateur et des capacités créateur
    const userInfo = await tiktokClient.getUserInfo(tokens.access_token);
    let creatorInfo = { max_video_post_duration_sec: 60, privacy_level_options: ["SELF_ONLY"] };
    try {
      creatorInfo = await tiktokClient.getCreatorInfo(tokens.access_token);
    } catch (err) {
      server.log.warn({ err }, "creator_info/query non disponible en mode sandbox, utilisation des limites par défaut.");
    }

    // Recherche d'un utilisateur par défaut ou associé
    const firstUser = await prisma.user.findFirst();
    const userId = firstUser?.id || "default_system_user";

    // Sauvegarde en base PostgreSQL
    await prisma.tikTokAccount.upsert({
      where: { openId: userInfo.open_id },
      update: {
        encryptedAccessToken,
        encryptedRefreshToken,
        tokenExpiresAt,
        refreshExpiresAt,
        displayName: userInfo.display_name,
        username: userInfo.username,
        avatarUrl: userInfo.avatar_url,
        unionId: userInfo.union_id,
        isCreatorInfoVerified: true,
        maxVideoDuration: creatorInfo.max_video_post_duration_sec,
        privacyLevelsAllowed: creatorInfo.privacy_level_options
      },
      create: {
        userId,
        openId: userInfo.open_id,
        encryptedAccessToken,
        encryptedRefreshToken,
        tokenExpiresAt,
        refreshExpiresAt,
        displayName: userInfo.display_name,
        username: userInfo.username,
        avatarUrl: userInfo.avatar_url,
        unionId: userInfo.union_id,
        isCreatorInfoVerified: true,
        maxVideoDuration: creatorInfo.max_video_post_duration_sec,
        privacyLevelsAllowed: creatorInfo.privacy_level_options
      }
    });

    // Nettoyage des cookies de transition
    reply.clearCookie("oauth_state", { path: "/" });
    reply.clearCookie("code_verifier", { path: "/" });

    return reply.redirect(`${env.FRONTEND_URL}/accounts?status=success`);
  });

  /**
   * POST /api/auth/tiktok/revoke
   * Révoque le jeton côté TikTok et supprime l'enregistrement local.
   */
  server.post("/revoke", async (request, reply) => {
    const { accountId } = request.body as { accountId?: string };
    if (!accountId) {
      return reply.status(400).send({ error: "MISSING_ACCOUNT_ID" });
    }

    const account = await prisma.tikTokAccount.findUnique({
      where: { id: accountId }
    });

    if (!account) {
      return reply.status(404).send({ error: "ACCOUNT_NOT_FOUND" });
    }

    try {
      const plainAccessToken = decryptToken(account.encryptedAccessToken);
      await tiktokClient.revokeAccess(plainAccessToken);
    } catch (err) {
      server.log.warn({ err }, "Échec de la révocation distante TikTok, poursuite de la purge locale.");
    }

    await prisma.tikTokAccount.delete({
      where: { id: accountId }
    });

    return { success: true };
  });
};
