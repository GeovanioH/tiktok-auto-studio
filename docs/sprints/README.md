# Index des Master Prompts d'Ingénierie — Sprints Autonomes

> Ce dossier rassemble les **7 Master Prompts d'Implémentation Unitaire** pour le projet **TikTok Auto-Studio**.  
> Chaque document a été conçu pour être confié à un agent d'IA autonome **sans aucune connaissance préalable du projet (Zero-Context Agent)**.

---

## Vue d'Ensemble des 7 Sprints Unitaires

| Sprint | Fichier Master Prompt | Domaine & Responsabilité | Dépendances & Livrables Clés |
| :---: | :--- | :--- | :--- |
| **01** | [`SPRINT-01-SOCLE-CRYPTO.md`](./SPRINT-01-SOCLE-CRYPTO.md) | **Socle Fondateur & Cryptographie (Monorepo)** | `pnpm-workspace.yaml`, `package.json` racine, `docker-compose.yml`, `apps/api/src/config/env.ts`, `apps/api/src/services/crypto/encryption.ts` (AES-256-GCM), tests unitaires. |
| **02** | [`SPRINT-02-BDD-PRISMA.md`](./SPRINT-02-BDD-PRISMA.md) | **Base PostgreSQL & Prisma ORM** | `apps/api/prisma/schema.prisma` (8 tables, 6 enums), migrations SQL, `src/lib/prisma.ts` singleton, script de seed, tests d'intégrité BDD. |
| **03** | [`SPRINT-03-TIKTOK-API.md`](./SPRINT-03-TIKTOK-API.md) | **Intégration TikTok API v2 & OAuth2** | Protocole PKCE (S256), flux callback, rotation proactif de token (23h), appel `creator_info/query/`, redirection frontend. |
| **04** | [`SPRINT-04-AI-FFMPEG.md`](./SPRINT-04-AI-FFMPEG.md) | **Pipeline Omnimodal & Montage FFmpeg** | Gemini Omni (vidéo native 9:16 + visuels carrousel), conversion Sharp PNG $\rightarrow$ JPEG 95%, sous-titres `.ass`, montage vidéo composite. |
| **05** | [`SPRINT-05-BULLMQ-SCHEDULER.md`](./SPRINT-05-BULLMQ-SCHEDULER.md) | **Moteur Asynchrone BullMQ & Résilience** | File Redis, idempotence `jobId`, verrou Redlock, streaming TikTok v2, **règle des 15 minutes** après crash, backoff exp. |
| **06** | [`SPRINT-06-UI-STUDIO.md`](./SPRINT-06-UI-STUDIO.md) | **Frontend Pur React (Vite SPA) & Studio 3-Clics** | Layout Dashboard React Router, prévisualisation smartphone 9:16 avec Safe Area TikTok, calendrier interactif, TanStack Query. |
| **07** | [`SPRINT-07-TESTS-AUDIT.md`](./SPRINT-07-TESTS-AUDIT.md) | **Tests E2E & Pack d'Audit TikTok** | Mocks MSW officiels, tests des 5 cas limites (edge cases), tests Playwright E2E (React 5173 <-> API 4000), guide screencast ByteDance. |

---

## Protocole de Délégation à un Agent Tiers

Lorsque vous lancez un sous-agent autonome ou une nouvelle session d'ingénierie :
1. **Copiez l'intégralité du fichier Markdown du sprint concerné** (ex: `SPRINT-01-SOCLE-CRYPTO.md`).
2. **Injectez-le directement comme prompt initial** de l'agent.
3. L'agent disposera immédiatement :
   - Du rôle et des règles d'engagement absolues (zéro placeholder, typage strict).
   - Du contexte à 360° du projet TikTok Auto-Studio.
   - De l'état exact des fichiers au démarrage.
   - Des spécifications techniques de chaque module à produire.
   - Du code complet de référence à instancier.
   - Des commandes exactes de test et de validation.
   - Du format standardisé du rapport de clôture de mission.
