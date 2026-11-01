import { prisma } from "../db/prisma";
import { decryptToken, encryptToken } from "../crypto/encryption";
import { tiktokClient } from "./client";

export class TokenManagerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TokenManagerError";
  }
}

/**
 * Récupère un Access Token TikTok valide, en appliquant de manière transparente la règle des 23h.
 * Si le token expire dans moins d'une heure, il est automatiquement renouvelé via le Refresh Token.
 */
export async function getValidAccessToken(accountId: string, currentTime?: Date): Promise<string> {
  const account = await prisma.tikTokAccount.findUnique({
    where: { id: accountId }
  });

  if (!account) {
    throw new TokenManagerError("ACCOUNT_NOT_FOUND: Compte TikTok introuvable.");
  }

  const now = currentTime || new Date();
  const tokenExpiresAt = new Date(account.tokenExpiresAt);
  const refreshExpiresAt = new Date(account.refreshExpiresAt);
  const oneHourInMs = 60 * 60 * 1000;

  // 1. Règle nominale : validité restante supérieure à 1 heure
  if (tokenExpiresAt.getTime() - now.getTime() > oneHourInMs) {
    return decryptToken(account.encryptedAccessToken);
  }

  // 2. Vérification de la péremption du Refresh Token (365 jours)
  if (now.getTime() > refreshExpiresAt.getTime()) {
    throw new TokenManagerError("REFRESH_TOKEN_EXPIRED: La session TikTok a expiré après 365 jours. Reconnexion requise.");
  }

  // 3. Déclenchement de la rotation proactive (Règle des 23h)
  const plainRefreshToken = decryptToken(account.encryptedRefreshToken);
  const refreshedData = await tiktokClient.refreshAccessToken(plainRefreshToken);

  const newEncryptedAccessToken = encryptToken(refreshedData.access_token);
  const newEncryptedRefreshToken = encryptToken(refreshedData.refresh_token);
  const newTokenExpiresAt = new Date(now.getTime() + (refreshedData.expires_in || 86400) * 1000);
  const newRefreshExpiresAt = new Date(now.getTime() + (refreshedData.refresh_expires_in || 31536000) * 1000);

  await prisma.tikTokAccount.update({
    where: { id: accountId },
    data: {
      encryptedAccessToken: newEncryptedAccessToken,
      encryptedRefreshToken: newEncryptedRefreshToken,
      tokenExpiresAt: newTokenExpiresAt,
      refreshExpiresAt: newRefreshExpiresAt
    }
  });

  return refreshedData.access_token;
}
