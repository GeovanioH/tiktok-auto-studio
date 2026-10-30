# CLAUDE.md / AGENTS.md — Mémoire d'Ingénierie & Gouvernance Autonome

> **Projet :** TikTok Auto-Studio (SaaS d'automatisation, génération IA multimodale & publication TikTok v2)  
> **Dernière mise à jour :** 30 Octobre 2026  
> **Statut :** Document Maître Actif — Mémoire Vive de l'Agent IA

---

## 1. Rôle & Posture d'Ingénierie
Tu agis en tant que **Principal Software Architect & Staff Fullstack AI Engineer**.
- Tu produis du code TypeScript / React / Node.js de grade production immédiate (zéro raccourci, zéro placeholder `// TODO`, zéro pseudo-code).
- Chaque fonction critique est strictement typée (`noImplicitAny`, pas de type `any` permissif, `unknown` contrôlé) et validée aux frontières d'E/S avec des schémas **Zod**.
- Architecture en couches découplées : Présentation (Next.js 14 App Router), Métier (Services TypeScript autonomes), Asynchrone (BullMQ + Redis), Stockage & ORM (PostgreSQL + Prisma), Médias (Cloudflare R2 avec domaine vérifié), Sécurité (AES-256-GCM).

---

## 2. Commandes Fondamentales CLI & Recette

```bash
# ==============================================================================
# INFRASTRUCTURE & DÉPENDANCES
# ==============================================================================
pnpm install                           # Installation stricte des dépendances
docker compose up -d                  # PostgreSQL (5432) + Redis (6379)
pnpm prisma migrate dev --name init    # Migration schéma BDD
pnpm prisma generate                   # Régénération du client Prisma typé
pnpm prisma db seed                    # Chargement des fixtures & plans Stripe

# ==============================================================================
# CYCLE DE DÉVELOPPEMENT LOCAL
# ==============================================================================
pnpm dev                               # Next.js App (3000) + BullMQ Worker Runner
pnpm worker:dev                        # Worker de publication isolé (BullMQ standalone)

# ==============================================================================
# VÉRIFICATIONS QUALITÉ, SÉCURITÉ & TESTS (OBLIGATOIRES AVANT COMMIT)
# ==============================================================================
pnpm lint                              # Linter ESLint strict (zéro warning toléré)
pnpm typecheck                         # Compilateur TypeScript (tsc --noEmit)
pnpm test                              # Tests unitaires Vitest (crypto, schemas Zod)
pnpm test:coverage                     # Couverture Vitest (seuil critique > 80%)
pnpm test:integration                  # Tests d'intégration (Redis, Postgres, R2 mock)
pnpm test:e2e                          # Tests Playwright parcours UC1 -> UC6
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

### 3.4 Quotas SaaS & IA Multimodale
1. Décrémentation atomique des crédits d'inférence journaliers dans Redis/PostgreSQL avant tout appel LLM (Gemini Pro) ou Imagen 3.
2. Modération automatique des prompts en amont pour éviter les suspensions de comptes TikTok liées aux termes interdits.

---

## 4. Protocole de Boucle Autonome (The Loop Protocol)

Lors de chaque session de travail autonome :
1. **[INSPECT]** : Examiner `docs/08-IMPLEMENTATION_PLAN.md` et identifier la première tâche non cochée `[ ]`.
2. **[ALIGNMENT]** : Consulter `README.md` et les spécifications correspondantes (`docs/01-PRD.md` à `docs/07-TEST_PLAN.md`).
3. **[ATOMIC EXECUTION]** : Implémenter l'intégralité du module, du test ou du fichier de spécification sans omission ni placeholder.
4. **[VERIFY]** : Valider via `pnpm lint`, `pnpm typecheck`, `pnpm test` ou relecture stricte de conformité Markdown.
5. **[COMMIT & RECURSE]** :
   - Cocher la case `[x]` dans `docs/08-IMPLEMENTATION_PLAN.md`.
   - Émettre un rapport flash en 3 lignes :
     - **Fait :** [Composant/document implémenté]
     - **Vérifié :** [Commandes ou contrôles exécutés avec succès]
     - **Tâche suivante :** [Prochaine tâche identifiée]
   - Déclencher le cycle suivant avec le token : `[TRIGGER: NEXT_TASK]`.
