# ==============================================================================
# MASTER PROMPT D'INGÉNIERIE — SPRINT 05 : MOTEUR ASYNCHRONE DE PLANIFICATION BULLMQ
# ==============================================================================

> **Destinataire du Prompt :** Agent Autonome d'Ingénierie Logicielle (Distributed Systems & Backend Worker Specialist)  
> **Niveau de Contexte Initial :** Zéro Connaissance Préalable (Self-Contained Master Prompt)  
> **Projet :** TikTok Auto-Studio  
> **Objectif du Sprint :** Conception et mise en production du moteur asynchrone de planification et d'exécution des publications TikTok via BullMQ et Redis, garantissant une idempotence absolue (zéro double post via Redlock), la gestion du backoff exponentiel, le streaming de téléversement vers TikTok v2, et la résilience après crash selon la règle des 15 minutes.

---

## 1. RÔLE, POSTURE ET RÈGLES D'ENGAGEMENT DE L'AGENT

Tu agis en tant que **Principal Systems Architect & Distributed Worker Engineer**.
Tu vas construire le moteur d'exécution autonome en arrière-plan.

### Règles d'or absolues :
1. **Idempotence Absolue (Zéro Double Post) :** Tout job planifié doit obligatoirement être créé avec un `jobId` déterministe sous la forme `jobId: "post_" + post.id`. Aucun job ne peut être traité sans acquisition préalable d'un verrou distribué Redlock sur la clé `lock:post:<postId>`.
2. **Application Stricte de la Règle des 15 Minutes :** Lors de l'initialisation du worker au redémarrage d'un serveur, tout job passé (`scheduledAt < NOW()`) avec un retard $\le 15\text{ minutes}$ doit être exécuté immédiatement en mode de récupération (`RECOVERED_EXECUTION`). Tout job ayant un retard $> 15\text{ minutes}$ doit basculer sans publication en statut `MISSED` pour éviter de réveiller ou de perturber l'audience de l'utilisateur à des heures inappropriées.
3. **Respect Militaire des Tokens :** Les tokens d'accès TikTok sont déchiffrés à la volée via `decryptToken()` dans la mémoire volatile du worker et ne doivent jamais être logués ou stockés en clair.
4. **Conformité API TikTok :**
   - Toujours inclure `is_aigc: true` dans l'objet `post_info`.
   - Respecter le mode bac à sable : forcer `privacy_level: "SELF_ONLY"` tant que `env.TIKTOK_AUDIT_APPROVED !== "true"`.
   - Utiliser exclusivement les URLs hébergées sur `https://assets.mondomaine-verifie.com/` pour les photos.

---

## 2. CONTEXTE GLOBAL DU PROJET : "TIKTOK AUTO-STUDIO"

### 2.1 Qu'est-ce que TikTok Auto-Studio ?
**TikTok Auto-Studio** permet à des utilisateurs de programmer des posts TikTok des jours ou semaines à l'avance. À l'heure exacte fixée par l'utilisateur, notre plateforme envoie le post directement aux serveurs de ByteDance via l'API officielle TikTok v2, sans que l'utilisateur n'ait besoin d'ouvrir l'application mobile.

### 2.2 Comment fonctionne la publication sur l'API TikTok v2 ?
L'API Content Posting de TikTok v2 propose deux modes d'initialisation distincts :

#### Mode 1 : Carrousels Photos (`POST /v2/post/publish/content/init/`)
- TikTok ne téléverse pas de fichiers binaires d'images sur ses serveurs.
- TikTok exige un tableau d'URLs publiques pointant sur un **domaine vérifié** déclaré dans la console développeur.
- Le payload transmet la liste ordonnée des images JPEG/WEBP, le titre, la description, les paramètres de commentaires et le tag `is_aigc: true`.

