# ==============================================================================
# MASTER PROMPT D'INGÉNIERIE — SPRINT 01 : SOCLE FONDATEUR & CRYPTOGRAPHIE
# ==============================================================================

> **Destinataire du Prompt :** Agent Autonome d'Ingénierie Logicielle (Fullstack / Lead Architect)  
> **Niveau de Contexte Initial :** Zéro Connaissance Préalable (Self-Contained Master Prompt)  
> **Projet :** TikTok Auto-Studio  
> **Objectif du Sprint :** Mise en place du socle technique complet, configuration de l'infrastructure locale conteneurisée (Docker), validation stricte des variables d'environnement via Zod, et implémentation du coffre-fort cryptographique militaire AES-256-GCM avec couverture de tests unitaires à 100%.

---

## 1. RÔLE, POSTURE ET RÈGLES D'ENGAGEMENT DE L'AGENT

Tu es mandaté en tant que **Principal Software Architect & Lead Security Engineer**.
Tu vas travailler sur un sous-ensemble critique du projet sans aucune assistance humaine.

### Règles d'or absolues :
1. **Zéro Placeholder :** Tu n'écris JAMAIS de code tronqué, de `// TODO`, de `// Implement later`, ou de pseudo-code. Chaque fonction doit être écrite intégralement avec sa gestion d'erreurs et ses types stricts.
2. **Typage Stricte TypeScript :** Pas de type `any`. Utilise `unknown` si le type est indéterminé, avec narrowing via des garde-fous ou des schémas **Zod**.
3. **Rigueur Cryptographique :** L'algorithme retenu est `aes-256-gcm`. Tout compromis sur le vecteur d'initialisation (IV) ou le tag d'authentification (Auth Tag) est considéré comme un échec critique.
4. **Validation Systématique :** Chaque livrable doit être compilable (`pnpm typecheck`) et testable immédiatement (`pnpm test`).

---

## 2. CONTEXTE GLOBAL DU PROJET : "TIKTOK AUTO-STUDIO"

### 2.1 Qu'est-ce que TikTok Auto-Studio ?
**TikTok Auto-Studio** est une plateforme SaaS B2B/B2C permettant aux créateurs de contenu, e-commerçants et agences marketing d'automatiser à 100% la création et la publication de vidéos et carrousels photos sur TikTok sans intervention manuelle sur smartphone.

### 2.2 Pourquoi ce produit existe-t-il ?
Pour réussir sur TikTok, il faut poster 1 à 3 fois par jour. Or :
1. Concevoir un contenu (script, voix-off, visuels 9:16, montage) prend 1h à 2h par jour.
2. TikTok force la validation manuelle sur l'application mobile pour les outils tiers non officiels.
3. Les outils de scraping ou émulateurs Android mènent au bannissement définitif du compte (*shadowban*).

### 2.3 Comment fonctionne la solution globale ?
La plateforme s'appuie exclusivement sur les **APIs officielles certifiées de TikTok (Login Kit & Content Posting API v2)** couplées à une suite d'IA multimodale (Google Gemini pour les scripts, Google Imagen 3 pour les visuels 9:16, synthèse vocale, et moteur FFmpeg automatisé).
Un planificateur asynchrone (BullMQ + Redis) publie les posts à la seconde près.

### 2.4 Pourquoi la cryptographie est-elle le point le plus critique ?
Pour publier au nom de l'utilisateur, notre plateforme détient des `access_token` et `refresh_token` TikTok. Si ces jetons fuitent :
- Un pirate pourrait publier des vidéos illicites ou haineuses sur le compte du client.
- L'application perdrait immédiatement sa certification développeur TikTok.
**Conséquence :** Aucun jeton ne peut être enregistré en clair dans la base de données PostgreSQL. Tout jeton doit être chiffré au repos via **AES-256-GCM** avec une clé maîtresse de 256 bits, un IV unique de 12 octets par écriture, et un Auth Tag de 16 octets vérifié à chaque lecture.

---

## 3. ÉTAT DU PROJET AVANT CE SPRINT (POINT DE DÉPART)

