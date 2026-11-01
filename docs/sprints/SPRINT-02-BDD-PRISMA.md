# ==============================================================================
# MASTER PROMPT D'INGÉNIERIE — SPRINT 02 : BASE DE DONNÉES & SCHÉMA PRISMA ORM
# ==============================================================================

> **Destinataire du Prompt :** Agent Autonome d'Ingénierie Logicielle (Backend & Database Engineer)  
> **Niveau de Contexte Initial :** Zéro Connaissance Préalable (Self-Contained Master Prompt)  
> **Projet :** TikTok Auto-Studio  
> **Objectif du Sprint :** Modélisation complète de la base de données relationnelle sous PostgreSQL 16 via Prisma ORM 5.x, génération des migrations initiales déterministes, instanciation du client Prisma typé en singleton, et mise en place du script de seeding de données avec fixtures de test.

---

## 1. RÔLE, POSTURE ET RÈGLES D'ENGAGEMENT DE L'AGENT

Tu agis en tant que **Principal Database Architect & Lead Backend Engineer**.
Tu vas intervenir sur la couche de persistance relationnelle de TikTok Auto-Studio.

### Règles d'or absolues :
1. **Intégrité Référentielle Stricte :** Chaque relation étrangère doit comporter une clause d'intégrité explicite (`onDelete: Cascade` ou `onDelete: Restrict`).
2. **Nommage Conventionnel :** Les modèles Prisma utilisent le `PascalCase` au singulier (`User`, `TikTokAccount`, `Post`), et sont mappés physiquement sur des tables en minuscules pluriels snake_case via `@@map("table_names")`. Les colonnes en `camelCase` sont mappées avec `@map("column_name")`.
3. **Optimisation par Indexation :** Aucun scan de table n'est toléré sur les requêtes critiques de publication et de planification. Les index composites requis doivent être déclarés.
4. **Zéro Compromis Typologique :** Ne jamais utiliser de chaînes génériques pour les états finis : utiliser les `enum` Prisma natifs pour `Role`, `SubscriptionPlan`, `PostType`, `PostStatus`, `PrivacyLevel`, etc.

---

## 2. CONTEXTE GLOBAL DU PROJET : "TIKTOK AUTO-STUDIO"

### 2.1 Qu'est-ce que TikTok Auto-Studio ?
**TikTok Auto-Studio** est un SaaS permettant d'automatiser la création de vidéos et carrousels photos via l'IA et de les publier automatiquement sur TikTok à des dates et heures programmées, sans aucune intervention manuelle sur smartphone.

### 2.2 Pourquoi la structure de la base de données est-elle cruciale ?
L'application gère 4 flux interdépendants qui exigent une modélisation parfaite :
1. **Le Multi-Tenant & Facturation SaaS :** Les utilisateurs ont des rôles (`USER`, `AGENCY_MEMBER`, `AGENCY_OWNER`) et souscrivent à des plans Stripe (`FREE`, `PRO`, `AGENCY`).
2. **Le Contrôle des Quotas IA :** L'utilisation de Google Gemini et Imagen 3 coûte cher. La table `AiQuota` trace la consommation quotidienne de chaque utilisateur avec réinitialisation à minuit UTC.
3. **Le Cycle de Vie Asynchrone du Post :** Un post passe par 6 états finis (`DRAFT` $\rightarrow$ `SCHEDULED` $\rightarrow$ `PROCESSING` $\rightarrow$ `PUBLISHED`, `FAILED`, `MISSED`).
4. **La Traçabilité & Conformité TikTok :** Chaque tentative de publication génère des logs d'audit (`PublishAuditLog`) avec requêtes brutes, réponses HTTP et horodatages pour répondre aux exigences des auditeurs de TikTok.

---

## 3. ÉTAT DU PROJET AVANT CE SPRINT (POINT DE DÉPART)

Avant de démarrer le Sprint 02, le Sprint 01 a été entièrement réalisé :
- L'environnement Node/TypeScript est configuré (`package.json`, `tsconfig.json`).
- `docker-compose.yml` est en place avec PostgreSQL 16 (port 5432) et Redis 7 (port 6379).
- Le module de chiffrement AES-256-GCM est opérationnel dans `src/lib/crypto/encryption.ts`.
- La configuration environnementale est validée dans `src/lib/config/env.ts`.
- Les dépendances `@prisma/client` et `prisma` sont installées.

