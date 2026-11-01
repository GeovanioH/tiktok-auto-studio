# Backend Schema & Database Architecture (BACKEND_SCHEMA) — TikTok Auto-Studio

> **Nom du Projet :** TikTok Auto-Studio  
> **Version :** 1.0.0  
> **Statut :** Validé — Schéma Relationnel & Spécifications Prisma ORM  
> **Auteur(s) :** Principal Software Architect & Staff Fullstack AI Engineer  
> **Dernière mise à jour :** 30 Octobre 2026

---

## 1. Diagramme Entité-Relation (ERD Mermaid)

```mermaid
erDiagram
    User ||--o{ TikTokAccount : "associe (1:N)"
    User ||--o{ Post : "crée (1:N)"
    User ||--one AiQuota : "possède (1:1)"
    User ||--one Subscription : "souscrit (1:1)"

    TikTokAccount ||--o{ Post : "publie sur (1:N)"

    Post ||--o{ MediaAsset : "contient (1:N)"
    Post ||--one ScheduleJob : "planifié par (1:1)"
    Post ||--o{ PublishAuditLog : "génère historique (1:N)"

    User {
        string id PK "cuid / uuid"
        string email UK "Adresse e-mail unique"
        string passwordHash "Hash Argon2id ou bcrypt"
        string fullName "Nom complet de l'utilisateur"
        string role "USER, AGENCY_MEMBER, AGENCY_OWNER, ADMIN"
        datetime createdAt
        datetime updatedAt
    }

    Subscription {
        string id PK
        string userId FK, UK
        string stripeCustomerId UK
        string stripeSubscriptionId UK
        string planType "FREE, PRO, AGENCY"
        string status "ACTIVE, PAST_DUE, CANCELED"
        datetime currentPeriodEnd
        datetime createdAt
        datetime updatedAt
    }

    AiQuota {
        string id PK
        string userId FK, UK
        int dailyLimit "Quota max selon abonnement"
        int dailyConsumed "Consommation du jour"
        datetime resetAt "Horodatage de réinitialisation UTC (00:00 UTC)"
        datetime updatedAt
    }

    TikTokAccount {
        string id PK
        string userId FK
        string openId UK "Identifiant unique retourné par TikTok"
        string unionId "Identifiant cross-app TikTok si dispo"
        string username "Handle TikTok @nom"
        string displayName "Nom affiché sur TikTok"
        string avatarUrl "URL CDN de l'avatar TikTok"
        text encryptedAccessToken "AES-256-GCM (IV:Tag:Ciphertext)"
        text encryptedRefreshToken "AES-256-GCM (IV:Tag:Ciphertext)"
        datetime tokenExpiresAt "Date expiration Access Token (24h)"
        datetime refreshExpiresAt "Date expiration Refresh Token (365j)"
        json maxVideoDuration "JSON: durées permises en secondes"
        json privacyLevelsAllowed "JSON: array des visibilités permises"
        boolean isCreatorInfoVerified "Dernier statut de vérification"
        datetime createdAt
        datetime updatedAt
    }

    Post {
        string id PK
        string userId FK
        string accountId FK
        string title "Titre interne ou TikTok"
        text caption "Légende avec hashtags (max 2200 car.)"
        string postType "VIDEO ou PHOTO"
        string privacyLevel "PUBLIC_TO_EVERYONE, SELF_ONLY, etc."
        boolean isAigc "Marquage légal IA (défaut true pour studio)"
        boolean disableComments "Désactiver les commentaires"
        boolean disableDuet "Désactiver les duos"
        boolean disableStitch "Désactiver les collages"
        string status "DRAFT, SCHEDULED, PROCESSING, PUBLISHED, FAILED, MISSED"
        datetime scheduledAt "Date d'envoi programmée (UTC)"
        datetime publishedAt "Date d'envoi effective confirmée (UTC)"
        string tiktokPublishId "Identifiant retourné par TikTok publish init"
        text failureReason "Message d'erreur vulgarisé en cas d'échec"
        datetime createdAt
        datetime updatedAt
    }

    MediaAsset {
        string id PK
        string postId FK
        string mediaType "IMAGE ou VIDEO"
        string mimeType "image/jpeg, image/webp, video/mp4"
        string s3Key "Chemin dans le bucket Cloudflare R2"
        string publicVerifiedUrl "URL https://assets.mondomaine-verifie.com/..."
        int fileSizeByte "Poids en octets"
        int widthPx "Largeur en pixels (ex 1080)"
        int heightPx "Hauteur en pixels (ex 1920)"
        int durationSeconds "Durée vidéo ou affichage (si applicable)"
        int sequenceOrder "Ordre d'apparition dans le carrousel (0 à 34)"
        datetime createdAt
    }

    ScheduleJob {
        string id PK
        string postId FK, UK
        string bullmqJobId UK "Idempotency Key: post_<postId>"
        int retryCount "Nombre de tentatives effectuées (max 3)"
        text lastErrorMessage "Dernière trace d'erreur brute reçue"
        datetime nextAttemptAt "Horodatage de la prochaine tentative avec backoff"
        datetime lockedAt "Horodatage du verrou Redlock"
        datetime createdAt
        datetime updatedAt
    }

    PublishAuditLog {
        string id PK
        string postId FK
        string eventType "INIT_REQUEST, UPLOAD_SUCCESS, PUBLISH_CONFIRMED, RETRY_ATTEMPT, ERROR"
        json requestPayload "Payload anonymisé envoyé à TikTok"
        json rawResponse "Réponse HTTP brute de TikTok"
        int httpStatusCode "Code de statut HTTP (200, 400, 500)"
        datetime createdAt
    }
```

