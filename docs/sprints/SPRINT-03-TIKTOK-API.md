# ==============================================================================
# MASTER PROMPT D'INGÉNIERIE — SPRINT 03 : INTÉGRATION TIKTOK API V2 & AUTH OAUTH2
# ==============================================================================

> **Destinataire du Prompt :** Agent Autonome d'Ingénierie Logicielle (API Integration & OAuth2 Specialist)  
> **Niveau de Contexte Initial :** Zéro Connaissance Préalable (Self-Contained Master Prompt)  
> **Projet :** TikTok Auto-Studio  
> **Objectif du Sprint :** Implémentation complète et sécurisée du protocole officiel TikTok API v2 (Login Kit for Web + Content Posting API), comprenant le flux OAuth2 avec challenge PKCE, l'échange de jetons, le chiffrement AES-256-GCM immédiat, le mécanisme proactif de rafraîchissement d'Access Token (règle des 23h), l'interrogation obligatoire de `creator_info/query/`, et la procédure de révocation.

---

## 1. RÔLE, POSTURE ET RÈGLES D'ENGAGEMENT DE L'AGENT

Tu agis en tant que **Staff Integration Engineer & OAuth2 Security Architect**.
Tu vas intégrer l'API officielle de ByteDance / TikTok v2.

### Règles d'or absolues :
1. **Conformité Stricte TikTok v2 :** N'utilise aucune API non documentée ou obsolète (v1). Tous les endpoints ciblent le domaine officiel `https://open.tiktokapis.com/v2/`.
2. **PKCE Obligatoire :** Le flux OAuth2 utilise impérativement le protocole PKCE (RFC 7636) avec `code_challenge_method=S256`.
3. **Chiffrement Systématique à la Volée :** Dès réception des tokens (`access_token` et `refresh_token`), ils doivent être chiffrés via le module `src/lib/crypto/encryption.ts` avant d'être passés à Prisma. Aucun token en clair ne doit subsister dans les variables d'état ou les logs.
4. **Zéro Compromis sur les Scopes :** Les seuls scopes demandés sont : `user.info.basic`, `video.publish`, `video.upload`.
5. **Pré-contrôle `creator_info` :** Toute finalisation d'association de compte doit appeler immédiatement `POST /v2/post/publish/creator_info/query/` pour stocker les restrictions du profil créateur en base de données.

---

## 2. CONTEXTE GLOBAL DU PROJET : "TIKTOK AUTO-STUDIO"

### 2.1 Qu'est-ce que TikTok Auto-Studio ?
**TikTok Auto-Studio** est une plateforme SaaS qui permet de générer des contenus vidéo et photos avec l'IA et de les poster automatiquement sur TikTok sans passer par le smartphone du créateur.

### 2.2 Comment fonctionne l'API TikTok v2 ?
TikTok applique des politiques strictes de contrôle d'accès :
1. **Login Kit for Web :** Permet à l'utilisateur de s'authentifier via son compte TikTok et d'octroyer son consentement sur des permissions précises.
2. **Durée de Vie des Jetons :**
   - L'`access_token` est valable **24 heures** (86 400 secondes).
   - Le `refresh_token` est valable **365 jours** (31 536 000 secondes).
   - *Règle critique :* Dès qu'un `access_token` atteint 23 heures de vie, notre backend doit utiliser le `refresh_token` pour en obtenir un nouveau sans solliciter l'utilisateur.
3. **L'Appel `creator_info/query/` :** Avant d'autoriser une publication ou de paramétrer les formulaires, l'application doit connaître les droits du créateur :
   - Durée vidéo maximale admise pour ce compte (ex: 60s, 180s ou 600s).
   - Visibilités autorisées (`PUBLIC_TO_EVERYONE`, `SELF_ONLY`, etc.).
   - Possibilité de duos, collages et commentaires.
4. **Audit Commercial ByteDance :** Avant l'approbation de l'audit commercial, l'application tourne en mode Sandbox. Toute publication est alors contrainte au mode `SELF_ONLY` (privé).

---

## 3. ÉTAT DU PROJET AVANT CE SPRINT (POINT DE DÉPART)

Avant de démarrer le Sprint 03, les composants suivants sont déjà testés et opérationnels :
- `src/lib/crypto/encryption.ts` : Fonctions `encryptToken` et `decryptToken` (AES-256-GCM).
- `src/lib/prisma.ts` : Client Prisma singleton.
- `prisma/schema.prisma` : Modèle de données complet incluant la table `TikTokAccount`.
- `src/lib/config/env.ts` : Variables `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_REDIRECT_URI`.

---

## 4. MISSION PRÉCISE DU SPRINT 03

