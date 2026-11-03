# 🔑 Guide Exhaustif de Récupération des Clés API — TikTok Auto-Studio

> Ce guide pas à pas détaille comment obtenir, configurer et sécuriser l'ensemble des clés d'API et variables d'environnement nécessaires au fonctionnement de **TikTok Auto-Studio**.

---

## 📑 Sommaire

1. [Tableau Récapitulatif des Services & Clés](#1-tableau-récapitulatif-des-services--clés)
2. [Google AI Studio (Gemini 1.5 & Imagen 3)](#2-google-ai-studio-gemini-15--imagen-3)
3. [ElevenLabs (Synthèse Vocale TTS)](#3-elevenlabs-synthèse-vocale-tts)
4. [TikTok Developer Portal (Login Kit & Content Posting)](#4-tiktok-developer-portal-login-kit--content-posting)
5. [Stockage Médias S3 / Supabase Storage (Domaine Vérifié)](#5-stockage-médias-s3--supabase-storage-domaine-vérifié)
6. [Clés Cryptographiques Locales (AES-256-GCM & JWT)](#6-clés-cryptographiques-locales-aes-256-gcm--jwt)
7. [Base de Données PostgreSQL & Cache Redis](#7-base-de-données-postgresql--cache-redis)
8. [Fichier `.env` Prêt à l'Emploi & Vérification](#8-fichier-env-prêt-à-lemploi--vérification)

---

## 1. Tableau Récapitulatif des Services & Clés

| Variable `.env` | Service Fournisseur | Rôle dans l'application | Coût / Tier Gratuit | Lien direct du portail |
| :--- | :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | **Google AI Studio** | Scripts IA, score viral, métadonnées & visuels | **Gratuit** (Free tier 15 RPM) | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| `ELEVENLABS_API_KEY` | **ElevenLabs Voice AI** | Génération de la voix-off ultra-réaliste | **Gratuit** (10 000 car./mois) | [elevenlabs.io](https://elevenlabs.io/) |
| `TIKTOK_CLIENT_KEY` | **TikTok for Developers** | Identifiant de votre application TikTok | **Gratuit** | [developers.tiktok.com](https://developers.tiktok.com/) |
| `TIKTOK_CLIENT_SECRET`| **TikTok for Developers** | Secret OAuth2 pour l'échange de jetons | **Gratuit** | [developers.tiktok.com](https://developers.tiktok.com/) |
| `S3_ACCESS_KEY_ID` | **Cloudflare R2** (ou AWS) | Authentification stockage média S3 | **Gratuit** (10 Go/mois, 0\$ egress) | [dash.cloudflare.com](https://dash.cloudflare.com/) |
| `S3_SECRET_ACCESS_KEY`| **Cloudflare R2** (ou AWS) | Secret API du stockage S3 | **Gratuit** | [dash.cloudflare.com](https://dash.cloudflare.com/) |
| `ENCRYPTION_MASTER_KEY`| **Génération Locale** | Chiffrement AES-256-GCM des tokens | **Gratuit** (Généré en Node.js) | Local |
| `JWT_SECRET` | **Génération Locale** | Signature des sessions web HttpOnly | **Gratuit** (Généré en Node.js) | Local |
| `DATABASE_URL` | **Neon / Supabase / Local** | Stockage PostgreSQL des posts et comptes | **Gratuit** (Tier cloud ou Docker) | [neon.tech](https://neon.tech/) |
| `REDIS_URL` | **Upstash / Local** | File d'attente BullMQ & planification | **Gratuit** (Tier cloud ou Docker) | [upstash.com](https://upstash.com/) |

---

## 2. Google AI Studio (Gemini 1.5 & Imagen 3)

Google AI Studio permet d'utiliser **Gemini 1.5 Pro**, **Gemini 1.5 Flash** et **Imagen 3** pour la rédaction des hooks, des scripts vidéo, l'analyse de viralité et la génération des visuels 9:16.

### 📝 Étapes de récupération :
1. Rendez-vous sur le portail [Google AI Studio](https://aistudio.google.com/).
2. Connectez-vous avec votre compte Google.
3. Cliquez sur le bouton bleu **« Get API key »** (dans la barre latérale gauche ou en haut).
4. Cliquez sur **« Create API key »** :
   - Choisissez un projet Google Cloud existant ou sélectionnez **« Create API key in new project »**.
5. Copiez la clé affichée (elle commence généralement par `AIzaSy...`).
6. Ajoutez-la dans votre fichier `.env` :
   ```env
   GEMINI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
   ```

> [!TIP]
> Le plan gratuit de Google AI Studio offre **15 requêtes par minute (RPM)** et jusqu'à 1 million de tokens de contexte, ce qui est largement suffisant pour générer des dizaines de vidéos par jour sans dépenser un centime.

---

## 3. ElevenLabs (Synthèse Vocale TTS)

ElevenLabs fournit les voix d'IA pour doubler automatiquement les scripts générés.

### 📝 Étapes de récupération :
1. Créez un compte ou connectez-vous sur [ElevenLabs.io](https://elevenlabs.io/).
2. En bas à gauche de l'interface, cliquez sur votre **Profil / Avatar** $\rightarrow$ sélectionnez **« Profile + API key »** (ou allez directement sur [elevenlabs.io/app/settings/api-keys](https://elevenlabs.io/app/settings/api-keys)).
3. Cliquez sur **« Create API Key »** (ou affichez la clé principale existante).
4. Donnez un nom (ex: `TikTok Auto Studio`) et copiez la clé.
5. Ajoutez-la dans votre `.env` :
   ```env
   ELEVENLABS_API_KEY="sk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
   ```

> [!NOTE]
> Le forfait gratuit d'ElevenLabs offre **10 000 caractères par mois** (~15 à 20 scripts de 60 secondes). Si la clé n'est pas configurée ou arrive à épuisement, le studio bascule automatiquement sur un moteur TTS local de secours sans bloquer la génération.

---

## 4. TikTok Developer Portal (Login Kit & Content Posting)

C'est l'intégration officielle qui permet à votre application de connecter des comptes TikTok et de publier des vidéos et photos sans passer par un émulateur ou du scraping.

### 📝 Étape 4.1 : Créer un compte Développeur TikTok
1. Allez sur [TikTok for Developers](https://developers.tiktok.com/).
2. Cliquez sur **« Log In »** et connectez-vous avec votre compte TikTok principal.
3. Remplissez les informations de profil développeur (Nom, Organisation, Email).

### 📝 Étape 4.2 : Créer une Application
1. Dans la console développeur, cliquez sur **« Manage Apps »** $\rightarrow$ **« Create an App »**.
2. Renseignez :
   - **App Name** : `TikTok Auto Studio` (ou le nom de votre marque).
   - **App Icon** : Logo carré 512x512 px.
   - **App Category** : `Productivity` ou `Content Creation Tool`.
   - **Description** : `Plateforme d'automatisation et de programmation de vidéos courtes avec étiquetage AIGC conforme.`

### 📝 Étape 4.3 : Activer les Produits Officiels (Scopes)
Dans les paramètres de votre application, ajoutez les deux produits suivants :
1. **Login Kit** :
   - Permet l'authentification OAuth2 des utilisateurs.
   - Scopes requis : `user.info.basic`, `user.info.profile`.
   - **Redirect Domain / URL** :
     - En développement : `http://localhost:4000/api/auth/tiktok/callback`
     - En production : `https://api.votredomaine.com/api/auth/tiktok/callback`
2. **Content Posting API** :
   - Permet de publier des carrousels photos et des vidéos.
   - Scopes requis :
     - `video.publish` (Publication directe de vidéos)
     - `video.upload` (Upload direct)
   - Paramètre d'audit initial : **Sandbox** (permet de publier immédiatement en visibilité privée `SELF_ONLY` sur des comptes test).

### 📝 Étape 4.4 : Récupérer Client Key et Client Secret
1. Dans l'onglet **« App Credentials »** (ou **Basic Settings**) de votre application :
   - Copiez la **Client Key** (identifiant public).
   - Cliquez sur **« View »** ou **« Regenerate »** pour révéler le **Client Secret**.
2. Reportez-les dans votre `.env` :
   ```env
   TIKTOK_CLIENT_KEY="awXXXXXXXXXXXXXXXX"
   TIKTOK_CLIENT_SECRET="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
   TIKTOK_REDIRECT_URI="http://localhost:4000/api/auth/tiktok/callback"
   TIKTOK_AUDIT_APPROVED="false"
   ```

> [!IMPORTANT]
> **Mode Sandbox vs Production :**
> Tant que votre application n'a pas été soumise et validée par l'équipe ByteDance, conservez `TIKTOK_AUDIT_APPROVED="false"`. Le système forcera automatiquement `privacy_level: "SELF_ONLY"` pour que toutes vos publications tests soient acceptées sans erreur 403. Pour soumettre l'audit, suivez notre guide complet : [`docs/AUDIT_SCREENCAST_GUIDE.md`](file:///C:/Users/ADMIN/Documents/tiktok-auto-studio/docs/AUDIT_SCREENCAST_GUIDE.md).

---

## 5. Stockage Médias S3 / Cloudflare R2 (Domaine Vérifié)

L'API TikTok **Content Posting API v2** n'accepte pas l'envoi direct de fichiers bruts en multipart dans la requête d'initialisation : elle exige une **URL HTTPS publique** hébergée sur un domaine préalablement enregistré et vérifié dans le portail développeur.

Nous recommandons **Cloudflare R2** car il est **100% compatible avec l'API Amazon S3**, ne facture **aucun frais de bande passante sortante (0\$ Egress)** et offre 10 Go de stockage gratuit chaque mois.

### 📝 Étape 5.1 : Créer un Bucket Cloudflare R2
1. Connectez-vous à votre [Tableau de bord Cloudflare](https://dash.cloudflare.com/).
2. Dans le menu de gauche, cliquez sur **« R2 Object Storage »**.
3. Cliquez sur **« Create bucket »** :
   - Nom du bucket : `tiktok-studio-media`
   - Emplacement : Automatique (ou Europe de l'Ouest / US selon votre cible).
4. Cliquez sur **« Create Bucket »**.

### 📝 Étape 5.2 : Générer les Clés API R2 (S3 Credentials)
1. Toujours sur la page principale R2, cliquez à droite sur **« Manage R2 API Tokens »**.
2. Cliquez sur **« Create API Token »** :
   - Nom du jeton : `TikTok Studio Backend`
   - Permissions : **Object Read & Write** (Lecture et Écriture).
   - Durée : Toujours valide (ou selon vos politiques d'expiration).
3. Cliquez sur **« Create API Token »**.
4. Notez précieusement les informations générées :
   - **Access Key ID** $\rightarrow$ `S3_ACCESS_KEY_ID`
   - **Secret Access Key** $\rightarrow$ `S3_SECRET_ACCESS_KEY`
   - **Endpoint S3 pour Cloudflare** (ressemble à `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`) $\rightarrow$ `S3_ENDPOINT`

### 📝 Étape 5.3 : Configurer le Domaine Public Vérifié
1. Sur votre bucket R2, allez dans l'onglet **« Settings »** $\rightarrow$ **« Public Access »**.
2. Cliquez sur **« Connect Domain »** et associez un sous-domaine que vous possédez (ex: `assets.mondomaine.com`).
3. Dans le portail [TikTok for Developers](https://developers.tiktok.com/), déclarez ce domaine dans la section **« Verified Domains »** de votre application.
4. Renseignez dans votre `.env` :
   ```env
   S3_ENDPOINT="https://<ACCOUNT_ID>.r2.cloudflarestorage.com"
   S3_ACCESS_KEY_ID="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
   S3_SECRET_ACCESS_KEY="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
   S3_BUCKET_NAME="tiktok-studio-media"
   S3_PUBLIC_VERIFIED_DOMAIN="https://assets.mondomaine.com"
   ```

---

## 6. Clés Cryptographiques Locales (AES-256-GCM & JWT)

Pour satisfaire aux audits de sécurité de ByteDance et garantir qu'aucun token d'accès TikTok (`access_token`, `refresh_token`) ne fuite dans la base de données, le backend chiffre chaque jeton au repos avec l'algorithme **AES-256-GCM**.

Ces clés ne proviennent d'aucun site web tiers : **vous devez les générer vous-même sur votre machine**.

### 💻 Commande de Génération (PowerShell / Bash / CMD) :
Exécutez cette commande dans votre terminal :

```bash
node -e "console.log('ENCRYPTION_MASTER_KEY=' + require('crypto').randomBytes(32).toString('hex')); console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

Vous obtiendrez deux chaînes hexadécimales de 64 caractères :
```env
ENCRYPTION_MASTER_KEY="a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90"
JWT_SECRET="e9f8d7c6b5a43210e9f8d7c6b5a43210e9f8d7c6b5a43210e9f8d7c6b5a43210"
```

> [!CAUTION]
> Ne partagez jamais `ENCRYPTION_MASTER_KEY`. Si vous changez cette clé en cours de production, tous les jetons TikTok préalablement stockés en base de données deviendront indéchiffrables et les utilisateurs devront reconnecter leur compte.

---

## 7. Base de Données PostgreSQL & Cache Redis

Deux options s'offrent à vous pour la persistance des données et les files d'attente BullMQ :

### Option A : 100% Docker en Local (Recommandé pour tester)
Si Docker est installé sur votre ordinateur, lancez les services en 1 seconde :
```bash
docker compose up -d
```
Les variables du `.env` sont déjà préconfigurées pour ce mode :
```env
DATABASE_URL="postgresql://postgres:postgres_password@localhost:5432/tiktok_studio?schema=public"
REDIS_URL="redis://localhost:6379"
```

### Option B : Services Managés Cloud Gratuits (Pour le déploiement)
1. **PostgreSQL Serverless Gratuit (Neon.tech)** :
   - Créez un compte gratuit sur [neon.tech](https://neon.tech/).
   - Créez un projet nommé `tiktok-studio`.
   - Copiez l'URL de connexion fournie :
     ```env
     DATABASE_URL="postgresql://user:password@ep-xyz.eu-central-1.aws.neon.tech/tiktok_studio?sslmode=require"
     ```
2. **Redis Cloud Gratuit (Upstash)** :
   - Créez un compte sur [upstash.com](https://upstash.com/).
   - Créez une base Redis standard.
   - Copiez l'URL de connexion Redis (`redis://...:6379` ou `rediss://...`).
     ```env
     REDIS_URL="rediss://default:password@eu1-xyz.upstash.io:6379"
     ```

---

## 8. Fichier `.env` Prêt à l'Emploi & Vérification

Copiez le fichier `.env.example` vers `.env` à la racine de votre projet :

```bash
cp .env.example .env
```

### Modèle complet commenté :
```env
# ==============================================================================
# 1. SERVEURS & PORTS
# ==============================================================================
NODE_ENV="development"
PORT=4000
API_URL="http://localhost:4000"
FRONTEND_URL="http://localhost:5173"

# ==============================================================================
# 2. BASE DE DONNÉES & FILE DISTRIBUÉE
# ==============================================================================
DATABASE_URL="postgresql://postgres:postgres_password@localhost:5432/tiktok_studio?schema=public"
REDIS_URL="redis://localhost:6379"

# ==============================================================================
# 3. SÉCURITÉ & CHIFFREMENT (Généré avec crypto.randomBytes(32))
# ==============================================================================
ENCRYPTION_MASTER_KEY="a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90"
JWT_SECRET="super_secret_jwt_key_pour_sessions_http_only_32_caracteres"

# ==============================================================================
# 4. TIKTOK DEVELOPER PORTAL (https://developers.tiktok.com/)
# ==============================================================================
TIKTOK_CLIENT_KEY="votre_tiktok_client_key"
TIKTOK_CLIENT_SECRET="votre_tiktok_client_secret"
TIKTOK_REDIRECT_URI="http://localhost:4000/api/auth/tiktok/callback"
TIKTOK_AUDIT_APPROVED="false"

# ==============================================================================
# 5. STOCKAGE S3 / CLOUDFLARE R2
# ==============================================================================
S3_ENDPOINT="https://<ACCOUNT_ID>.r2.cloudflarestorage.com"
S3_ACCESS_KEY_ID="votre_r2_access_key"
S3_SECRET_ACCESS_KEY="votre_r2_secret_key"
S3_BUCKET_NAME="tiktok-studio-media"
S3_PUBLIC_VERIFIED_DOMAIN="https://assets.votredomaine.com"

# ==============================================================================
# 6. IA GÉNÉRATIVE & VOIX-OFF
# ==============================================================================
GEMINI_API_KEY="AIzaSy_votre_cle_google_ai_studio"
ELEVENLABS_API_KEY="sk_votre_cle_elevenlabs"
```

---

## 🚀 Commande de Test Rapide des Variables

Pour vérifier que vos variables d'environnement sont correctement chargées et conformes aux schémas stricts Zod sans lancer l'intégralité du studio :

```bash
pnpm --filter @tiktok-studio/api test:unit tests/unit/env.test.ts
```

Ou lancez les serveurs en mode développement :
```bash
# Démarrer le backend (vérifie automatiquement l'intégrité du .env au boot)
pnpm --filter @tiktok-studio/api dev

# Démarrer le studio web React
pnpm --filter @tiktok-studio/web dev
```