---

## 2. Déclaration Exhaustive du Schéma Prisma (`schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  USER
  AGENCY_MEMBER
  AGENCY_OWNER
  ADMIN
}

enum SubscriptionPlan {
  FREE
  PRO
  AGENCY
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELED
}

enum PostType {
  VIDEO
  PHOTO
}

enum PostStatus {
  DRAFT
  SCHEDULED
  PROCESSING
  PUBLISHED
  FAILED
  MISSED
}

enum PrivacyLevel {
  PUBLIC_TO_EVERYONE
  MUTUAL_FOLLOW_FRIENDS
  FOLLOWER_OF_CREATOR
  SELF_ONLY
}

enum MediaType {
  IMAGE
  VIDEO
}

model User {
  id            String          @id @default(uuid())
  email         String          @unique
  passwordHash  String          @map("password_hash")
  fullName      String          @map("full_name")
  role          Role            @default(USER)
  createdAt     DateTime        @default(now()) @map("created_at")
  updatedAt     DateTime        @updatedAt @map("updated_at")

  tiktokAccounts TikTokAccount[]
  posts          Post[]
  subscription   Subscription?
  aiQuota        AiQuota?

  @@map("users")
}

model Subscription {
  id                    String             @id @default(uuid())
  userId                String             @unique @map("user_id")
  stripeCustomerId      String?            @unique @map("stripe_customer_id")
  stripeSubscriptionId  String?            @unique @map("stripe_subscription_id")
  planType              SubscriptionPlan   @default(FREE) @map("plan_type")
  status                SubscriptionStatus @default(ACTIVE)
  currentPeriodEnd      DateTime?          @map("current_period_end")
  createdAt             DateTime           @default(now()) @map("created_at")
  updatedAt             DateTime           @updatedAt @map("updated_at")

  user                  User               @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("subscriptions")
}