L'espace de travail est localisé dans : `C:\Users\ADMIN\Documents\tiktok-auto-studio`
Avant ton intervention, le projet contient uniquement le socle documentaire :
- `README.md` : Présentation exhaustive de l'architecture.
- `CLAUDE.md` : Règles de gouvernance pour l'agent.
- `docs/` : Le socle documentaire complet (`00-VISION.md`, `01-PRODUCT_REQUIREMENTS_DOCUMENT.md`, `02-TECHNICAL_REQUIREMENTS_DOCUMENT.md` à `09-ROADMAP.md`).
- **Aucun fichier de code source n'est encore implémenté.** L'arborescence technique `src/`, `tests/`, `docker-compose.yml`, `package.json` doit être forgée durant ce Sprint 01.

---

## 4. MISSION PRÉCISE DU SPRINT 01

Tu dois créer l'épine dorsale du projet en réalisant les 6 actions atomiques suivantes :
1. **Initialisation du Monorepo (`pnpm-workspace.yaml` et `package.json` racine)** avec gestion des workspaces `apps/*` (Backend Node `apps/api` et Frontend React `apps/web`) et `packages/*` (`packages/shared`).
2. **Configuration TypeScript & Outillage :** `tsconfig.base.json`, `.gitignore` standardisé et configurations découplées (Vite pour `apps/web`, Node `tsc` pour `apps/api`).
3. **Infrastructure Locale Conteneurisée :** Rédaction de `docker-compose.yml` déclarant PostgreSQL 16 (port 5432) et Redis 7 (port 6379) avec persistance locale et healthchecks.
4. **Validation Zod des Variables d'Environnement :** Création de `apps/api/src/config/env.ts` et `.env.example` assurant le crash immédiat du serveur Node si une variable obligatoire est absente ou mal configurée (avec CORS `FRONTEND_URL`).
5. **Moteur Cryptographique Militaire :** Implémentation complète de `apps/api/src/services/crypto/encryption.ts` (fonctions `encryptToken` et `decryptToken` avec AES-256-GCM, gestion des IVs et Auth Tags).
6. **Couverture de Tests Unitaires :** Écriture et exécution de `apps/api/tests/unit/crypto.test.ts` via Vitest (100% de réussite exigée, tests de non-régression, altération intentionnelle de tag, formats corrompus).

---

## 5. SPÉCIFICATIONS TECHNIQUES DÉTAILLÉES & CONTRATS DE CODE

### 5.1 Fichier `pnpm-workspace.yaml` & `package.json` Racine

#### `pnpm-workspace.yaml` :
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

#### Scripts obligatoires dans le `package.json` racine :
- `"dev"`: `"pnpm --parallel --filter @tiktok-studio/* dev"`
- `"dev:api"`: `"pnpm --filter @tiktok-studio/api dev"`
- `"dev:web"`: `"pnpm --filter @tiktok-studio/web dev"`
- `"build"`: `"pnpm --recursive --filter @tiktok-studio/* build"`
- `"lint"`: `"pnpm --recursive lint"`
- `"typecheck"`: `"pnpm --recursive typecheck"`
- `"test"`: `"pnpm --recursive test"`
- `"db:migrate"`: `"pnpm --filter @tiktok-studio/api prisma migrate dev"`
- `"db:generate"`: `"pnpm --filter @tiktok-studio/api prisma generate"`

#### Dépendances clés par application :
- **`apps/api` (Backend Node.js) :** `fastify@^4.28.1` (ou `express@^4.21.1`), `@fastify/cors@^9.0.1`, `@fastify/cookie@^9.3.1`, `@prisma/client@^5.21.1`, `bullmq@^5.20.0`, `ioredis@^5.4.1`, `sharp@^0.33.5`, `zod@^3.23.8`, `typescript@^5.6.3`, `tsx@^4.19.1`
- **`apps/web` (Frontend React) :** `react@^18.3.1`, `react-dom@^18.3.1`, `react-router-dom@^6.27.0`, `@tanstack/react-query@^5.59.16`, `axios@^1.7.7`, `tailwindcss@^3.4.14`, `lucide-react@^0.453.0`, `vite@^5.4.9`
- **`packages/shared` :** `zod@^3.23.8`, `typescript@^5.6.3`