#### Mode 2 : Vidéos Directes (`POST /v2/post/publish/video/init/`)
1. Le client envoie les métadonnées de la vidéo (titre, vie privée, `is_aigc: true`).
2. TikTok renvoie une `upload_url` signée et un `publish_id`.
3. Le worker téléverse le flux binaire MP4 par morceaux (Chunked Streaming) vers cette URL.
4. Le worker interroge périodiquement `POST /v2/post/publish/status/fetch/` jusqu'à confirmation du succès (`PUBLISH_COMPLETE`) ou échec.

---

## 3. ÉTAT DU PROJET AVANT CE SPRINT (POINT DE DÉPART)

Avant de démarrer le Sprint 05 :
- La base PostgreSQL et le serveur Redis tournent localement via `docker-compose.yml`.
- Le schéma Prisma contient les modèles `Post`, `ScheduleJob`, `MediaAsset`, `TikTokAccount` et `PublishAuditLog`.
- Le module `src/lib/crypto/encryption.ts` permet de déchiffrer les tokens en mémoire.
- Le module `src/lib/tiktok/tokenManager.ts` fournit `getValidAccessToken(accountId)`.
- Les fichiers médias générés ou uploadés sont disponibles sur Cloudflare R2 avec des URLs sur `https://assets.mondomaine-verifie.com/`.

---

## 4. MISSION PRÉCISE DU SPRINT 05

Tu dois concevoir et implémenter le système de files et de workers en réalisant les 6 actions suivantes :
1. **Configuration de la File Redis BullMQ (`src/lib/queue/publishQueue.ts`) :** Initialisation de la queue `tiktok-publish-queue` avec connexion IORedis dédiée et options par défaut (backoff exponentiel, suppression des jobs réussis après 7 jours).
2. **Gestionnaire de Verrou Distribué Redlock (`src/lib/queue/redlock.ts`) :** Implémentation du lock distribué basé sur Redis avec TTL de 120 secondes et libération garantie en bloc `finally`.
3. **Moteur d'Exécution TikTok v2 (`src/lib/tiktok/publisher.ts`) :** Fonctions spécialisées pour orchestrer l'envoi de photos (`publishPhotoCarouselToTikTok`) et de vidéos (`publishVideoToTikTok`).
4. **Worker de Publication BullMQ (`src/workers/publishWorker.ts`) :** Déclaration du worker traitant les jobs arrivant à échéance, gérant les erreurs réseau (5xx) vs erreurs d'authentification (4xx), et mettant à jour les statuts en base (`PROCESSING`, `PUBLISHED`, `FAILED`).
5. **Algorithme de Résilience & Règle des 15 Minutes (`src/workers/recoveryJob.ts`) :** Service exécuté au démarrage du worker qui scanne la base pour réconcilier les posts bloqués à la suite d'un arrêt intempestif.
6. **Routes API de Programmation & Relance (`src/app/api/posts/route.ts` & `src/app/api/posts/[id]/retry/route.ts`) :** Endpoints permettant de planifier un post dans BullMQ et de relancer manuellement un post échoué.

---

## 5. SPÉCIFICATIONS TECHNIQUES DÉTAILLÉES & CONTRATS DE CODE

### 5.1 Configuration de la File BullMQ (`src/lib/queue/publishQueue.ts`)

```typescript
import { Queue } from "bullmq";
import Redis from "ioredis";

const redisConnection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null // Requis par BullMQ
});

export interface PublishJobData {
  postId: string;
}

export const publishQueue = new Queue<PublishJobData>("tiktok-publish-queue", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // 3 tentatives en cas d'erreur 5xx
    backoff: {
      type: "exponential",
      delay: 60 * 1000 // 1 minute, puis 5 minutes, puis 15 minutes
    },
    removeOnComplete: {
      age: 7 * 24 * 3600 // Rétention des logs réussis 7 jours
    },
    removeOnFail: {
      age: 30 * 24 * 3600 // Rétention des échecs 30 jours
    }
  }
});

/**
 * Planifie un post avec idempotence absolue.
 */
export async function schedulePostJob(postId: string, scheduledAt: Date): Promise<string> {
  const delay = Math.max(0, scheduledAt.getTime() - Date.now());
  const jobId = `post_${postId}`;

  const job = await publishQueue.add(
    "publish_post",
    { postId },
    {
      delay,
      jobId // Clé d'idempotence stricte
    }
  );

  return job.id!;
}
```