Tu dois concevoir et implémenter le module complet d'intégration TikTok en réalisant les 6 actions suivantes :
1. **Création du SDK Client HTTP TikTok v2 (`src/lib/tiktok/client.ts`) :** Classe utilitaire gérant les requêtes HTTP typées, l'injection des en-têtes Bearer, et le parsing des erreurs officielles ByteDance.
2. **Générateur PKCE & Gestion Anti-CSRF (`src/lib/tiktok/pkce.ts`) :** Fonctions pour générer le `code_verifier`, dériver le `code_challenge` en Base64URL(SHA-256), et signer le token `state`.
3. **Route Initiale OAuth2 (`src/app/api/auth/tiktok/login/route.ts`) :** Génère les challenges, pose les cookies sécurisés `oauth_state` et `code_verifier`, et redirige l'utilisateur vers la page officielle TikTok.
4. **Route Callback OAuth2 (`src/app/api/auth/tiktok/callback/route.ts`) :** Valide le `state`, échange le code temporaire contre les tokens, chiffre les tokens en AES-256-GCM, interroge le profil de base (`/v2/user/info/`) et les permissions créateur (`/v2/post/publish/creator_info/query/`), puis persiste le tout dans `TikTokAccount`.
5. **Gestionnaire de Renouvellement de Jeton (`src/lib/tiktok/tokenManager.ts`) :** Méthode `getValidAccessToken(accountId: string)` qui déchiffre l'Access Token existant, vérifie son horodatage d'expiration, et si `now > expiresAt - 1 heure`, exécute automatiquement la rotation via le Refresh Token et sauvegarde les nouveaux secrets chiffrés.
6. **Procédure de Révocation Complète (`src/app/api/auth/tiktok/revoke/route.ts`) :** Appel à `POST /v2/oauth/revoke/`, suppression des jetons en base et annulation de tous les jobs de publication planifiés du compte.

---

## 5. SPÉCIFICATIONS TECHNIQUES DÉTAILLÉES DES ENDPOINTS TIKTOK

### 5.1 Endpoints Officiels Utilisés
- **Page de Consentement :** `https://www.tiktok.com/v2/auth/authorize/`
- **Échange de Token / Refresh :** `POST https://open.tiktokapis.com/v2/oauth/token/`
- **Informations Profil :** `GET https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username`
- **Contrôle Permissions Créateur :** `POST https://open.tiktokapis.com/v2/post/publish/creator_info/query/`
- **Révocation d'Accès :** `POST https://open.tiktokapis.com/v2/oauth/revoke/`

### 5.2 Algorithme PKCE (`src/lib/tiktok/pkce.ts`)

```typescript
import crypto from "crypto";

export function generateCodeVerifier(): string {
  // RFC 7636 : chaîne aléatoire sécurisée de 43 à 128 caractères
  return crypto.randomBytes(32).toString("base64url");
}

export function generateCodeChallenge(verifier: string): string {
  return crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");
}

export function generateStateToken(): string {
  return crypto.randomBytes(16).toString("hex");
}
```

### 5.3 Route Callback & Enregistrement Sécurisé (`src/app/api/auth/tiktok/callback/route.ts`)

#### Déroulement logique obligatoire :
1. Extraction de `code`, `state`, et `error` depuis `request.nextUrl.searchParams`.
2. Si `error` est présent (ex: `access_denied`), redirection vers `/dashboard/accounts?error=user_cancelled`.
3. Récupération du `state` et du `code_verifier` stockés dans les cookies chiffrés. Si discordance, lever une erreur HTTP 403 `CSRF_STATE_MISMATCH`.
4. Appel POST vers `https://open.tiktokapis.com/v2/oauth/token/` avec les paramètres :
   - `client_key`: `env.TIKTOK_CLIENT_KEY`
   - `client_secret`: `env.TIKTOK_CLIENT_SECRET`
   - `code`: `code`
   - `grant_type`: `"authorization_code"`
   - `redirect_uri`: `env.TIKTOK_REDIRECT_URI`
   - `code_verifier`: `codeVerifier`
   - `Content-Type`: `application/x-www-form-urlencoded`
5. Réception du payload TikTok :
   ```json
   {
     "access_token": "act.example_access_token",
     "expires_in": 86400,
     "open_id": "_000xyz123",
     "refresh_token": "rft.example_refresh_token",
     "refresh_expires_in": 31536000,
     "scope": "user.info.basic,video.publish,video.upload",
     "token_type": "Bearer"
   }
   ```
6. Chiffrement immédiat :
   ```typescript
   const encryptedAccessToken = encryptToken(data.access_token);
   const encryptedRefreshToken = encryptToken(data.refresh_token);
   const tokenExpiresAt = new Date(Date.now() + data.expires_in * 1000);
   const refreshExpiresAt = new Date(Date.now() + data.refresh_expires_in * 1000);
   ```