### 5.2 Fichier `docker-compose.yml`
Déclare deux conteneurs fondamentaux isolés sur un réseau interne `tiktok-studio-net` :
1. **Conteneur PostgreSQL (`tiktok-postgres`) :**
   - Image : `postgres:16-alpine`
   - Ports : `5432:5432`
   - Environnement : `POSTGRES_USER=postgres`, `POSTGRES_PASSWORD=postgres_password`, `POSTGRES_DB=tiktok_studio`
   - Volumes : `postgres_data:/var/lib/postgresql/data`
   - Healthcheck : `pg_isready -U postgres` (intervalle: 5s, timeout: 5s, retries: 5)
2. **Conteneur Redis (`tiktok-redis`) :**
   - Image : `redis:7-alpine`
   - Ports : `6379:6379`
   - Commande : `redis-server --appendonly yes`
   - Volumes : `redis_data:/data`
   - Healthcheck : `redis-cli ping` (intervalle: 5s, timeout: 5s, retries: 5)
3. **Volumes nommés :** `postgres_data` et `redis_data`.

### 5.3 Fichier `apps/api/src/config/env.ts` (Validation Stricte Zod)
Ce module garantit que le serveur Node.js ne peut pas démarrer si les clés critiques manquent.

```typescript
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000), // Port API Node.js
  API_URL: z.string().url().default("http://localhost:4000"),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"), // Origine React Vite

  // Persistance & Cache
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),

  // Sécurité & Crypto (Exactement 64 caractères hexadécimaux = 32 octets)
  ENCRYPTION_MASTER_KEY: z.string().length(64, {
    message: "ENCRYPTION_MASTER_KEY doit contenir exactement 64 caractères hexadécimaux (256 bits)."
  }).regex(/^[0-9a-fA-F]+$/, {
    message: "ENCRYPTION_MASTER_KEY doit être une chaîne hexadécimale valide."
  }),
  JWT_SECRET: z.string().min(32, {
    message: "JWT_SECRET doit contenir au moins 32 caractères."
  }),

  // TikTok API v2
  TIKTOK_CLIENT_KEY: z.string().default("dev_tiktok_key"),
  TIKTOK_CLIENT_SECRET: z.string().default("dev_tiktok_secret"),
  TIKTOK_REDIRECT_URI: z.string().url().default("http://localhost:4000/api/auth/tiktok/callback"),
  TIKTOK_AUDIT_APPROVED: z.enum(["true", "false"]).default("false"),

  // Cloudflare R2 / S3
  S3_ENDPOINT: z.string().url().default("https://example.r2.cloudflarestorage.com"),
  S3_ACCESS_KEY_ID: z.string().default("dev_access_key"),
  S3_SECRET_ACCESS_KEY: z.string().default("dev_secret_key"),
  S3_BUCKET_NAME: z.string().default("tiktok-media-dev"),
  S3_PUBLIC_VERIFIED_DOMAIN: z.string().url().default("https://assets.mondomaine-verifie.com"),

  // Fournisseurs IA
  GEMINI_API_KEY: z.string().default("dev_gemini_key"),
  ELEVENLABS_API_KEY: z.string().default("dev_elevenlabs_key")
});

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env;

try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ ERREUR CRITIQUE DE CONFIGURATION ENVIRONNEMENTALE :");
    console.error(JSON.stringify(error.format(), null, 2));
    process.exit(1);
  }
  throw error;
}

export const env = parsedEnv;
```

### 5.4 Fichier `src/lib/crypto/encryption.ts` (Coffre-Fort AES-256-GCM)
C'est le composant le plus sensible de l'architecture.

