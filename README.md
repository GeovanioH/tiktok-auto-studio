# 📱 TikTok Auto-Studio — Documentation d'Ingénierie & Guide Complet

> **Plateforme SaaS d'automatisation, de génération par IA générative et de publication sur TikTok via l'API officielle.**

---

## Sommaire

1. [Vision & Proposition de Valeur](#1-vision--proposition-de-valeur)
2. [Architecture Technique Globale](#2-architecture-technique-globale)
3. [Détail Exhaustif des Cas d'Usage (UC1 à UC7)](#3-détail-exhaustif-des-cas-dusage-uc1-à-uc7)
4. [Intégration de l'API TikTok & Conformité Audit](#4-intégration-de-lapi-tiktok--conformité-audit)
5. [Pipeline Multimodal d'IA Générative en 3 Clics](#5-pipeline-multimodal-dia-générative-en-3-clics)
6. [Moteur de Programmation & Résilience (BullMQ)](#6-moteur-de-programmation--résilience-bullmq)
7. [Sécurité, Cryptographie & Gestion des Tokens](#7-sécurité-cryptographie--gestion-des-tokens)
8. [Modèle de Données & Schéma Relationnel](#8-modèle-de-données--schéma-relationnel)
9. [Variables d'Environnement & Configuration](#9-variables-denvironnement--configuration)
10. [Guide d'Installation & Démarrage Pas à Pas](#10-guide-dinstallation--démarrage-pas-à-pas)
11. [Stratégie de Test & Assurance Qualité](#11-stratégie-de-test--assurance-qualité)
12. [Feuille de Route Produit (Roadmap V1 à V2)](#12-feuille-de-route-produit-roadmap-v1-à-v2)
13. [Arborescence du Projet](#13-arborescence-du-projet)

---

## 1. Vision & Proposition de Valeur

### 1.1 Le Problème
Gérer une présence active sur TikTok exige une régularité extrême (1 à 3 publications par jour). Or, les créateurs de contenu, agences et marques font face à trois blocages majeurs :
1. **La charge mentale de création :** Trouver une idée accrocheuse, rédiger un script dynamique, générer des visuels percutants, monter la vidéo et sous-titrer prend entre 45 minutes et 2 heures par vidéo.
2. **L'obligation d'intervention manuelle :** TikTok impose l'utilisation de son application mobile pour publier au moment précis où l'audience est en ligne, brisant la productivité.
3. **Le risque de blocage par TikTok :** Les outils d'automatisation non officiels (scraping, émulateurs Android, macros) violent les Conditions Générales de TikTok et entraînent des *shadowbans* ou suspensions définitives.

### 1.2 La Solution : TikTok Auto-Studio
**TikTok Auto-Studio** élimine complètement ces frictions en exploitant les APIs officielles certifiées de TikTok (**Login Kit** + **Content Posting API v2**) couplées à une suite d'IA multimodale (LLM + Génération d'images + Synthèse vocale + Montage FFmpeg automatique) :
* **Connexion en 1 clic :** L'utilisateur associe son compte TikTok en toute sécurité via OAuth2.
* **Studio IA en 3 clics :** Une simple idée textuelle est convertie en un post prêt à publier (carrousel photo ou vidéo montée 9:16 avec voix-off et sous-titres) en moins de 60 secondes.
* **Pilotage automatique "Zéro Application" :** Le planificateur côté serveur envoie les publications aux heures programmées, sans que l'utilisateur n'ait besoin d'ouvrir TikTok ni de toucher à son smartphone.
* **Conformité stricte :** 100% aligné sur les exigences de sécurité et d'audit commercial de TikTok (chiffrement militaire des tokens, hébergement des médias sur domaine vérifié, étiquetage obligatoire des contenus IA `is_aigc`).

---

## 2. Architecture Technique Globale

L'application repose sur une architecture moderne en couches découplées, garantissant robustesse, sécurité des secrets et scalabilité.

```mermaid
flowchart TD
    subgraph ClientLayer ["Couche Présentation (Client)"]
        Browser["Navigateur Web (Desktop / Mobile)"]
        DashboardUI["Dashboard & Calendrier Interactif (Next.js App Router)"]
        StudioUI["Studio 3-Clics & Prévisualisation Vidéo"]
        Browser --> DashboardUI
        Browser --> StudioUI
    end

    subgraph AppLayer ["Couche Applicative (Next.js & API)"]
        NextServer["Serveur Web & API Routes (Next.js 14+)"]
        AuthMiddleware["Middleware Session (Cookies HttpOnly SameSite=Strict)"]
        CryptoService["Service Cryptographique (AES-256-GCM)"]
        ValidationPipe["Validation Stricte des Entrées (Zod)"]
        
        DashboardUI -->|HTTPS / REST| NextServer
        StudioUI -->|HTTPS / REST| NextServer
        NextServer --> AuthMiddleware
        NextServer --> CryptoService
        NextServer --> ValidationPipe
    end

    subgraph ServiceLayer ["Couche Métier & Orchestration IA"]
        TikTokClient["Client Officiel API TikTok (v2)"]
        AIEngine["Orchestrateur IA (LLM + Image Gen)"]
        FFmpegWorker["Moteur de Montage Vidéo (FFmpeg)"]
        QuotasManager["Gestionnaire de Quotas & Modération"]
        
        NextServer --> TikTokClient
        NextServer --> AIEngine
        AIEngine --> QuotasManager
        AIEngine --> FFmpegWorker
    end

    subgraph DataLayer ["Couche Données & Persistance"]
        Postgres[(PostgreSQL - Données Métier & Tokens Chiffrés)]
        Redis[(Redis - Cache de Sessions & Files BullMQ)]
        S3Storage[(Cloudflare R2 / AWS S3 - Domaine Vérifié TikTok)]
        
        NextServer -->|Prisma ORM| Postgres
        NextServer --> Redis
        FFmpegWorker -->|Upload CDN| S3Storage
    end

    subgraph WorkerLayer ["Couche Asynchrone & Arrière-Plan"]
        BullMQWorker["Worker Planificateur (Scheduler BullMQ)"]
        RetryManager["Gestionnaire de Pannes & Backoff Exponentiel"]
        
        Redis --> BullMQWorker
        BullMQWorker --> RetryManager
        BullMQWorker --> CryptoService
        BullMQWorker --> TikTokClient
        TikTokClient -->|Push Contenu| TikTokPlatform["Plateforme TikTok (Content Posting API v2)"]
    end
```

---

## 3. Détail Exhaustif des Cas d'Usage (UC1 à UC7)

### UC1 : Connecter son compte TikTok
* **Objectif :** Obtenir et stocker les permissions de publication au nom de l'utilisateur.
* **Acteurs :** Utilisateur, Application, Portail OAuth2 TikTok.
* **Déroulement Nominal :**
  1. L'utilisateur clique sur « Connecter TikTok ».
  2. L'application génère un challenge cryptographique PKCE (`code_verifier`, `code_challenge`) et un `state` CSRF signé stocké temporairement dans un cookie chiffré.
  3. L'utilisateur est redirigé vers l'interface de consentement officiel de TikTok (`https://www.tiktok.com/v2/auth/authorize/`).
  4. L'utilisateur s'authentifie et valide les permissions demandées (`user.info.basic`, `video.publish`, `video.upload`).
  5. TikTok redirige vers `/api/auth/tiktok/callback` avec un code d'autorisation temporaire.
  6. Le serveur échange ce code contre un `access_token` (valable 24h) et un `refresh_token` (valable 365 jours).
  7. L'application chiffre immédiatement les tokens avec AES-256-GCM et les enregistre dans la table `tiktok_accounts`.
  8. L'application interroge les informations de base du compte (nom, avatar, handle) et redirige l'utilisateur vers le studio.
* **Gestion des Variantes & Erreurs :**
  - *Refus de consentement :* Détection du paramètre `error=access_denied`. Affichage d'un message didactique expliquant pourquoi l'application ne peut pas fonctionner sans la permission de publication.
  - *Permissions partielles :* Si l'utilisateur décoche `video.publish`, l'application refuse la finalisation et affiche un avertissement clair.

---

### UC2 : Créer un post manuellement
* **Objectif :** Préparer une publication à partir des médias propres de l'utilisateur en respectant les contraintes TikTok.
* **Déroulement Nominal :**
  1. L'utilisateur choisit le type de média : Vidéo unique (`VIDEO`) ou Carrousel d'images (`PHOTO`).
  2. L'utilisateur uploade ses fichiers (validation immédiate côté client : résolution, poids, encodage).
  3. **Appel Préliminaire TikTok :** L'application effectue une requête vers `POST /v2/post/publish/creator_info/query/` avec le token du compte.
  4. La réponse renvoie dynamiquement :
     - La durée vidéo maximale permise pour ce profil (ex: 60s, 180s ou 600s).
     - La liste exacte des niveaux de visibilité autorisés (`PUBLIC_TO_EVERYONE`, `MUTUAL_FOLLOW_FRIENDS`, `FOLLOWER_OF_CREATOR`, `SELF_ONLY`).
     - Les options autorisées pour les commentaires, duos et collages.
  5. L'interface adapte ses champs en temps réel (désactivation des options non supportées).
  6. L'utilisateur saisit la légende (maximum 2 200 caractères) et ses hashtags.
  7. L'utilisateur choisit entre : « Publier maintenant » (envoi immédiat), « Programmer » (UC3), ou « Enregistrer en brouillon ».

---

### UC3 : Programmer un post
* **Objectif :** Différer la publication à une date et une heure précises.
* **Déroulement Nominal :**
  1. À partir d'un post configuré (UC2 ou UC4), l'utilisateur ouvre le sélecteur temporel.
  2. L'interface affiche le calendrier avec les créneaux déjà occupés et le fuseau horaire local détecté.
  3. L'utilisateur valide une date/heure (qui doit être supérieure d'au moins 5 minutes à l'heure actuelle).
  4. Le serveur convertit la date locale en horodatage absolu UTC.
  5. Le post passe au statut `SCHEDULED`.
  6. Un job est programmé dans la file d'attente Redis / BullMQ avec un délai calculé (`delay = target_time - current_time`).
  7. L'utilisateur peut modifier la date, modifier le contenu ou annuler la programmation à tout moment tant que le statut reste `SCHEDULED`.

---

### UC4 : Générer un post avec l'IA en 3 Clics
* **Objectif :** Créer un post complet viral sans compétence technique ni rédactionnelle.
* **Déroulement Détaillé des 3 Clics :**

```mermaid
sequenceDiagram
    autonumber
    actor User as Utilisateur
    participant UI as Studio UI
    participant Backend as Serveur Next.js
    participant LLM as Moteur LLM (GPT-4o)
    participant ImgAPI as Moteur Image (Flux / DALL-E)
    participant FFmpeg as Worker FFmpeg
    participant Storage as Stockage S3 / R2 (Vérifié)

    Note over User, UI: Clic 1 : Expression du Besoin
    User->>UI: Saisie idée ("3 astuces pour doubler ses ventes") + Format
    UI->>Backend: Requête /api/ai/generate (Idée, Format, Style)
    
    Note over Backend, Storage: Clic 2 : Synthèse & Génération Multimodale
    Backend->>Backend: Vérification des quotas utilisateur
    Backend->>Backend: Filtre de modération du prompt (Guardrails)
    Backend->>LLM: Génération texte (Accroche, Script 3 scènes, Légende, Hashtags)
    LLM-->>Backend: Payload structuré JSON
    
    par Génération Visuels
        Backend->>ImgAPI: Prompt Scène 1 (9:16)
        Backend->>ImgAPI: Prompt Scène 2 (9:16)
        Backend->>ImgAPI: Prompt Scène 3 (9:16)
        ImgAPI-->>Backend: Images brutes
    end
    
    Backend->>Storage: Sauvegarde des images sur domaine vérifié
    
    opt Si Format = Vidéo
        Backend->>FFmpeg: Assemblage (Images + Voix TTS + Sous-titres dynamiques)
        FFmpeg-->>Storage: Upload de la vidéo finale MP4
    end
    
    Backend-->>UI: Aperçu interactif complet (Visuel, Audio, Légende)
    
    Note over User, UI: Clic 3 : Validation & Déclenchement
    User->>UI: Clic sur "Publier maintenant" ou "Programmer"
    UI->>Backend: Confirmation avec tag is_aigc=true
    Backend-->>UI: Post enregistré avec succès
```

---

### UC5 : Publier automatiquement (Système d'Arrière-Plan)
* **Objectif :** Exécuter les envois sans intervention humaine.
* **Déroulement Nominal :**
  1. Le worker BullMQ se déclenche dès qu'un job planifié arrive à échéance.
  2. Le worker pose un verrou distribué Redis (`redlock`) sur le `post_id` pour empêcher toute exécution concurrente.
  3. Le post passe au statut `PROCESSING`.
  4. Le worker déchiffre l'Access Token du compte TikTok associé.
  5. **Contrôle d'Expiration :** Si l'Access Token a plus de 23 heures, le worker appelle l'API TikTok pour obtenir un nouvel Access Token via le Refresh Token, puis chiffre et met à jour la base.
  6. Le worker interroge l'endpoint `creator_info/query/` pour s'assurer que les permissions n'ont pas changé.
  7. **Initialisation de la publication :**
     - *Pour une Vidéo :* Appel à `POST /v2/post/publish/video/init/` avec les métadonnées (légende, confidentialité, `is_aigc: true`). TikTok retourne une URL d'upload signée.
     - Le worker streame le fichier vidéo depuis le bucket S3 vers TikTok.
     - *Pour des Photos :* Appel à `POST /v2/post/publish/content/init/` en transmettant les URLs publiques des images hébergées sur le domaine vérifié.
  8. Le worker sonde l'état du post auprès de TikTok (`POST /v2/post/publish/status/fetch/`) jusqu'à confirmation de succès.
  9. Le post passe au statut `PUBLISHED` et l'horodatage effectif est enregistré.

---

### UC6 : Suivre l'état des publications et gérer les erreurs
* **Objectif :** Donner une transparence totale à l'utilisateur sur le cycle de vie de ses contenus.
* **Fonctionnalités de l'Écran de Suivi :**
  - **Matrice des Statuts :**
    * `DRAFT` : Brouillon modifiable.
    * `SCHEDULED` : En attente dans la file BullMQ.
    * `PROCESSING` : Upload ou traitement en cours chez TikTok.
    * `PUBLISHED` : En ligne sur le compte TikTok.
    * `FAILED` : Échec après épuisement des tentatives de réessai.
    * `MISSED` : Échéance dépassée lors d'un arrêt prolongé du serveur.
  - **Gestion des Erreurs Intelligente :** Traduction des codes d'erreurs bruts TikTok en messages compréhensibles (ex: `access_token_invalid` $\rightarrow$ *"Votre connexion TikTok a expiré, veuillez cliquer sur Reconnecter"*).
  - **Bouton « Réessayer » :** Permet de relancer immédiatement un post en échec sans avoir à retaper le texte ou réimporter les médias.

---

### UC7 : Gérer et révoquer la connexion au compte
* **Objectif :** Garantir la souveraineté de l'utilisateur sur ses données personnelles et ses accès.
* **Scénarios :**
  - Consultation de la liste des comptes TikTok rattachés avec date de dernière synchronisation.
  - Alerte visuelle préventive lorsque le Refresh Token approche des 365 jours de validité.
  - **Déconnexion complète :**
    1. Appel synchrone à `POST /v2/oauth/revoke/` pour avertir TikTok d'invalider tous les jetons.
    2. Suppression définitive des tokens chiffrés dans la table `tiktok_accounts`.
    3. Dé-planification automatique de tous les posts du compte au statut `SCHEDULED`.

---

## 4. Intégration de l'API TikTok & Conformité Audit

L'intégration de l'API TikTok est soumise à des contrôles stricts imposés par ByteDance. Tout écart entraîne le rejet de l'application lors de l'audit commercial.

### 4.1 Produits & Permissions TikTok Requis
L'application doit déclarer et faire approuver les éléments suivants sur le portail développeur :
1. **Login Kit for Web :**
   - Scope `user.info.basic` : Récupération de l'avatar (`avatar_url`), du nom d'affichage (`display_name`) et de l'identifiant unique TikTok (`open_id`).
2. **Content Posting API :**
   - Scope `video.publish` : Autorise l'initialisation et la publication directe sur le flux du créateur.
   - Scope `video.upload` : Autorise le téléversement des binaires vidéo vers l'infrastructure TikTok.

### 4.2 La Contrainte Critique du Domaine Vérifié pour les Photos
Contrairement aux vidéos qui sont téléversées directement via un flux binaire sur les serveurs de TikTok, **les photos doivent être transmises sous la forme d'URLs publiques** :
* **Domaine vérifié obligatoire :** TikTok exige que le nom de domaine hébergeant les images soit déclaré et vérifié dans la console développeur (via l'ajout d'un enregistrement DNS TXT ou d'un fichier de vérification à la racine).
* **Formats d'image acceptés :** TikTok accepte strictement les formats **JPEG** et **WEBP** (1 à 35 images par carrousel). **Attention : les fichiers PNG sont systématiquement rejetés par l'API TikTok** ; le pipeline de téléversement doit donc convertir tout PNG en JPEG/WEBP optimisé avant soumission.
* Exemple de payload conforme pour l'endpoint `POST /v2/post/publish/content/init/` :
```json
{
  "post_mode": "DIRECT_POST",
  "media_type": "PHOTO",
  "post_info": {
    "title": "Titre du Carrousel",
    "description": "Légende du post avec hashtags #fyp #tiktok",
    "privacy_level": "PUBLIC_TO_EVERYONE",
    "disable_comment": false,
    "is_aigc": true,
    "auto_add_music": true
  },
  "source_info": {
    "source": "PULL_FROM_URL",
    "photo_images": [
      "https://assets.mondomaine-verifie.com/carousel/slide_1.jpg",
      "https://assets.mondomaine-verifie.com/carousel/slide_2.jpg"
    ],
    "photo_cover_index": 0
  }
}
```
* Toute tentative de soumission d'une photo hébergée sur un domaine non vérifié ou sur un domaine générique temporaire (ex: URL brute S3 ou Replicate) entraîne une erreur immédiate de l'API TikTok (`invalid_image_url`).

### 4.3 La Restriction de Confidentialité Pré-Audit
* **En mode Sandbox (développement) :** L'application ne peut publier que sur les comptes de test enregistrés dans la console, et **uniquement avec la visibilité privée (`SELF_ONLY`)**.
* **Le passage en Production :** Nécessite la soumission d'une vidéo de démonstration complète (*Screencast d'audit*) démontrant :
  1. L'écran de connexion avec affichage explicite des permissions.
  2. La conformité avec les directives graphiques TikTok (bouton officiel *Sign in with TikTok*).
  3. La présence visible des fonctionnalités de révocation et de gestion de la vie privée.
  4. L'interrogation de `creator_info/query` et le respect des options renvoyées.

### 4.4 Étiquetage Obligatoire du Contenu IA (`is_aigc`)
Conformément aux politiques de transparence de TikTok et aux réglementations internationales, tout contenu généré ou assisté par l'IA doit être déclaré lors de l'appel à l'API via le paramètre :
```json
{
  "post_info": {
    "title": "Ma superbe vidéo #IA #TikTok",
    "privacy_level": "PUBLIC_TO_EVERYONE",
    "is_aigc": true
  }
}
```

---

## 5. Pipeline Multimodal d'IA Générative en 3 Clics

Le moteur d'IA interne orchestre 4 modèles complémentaires pour transformer une idée abstraite en un asset multimédia de qualité studio.

### 5.1 Découpage des Responsabilités des Modèles

| Rôle | Modèle Retenu | Mission Spécifique | Format de Sortie |
| :--- | :--- | :--- | :--- |
| **Génération Textuelle & Structuration** | Google Gemini (Gemini Multimodal / Pro) | Création d'une accroche (*Hook*), découpage du script en 3 à 5 scènes visuelles, rédaction de la légende et sélection de 5 hashtags SEO tendance. | Objet JSON typé strict (via Zod schema). |
| **Génération Visuelle** | Google Imagen 3 (via Gemini API) | Génération d'images photoréalistes percutantes au ratio vertical strict 9:16 (1080 $\times$ 1920 pixels). | Images JPEG / WebP haute fidélité (conversion automatique si PNG généré). |
| **Synthèse Vocale (TTS)** | Gemini Speech / ElevenLabs | Génération de la voix-off rythmée et engageante à partir du script généré. | Fichier audio MP3 44.1kHz. |
| **Moteur d'Assemblage Vidéo** | Worker FFmpeg local / conteneurisé | Fusion des flux : juxtaposition des scènes visuelles avec effet zoom dynamique (*Ken Burns*), mixage de la voix-off et incrustation des sous-titres animés. | Fichier vidéo MP4 (Codec H.264, AAC). |

### 5.2 Algorithme de Montage FFmpeg Automatisé
Pour chaque scène générée :
1. Application d'une animation d'échelle continue (`scale=8000x-1,zoompan=...`) pour éviter l'effet d'image fixe.
2. Découpage du fichier audio généré pour synchroniser la durée exacte de chaque visuel avec la portion de texte prononcée.
3. Génération d'un fichier de sous-titres au format `.ass` pour afficher les mots prononcés en surbrillance au centre de l'écran (style Alex Hormozi).
4. Exportation au format vidéo standard TikTok : 1080 $\times$ 1920, 30 fps, bitrate vidéo 4 000 kbps, audio stéréo 192 kbps.

---

## 6. Moteur de Programmation & Résilience (BullMQ)

Le système de planification doit garantir qu'aucun post n'est perdu, dupliqué ou envoyé en retard.

### 6.1 Architecture de la File d'Attente
* **File Principale :** `tiktok-publish-queue` gérée par BullMQ sur une instance Redis dédiée.
* **Idempotence Absolue :** Chaque job planifié a pour identifiant unique le `post_id` (`jobId: "post_" + post.id`). Il est mathématiquement impossible que deux instances de workers traitent le même post en parallèle.

### 6.2 Matrice de Gestion des Pannes & Retries

```mermaid
stateDiagram-v2
    [*] --> Scheduled : Programmation par l'utilisateur
    Scheduled --> Processing : Échéance atteinte
    
    Processing --> CheckToken : Vérification validité token
    CheckToken --> RefreshToken : Token > 23h
    RefreshToken --> CheckToken : Token renouvelé
    CheckToken --> PublishInit : Token valide
    
    PublishInit --> UploadMedia : Init OK
    UploadMedia --> Published : Confirmation TikTok (200 OK)
    
    PublishInit --> HandleError : Erreur API
    UploadMedia --> HandleError : Échec Upload
    
    state HandleError {
        [*] --> ErrorType
        ErrorType --> Network5xx : Erreur Réseau (500, 502, 504)
        ErrorType --> Auth4xx : Erreur Auth (401, 403)
        
        Network5xx --> RetryBackoff : Tentative < 3
        RetryBackoff --> Processing : Re-tentative (Backoff exp: 1m, 5m, 15m)
        Network5xx --> Failed : Tentatives >= 3
        
        Auth4xx --> Failed : Jeton révoqué / Action requise
    }
    
    Published --> [*]
    Failed --> [*]
```

### 6.3 Gestion des Dépassages d'Échéance (Crash Serveur)
Si le serveur de workers redémarre après une coupure imprévue :
* Le worker analyse tous les jobs en attente dont l'horodatage prévu est antérieur à `NOW()`.
* **Règle des 15 minutes :**
  - Si le retard est inférieur ou égal à 15 minutes : Le post est immédiatement envoyé (`RECOVERED_EXECUTION`).
  - Si le retard dépasse 15 minutes : Le post bascule au statut `MISSED` pour éviter de publier à une heure inappropriée (ex: 3h du matin). Une notification d'alerte invite l'utilisateur à replanifier en un clic.

---

## 7. Sécurité, Cryptographie & Gestion des Tokens

La fuite d'un jeton de publication TikTok permettrait à un attaquant de publier du contenu illégal ou malveillant sur le compte d'une victime. Le niveau de sécurité est donc équivalent à celui d'une application bancaire.

### 7.1 Algorithme de Chiffrement des Tokens (AES-256-GCM)
Les jetons d'accès et de rafraîchissement ne sont jamais enregistrés en clair :
1. Une clé maîtresse de chiffrement (`ENCRYPTION_MASTER_KEY`) de 256 bits (32 octets) est injectée via les variables d'environnement.
2. Pour chaque opération de chiffrement :
   - Génération d'un **Vecteur d'Initialisation (IV)** aléatoire et unique de 12 octets (96 bits) via un générateur cryptographiquement sûr (`crypto.randomBytes(12)`).
   - Chiffrement du jeton en mode Galois/Counter Mode (GCM).
   - Récupération du **Tag d'Authentification (Auth Tag)** de 16 octets (128 bits) garantissant l'intégrité du message.
3. La valeur stockée en base de données concatène les segments :
   $$\text{Stored\_String} = \text{base64(IV)} + \text{":"} + \text{base64(AuthTag)} + \text{":"} + \text{base64(Ciphertext)}$$
4. En cas de tentative d'altération de la base de données, le déchiffrement échoue instantanément via le contrôle du tag d'authentification.

### 7.2 Cloisonnement Strict Client / Serveur
* Aucun jeton d'API TikTok, aucune clé secrète de chiffrement et aucune clé d'API d'IA n'est accessible dans le bundle JavaScript du navigateur client.
* Les sessions utilisateurs reposent sur des cookies sécurisés `HttpOnly`, `SameSite=Strict`, `Secure` (HTTPS uniquement).

---

## 8. Modèle de Données & Schéma Relationnel

Le schéma de données est orchestré avec PostgreSQL et modélisé via Prisma ORM.

```mermaid
erDiagram
    User ||--o{ TikTokAccount : connects
    User ||--o{ AiQuota : has
    TikTokAccount ||--o{ Post : owns
    Post ||--o{ MediaAsset : contains
    Post ||--o{ ScheduleJob : tracks
    Post ||--o{ PublishAuditLog : records

    User {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        timestamp created_at
    }

    TikTokAccount {
        uuid id PK
        uuid user_id FK
        string open_id UK
        string username
        string avatar_url
        text encrypted_access_token
        text encrypted_refresh_token
        timestamp token_expires_at
        timestamp refresh_expires_at
        json max_video_duration
        json privacy_levels_allowed
        timestamp created_at
    }

    Post {
        uuid id PK
        uuid account_id FK
        string title
        text caption
        string post_type
        string privacy_level
        boolean is_aigc
        string status
        timestamp scheduled_at
        timestamp published_at
        string tiktok_publish_id
        timestamp created_at
    }

    MediaAsset {
        uuid id PK
        uuid post_id FK
        string media_type
        string s3_key
        string public_verified_url
        int sequence_order
        int duration_seconds
    }

    ScheduleJob {
        uuid id PK
        uuid post_id FK
        string bullmq_job_id UK
        int retry_count
        text last_error_message
        timestamp next_attempt_at
    }

    AiQuota {
        uuid id PK
        uuid user_id FK
        int daily_limit
        int daily_consumed
        timestamp reset_at
    }

    PublishAuditLog {
        uuid id PK
        uuid post_id FK
        string event_type
        json raw_response
        timestamp created_at
    }
```

---

## 9. Variables d'Environnement & Configuration

Créez un fichier `.env.local` (développement) et configurez votre gestionnaire de secrets (production) avec les variables suivantes :

```bash
# ==============================================================================
# CONFIGURATION SERVEUR & URLS
# ==============================================================================
NODE_ENV="development" # ou "production"
PORT=3000
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ==============================================================================
# BASE DE DONNÉES & CACHE DISTRIBUÉ
# ==============================================================================
DATABASE_URL="postgresql://postgres:postgres_password@localhost:5432/tiktok_studio?schema=public"
REDIS_URL="redis://localhost:6379"

# ==============================================================================
# SÉCURITÉ & CHIFFREMENT (Générer une clé de 64 caractères hexadécimaux)
# Commande Linux/Mac : openssl rand -hex 32
# ==============================================================================
ENCRYPTION_MASTER_KEY="a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90"
JWT_SECRET="remplacer_par_un_secret_jwt_aleatoire_de_minimum_32_caracteres"

# ==============================================================================
# TIKTOK DEVELOPER PORTAL (Console https://developers.tiktok.com/)
# ==============================================================================
TIKTOK_CLIENT_KEY="votre_tiktok_client_key"
TIKTOK_CLIENT_SECRET="votre_tiktok_client_secret"
TIKTOK_REDIRECT_URI="http://localhost:3000/api/auth/tiktok/callback"

# ==============================================================================
# HÉBERGEMENT MÉDIAS S3 / CLOUDFLARE R2 (Domaine vérifié TikTok obligatoire)
# ==============================================================================
S3_ENDPOINT="https://<account_id>.r2.cloudflarestorage.com"
S3_ACCESS_KEY_ID="votre_access_key_r2"
S3_SECRET_ACCESS_KEY="votre_secret_key_r2"
S3_BUCKET_NAME="tiktok-studio-media"
S3_REGION="auto"
# ATTENTION : Ce domaine public DOIT être déclaré et validé dans la console TikTok
S3_PUBLIC_VERIFIED_DOMAIN="https://assets.mondomaine-verifie.com"

# ==============================================================================
# FOURNISSEURS D'INTELLIGENCE ARTIFICIELLE
# ==============================================================================
GEMINI_API_KEY="AIzaSy..." # Google Gemini API (Scripts, Multimodal & Imagen 3)
ELEVENLABS_API_KEY="votre_cle_elevenlabs"

# ==============================================================================
# QUOTAS & LIMITES SYSTÈME
# ==============================================================================
DEFAULT_USER_DAILY_AI_QUOTA=20
MAX_VIDEO_UPLOAD_SIZE_MB=500
```

---

## 10. Guide d'Installation & Démarrage Pas à Pas

### 10.1 Prérequis Système
- **Node.js :** Version 20.x LTS ou supérieure.
- **Gestionnaire de paquets :** `pnpm` version 9.x recommandé (`npm install -g pnpm`).
- **Docker & Docker Compose :** Pour l'exécution locale de PostgreSQL et Redis.
- **FFmpeg :** Installé localement sur la machine hôte (`brew install ffmpeg` ou `apt install ffmpeg`).

### 10.2 Procédure d'Initialisation

```bash
# Étape 1 : Cloner le dépôt et entrer dans le dossier
git clone <url_de_votre_depot>/tiktok-auto-studio.git
cd tiktok-auto-studio

# Étape 2 : Installer l'ensemble des dépendances
pnpm install

# Étape 3 : Démarrer les services d'infrastructure (PostgreSQL + Redis)
docker compose up -d

# Étape 4 : Copier et renseigner les variables d'environnement
cp .env.example .env.local
# (Éditez .env.local avec vos vraies clés)

# Étape 5 : Appliquer les migrations de base de données via Prisma
pnpm prisma migrate dev --name init_schema

# Étape 6 : Générer le client Prisma typé
pnpm prisma generate

# Étape 7 : Lancer simultanément l'application Next.js et le worker BullMQ
pnpm dev
```

L'application est immédiatement accessible à l'adresse [http://localhost:3000](http://localhost:3000).

---

## 11. Stratégie de Test & Assurance Qualité

Le projet applique une couverture de tests automatisés rigoureuse :
* **Tests Unitaires Cryptographiques :** Validation du chiffrement et déchiffrement AES-256-GCM, validation de l'échec en cas d'Auth Tag altéré.
* **Mocks de l'API TikTok v2 :** Tests des réponses de l'API TikTok via MSW (Mock Service Worker) simulant :
  - Un token valide avec publication réussie.
  - Un token expiré renouvelé automatiquement par le refresh token.
  - Un compte bloqué en visibilité privée avant audit.
  - Les erreurs réseau avec vérification de la montée en charge du backoff exponentiel.
* **Exécution des Tests :**
  ```bash
  # Lancer tous les tests unitaires et d'intégration
  pnpm test

  # Vérifier la couverture de code (Objectif > 80%)
  pnpm test:coverage

  # Lancer les tests End-to-End avec Playwright
  pnpm test:e2e
  ```

---

## 12. Feuille de Route Produit (Roadmap V1 à V2)

```mermaid
timeline
    title Évolution Stratégique de TikTok Auto-Studio
    section V1.0 - Le MVP Fondateur
      Socle & Chiffrement : Architecture Next.js, Prisma, BullMQ, AES-256-GCM
      Intégration TikTok Core : Login Kit, Creator Info, Post Manuel & Planifié
      Studio IA 3-Clics : LLM (Textes) + Flux (Images) + FFmpeg (Vidéo 9:16)
      Audit TikTok : Préparation de la démo d'audit (Mode privé SELF_ONLY)
    section V1.5 - Post-Audit & Monétisation
      Validation Commerciale : Ouverture de la visibilité PUBLIC_TO_EVERYONE
      Facturation SaaS : Intégration Stripe (Plans Creator / Pro / Agency)
      Quotas Payants : Recharge automatique de crédits de génération IA
      Analytics Réseau : Taux de succès des publications et alertes Telegram/Email
    section V2.0 - Scale & Multi-Réseaux
      Multi-Comptes : Gestion de 10+ comptes TikTok par utilisateur
      Génération par Lot (Batch) : Création et programmation de 7 jours de contenu en 1 clic
      Brand Kit Custom : Sauvegarde des polices, couleurs et voix IA personnalisées
      Cross-Posting : Déclinaison automatique vers Instagram Reels et YouTube Shorts
```

---

## 13. Arborescence du Projet

```text
tiktok-auto-studio/
├── README.md                      # Documentation exhaustive à 360° (Ce fichier)
├── CLAUDE.md                      # Mémoire d'ingénierie et protocole pour l'agent IA
├── docker-compose.yml             # Conteneurs PostgreSQL et Redis locaux
├── package.json                   # Dépendances du projet (Next.js, Prisma, BullMQ...)
├── prisma/
│   ├── schema.prisma              # Schéma de base de données relationnel
│   └── migrations/                # Historique des migrations SQL
├── docs/                          # Les 9 fichiers de spécification détaillés
│   ├── 01-PRD.md                  # Exigences produit & User Stories
│   ├── 02-TRD.md                  # Spécifications techniques & SLAs
│   ├── 03-APP_FLOW.md             # Parcours UX & machine à états
│   ├── 04-BACKEND_SCHEMA.md       # Schéma BDD & relations détaillées
│   ├── 05-SECURITY.md             # Chiffrement & conformité TikTok
│   ├── 06-API_SPEC.md             # Spécifications des endpoints OpenAPI
│   ├── 07-TEST_PLAN.md            # Plan de recette & mocks
│   ├── 08-IMPLEMENTATION_PLAN.md  # Roadmap de développement par tâches
│   └── 09-ROADMAP.md              # Vision stratégique V1 à V2
├── src/
│   ├── app/                       # Routes Next.js App Router (Pages & API)
│   │   ├── (auth)/                # Pages de connexion / inscription
│   │   ├── (dashboard)/           # Interface studio, calendrier et paramètres
│   │   └── api/                   # API Routes (TikTok OAuth, Webhooks, IA...)
│   ├── components/                # Composants UI React (Tailwind / Shadcn)
│   ├── lib/                       # Modules utilitaires partagés
│   │   ├── crypto/                # Fonctions de chiffrement AES-256-GCM
│   │   ├── tiktok/                # Client SDK officiel TikTok API v2
│   │   ├── ai/                    # Orchestrateur LLM, Image Gen et TTS
│   │   ├── ffmpeg/                # Scripts de montage vidéo dynamique
│   │   └── s3/                    # Client de téléversement vers domaine vérifié
│   └── workers/                   # Workers BullMQ d'arrière-plan pour la publication
└── tests/                         # Suites de tests automatisés (Vitest / Playwright)
```

---

> [!IMPORTANT]
> **Rappel de Conformité :** Toute modification du flux d'authentification ou des permissions demandées à TikTok nécessite une nouvelle soumission d'approbation sur le portail développeur TikTok. Ne jamais modifier les scopes sans mettre à jour la documentation d'audit.