### 5.2 Algorithme de Publication TikTok v2 (`src/lib/tiktok/publisher.ts`)

```typescript
import { prisma } from "@/lib/prisma";
import { getValidAccessToken } from "@/lib/tiktok/tokenManager";
import { env } from "@/lib/config/env";

export async function executeTikTokPublish(postId: string): Promise<string> {
  const post = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
    include: {
      account: true,
      mediaAssets: { orderBy: { sequenceOrder: "asc" } }
    }
  });

  // 1. Récupération d'un Access Token valide
  const accessToken = await getValidAccessToken(post.accountId);

  // 2. Détermination de la visibilité (Mode Sandbox contraint)
  const privacyLevel =
    env.TIKTOK_AUDIT_APPROVED === "true"
      ? post.privacyLevel
      : "SELF_ONLY";

  // 3. Déclenchement selon le type de post
  if (post.postType === "PHOTO") {
    const photoUrls = post.mediaAssets.map((asset) => asset.publicVerifiedUrl);

    // Contrôle strict du domaine vérifié
    const invalidDomain = photoUrls.some(
      (url) => !url.startsWith(env.S3_PUBLIC_VERIFIED_DOMAIN)
    );
    if (invalidDomain) {
      throw new Error(`CRITICAL_DOMAIN_ERROR: Les photos doivent pointer vers ${env.S3_PUBLIC_VERIFIED_DOMAIN}`);
    }

    const payload = {
      post_mode: "DIRECT_POST",
      media_type: "PHOTO",
      post_info: {
        title: post.title,
        description: post.caption,
        privacy_level: privacyLevel,
        disable_comment: post.disableComments,
        is_aigc: true,
        auto_add_music: true
      },
      source_info: {
        source: "PULL_FROM_URL",
        photo_images: photoUrls,
        photo_cover_index: 0
      }
    };

    const response = await fetch("https://open.tiktokapis.com/v2/post/publish/content/init/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || result.error?.code !== "ok") {
      throw new Error(`TIKTOK_API_ERROR: ${result.error?.message || response.statusText}`);
    }

    return result.data.publish_id;
  } else {
    // Pipeline Vidéo Directe
    const videoAsset = post.mediaAssets[0];
    if (!videoAsset) throw new Error("Aucun média vidéo associé à ce post.");

    const initPayload = {
      post_info: {
        title: post.caption,
        privacy_level: privacyLevel,
        disable_comment: post.disableComments,
        disable_duet: post.disableDuet,
        disable_stitch: post.disableStitch,
        is_aigc: true
      },
      source_info: {
        source: "FILE_UPLOAD",
        video_size: videoAsset.fileSizeByte,
        chunk_size: videoAsset.fileSizeByte,
        total_chunk_count: 1
      }
    };

    const initRes = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(initPayload)
    });

    const initData = await initRes.json();
    if (!initRes.ok || initData.error?.code !== "ok") {
      throw new Error(`TIKTOK_VIDEO_INIT_ERROR: ${initData.error?.message || initRes.statusText}`);
    }

    const { publish_id, upload_url } = initData.data;

    // Téléchargement du binaire depuis R2 et stream direct vers l'upload_url de TikTok
    const videoStream = await fetch(videoAsset.publicVerifiedUrl);
    const videoBuffer = await videoStream.arrayBuffer();

    const uploadRes = await fetch(upload_url, {
      method: "PUT",
      headers: {
        "Content-Type": "video/mp4",
        "Content-Range": `bytes 0-${videoAsset.fileSizeByte - 1}/${videoAsset.fileSizeByte}`
      },
      body: videoBuffer
    });

    if (!uploadRes.ok) {
      throw new Error(`TIKTOK_VIDEO_UPLOAD_ERROR: Échec du téléversement vers le CDN TikTok`);
    }

    return publish_id;
  }
}
```