#### Règles de conception interne :
- Algorithme : `aes-256-gcm`.
- La clé maîtresse est lue depuis `process.env.ENCRYPTION_MASTER_KEY` et convertie en Buffer binaire (`Buffer.from(hexKey, 'hex')`).
- L'IV est généré aléatoirement à chaque appel : `crypto.randomBytes(12)`.
- Lors du chiffrement, on extrait le tag d'authentification : `cipher.getAuthTag()` (16 octets).
- Format sérialisé stocké en BDD : `${ivBase64}:${authTagBase64}:${cipherTextBase64}`.
- Lors du déchiffrement :
  - Découpage strict sur le séparateur `:`. Doit comporter exactement 3 parties.
  - Décodage des Buffers base64.
  - Vérification stricte des longueurs (`iv.length === 12` et `authTag.length === 16`).
  - `decipher.setAuthTag(authTag)`.
  - Si l'un des bits du ciphertext ou du tag a été altéré, `decipher.final()` lève automatiquement une exception OpenSSL. Le module doit intercepter cette erreur et la requalifier en erreur typée : `SecurityIntegrityError`.

---

## 6. INVENTAIRE DES FICHIERS À PRODUIRE DANS CE SPRINT

Voici la liste exacte des fichiers que tu dois créer à la racine du projet :

```text
tiktok-auto-studio/
├── .env.example
├── .env.local
├── .gitignore
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   └── lib/
│       ├── config/
│       │   └── env.ts
│       └── crypto/
│           └── encryption.ts
└── tests/
    └── unit/
        └── crypto.test.ts
```

---

## 7. SUITE DE TESTS UNITAIRES OBLIGATOIRE (`tests/unit/crypto.test.ts`)

La suite de tests Vitest doit tester tous les cas suivants :
1. **Cas Nominal :** Chiffre une chaîne secrète de type token TikTok (`"act.tiktok.sample_token_secret_123456789"`), déchiffre la valeur et vérifie l'égalité parfaite avec le message d'origine.
2. **Unicité des Vecteurs d'Initialisation (IV) :** Chiffre deux fois le même texte en clair consécutivement. Vérifie que les deux résultats chiffrés et leurs IVs respectifs sont **strictement différents**.
3. **Protection contre l'Altération (Intégrité GCM) :** Chiffre un texte. Modifie un seul caractère du ciphertext ou du tag d'authentification. Tente le déchiffrement et vérifie que le code lève immédiatement l'exception `SecurityIntegrityError`.
4. **Validation des Entrées Vides ou Non Textuelles :** Vérifie que `encryptToken("")` ou une valeur non valide lève une erreur explicite.
5. **Format Malformé :** Tente de déchiffrer une chaîne ne comportant pas les 3 segments attendus (`"invalid:format"`), et vérifie le rejet.

---

## 8. PROTOCOLE D'EXÉCUTION ET DE VALIDATION

Pour déclarer ce sprint terminé, tu dois exécuter les étapes de validation suivantes dans ton environnement :

1. **Installation :**
   ```bash
   pnpm install
   ```
2. **Vérification TypeScript :**
   ```bash
   pnpm typecheck
   ```
   *Résultat attendu : 0 erreur de typage.*
3. **Exécution des Tests :**
   ```bash
   pnpm test
   ```
   *Résultat attendu : Tous les tests unitaires cryptographiques passent avec succès.*
4. **Vérification Docker :**
   Vérifier la validité de la syntaxe de `docker-compose.yml`.

---

## 9. FORMAT DE RESTITUTION DU RAPPORT DE FIN DE SPRINT

Une fois tout le code écrit, vérifié et testé, tu dois émettre un rapport de clôture sous ce format précis :

```markdown
### ✅ RAPPORT DE CLÔTURE — SPRINT 01 : SOCLE FONDATEUR & CRYPTOGRAPHIE

1. **Statut :** TERMINE AVEC SUCCÈS
2. **Fichiers créés :**
   - `package.json`
   - `tsconfig.json`
   - `docker-compose.yml`
   - `.env.example` & `.env.local`
   - `src/lib/config/env.ts`
   - `src/lib/crypto/encryption.ts`
   - `tests/unit/crypto.test.ts`
3. **Preuves de Validation :**
   - Compilation TypeScript : PASS (0 erreur)
   - Tests Vitest : PASS (100% de réussite sur les tests crypto)
4. **Prêt pour le Sprint 02 :** Modèle de Données PostgreSQL & Schéma Prisma ORM.
```