---

## 4. MISSION PRÉCISE DU SPRINT 02

Tu dois implémenter la totalité de la couche de données relationnelle en réalisant les 5 actions suivantes :
1. **Rédaction exhaustive du fichier `prisma/schema.prisma`** comprenant l'ensemble des 8 tables métier, 6 enums, index composites et contraintes de clés étrangères.
2. **Génération et exécution de la migration initiale SQL** via `pnpm prisma migrate dev --name init_schema` ciblant la base PostgreSQL locale.
3. **Création du singleton du client Prisma** dans `src/lib/prisma.ts` avec gestion propre du rechargement à chaud (Hot Module Replacement / HMR) en développement.
4. **Implémentation du script de Seeding (`prisma/seed.ts`)** créant des utilisateurs de test pour chaque rôle (`ADMIN`, `USER` Free, `AGENCY_OWNER` Pro), avec leurs quotas initiaux et comptes fictifs.
5. **Écriture d'un test d'intégrité de la BDD** (`tests/integration/prisma.test.ts`) vérifiant les contraintes d'unicité, les cascades de suppression et le typage des enums.

---

## 5. SPÉCIFICATIONS TECHNIQUES DÉTAILLÉES DU MODÈLE RELATIONNEL

### 5.1 Les Enums Requis
1. `Role` : `USER`, `AGENCY_MEMBER`, `AGENCY_OWNER`, `ADMIN`
2. `SubscriptionPlan` : `FREE`, `PRO`, `AGENCY`
3. `SubscriptionStatus` : `ACTIVE`, `PAST_DUE`, `CANCELED`
4. `PostType` : `VIDEO`, `PHOTO`
5. `PostStatus` : `DRAFT`, `SCHEDULED`, `PROCESSING`, `PUBLISHED`, `FAILED`, `MISSED`
6. `PrivacyLevel` : `PUBLIC_TO_EVERYONE`, `MUTUAL_FOLLOW_FRIENDS`, `FOLLOWER_OF_CREATOR`, `SELF_ONLY`
7. `MediaType` : `IMAGE`, `VIDEO`

### 5.2 Les 8 Modèles et leurs Attributs

#### 1. Modèle `User` (`users`)
- `id` : `String @id @default(uuid())`
- `email` : `String @unique`
- `passwordHash` : `String @map("password_hash")`
- `fullName` : `String @map("full_name")`
- `role` : `Role @default(USER)`
- `createdAt` : `DateTime @default(now()) @map("created_at")`
- `updatedAt` : `DateTime @updatedAt @map("updated_at")`
- *Relations :* 1:N vers `TikTokAccount`, 1:N vers `Post`, 1:1 vers `Subscription`, 1:1 vers `AiQuota`.

#### 2. Modèle `Subscription` (`subscriptions`)
- `id` : `String @id @default(uuid())`
- `userId` : `String @unique @map("user_id")`
- `stripeCustomerId` : `String? @unique @map("stripe_customer_id")`
- `stripeSubscriptionId` : `String? @unique @map("stripe_subscription_id")`
- `planType` : `SubscriptionPlan @default(FREE) @map("plan_type")`
- `status` : `SubscriptionStatus @default(ACTIVE)`
- `currentPeriodEnd` : `DateTime? @map("current_period_end")`
- `createdAt` : `DateTime @default(now()) @map("created_at")`
- `updatedAt` : `DateTime @updatedAt @map("updated_at")`
- *Relation :* FK vers `User` avec `onDelete: Cascade`.

#### 3. Modèle `AiQuota` (`ai_quotas`)
- `id` : `String @id @default(uuid())`
- `userId` : `String @unique @map("user_id")`
- `dailyLimit` : `Int @default(3) @map("daily_limit")` (Free = 3, Pro = 25, Agency = 100)
- `dailyConsumed` : `Int @default(0) @map("daily_consumed")`
- `resetAt` : `DateTime @map("reset_at")` (Fixé chaque jour à 00:00:00 UTC)
- `updatedAt` : `DateTime @updatedAt @map("updated_at")`
- *Relation :* FK vers `User` avec `onDelete: Cascade`.