### 5.3 Le Worker de Publication BullMQ (`src/workers/publishWorker.ts`)

```typescript
import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import { prisma } from "@/lib/prisma";
import { executeTikTokPublish } from "@/lib/tiktok/publisher";
import { acquireRedlock, releaseRedlock } from "@/lib/queue/redlock";
import { PublishJobData } from "@/lib/queue/publishQueue";

const redisConnection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null
});

export const publishWorker = new Worker<PublishJobData>(
  "tiktok-publish-queue",
  async (job: Job<PublishJobData>) => {
    const { postId } = job.data;
    const lockKey = `lock:post:${postId}`;
    const lockAcquired = await acquireRedlock(lockKey, 120 * 1000);

    if (!lockAcquired) {
      console.warn(`[WORKER] Lock non obtenu pour le post ${postId}, exécution ignorée.`);
      return;
    }

    try {
      // 1. Passage en statut PROCESSING
      await prisma.post.update({
        where: { id: postId },
        data: { status: "PROCESSING" }
      });

      // 2. Publication TikTok
      const publishId = await executeTikTokPublish(postId);

      // 3. Clôture en statut PUBLISHED
      await prisma.post.update({
        where: { id: postId },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          tiktokPublishId: publishId,
          failureReason: null
        }
      });

      // 4. Log d'audit
      await prisma.publishAuditLog.create({
        data: {
          postId,
          eventType: "PUBLISH_CONFIRMED",
          httpStatusCode: 200,
          rawResponse: { publishId }
        }
      });

      console.log(`[WORKER] Post ${postId} publié avec succès sur TikTok (ID: ${publishId}).`);
    } catch (error: any) {
      console.error(`[WORKER] Erreur lors de la publication du post ${postId}:`, error.message);

      const isLastAttempt = job.attemptsMade + 1 >= (job.opts.attempts || 3);

      if (isLastAttempt) {
        await prisma.post.update({
          where: { id: postId },
          data: {
            status: "FAILED",
            failureReason: error.message
          }
        });
      }

      await prisma.publishAuditLog.create({
        data: {
          postId,
          eventType: isLastAttempt ? "FINAL_FAILURE" : "RETRY_ATTEMPT",
          rawResponse: { error: error.message, attempt: job.attemptsMade + 1 }
        }
      });

      throw error; // Déclenche le backoff BullMQ si tentatives restantes
    } finally {
      await releaseRedlock(lockKey);
    }
  },
  {
    connection: redisConnection,
    concurrency: 5 // Traitement simultané de 5 jobs
  }
);
```

### 5.4 La Règle des 15 Minutes en Reprise après Crash (`src/workers/recoveryJob.ts`)