7. Appel à `GET /v2/user/info/` avec `Authorization: Bearer <access_token>`.
8. Appel à `POST /v2/post/publish/creator_info/query/` avec `Authorization: Bearer <access_token>`.
9. Upsert dans PostgreSQL via Prisma :
   ```typescript
   await prisma.tiktokAccount.upsert({
     where: { openId: data.open_id },
     update: {
       encryptedAccessToken,
       encryptedRefreshToken,
       tokenExpiresAt,
       refreshExpiresAt,
       displayName: userInfo.display_name,
       avatarUrl: userInfo.avatar_url,
       username: userInfo.username,
       maxVideoDuration: creatorInfo.max_video_post_duration_sec,
       privacyLevelsAllowed: creatorInfo.privacy_level_options,
       isCreatorInfoVerified: true
     },
     create: {
       userId: currentUserId,
       openId: data.open_id,
       encryptedAccessToken,
       encryptedRefreshToken,
       tokenExpiresAt,
       refreshExpiresAt,
       displayName: userInfo.display_name,
       avatarUrl: userInfo.avatar_url,
       username: userInfo.username,
       maxVideoDuration: creatorInfo.max_video_post_duration_sec,
       privacyLevelsAllowed: creatorInfo.privacy_level_options,
       isCreatorInfoVerified: true
     }
   });
   ```

### 5.4 Service de Rotation Automatique (`src/lib/tiktok/tokenManager.ts`)

```typescript
export async function getValidAccessToken(accountId: string): Promise<string> {
  const account = await prisma.tiktokAccount.findUniqueOrThrow({
    where: { id: accountId }
  });

  const now = new Date();
  const expiresAt = new Date(account.tokenExpiresAt);
  const oneHourInMs = 60 * 60 * 1000;

  // Si le token est encore valide pour plus d'une heure, on le déchiffre et on le retourne
  if (expiresAt.getTime() - now.getTime() > oneHourInMs) {
    return decryptToken(account.encryptedAccessToken);
  }

  // Sinon, renouvellement proactif via le Refresh Token
  const refreshToken = decryptToken(account.encryptedRefreshToken);
  const refreshedData = await refreshTikTokToken(refreshToken);

  const newEncryptedAccessToken = encryptToken(refreshedData.access_token);
  const newEncryptedRefreshToken = encryptToken(refreshedData.refresh_token);
  const newTokenExpiresAt = new Date(Date.now() + refreshedData.expires_in * 1000);
  const newRefreshExpiresAt = new Date(Date.now() + refreshedData.refresh_expires_in * 1000);

  await prisma.tiktokAccount.update({
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
```

---

## 6. INVENTAIRE DES FICHIERS À PRODUIRE DANS CE SPRINT

```text
src/
└── lib/
    └── tiktok/
        ├── client.ts
        ├── types.ts
        ├── pkce.ts
        ├── tokenManager.ts
        └── creatorInfo.ts
src/
└── app/
    └── api/
        └── auth/
            └── tiktok/
                ├── login/
                │   └── route.ts
                ├── callback/
                │   └── route.ts
                └── revoke/
                    └── route.ts
tests/
└── integration/
    └── tiktokAuth.test.ts
```

---

## 7. SUITE DE TESTS D'INTÉGRATION AVEC MOCKS MSW (`tests/integration/tiktokAuth.test.ts`)

La suite de tests doit simuler le cycle complet sans contacter les vrais serveurs de TikTok :
1. **Génération de l'URL de connexion :** Vérifie la présence de `client_key`, `code_challenge`, `code_challenge_method=S256` et du cookie `oauth_state`.
2. **Callback avec succès :** Échange un code factice, vérifie le bon chiffrement en base de l'Access Token et du Refresh Token, et vérifie la sauvegarde des données de `creator_info`.
3. **Rejet en cas de discordance CSRF :** Tente un callback avec un `state` altéré et vérifie le renvoi du statut HTTP 403.
4. **Rotation automatique de token :** Simule un compte dont l'Access Token expire dans 15 minutes, appelle `getValidAccessToken()` et vérifie que l'appel d'échange a bien été exécuté et la base mise à jour.

---

## 8. PROTOCOLE D'EXÉCUTION ET DE VALIDATION

1. **Compilation des routes :**
   ```bash
   pnpm typecheck
   ```
2. **Exécution des tests de l'intégration TikTok :**
   ```bash
   pnpm test tests/integration/tiktokAuth.test.ts
   ```

---

## 9. FORMAT DE RESTITUTION DU RAPPORT DE FIN DE SPRINT

```markdown
### ✅ RAPPORT DE CLÔTURE — SPRINT 03 : INTÉGRATION TIKTOK API V2 & AUTH

1. **Statut :** TERMINE AVEC SUCCÈS
2. **Fichiers créés :**
   - `src/lib/tiktok/client.ts`, `types.ts`, `pkce.ts`, `tokenManager.ts`, `creatorInfo.ts`
   - `src/app/api/auth/tiktok/login/route.ts`
   - `src/app/api/auth/tiktok/callback/route.ts`
   - `src/app/api/auth/tiktok/revoke/route.ts`
   - `tests/integration/tiktokAuth.test.ts`
3. **Preuves de Validation :**
   - Déroulement PKCE validé (génération S256 et vérification du state)
   - Rotation proactif du jeton (règle des 23h) testée et validée
   - Mocks MSW : 100% des tests au vert
4. **Prêt pour le Sprint 04 :** Pipeline IA Multimodale (Gemini Pro, Imagen 3, Sharp, TTS & FFmpeg).
```