#### 4. Modèle `TikTokAccount` (`tiktok_accounts`)
- `id` : `String @id @default(uuid())`
- `userId` : `String @map("user_id")`
- `openId` : `String @unique @map("open_id")` (Identifiant unique renvoyé par TikTok)
- `unionId` : `String? @map("union_id")`
- `username` : `String` (Handle, ex: "@moncompte")
- `displayName` : `String @map("display_name")`
- `avatarUrl` : `String @map("avatar_url")`
- `encryptedAccessToken` : `String @map("encrypted_access_token")` (Format AES-256-GCM : `iv:tag:cipher`)
- `encryptedRefreshToken` : `String @map("encrypted_refresh_token")` (Format AES-256-GCM : `iv:tag:cipher`)
- `tokenExpiresAt` : `DateTime @map("token_expires_at")` (Access Token, ~24h)
- `refreshExpiresAt` : `DateTime @map("refresh_expires_at")` (Refresh Token, ~365j)
- `maxVideoDuration` : `Json @map("max_video_duration")` (Réponse JSON de `creator_info/query`)
- `privacyLevelsAllowed` : `Json @map("privacy_levels_allowed")` (Niveaux autorisés pour ce créateur)
- `isCreatorInfoVerified` : `Boolean @default(false) @map("is_creator_info_verified")`
- `createdAt` : `DateTime @default(now()) @map("created_at")`
- `updatedAt` : `DateTime @updatedAt @map("updated_at")`
- *Index :* `@@index([userId])`
- *Relation :* FK vers `User` avec `onDelete: Cascade`, 1:N vers `Post`.

#### 5. Modèle `Post` (`posts`)
- `id` : `String @id @default(uuid())`
- `userId` : `String @map("user_id")`
- `accountId` : `String @map("account_id")`
- `title` : `String @db.VarChar(150)`
- `caption` : `String @db.VarChar(2200)` (Légende avec hashtags)
- `postType` : `PostType @map("post_type")`
- `privacyLevel` : `PrivacyLevel @default(SELF_ONLY) @map("privacy_level")`
- `isAigc` : `Boolean @default(true) @map("is_aigc")` (Étiquetage obligatoire contenu IA)
- `disableComments` : `Boolean @default(false) @map("disable_comments")`
- `disableDuet` : `Boolean @default(false) @map("disable_duet")`
- `disableStitch` : `Boolean @default(false) @map("disable_stitch")`
- `status` : `PostStatus @default(DRAFT)`
- `scheduledAt` : `DateTime? @map("scheduled_at")` (Horodatage UTC prévu)
- `publishedAt` : `DateTime? @map("published_at")` (Horodatage effectif)
- `tiktokPublishId` : `String? @map("tiktok_publish_id")`
- `failureReason` : `String? @map("failure_reason")`
- `createdAt` : `DateTime @default(now()) @map("created_at")`
- `updatedAt` : `DateTime @updatedAt @map("updated_at")`
- *Index critiques :*
  - `@@index([userId, status])` : Récupération rapide par statut du tableau de bord.
  - `@@index([scheduledAt, status])` : Requête de récupération des jobs orphelins (Règle des 15 min).
  - `@@index([accountId])`
- *Relations :* FK vers `User` (`Cascade`), FK vers `TikTokAccount` (`Cascade`), 1:N vers `MediaAsset`, 1:1 vers `ScheduleJob`, 1:N vers `PublishAuditLog`.

#### 6. Modèle `MediaAsset` (`media_assets`)
- `id` : `String @id @default(uuid())`
- `postId` : `String @map("post_id")`
- `mediaType` : `MediaType @map("media_type")`
- `mimeType` : `String @map("mime_type")` (`image/jpeg`, `image/webp`, `video/mp4`)
- `s3Key` : `String @map("s3_key")`
- `publicVerifiedUrl` : `String @map("public_verified_url")` (`https://assets.mondomaine-verifie.com/...`)
- `fileSizeByte` : `Int @map("file_size_byte")`
- `widthPx` : `Int @map("width_px")` (ex: 1080)
- `heightPx` : `Int @map("height_px")` (ex: 1920)
- `durationSeconds` : `Int? @map("duration_seconds")`
- `sequenceOrder` : `Int @default(0) @map("sequence_order")` (Ordre des slides de 0 à 34)
- `createdAt` : `DateTime @default(now()) @map("created_at")`
- *Index :* `@@index([postId, sequenceOrder])`
- *Relation :* FK vers `Post` (`onDelete: Cascade`).

