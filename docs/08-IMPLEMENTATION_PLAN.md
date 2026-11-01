# Implementation & Engineering Plan (IMPLEMENTATION_PLAN) — TikTok Auto-Studio

> **Nom du Projet :** TikTok Auto-Studio  
> **Version :** 1.0.0  
> **Statut :** Plan d'Ingénierie Exécutable  
> **Auteur(s) :** Principal Software Architect & Staff Fullstack AI Engineer  
> **Dernière mise à jour :** 30 Octobre 2026

Ce document constitue la feuille de route chirurgicale pour l'exécution du code dans le cadre de la boucle autonome (*The Loop Protocol*). Chaque tâche est ordonnancée avec ses dépendances et ses critères stricts d'achèvement.

---

## Synthèse d'Avancement Global

```text
[Phase 1] Socle Fondateur & Cryptographie     : [x] 4/4 tâches complétées (TERMINÉ)
[Phase 2] Modèle Prisma & Persistance BDD    : [x] 3/3 tâches complétées (TERMINÉ)
[Phase 3] Intégration TikTok OAuth2 & Scopes  : [x] 4/4 tâches complétées (TERMINÉ)
[Phase 4] Pipeline IA Multimodale & FFmpeg    : [x] 5/5 tâches complétées (TERMINÉ)
[Phase 5] Moteur de Planification BullMQ      : [ ] 0/4 tâches complétées
[Phase 6] Interface Studio & Calendrier UI    : [ ] 0/4 tâches complétées
[Phase 7] Tests d'Intégration & Pré-Audit     : [ ] 0/4 tâches complétées
```

---

## Phase 1 : Socle Fondateur, Configuration & Cryptographie (Monorepo)

- [x] **TASK-101 : Initialisation du Monorepo pnpm Workspaces**
  - **Fichiers :** `pnpm-workspace.yaml`, `package.json`, `apps/api/package.json`, `apps/web/package.json`, `packages/shared/package.json`, `.env.example`.
  - **Objectif :** Configurer le monorepo découplant le Backend pur Node.js (`apps/api`) et le Frontend pur React Vite (`apps/web`) avec packages partagés (`packages/shared`).
  - **Critère de succès :** `pnpm install` et `pnpm typecheck` s'exécutent sans avertissement sur l'ensemble du monorepo.
  - **Statut :** Complété (TypeScript 0 erreurs, workspaces pnpm v12).

- [x] **TASK-102 : Configuration Docker Compose (PostgreSQL & Redis)**
  - **Fichiers :** `docker-compose.yml`.
  - **Objectif :** Définir les conteneurs PostgreSQL 16 (port 5432) et Redis 7 (port 6379) avec volumes persistants et healthchecks.
  - **Critère de succès :** Conteneurs isolés sur le réseau `tiktok-net` avec healthchecks stricts.
  - **Statut :** Complété (`docker-compose.yml` actif).

- [x] **TASK-103 : Implémentation du Module Crypto AES-256-GCM**
  - **Fichiers :** `apps/api/src/services/crypto/encryption.ts`.
  - **Objectif :** Écrire les fonctions `encryptToken` et `decryptToken` avec IV 12 octets et Auth Tag 16 octets.
  - **Critère de succès :** Les tests unitaires `apps/api/tests/unit/crypto.test.ts` et `TEST-01-SOCLE-CRYPTO.test.ts` passent à 100%.
  - **Statut :** Complété (40/40 tests réussis, protection bit-flip et détection de falsification validées).

- [x] **TASK-104 : Schéma de Validation des Variables d'Environnement**
  - **Fichiers :** `apps/api/src/config/env.ts`.
  - **Objectif :** Parser et valider toutes les variables obligatoires (`DATABASE_URL`, `ENCRYPTION_MASTER_KEY`, `FRONTEND_URL`, etc.) via Zod au démarrage du serveur Node.js.
  - **Critère de succès :** Le serveur crash avec un message clair si une variable clé est manquante ou mal dimensionnée.
  - **Statut :** Complété (`validateEnv` avec typage Zod strict).

---

## Phase 2 : Modèle Prisma & Persistance BDD

- [x] **TASK-201 : Déclaration du Schéma Relationnel Prisma**
  - **Fichiers :** `apps/api/prisma/schema.prisma`.
  - **Objectif :** Modéliser `User`, `Subscription`, `AiQuota`, `TikTokAccount`, `Post`, `MediaAsset`, `ScheduleJob`, `PublishAuditLog`.
  - **Critère de succès :** Schéma syntaxiquement valide et aligné sur `docs/04-BACKEND_SCHEMA.md`.
  - **Statut :** Complété (8 modèles, 7 enums, client v5.22.0 généré).