model AiQuota {
  id            String    @id @default(uuid())
  userId        String    @unique @map("user_id")
  dailyLimit    Int       @default(3) @map("daily_limit")
  dailyConsumed Int       @default(0) @map("daily_consumed")
  resetAt       DateTime  @map("reset_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("ai_quotas")
}

model TikTokAccount {
  id                    String        @id @default(uuid())
  userId                String        @map("user_id")
  openId                String        @unique @map("open_id")
  unionId               String?       @map("union_id")
  username              String
  displayName           String        @map("display_name")
  avatarUrl             String        @map("avatar_url")
  encryptedAccessToken  String        @map("encrypted_access_token")
  encryptedRefreshToken String        @map("encrypted_refresh_token")
  tokenExpiresAt        DateTime      @map("token_expires_at")
  refreshExpiresAt      DateTime      @map("refresh_expires_at")
  maxVideoDuration      Json          @map("max_video_duration")
  privacyLevelsAllowed  Json          @map("privacy_levels_allowed")
  isCreatorInfoVerified Boolean       @default(false) @map("is_creator_info_verified")
  createdAt             DateTime      @default(now()) @map("created_at")
  updatedAt             DateTime      @updatedAt @map("updated_at")

  user                  User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  posts                 Post[]

  @@index([userId])
  @@map("tiktok_accounts")
}

model Post {
  id                String            @id @default(uuid())
  userId            String            @map("user_id")
  accountId         String            @map("account_id")
  title             String            @db.VarChar(150)
  caption           String            @db.VarChar(2200)
  postType          PostType          @map("post_type")
  privacyLevel      PrivacyLevel      @default(SELF_ONLY) @map("privacy_level")
  isAigc            Boolean           @default(true) @map("is_aigc")
  disableComments   Boolean           @default(false) @map("disable_comments")
  disableDuet       Boolean           @default(false) @map("disable_duet")
  disableStitch     Boolean           @default(false) @map("disable_stitch")
  status            PostStatus        @default(DRAFT)
  scheduledAt       DateTime?         @map("scheduled_at")
  publishedAt       DateTime?         @map("published_at")
  tiktokPublishId   String?           @map("tiktok_publish_id")
  failureReason     String?           @map("failure_reason")
  createdAt         DateTime          @default(now()) @map("created_at")
  updatedAt         DateTime          @updatedAt @map("updated_at")

  user              User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  account           TikTokAccount     @relation(fields: [accountId], references: [id], onDelete: Cascade)
  mediaAssets       MediaAsset[]
  scheduleJob       ScheduleJob?
  auditLogs         PublishAuditLog[]

  @@index([userId, status])
  @@index([accountId])
  @@index([scheduledAt, status])
  @@map("posts")
}

model MediaAsset {
  id                String    @id @default(uuid())
  postId            String    @map("post_id")
  mediaType         MediaType @map("media_type")
  mimeType          String    @map("mime_type")
  s3Key             String    @map("s3_key")
  publicVerifiedUrl String    @map("public_verified_url")
  fileSizeByte      Int       @map("file_size_byte")
  widthPx           Int       @map("width_px")
  heightPx          Int       @map("height_px")
  durationSeconds   Int?      @map("duration_seconds")
  sequenceOrder     Int       @default(0) @map("sequence_order")
  createdAt         DateTime  @default(now()) @map("created_at")

  post              Post      @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId, sequenceOrder])
  @@map("media_assets")
}

model ScheduleJob {
  id               String    @id @default(uuid())
  postId           String    @unique @map("post_id")
  bullmqJobId      String    @unique @map("bullmq_job_id")
  retryCount       Int       @default(0) @map("retry_count")
  lastErrorMessage String?   @map("last_error_message")
  nextAttemptAt    DateTime? @map("next_attempt_at")
  lockedAt         DateTime? @map("locked_at")
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  post             Post      @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@map("schedule_jobs")
}

model PublishAuditLog {
  id             String   @id @default(uuid())
  postId         String   @map("post_id")
  eventType      String   @map("event_type")
  requestPayload Json?    @map("request_payload")
  rawResponse    Json?    @map("raw_response")
  httpStatusCode Int?     @map("http_status_code")
  createdAt      DateTime @default(now()) @map("created_at")

  post           Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId, createdAt])
  @@map("publish_audit_logs")
}
```

---

## 3. Stratégie d'Indexation & Optimisations de Requêtes

1. **Index Composite `[scheduled_at, status]` sur `posts` :**
   - Utilisé par le mécanisme de réconciliation au redémarrage serveur pour détecter immédiatement tous les posts orphelins (`status = 'SCHEDULED' AND scheduled_at < NOW()`).
2. **Index Composite `[user_id, status]` sur `posts` :**
   - Permet l'affichage instantané du tableau de bord utilisateur filtré par état (`SCHEDULED`, `FAILED`, etc.) sans scan séquentiel de table.
3. **Index Unique `bullmq_job_id` sur `schedule_jobs` :**
   - Garantit une contrainte d'unicité physique en base s'alignant sur l'idempotency key Redis (`post_<id>`).
4. **Index Composite `[post_id, sequence_order]` sur `media_assets` :**
   - Assure l'extraction ordonnée immédiate des diapositives d'un carrousel photo (de 0 à 34) lors de l'appel TikTok `content/init`.