#### 7. Modèle `ScheduleJob` (`schedule_jobs`)
- `id` : `String @id @default(uuid())`
- `postId` : `String @unique @map("post_id")`
- `bullmqJobId` : `String @unique @map("bullmq_job_id")` (`post_<postId>`)
- `retryCount` : `Int @default(0) @map("retry_count")` (Max 3)
- `lastErrorMessage` : `String? @map("last_error_message")`
- `nextAttemptAt` : `DateTime? @map("next_attempt_at")`
- `lockedAt` : `DateTime? @map("locked_at")` (Timestamp de verrou Redlock)
- `createdAt` : `DateTime @default(now()) @map("created_at")`
- `updatedAt` : `DateTime @updatedAt @map("updated_at")`
- *Relation :* FK vers `Post` (`onDelete: Cascade`).

#### 8. Modèle `PublishAuditLog` (`publish_audit_logs`)
- `id` : `String @id @default(uuid())`
- `postId` : `String @map("post_id")`
- `eventType` : `String @map("event_type")` (`INIT_REQUEST`, `UPLOAD_COMPLETE`, `PUBLISH_CONFIRMED`, `RETRY_ATTEMPT`, `ERROR`)
- `requestPayload` : `Json? @map("request_payload")`
- `rawResponse` : `Json? @map("raw_response")`
- `httpStatusCode` : `Int? @map("http_status_code")`
- `createdAt` : `DateTime @default(now()) @map("created_at")`
- *Index :* `@@index([postId, createdAt])`
- *Relation :* FK vers `Post` (`onDelete: Cascade`).

---

## 6. CLIENT PRISMA SINGLETON (`src/lib/prisma.ts`)

Pour éviter d'épuiser le pool de connexions PostgreSQL lors du rechargement de modules en développement :

```typescript
import { PrismaClient } from "@prisma/client";

declare global {
  // Déclaration globale pour éviter l'instanciation multiple sous HMR
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  global.prismaGlobal ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}
```

---

## 7. SCRIPT DE SEEDING INITIAL (`prisma/seed.ts`)

Le script de seeding doit alimenter la base avec :
1. Un compte administrateur : `admin@tiktokautostudio.io` (Role: `ADMIN`, Quota: 1000).
2. Un compte utilisateur Free : `user@example.com` (Plan: `FREE`, Quota: 3).
3. Un compte Agence Pro : `agency@marketing.com` (Plan: `AGENCY`, Quota: 100).
4. Création associée d'un faux compte TikTok pour tester l'interface avec des tokens chiffrés valides issus de `encryptToken()`.

---

## 8. PROTOCOLE D'EXÉCUTION ET DE VALIDATION

1. **Création du schéma :** `prisma/schema.prisma`
2. **Exécution de la migration :**
   ```bash
   pnpm prisma migrate dev --name init_schema
   ```
3. **Génération du client Prisma :**
   ```bash
   pnpm prisma generate
   ```
4. **Exécution du Seed :**
   ```bash
   pnpm tsx prisma/seed.ts
   ```
5. **Tests d'Intégration BDD :**
   ```bash
   pnpm test tests/integration/prisma.test.ts
   ```

---

## 9. FORMAT DE RESTITUTION DU RAPPORT DE FIN DE SPRINT

```markdown
### ✅ RAPPORT DE CLÔTURE — SPRINT 02 : BASE DE DONNÉES & SCHÉMA PRISMA

1. **Statut :** TERMINE AVEC SUCCÈS
2. **Fichiers créés :**
   - `prisma/schema.prisma`
   - `prisma/migrations/.../migration.sql`
   - `src/lib/prisma.ts`
   - `prisma/seed.ts`
   - `tests/integration/prisma.test.ts`
3. **Preuves de Validation :**
   - Migration Prisma : OK (8 tables créées, tous les enums et index appliqués)
   - Seeding : OK (Comptes de test générés avec quotas et tokens chiffrés)
   - Tests d'intégration : PASS (Cascades et contraintes vérifiées)
4. **Prêt pour le Sprint 03 :** Intégration TikTok API v2 (OAuth2 PKCE, Refresh Tokens & Scopes).
```
