# API Specifications & Contracts (API_SPEC) — TikTok Auto-Studio

> **Nom du Projet :** TikTok Auto-Studio  
> **Version :** 1.0.0  
> **Statut :** Validé — Spécification des Contrats d'Interface REST & Webhooks  
> **Auteur(s) :** Principal Software Architect & Staff Fullstack AI Engineer  
> **Dernière mise à jour :** 30 Octobre 2026

---

## 1. Normes Globales & Format des Réponses

Toutes les routes internes de l'application répondent selon une structure JSON standardisée et prévisible.

### 1.1 Format de Réponse Succès (HTTP 200, 201)
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-30T04:00:00.000Z",
    "requestId": "req_cuid123456"
  }
}
```

### 1.2 Format de Réponse Erreur (HTTP 4xx, 5xx)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Les paramètres fournis sont invalides.",
    "details": [
      {
        "field": "scheduledAt",
        "message": "La date de programmation doit être supérieure d'au moins 5 minutes à l'heure actuelle."
      }
    ]
  },
  "meta": {
    "timestamp": "2026-10-30T04:00:00.000Z",
    "requestId": "req_cuid123456"
  }
}
```

### 1.3 Architecture Découplée, Base URL & Politique CORS
- **Base URL Backend Node.js :** `http://localhost:4000/api` (dev) ou `https://api.mondomaine.com/api` (prod)
- **Origine Frontend React Vite :** `http://localhost:5173` (dev) ou `https://app.mondomaine.com` (prod)
- **Configuration CORS requise (Fastify / Express) :**
  ```typescript
  // fastify.register(cors, ...) ou app.use(cors(...))
  {
    origin: [process.env.FRONTEND_URL || "http://localhost:5173"],
    credentials: true, // Autorise le transport des cookies HttpOnly de session
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }
  ```
- **Politique de Cookies de Session Cross-Origin :**
  - En développement local (ports distincts 5173 / 4000) : `SameSite: "lax"`, `secure: false`, `httpOnly: true`.
  - En production (sous-domaines distincts) : `SameSite: "none"`, `secure: true`, `httpOnly: true`.

---

## 2. Authentification & Connexion TikTok (OAuth2)

### 2.1 `GET /api/auth/tiktok/login`
Initialise le challenge PKCE et redirige l'utilisateur vers le portail officiel TikTok.
- **En-têtes requis :** Cookie de session utilisateur `session_token`.
- **Réponse HTTP :** `302 Found`
  - En-tête `Location` : `https://www.tiktok.com/v2/auth/authorize/?client_key=...&response_type=code&scope=user.info.basic,video.publish,video.upload&redirect_uri=...&state=...&code_challenge=...&code_challenge_method=S256`
  - Cookie positionné : `oauth_state` (HttpOnly, Secure, 10 min).

