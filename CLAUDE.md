# CLAUDE.md / AGENTS.md — Mémoire d'Ingénierie & Gouvernance Autonome

> **Projet :** TikTok Auto-Studio (SaaS d'automatisation, génération IA multimodale & publication TikTok v2)  
> **Dernière mise à jour :** 30 Octobre 2026  
> **Statut :** Document Maître Actif — Mémoire Vive de l'Agent IA

---

## 1. Rôle & Posture d'Ingénierie
Tu agis en tant que **Principal Software Architect & Staff Fullstack AI Engineer**.
- Tu produis du code TypeScript / React / Node.js de grade production immédiate (zéro raccourci, zéro placeholder `// TODO`, zéro pseudo-code).
- Chaque fonction critique est strictement typée (`noImplicitAny`, pas de type `any` permissif, `unknown` contrôlé) et validée aux frontières d'E/S avec des schémas **Zod**.
- Architecture découplée en Monorepo (pnpm workspaces) :
  * **Frontend Web :** Application monopage pure **React 18/19 (Vite + TypeScript + Tailwind + Shadcn)** dans `apps/web`.
  * **Backend API :** Serveur pur **Node.js (Fastify / Express + TypeScript)** dans `apps/api`.
  * **Contrats Partagés :** Schémas Zod et DTOs stricts dans `packages/shared`.
  * **Moteur Asynchrone :** BullMQ + Redis + Worker FFmpeg conteneurisé.
  * **Données & Cryptographie :** PostgreSQL 16 + Prisma ORM + Coffre-fort AES-256-GCM.

---

## 2. Commandes Fondamentales CLI & Recette (Monorepo)

```bash
# ==============================================================================
# INFRASTRUCTURE & DÉPENDANCES
# ==============================================================================
pnpm install                           # Installation stricte des dépendances du monorepo
docker compose up -d                  # PostgreSQL (5432) + Redis (6379)
pnpm db:migrate                        # Migration schéma BDD Prisma (apps/api)
pnpm db:generate                       # Régénération du client Prisma typé
pnpm db:seed                           # Chargement des fixtures & plans Stripe

# ==============================================================================
# CYCLE DE DÉVELOPPEMENT LOCAL
# ==============================================================================
pnpm dev                               # Lance simultanément le Frontend React (5173) et l'API Node.js (4000)
pnpm dev:api                           # Lance uniquement le serveur d'API Node.js
pnpm dev:web                           # Lance uniquement l'application React Vite
pnpm dev:worker                        # Lance le worker de publication isolé (BullMQ standalone)

# ==============================================================================
# VÉRIFICATIONS QUALITÉ, SÉCURITÉ & TESTS (OBLIGATOIRES AVANT COMMIT)
# ==============================================================================
pnpm lint                              # Linter ESLint sur l'ensemble du monorepo
pnpm typecheck                         # Compilateur TypeScript strict sur apps et packages
pnpm test                              # Tests unitaires Vitest (crypto, schemas Zod, API)
pnpm test:coverage                     # Couverture Vitest (seuil critique > 80%)
pnpm test:integration                  # Tests d'intégration (Redis, Postgres, R2 mock)
pnpm test:e2e                          # Tests Playwright parcours UC1 -> UC6 (React SPA -> API Node)
```

---

## 3. Invariants Architecturaux & Règles de Sécurité Non-Négociables

### 3.1 Sécurité des Tokens & Clés d'API (Niveau Militaire)
1. **Chiffrement au repos obligatoire :**
   - Tous les tokens TikTok (`access_token`, `refresh_token`) sont chiffrés via **AES-256-GCM** avant écriture en base de données.
   - Algorithme : Clé maîtresse de 32 octets (`ENCRYPTION_MASTER_KEY`), IV aléatoire unique de 12 octets (`crypto.randomBytes(12)`), Auth Tag de 16 octets.
   - Format de stockage sérialisé : `base64(iv):base64(authTag):base64(ciphertext)`.
   - Tout échec de déchiffrement ou corruption du tag d'authentification invalide immédiatement l'opération et journalise un incident de sécurité critique.
2. **Cloisonnement Client/Serveur absolu :**
   - Aucun jeton brut, aucune clé secrète, aucun token TikTok n'est jamais transmis au navigateur client.
   - Les sessions web utilisent des cookies `HttpOnly`, `SameSite=Strict`, `Secure` chiffrés.

### 3.2 Conformité TikTok API v2 & Directives d'Audit
1. **Appel préalable systématique :** Avant toute publication ou validation de brouillon, exécution de `POST /v2/post/publish/creator_info/query/` pour valider la durée vidéo permise, les niveaux de confidentialité autorisés et les restrictions d'interaction.
2. **Restriction Sandbox Pré-Audit :** La confidentialité par défaut est obligatoirement bridée sur `SELF_ONLY` (privé) tant que l'audit commercial ByteDance n'est pas approuvé en production.
3. **Contrainte Carrousel Photo (Cloudflare R2 + Domaine Vérifié) :**
   - Les photos DOIVENT être hébergées sur le sous-domaine vérifié DNS auprès de TikTok (`https://assets.mondomaine-verifie.com`).
   - Formats d'image strictement limités à **JPEG** et **WEBP**. **Les fichiers PNG sont formellement rejetés par TikTok** ; conversion obligatoire dans le pipeline avant tout upload.
4. **Transparence IA obligatoire :** Paramètre obligatoire `is_aigc: true` injecté dans l'objet `post_info` de chaque requête TikTok.

### 3.3 Moteur Asynchrone & Résilience (BullMQ + Redis)
1. **Idempotence stricte :** Chaque job de publication porte un identifiant unique déterministe `jobId: "post_" + post.id` avec verrou distribué Redlock pour bannir tout double post.
2. **Règle des 15 minutes en reprise après crash :**
   - Si `retard <= 15 min` : publication immédiate avec statut `RECOVERED_EXECUTION`.
   - Si `retard > 15 min` : bascule automatique au statut `MISSED`, annulation de l'envoi direct et alerte utilisateur pour replanification manuelle.
3. **Backoff Exponentiel :** 3 réessais maximum sur erreurs réseau 5xx (1 min, 5 min, 15 min). Arrêt immédiat et statut `FAILED` sur erreurs d'autorisation 4xx.

### 3.4 Quotas SaaS & IA Omnimodale (Gemini Omni)
1. Décrémentation atomique des crédits d'inférence journaliers dans Redis/PostgreSQL avant tout appel LLM (Gemini Omni), génération d'images (Gemini Omni / Imagen 3) ou génération vidéo native.
2. Prise en charge des deux modes vidéo : Mode Vidéo Native (génération directe par Gemini Omni) et Mode Vidéo Composite (Gemini Omni + Voix TTS + Montage FFmpeg avec sous-titres `.ass`).
3. Modération automatique des prompts en amont pour éviter les suspensions de comptes TikTok liées aux termes interdits.

---

## 4. Protocole de Boucle Autonome (The Loop Protocol)

Lors de chaque session de travail autonome :
1. **[INSPECT]** : Examiner `docs/FEUILLE_DE_ROUTE_DEV_ET_TESTS.md` ainsi que `docs/08-IMPLEMENTATION_PLAN.md` et identifier la première tâche non cochée `[ ]`.
2. **[ALIGNMENT]** : Consulter `README.md` et les spécifications correspondantes (`docs/00-VISION.md`, `docs/01-PRODUCT_REQUIREMENTS_DOCUMENT.md` à `docs/07-TEST_PLAN.md`).
3. **[ATOMIC EXECUTION]** : Implémenter l'intégralité du module, du test ou du fichier de spécification sans omission ni placeholder.
4. **[VERIFY]** : Valider via `pnpm lint`, `pnpm typecheck`, `pnpm test` (suites `C:\Users\ADMIN\Documents\TEST`) ou relecture stricte de conformité Markdown.
5. **[COMMIT & RECURSE]** :
   - Cocher la case `[x]` dans `docs/08-IMPLEMENTATION_PLAN.md`.
   - Émettre un rapport flash en 3 lignes :
     - **Fait :** [Composant/document implémenté]
     - **Vérifié :** [Commandes ou contrôles exécutés avec succès]
     - **Tâche suivante :** [Prochaine tâche identifiée]
   - Déclencher le cycle suivant avec le token : `[TRIGGER: NEXT_TASK]`.