```typescript
import { prisma } from "@/lib/prisma";
import { executeTikTokPublish } from "@/lib/tiktok/publisher";
import { schedulePostJob } from "@/lib/queue/publishQueue";

export async function runCrashRecoveryScan(): Promise<void> {
  console.log("[RECOVERY] Démarrage du scan de réconciliation après redémarrage...");

  const now = new Date();
  const orphanedPosts = await prisma.post.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lt: now }
    }
  });

  for (const post of orphanedPosts) {
    if (!post.scheduledAt) continue;

    const delayMinutes = (now.getTime() - post.scheduledAt.getTime()) / (1000 * 60);

    if (delayMinutes <= 15) {
      console.log(`[RECOVERY] Post ${post.id} en retard de ${delayMinutes.toFixed(1)}m (<= 15m). Exécution d'urgence.`);
      await prisma.publishAuditLog.create({
        data: {
          postId: post.id,
          eventType: "RECOVERED_EXECUTION",
          rawResponse: { delayMinutes }
        }
      });
      // Exécution immédiate
      try {
        await executeTikTokPublish(post.id);
        await prisma.post.update({
          where: { id: post.id },
          data: { status: "PUBLISHED", publishedAt: new Date() }
        });
      } catch (err: any) {
        await prisma.post.update({
          where: { id: post.id },
          data: { status: "FAILED", failureReason: err.message }
        });
      }
    } else {
      console.warn(`[RECOVERY] Post ${post.id} en retard critique de ${delayMinutes.toFixed(1)}m (> 15m). Bascule en statut MISSED.`);
      await prisma.post.update({
        where: { id: post.id },
        data: {
          status: "MISSED",
          failureReason: `Échéance dépassée de ${Math.round(delayMinutes)} minutes suite à un arrêt serveur.`
        }
      });
      await prisma.publishAuditLog.create({
        data: {
          postId: post.id,
          eventType: "JOB_MARKED_MISSED",
          rawResponse: { delayMinutes, scheduledAt: post.scheduledAt }
        }
      });
    }
  }
}
```

---

## 6. INVENTAIRE DES FICHIERS À PRODUIRE DANS CE SPRINT

```text
src/
└── lib/
    ├── queue/
    │   ├── redis.ts
    │   ├── publishQueue.ts
    │   └── redlock.ts
    └── tiktok/
        └── publisher.ts
src/
└── workers/
    ├── publishWorker.ts
    ├── recoveryJob.ts
    └── runner.ts
src/
└── app/
    └── api/
        └── posts/
            ├── route.ts
            └── [id]/
                └── retry/
                    └── route.ts
tests/
└── integration/
    ├── schedulerResilience.test.ts
    └── idempotency.test.ts
```

---

## 7. SUITE DE TESTS DE RÉSILIENCE (`tests/integration/`)

1. **Test d'Idempotence Absolue (`idempotency.test.ts`) :**
   - Programme deux fois le même post avec `schedulePostJob(post.id)`.
   - Vérifie que BullMQ ne contient qu'un seul job dans la file Redis grâce à `jobId`.
2. **Test de la Règle des 15 Minutes (`schedulerResilience.test.ts`) :**
   - Insère un post avec `scheduledAt = NOW() - 10 min` $\rightarrow$ Le scan doit l'exécuter et le passer en `PUBLISHED`.
   - Insère un post avec `scheduledAt = NOW() - 30 min` $\rightarrow$ Le scan doit le basculer immédiatement en `MISSED`.

---

## 8. PROTOCOLE D'EXÉCUTION ET DE VALIDATION

1. **Compilation des workers :**
   ```bash
   pnpm typecheck
   ```
2. **Exécution des tests de résilience :**
   ```bash
   pnpm test tests/integration/schedulerResilience.test.ts
   ```

---

## 9. FORMAT DE RESTITUTION DU RAPPORT DE FIN DE SPRINT

```markdown
### ✅ RAPPORT DE CLÔTURE — SPRINT 05 : PLANIFICATEUR BULLMQ & RÉSILIENCE

1. **Statut :** TERMINE AVEC SUCCÈS
2. **Fichiers créés :**
   - `src/lib/queue/redis.ts`, `publishQueue.ts`, `redlock.ts`
   - `src/lib/tiktok/publisher.ts`
   - `src/workers/publishWorker.ts`, `recoveryJob.ts`, `runner.ts`
   - `src/app/api/posts/route.ts` & `src/app/api/posts/[id]/retry/route.ts`
   - `tests/integration/schedulerResilience.test.ts`
3. **Preuves de Validation :**
   - Idempotence garantie via `jobId` et Redlock
   - Règle des 15 minutes validée en simulation de redémarrage
   - Backoff exponentiel opérationnel
4. **Prêt pour le Sprint 06 :** Frontend Dashboard, Studio 3-Clics & Calendrier UI.
```