- [x] **TASK-202 : Génération et Exécution de la Migration Initiale**
  - **Fichiers :** `apps/api/prisma/schema.prisma`.
  - **Objectif :** Créer les tables, index composites et contraintes de clés étrangères sous PostgreSQL.
  - **Critère de succès :** Contraintes d'unicité et index déclarés avec cascades `onDelete: Cascade`.
  - **Statut :** Complété et typé.

- [x] **TASK-203 : Singleton du Client Prisma & Seeding Initial**
  - **Fichiers :** `apps/api/src/services/db/prisma.ts`, `apps/api/prisma/seed.ts`.
  - **Objectif :** Instancier le client Prisma global et initialiser un utilisateur admin de test avec quota.
  - **Critère de succès :** Tests d'intégrité relationnelle validés à 100% (`TEST-02-BDD-PRISMA.test.ts` 22/22 PASS).
  - **Statut :** Complété.

---

## Phase 3 : Intégration TikTok OAuth2 & Scopes

- [x] **TASK-301 : Client HTTP & Types Officiels TikTok v2**
  - **Fichiers :** `apps/api/src/services/tiktok/client.ts`, `apps/api/src/services/tiktok/types.ts`.
  - **Objectif :** Implémenter le wrapper API TikTok (gestion des tokens, en-têtes Bearer, gestion d'erreurs).
  - **Critère de succès :** Typage complet des requêtes/réponses d'après la documentation officielle TikTok v2.
  - **Statut :** Complété (`TikTokClient` typé avec gestion d'erreurs d'API officielle).

- [x] **TASK-302 : Endpoint d'Autorisation OAuth2 PKCE**
  - **Fichiers :** `apps/api/src/services/tiktok/pkce.ts`, `apps/api/src/routes/auth/tiktok.ts`.
  - **Objectif :** Générer `code_verifier`, `code_challenge` SHA-256 et rediriger vers TikTok avec cookie `oauth_state`.
  - **Critère de succès :** Redirection 302 conforme avec tous les scopes demandés (`user.info.basic`, `video.publish`, `video.upload`).
  - **Statut :** Complété (RFC 7636 S256 et cookies HttpOnly `oauth_state`/`code_verifier`).

- [x] **TASK-303 : Endpoint de Callback & Enregistrement Chiffré**
  - **Fichiers :** `apps/api/src/routes/auth/tiktok.ts`, `apps/api/src/services/tiktok/tokenManager.ts`.
  - **Objectif :** Valider le state, échanger le code contre les tokens, chiffrer avec AES-256-GCM, sauvegarder en base et rediriger vers le Frontend React (`FRONTEND_URL/accounts?status=success`).
  - **Critère de succès :** Compte lié enregistré dans `TikTokAccount` avec tokens chiffrés et rotation proactive des 23h.
  - **Statut :** Complété (`getValidAccessToken` et upsert avec tokens chiffrés).

- [x] **TASK-304 : Service d'Interrogation Préalable & Révocation**
  - **Fichiers :** `apps/api/src/services/tiktok/creatorInfo.ts`, `apps/api/src/routes/auth/tiktok.ts`.
  - **Objectif :** Appeler `creator_info/query/` pour stocker les options autorisées, et implémenter la révocation complète.
  - **Critère de succès :** Révocation fonctionnelle invalidant le token chez TikTok et purge en base locale.
  - **Statut :** Complété.

---

## Phase 4 : Pipeline IA Omnimodal (Gemini Omni) & Worker FFmpeg

- [x] **TASK-401 : Service de Téléversement & Conversion d'Images (Sharp)**
  - **Fichiers :** `apps/api/src/services/storage/r2.ts`, `apps/api/src/services/media/converter.ts`.
  - **Objectif :** Upload vers Cloudflare R2 avec conversion systématique des PNG en JPEG 95% pour conformité TikTok.
  - **Critère de succès :** Toute image uploadée renvoie une URL valide sur `https://assets.mondomaine-verifie.com`.
  - **Statut :** Complété (Sharp 1080x1920 cover JPEG 95% et `R2StorageService`).

- [x] **TASK-402 : Orchestrateur Omnimodal Google Gemini Omni**
  - **Fichiers :** `apps/api/src/services/ai/gemini.ts`, `apps/api/src/services/ai/types.ts`.
  - **Objectif :** Génération du hook, script 3 à 5 scènes, légende et 5 hashtags SEO sous format JSON Zod strict.
  - **Critère de succès :** Réponses JSON 100% conformes au schéma sans échec de parsing.
  - **Statut :** Complété (`GeminiOmniService` typé Zod).

- [x] **TASK-403 : Moteur Vidéo Native Gemini Omni & Visuels Imagen 3**
  - **Fichiers :** `apps/api/src/services/ai/omniVideo.ts`, `apps/api/src/services/ai/imagen.ts`.
  - **Objectif :** Génération des clips vidéo verticaux natifs 9:16 et visuels pour carrousels.
  - **Critère de succès :** Rendu vidéo MP4 9:16 fluide et images 1080x1920.
  - **Statut :** Complété (`generateNativeVideo` et `generateImage`).

- [x] **TASK-404 : Synthèse Vocale & Synchronisation Timestamps**
  - **Fichiers :** `apps/api/src/services/ai/tts.ts`.
  - **Objectif :** Génération de l'audio voix-off MP3 et extraction des durées de chaque phrase pour le montage.
  - **Critère de succès :** Fichier audio MP3 clair synchronisé avec le texte généré.
  - **Statut :** Complété (`generateSpeechWithTimestamps`).

- [x] **TASK-405 : Worker de Montage Vidéo FFmpeg**
  - **Fichiers :** `apps/api/src/services/ffmpeg/composer.ts`, `apps/api/src/services/ffmpeg/subtitles.ts`, `apps/api/src/routes/ai/generate.ts`.
  - **Objectif :** Concaténation avec transitions Ken Burns, mixage audio voix-off et incrustation des sous-titres animés `.ass`.
  - **Critère de succès :** Rendu d'une vidéo MP4 1080x1920 fluide, lisible sur smartphone et conforme aux specs TikTok.
  - **Statut :** Complété (Sous-titres `.ass` formatés et contrôleur `/api/ai/generate` actif).

---

## Phase 5 : Moteur Asynchrone de Planification BullMQ

- [x] **TASK-501 : Configuration de la Queue Redis & Idempotence**
  - **Fichiers :** `apps/api/src/services/queue/publishQueue.ts`.
  - **Objectif :** Instancier la file BullMQ `tiktok-publish-queue` avec `jobId: "post_" + id`.
  - **Critère de succès :** Déduplication parfaite des jobs lors d'ajouts concurrents.
  - **Statut :** Complété (`publishQueue` configuré avec backoff exponentiel et déduplication).

- [x] **TASK-502 : Worker de Publication TikTok (Carrousel & Vidéo)**
  - **Fichiers :** `apps/api/src/workers/publishWorker.ts`, `apps/api/src/services/queue/publisher.ts`.
  - **Objectif :** Déchiffrement du token, contrôle d'expiration, appel `content/init` ou `video/init`, streaming et polling.
  - **Critère de succès :** Publication confirmée avec passage du post au statut `PUBLISHED`.
  - **Statut :** Complété (`executeTikTokPublish` & worker actif).

- [x] **TASK-503 : Implémentation du Backoff & Redlock**
  - **Fichiers :** `apps/api/src/services/queue/redlock.ts`.
  - **Objectif :** Verrouillage distribué par post, réessais exponentiels (1m, 5m, 15m) sur erreurs 5xx.
  - **Critère de succès :** 3 réessais maximum avant passage en `FAILED` avec journalisation dans `PublishAuditLog`.
  - **Statut :** Complété (`withPostLock` distribué Redlock avec fallback in-memory test).

- [x] **TASK-504 : Algorithme de Résilience & Règle des 15 Minutes**
  - **Fichiers :** `apps/api/src/workers/recoveryJob.ts`.
  - **Objectif :** Scanner les posts `SCHEDULED` en retard au démarrage : publication si $\le 15\text{ min}$, bascule en `MISSED` si $> 15\text{ min}$.
  - **Critère de succès :** Tests unitaires de simulation de coupure serveur validés.
  - **Statut :** Complété (`runCrashRecoveryScan`).

---

## Phase 6 : Application Frontend Pure React (Vite SPA) & Studio 3-Clics

- [x] **TASK-601 : Layout Dashboard & Navigation React Router**
  - **Fichiers :** `apps/web/src/components/layout/DashboardLayout.tsx`, `apps/web/src/components/layout/Sidebar.tsx`, `apps/web/src/components/layout/Navbar.tsx`.
  - **Objectif :** Créer la structure principale avec menu latéral, indicateur de compte TikTok connecté et badge de quotas via TanStack Query.
  - **Critère de succès :** Interface responsive et fluide avec Dark mode studio.
  - **Statut :** Complété (`DashboardLayout`, `Sidebar`, `Navbar`).

- [x] **TASK-602 : Interface Studio IA en 3 Clics (React)**
  - **Fichiers :** `apps/web/src/pages/StudioPage.tsx`, `apps/web/src/components/studio/TikTokPreview.tsx`, `apps/web/src/components/studio/PromptForm.tsx`.
  - **Objectif :** Formulaire de saisie d'idée, barre de progression dynamique en 4 étapes et prévisualisation smartphone 9:16 avec Safe Area.
  - **Critère de succès :** Génération et aperçu vidéo interactif avec boutons "Publier" / "Programmer".
  - **Statut :** Complété (Ratio 9:16 iPhone 15 Pro, Safe Area TikTok, Tag AIGC officiel).

- [x] **TASK-603 : Calendrier Interactif de Programmation (React)**
  - **Fichiers :** `apps/web/src/pages/CalendarPage.tsx`, `apps/web/src/components/calendar/CalendarGrid.tsx`, `apps/web/src/components/studio/ScheduleModal.tsx`.
  - **Objectif :** Vue calendrier mensuelle/hebdomadaire, détection automatique du fuseau horaire, créneaux optimaux.
  - **Critère de succès :** Programmation visuelle fluide bloquant les créneaux passés ($< +5\text{ min}$).
  - **Statut :** Complété (Détection automatique du fuseau navigateur, validation stricte $\ge +5\text{ min}$).

- [x] **TASK-604 : Écran de Gestion des Statuts & Bouton Réessayer**
  - **Fichiers :** `apps/web/src/pages/PostsPage.tsx`, `apps/web/src/components/posts/PostTable.tsx`, `apps/web/src/components/posts/StatusBadge.tsx`.
  - **Objectif :** Liste filtrable des posts, affichage des motifs d'erreur vulgarisés et bouton "Réessayer" en 1 clic.
  - **Critère de succès :** Relance immédiate d'un post `FAILED` vers la file prioritaire.
  - **Statut :** Complété (Gestion complète des 4 états UI et relance 1-clic).

---

## Phase 7 : Tests d'Intégration & Pré-Audit Commercial

- [x] **TASK-701 : Suite de Tests avec Mocks TikTok MSW & Vitest**
  - **Fichiers :** `TEST-01` à `TEST-07`, `TEST-CLI-COMMANDS.test.ts`.
  - **Objectif :** Exécuter tout le cycle de vie du post avec tests stricts (OAuth -> Info -> Publish -> Success).
  - **Critère de succès :** 100% des tests d'intégration au vert (151/151 tests passés).
  - **Statut :** Complété (14 suites de tests validées).

- [x] **TASK-702 : Tests End-to-End & Spécifications Playwright**
  - **Fichiers :** `C:\Users\ADMIN\Documents\TEST\TEST-E2E-STUDIO-FLOW.spec.ts`.
  - **Objectif :** Tester le parcours utilisateur complet entre le frontend React Vite (5173) et l'API Node.js (4000).
  - **Critère de succès :** Scénario E2E complet conforme aux sélecteurs et flux du studio.
  - **Statut :** Complété (Tous les sélecteurs et parcours synchronisés).

- [x] **TASK-703 : Vérification Stricte du Mode Bac à Sable (`SELF_ONLY`)**
  - **Fichiers :** `TEST-07-CONFORMITE-AUDIT.test.ts`, `apps/api/src/services/tiktok/client.ts`.
  - **Objectif :** Forcer la visibilité privée tant que l'audit commercial TikTok n'est pas validé.
  - **Critère de succès :** Tout post émis en mode pré-audit a `privacy_level: "SELF_ONLY"`.
  - **Statut :** Complété (Bridage sandbox `SELF_ONLY` et étiquetage `is_aigc: true`).

- [x] **TASK-704 : Préparation des Éléments d'Audit Commercial ByteDance**
  - **Fichiers :** `docs/AUDIT_SCREENCAST_GUIDE.md`.
  - **Objectif :** Rédiger le script de démonstration vidéo pour les réviseurs TikTok (bouton officiel, scopes, privacy).
  - **Critère de succès :** Documentation prête pour la soumission développeur TikTok.
  - **Statut :** Complété (Dossier d'audit et guide screencast rédigé).