### 2.2 `GET /api/auth/tiktok/callback`
Réceptionne le code temporaire émis par TikTok et procède à l'échange contre les tokens.
- **Paramètres Query :**
  - `code` : string (code d'autorisation temporaire).
  - `state` : string (jeton anti-CSRF).
  - `error` (optionnel) : string (ex: `access_denied`).
- **Comportement :**
  - Valide le `state` avec le cookie local.
  - Échange le code auprès de `POST https://open.tiktokapis.com/v2/oauth/token/`.
  - Chiffre l'Access Token et le Refresh Token en AES-256-GCM.
  - Récupère le profil créateur (`/v2/user/info/`) et les permissions (`/v2/post/publish/creator_info/query/`).
  - Enregistre ou met à jour la table `tiktok_accounts`.
- **Réponse HTTP :** `302 Found` vers `/dashboard/accounts?status=connected`.

### 2.3 `POST /api/auth/tiktok/revoke`
Révoque un compte TikTok associé et supprime tous les accès.
- **Payload Requête :**
  ```json
  {
    "accountId": "acc_clx7890"
  }
  ```
- **Réponse Succès (HTTP 200) :**
  ```json
  {
    "success": true,
    "data": {
      "revokedAccountId": "acc_clx7890",
      "canceledJobsCount": 4
    }
  }
  ```

---

## 3. Moteur IA Omnimodal (Gemini Omni) & Médias

### 3.1 `POST /api/ai/generate` (Studio 3-Clics Omnimodal)
Transforme une idée textuelle en carrousel photos, vidéo native ou vidéo composite via **Google Gemini Omni**.
- **Schéma Zod de Requête :**
  ```typescript
  export const AIGenerateRequestSchema = z.object({
    prompt: z.string().min(5).max(1000),
    format: z.enum([
      "PHOTO_CAROUSEL",        // Carrousel photos 9:16 (Gemini Omni / Imagen 3 + Sharp JPEG)
      "OMNI_NATIVE_VIDEO",     // Vidéo directe native 9:16 générée par Gemini Omni
      "COMPOSITE_STUDIO_VIDEO" // Vidéo montée FFmpeg (visuels + voix TTS + Ken Burns + sous-titres .ass)
    ]).default("COMPOSITE_STUDIO_VIDEO"),
    tone: z.enum(["EDUCATIONAL", "HUMOROUS", "STORYTELLING", "PROMOTIONAL"]).default("EDUCATIONAL"),
    voiceId: z.string().optional()
  });
  ```
- **Exemple de Requête JSON :**
  ```json
  {
    "prompt": "5 règles d'or pour exploser son engagement sur TikTok en 2026",
    "format": "OMNI_NATIVE_VIDEO",
    "tone": "EDUCATIONAL"
  }
  ```
- **Réponse Succès (HTTP 200) :**
  ```json
  {
    "success": true,
    "data": {
      "postId": "post_clk554433",
      "title": "Exploser son engagement TikTok en 2026",
      "caption": "Voici les 5 règles d'or indispensables pour doubler tes vues cette semaine ! 🚀 #tiktoktips #contentcreator #growth #marketing",
      "postType": "VIDEO",
      "videoUrl": "https://assets.mondomaine-verifie.com/rendered/video_clk554433.mp4",
      "coverImageUrl": "https://assets.mondomaine-verifie.com/scenes/scene_1.jpg",
      "durationSeconds": 35,
      "quotaRemaining": 19
    }
  }
  ```

### 3.2 `POST /api/media/upload`
Téléversement manuel d'une image ou vidéo avec conversion automatique de format.
- **Content-Type :** `multipart/form-data`
- **Champs de formulaire :**
  - `file` : Binaire (Image ou Vidéo).
  - `mediaType` : `"IMAGE"` ou `"VIDEO"`.
- **Règles de conversion :**
  - Si le fichier image est un PNG : Conversion automatique côté serveur en JPEG 95% via la bibliothèque Sharp.
  - Validation du ratio 9:16 ($1080 \times 1920$).
  - Dépôt sur Cloudflare R2 et retour d'une URL sur le sous-domaine vérifié.
- **Réponse Succès (HTTP 201) :**
  ```json
  {
    "success": true,
    "data": {
      "publicVerifiedUrl": "https://assets.mondomaine-verifie.com/uploads/photo_converted_8899.jpg",
      "s3Key": "uploads/photo_converted_8899.jpg",
      "mimeType": "image/jpeg",
      "fileSizeByte": 1420500,
      "widthPx": 1080,
      "heightPx": 1920
    }
  }
  ```

---

## 4. Gestion des Publications & Programmation (Posts CRUD)

### 4.1 `GET /api/posts`
Récupère la liste paginée et filtrable des publications de l'utilisateur.
- **Paramètres Query :**
  - `status` (optionnel) : `DRAFT`, `SCHEDULED`, `PROCESSING`, `PUBLISHED`, `FAILED`, `MISSED`.
  - `accountId` (optionnel) : ID du compte TikTok rattaché.
  - `page` : entier (défaut 1).
  - `limit` : entier (défaut 20).
- **Réponse Succès (HTTP 200) :**
  ```json
  {
    "success": true,
    "data": {
      "posts": [
        {
          "id": "post_01",
          "title": "3 astuces prospection",
          "status": "SCHEDULED",
          "scheduledAt": "2026-10-31T18:00:00.000Z",
          "postType": "PHOTO",
          "mediaCount": 4,
          "account": {
            "id": "acc_01",
            "username": "@growth_expert"
          }
        }
      ],
      "pagination": {
        "total": 45,
        "page": 1,
        "totalPages": 3
      }
    }
  }
  ```

### 4.2 `POST /api/posts` (Création ou Planification d'un Post)
- **Schéma Zod de Requête :**
  ```typescript
  export const CreatePostRequestSchema = z.object({
    accountId: z.string().uuid(),
    title: z.string().min(1).max(150),
    caption: z.string().max(2200),
    postType: z.enum(["VIDEO", "PHOTO"]),
    privacyLevel: z.enum(["PUBLIC_TO_EVERYONE", "MUTUAL_FOLLOW_FRIENDS", "FOLLOWER_OF_CREATOR", "SELF_ONLY"]),
    isAigc: z.boolean().default(true),
    mediaAssetIds: z.array(z.string().uuid()).min(1).max(35),
    scheduledAt: z.string().datetime().optional() // Obligatoire si action = SCHEDULE
  });
  ```
- **Réponse Succès (HTTP 201) :**
  ```json
  {
    "success": true,
    "data": {
      "id": "post_778899",
      "status": "SCHEDULED",
      "scheduledAt": "2026-11-01T14:30:00.000Z",
      "bullmqJobId": "post_post_778899"
    }
  }
  ```

### 4.3 `POST /api/posts/[id]/retry`
Relance manuelle immédiate d'un post ayant échoué (`FAILED`) sans réimporter les médias.
- **Réponse Succès (HTTP 200) :**
  ```json
  {
    "success": true,
    "data": {
      "id": "post_778899",
      "status": "PROCESSING",
      "message": "Le post a été renvoyé dans la file d'exécution prioritaire."
    }
  }
  ```

---

## 5. Webhooks Externes

### 5.1 `POST /api/webhooks/stripe`
Traite les événements de paiement et met à jour les quotas SaaS du compte utilisateur.
- **Vérification de Signature :** Header `Stripe-Signature` validé avec `STRIPE_WEBHOOK_SECRET`.
- **Événements supportés :**
  - `checkout.session.completed` : Activation de l'abonnement et mise à niveau des quotas journaliers.
  - `invoice.payment_succeeded` : Réinitialisation de la période d'abonnement.
  - `customer.subscription.deleted` : Rétrogradation au plan `FREE`.
