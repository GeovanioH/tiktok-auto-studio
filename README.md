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

## 2. Architecture Technique Globale (Découplée Node.js & React)

L'application repose sur une **architecture découplée moderne (Monorepo)** séparant hermétiquement le frontend web (SPA React haute vélocité) et le backend d'ingénierie (serveur d'API Node.js et workers asynchrones).

```mermaid
flowchart TD
    subgraph ClientLayer ["Couche Présentation (Frontend React SPA)"]
        Browser["Navigateur Web (Desktop / Mobile)"]
        ReactApp["Application React 18/19 (Vite + TypeScript)"]
        TailwindShadcn["Design System (TailwindCSS + Shadcn/ui)"]
        TanStackQuery["Cache Client & Requêtage (TanStack Query)"]
        Preview916["Studio 3-Clics & Prévisualisation 9:16"]
        
        Browser --> ReactApp
        ReactApp --> TailwindShadcn
        ReactApp --> TanStackQuery
        ReactApp --> Preview916
    end

    subgraph ApiLayer ["Couche Serveur & API (Backend Node.js)"]
        NodeServer["Serveur HTTP Node.js (Fastify / Express + TypeScript)"]
        CorsMiddleware["Middleware CORS (Credentials & Whitelist Frontend)"]
        AuthMiddleware["Middleware Session (Cookies HttpOnly SameSite=Lax/Strict)"]
        CryptoService["Service Cryptographique (AES-256-GCM)"]
        ValidationPipe["Validation Stricte des Entrées (Zod Shared Package)"]
        
        TanStackQuery -->|HTTPS / REST (withCredentials)| CorsMiddleware
        CorsMiddleware --> NodeServer
        NodeServer --> AuthMiddleware
        NodeServer --> CryptoService
        NodeServer --> ValidationPipe
    end

    subgraph ServiceLayer ["Couche Métier & Orchestration IA (Node.js)"]
        TikTokClient["Client Officiel API TikTok (v2)"]
        GeminiOmniEngine["Orchestrateur IA Omnimodal (Google Gemini Omni)"]
        FFmpegWorker["Moteur de Montage Vidéo (FFmpeg)"]
        QuotasManager["Gestionnaire de Quotas Journaliers"]
        
        NodeServer --> TikTokClient
        NodeServer --> GeminiOmniEngine
        GeminiOmniEngine --> QuotasManager
        GeminiOmniEngine --> FFmpegWorker
    end

    subgraph DataLayer ["Couche Données & Persistance"]
        Postgres[(PostgreSQL 16 - Données Métier & Tokens Chiffrés)]
        Redis[(Redis 7 - Cache de Sessions & Files BullMQ)]
        S3Storage[(Cloudflare R2 - Domaine Vérifié TikTok)]
        
        NodeServer -->|Prisma ORM| Postgres
        NodeServer --> Redis
        FFmpegWorker -->|Upload CDN| S3Storage
    end

    subgraph WorkerLayer ["Couche Asynchrone & Arrière-Plan (Worker Node.js)"]
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

## 5. Pipeline Multimodal d'IA Générative en 3 Clics (Gemini Omni)

Le moteur d'IA interne exploite l'architecture omnimodale de **Google Gemini Omni** couplée à des modèles spécialisés pour couvrir aussi bien la génération d'images haute fidélité que la génération et le montage de vidéos verticales natives.

### 5.1 Architecture Double Pipeline : Vidéo Native Omni vs Montage Hybride

Le Studio propose deux modes de génération vidéo et un mode carrousel :
1. **Mode Vidéo Native (Gemini Omni) :** Génération directe de séquences vidéo verticales 9:16 par le modèle omnimodal, avec motion fluide, cohérence temporelle et mouvements de caméra réalistes.
2. **Mode Vidéo Composite Studio (Gemini Omni + FFmpeg) :** Génération des scènes visuelles 9:16 par Gemini Omni / Imagen 3, synchronisation avec la voix-off TTS et animation dynamique Ken Burns avec gravure des sous-titres animés `.ass`.
3. **Mode Carrousel Photos (Gemini Omni / Imagen 3 + Sharp) :** Génération de séries de visuels 9:16 convertis automatiquement en JPEG qualité 95 pour conformité TikTok.

### 5.2 Découpage des Responsabilités des Modèles

| Rôle | Modèle Retenu | Mission Spécifique | Format de Sortie |
| :--- | :--- | :--- | :--- |
| **Génération & Structuration Omnimodale** | **Google Gemini Omni** | Analyse du prompt, hook viral, découpage en scènes temporelles, légende SEO, tags et directives de mise en scène. | Objet JSON typé strict (schéma Zod). |
| **Génération Vidéo Native** | **Google Gemini Omni (Video Engine)** | Génération directe de clips vidéo verticaux 9:16 cinématographiques avec animation et continuité de mouvement. | Fichier vidéo MP4 (H.264, 1080x1920, 30 fps). |
| **Génération Visuelle (Images & Carrousels)** | **Google Gemini Omni & Imagen 3** | Rendu de visuels photoréalistes verticaux 9:16 (1080x1920) pour carrousels et scènes composites. | JPEG / WEBP (conversion automatique via Sharp, PNG rejeté). |
| **Synthèse Vocale & Audio** | **Gemini Speech / ElevenLabs** | Génération de la voix-off naturelle synchronisée avec extraction des timestamps mot-à-mot. | Audio MP3 stéréo 44.1kHz. |
| **Moteur d'Assemblage & Sous-titrage** | **Worker FFmpeg (Dockerisé)** | Concaténation de flux, animation Ken Burns pour le mode composite, mixage audio et gravure de sous-titres dynamiques `.ass`. | Fichier vidéo final MP4 (H.264 / AAC 192k). |

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

## 9. Variables d'Environnement & Guide Complet de Récupération des Clés API

Ce guide exhaustif détaille l'obtention, la configuration et la sécurisation de l'ensemble des clés d'API et variables d'environnement requises par **TikTok Auto-Studio**.

### 9.1 Tableau Récapitulatif des Services & Clés

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

### 9.2 Google AI Studio (Gemini 1.5 & Imagen 3)

Google AI Studio permet d'utiliser **Gemini 1.5 Pro**, **Gemini 1.5 Flash** et **Imagen 3** pour la rédaction des hooks, des scripts vidéo, l'analyse de viralité et la génération des visuels 9:16.

1. Rendez-vous sur le portail [Google AI Studio](https://aistudio.google.com/).
2. Connectez-vous avec votre compte Google.
3. Cliquez sur le bouton bleu **« Get API key »** (dans la barre latérale gauche).
4. Cliquez sur **« Create API key »** $\rightarrow$ Sélectionnez un projet existant ou **« Create API key in new project »**.
5. Copiez la clé générée (commençant par `AIzaSy...`).
6. Ajoutez-la dans votre `.env` :
   ```env
   GEMINI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
   ```

*Remarque : Le quota gratuit fournit 15 requêtes par minute (RPM) et 1 million de tokens de contexte, amplement suffisant pour des dizaines de publications journalières.*

---

### 9.3 ElevenLabs (Synthèse Vocale TTS)

ElevenLabs fournit les voix de synthèse haute fidélité pour le doublage audio des vidéos.

1. Créez un compte ou connectez-vous sur [ElevenLabs.io](https://elevenlabs.io/).
2. Cliquez sur votre **Avatar** en bas à gauche $\rightarrow$ **« Profile + API key »** (ou allez sur [elevenlabs.io/app/settings/api-keys](https://elevenlabs.io/app/settings/api-keys)).
3. Cliquez sur **« Create API Key »**, nommez-la `TikTok Studio` et copiez le token.
4. Ajoutez-le dans votre `.env` :
   ```env
   ELEVENLABS_API_KEY="sk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
   ```

*Remarque : 10 000 caractères gratuits par mois sont offerts. En cas d'absence de clé ou d'épuisement du quota, le studio bascule automatiquement sur un moteur TTS local.*

---

### 9.4 TikTok Developer Portal (Login Kit & Content Posting)

1. **Création du compte :** Rendez-vous sur [TikTok for Developers](https://developers.tiktok.com/) et connectez-vous avec votre compte TikTok.
2. **Création de l'application :** Cliquez sur **« Manage Apps »** $\rightarrow$ **« Create an App »** (Nom : `TikTok Auto Studio`, Catégorie : `Productivity / Content Creation Tool`).
3. **Activation des Produits :**
   - **Login Kit :** Scopes `user.info.basic`, `user.info.profile`. Redirect URI : `http://localhost:4000/api/auth/tiktok/callback` (dev) ou votre URL de production.
   - **Content Posting API :** Scopes `video.publish`, `video.upload`.
4. **Récupération des Identifiants :** Dans **« App Credentials »**, copiez la **Client Key** et le **Client Secret**.
5. Ajoutez-les dans votre `.env` :
   ```env
   TIKTOK_CLIENT_KEY="awXXXXXXXXXXXXXXXX"
   TIKTOK_CLIENT_SECRET="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
   TIKTOK_REDIRECT_URI="http://localhost:4000/api/auth/tiktok/callback"
   TIKTOK_AUDIT_APPROVED="false"
   ```

*Important : Laissez `TIKTOK_AUDIT_APPROVED="false"` tant que l'audit commercial n'est pas validé. Le studio forcera automatiquement la visibilité `SELF_ONLY` en mode Sandbox pour éviter tout blocage 403.*

---

### 9.5 Stockage Médias S3 / Cloudflare R2 (Domaine Vérifié)

TikTok exige que les fichiers médias soient accessibles via une **URL HTTPS publique hébergée sur un domaine vérifié**. Cloudflare R2 est recommandé (zéro frais de bande passante sortante et 10 Go gratuits).

1. Sur [Cloudflare Dashboard](https://dash.cloudflare.com/), allez dans **« R2 Object Storage »** $\rightarrow$ **« Create bucket »** nommé `tiktok-studio-media`.
2. Cliquez sur **« Manage R2 API Tokens »** $\rightarrow$ **« Create API Token »** (Permissions : *Object Read & Write*).
3. Notez l'**Access Key ID**, la **Secret Access Key** et l'**Endpoint S3**.
4. Dans l'onglet **« Settings »** de votre bucket, activez l'accès public via **« Connect Domain »** (ex: `assets.mondomaine.com`).
5. Déclarez ce même domaine dans la console développeur TikTok (rubrique *Verified Domains*).
6. Ajoutez dans votre `.env` :
   ```env
   S3_ENDPOINT="https://<ACCOUNT_ID>.r2.cloudflarestorage.com"
   S3_ACCESS_KEY_ID="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
   S3_SECRET_ACCESS_KEY="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
   S3_BUCKET_NAME="tiktok-studio-media"
   S3_PUBLIC_VERIFIED_DOMAIN="https://assets.mondomaine.com"
   ```

---

### 9.6 Clés Cryptographiques Locales (AES-256-GCM & JWT)

Les jetons TikTok sont chiffrés au repos en base de données selon la norme militaire **AES-256-GCM** (exigence d'audit ByteDance). Vous générez ces clés vous-même sur votre poste :

```bash
node -e "console.log('ENCRYPTION_MASTER_KEY=' + require('crypto').randomBytes(32).toString('hex')); console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

Reportez les deux chaînes hexadécimales de 64 caractères dans votre `.env` :
```env
ENCRYPTION_MASTER_KEY="a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90"
JWT_SECRET="e9f8d7c6b5a43210e9f8d7c6b5a43210e9f8d7c6b5a43210e9f8d7c6b5a43210"
```

---

### 9.7 Base de Données PostgreSQL & Cache Redis

- **En local avec Docker (recommandé pour démarrer) :**
  ```bash
  docker compose up -d
  ```
  ```env
  DATABASE_URL="postgresql://postgres:postgres_password@localhost:5432/tiktok_studio?schema=public"
  REDIS_URL="redis://localhost:6379"
  ```
- **En Cloud Gratuit :** PostgreSQL serverless sur [Neon.tech](https://neon.tech/) et Redis managé sur [Upstash.com](https://upstash.com/).

---

### 9.8 Template `.env` Complet & Commande de Vérification

Copiez `.env.example` vers `.env` :

```bash
cp .env.example .env
```

```env
# ==============================================================================
# 1. SERVEURS & PORTS
# ==============================================================================
NODE_ENV="development"
PORT=4000
API_URL="http://localhost:4000"
FRONTEND_URL="http://localhost:5173"

# ==============================================================================
# 2. PERSISTANCE & CACHE
# ==============================================================================
DATABASE_URL="postgresql://postgres:postgres_password@localhost:5432/tiktok_studio?schema=public"
REDIS_URL="redis://localhost:6379"

# ==============================================================================
# 3. SÉCURITÉ MILITAIRE (AES-256-GCM & JWT)
# ==============================================================================
ENCRYPTION_MASTER_KEY="a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90"
JWT_SECRET="super_secret_jwt_key_pour_sessions_http_only_32_caracteres"

# ==============================================================================
# 4. TIKTOK DEVELOPER PORTAL
# ==============================================================================
TIKTOK_CLIENT_KEY="dev_tiktok_client_key"
TIKTOK_CLIENT_SECRET="dev_tiktok_client_secret"
TIKTOK_REDIRECT_URI="http://localhost:4000/api/auth/tiktok/callback"
TIKTOK_AUDIT_APPROVED="false"

# ==============================================================================
# 5. STOCKAGE MÉDIAS S3 / CLOUDFLARE R2
# ==============================================================================
S3_ENDPOINT="https://example.r2.cloudflarestorage.com"
S3_ACCESS_KEY_ID="dev_r2_access_key"
S3_SECRET_ACCESS_KEY="dev_r2_secret_key"
S3_BUCKET_NAME="tiktok-studio-media"
S3_PUBLIC_VERIFIED_DOMAIN="https://assets.mondomaine-verifie.com"

# ==============================================================================
# 6. IA GÉNÉRATIVE & VOIX-OFF
# ==============================================================================
GEMINI_API_KEY="AIzaSy_dev_key"
ELEVENLABS_API_KEY="dev_elevenlabs_key"
```

Validez votre configuration en lançant les tests unitaires d'environnement :
```bash
pnpm --filter @tiktok-studio/api test:unit tests/unit/env.test.ts
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
pnpm db:migrate

# Étape 6 : Générer le client Prisma typé
pnpm db:generate

# Étape 7 : Lancer simultanément l'API Node.js et le client React Vite
pnpm dev
```

L'application web React est immédiatement accessible à l'adresse [http://localhost:5173](http://localhost:5173) et l'API Node.js à l'adresse [http://localhost:4000](http://localhost:4000).

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
├── pnpm-workspace.yaml            # Déclaration du monorepo (apps/*, packages/*)
├── package.json                   # Scripts racine du monorepo
├── docker-compose.yml             # Conteneurs PostgreSQL et Redis locaux
├── docs/                          # Socle de spécification exhaustif
│   ├── 00-VISION.md               # Vision produit, manifeste & North Star Metric
│   ├── 01-PRODUCT_REQUIREMENTS_DOCUMENT.md   # Product Requirements Document (Exigences & User Stories)
│   ├── 02-TECHNICAL_REQUIREMENTS_DOCUMENT.md # Technical Requirements Document (Architecture & SLAs)
│   ├── 03-APP_FLOW.md             # Parcours UX & machine à états
│   ├── 04-BACKEND_SCHEMA.md       # Schéma BDD & relations détaillées
│   ├── 05-SECURITY.md             # Chiffrement & conformité TikTok
│   ├── 06-API_SPEC.md             # Spécifications des endpoints OpenAPI
│   ├── 07-TEST_PLAN.md            # Plan de recette & mocks
│   ├── 08-IMPLEMENTATION_PLAN.md  # Roadmap de développement par tâches
│   ├── 09-ROADMAP.md              # Vision stratégique V1 à V2
│   ├── FEUILLE_DE_ROUTE_DEV_ET_TESTS.md      # Synchronisation complète Sprints / Tests (Unit, E2E, CLI)
│   └── sprints/                   # Master Prompts d'ingénierie par sprint unitaire (01 à 07)
├── apps/
│   ├── api/                       # BACKEND PUR NODE.JS (Fastify / Express + TypeScript)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── prisma/
│   │   │   ├── schema.prisma      # Schéma relationnel Prisma
│   │   │   └── migrations/
│   │   └── src/
│   │       ├── server.ts          # Serveur HTTP Node.js (CORS, Cookies, Routes)
│   │       ├── routes/            # Endpoints REST (/auth, /ai, /posts, /media)
│   │       ├── services/          # Services métiers (TikTok API, Gemini Omni, Sharp, Crypto)
│   │       └── workers/           # Workers BullMQ d'arrière-plan & FFmpeg
│   └── web/                       # FRONTEND PUR REACT (Vite + TypeScript + Tailwind)
│       ├── package.json
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── index.html
│       └── src/
│           ├── main.tsx           # Point de montage React
│           ├── App.tsx            # Routage React Router
│           ├── components/        # Composants UI (Preview 9:16, Sidebar, Shadcn)
│           ├── hooks/             # Custom hooks & TanStack Query
│           └── lib/               # Client API (Axios configuré avec credentials)
└── packages/
    └── shared/                    # CONTRATS & SCHÉMAS ZOD PARTAGÉS
        ├── package.json
        ├── tsconfig.json
        └── src/
            ├── schemas/           # Schémas Zod partagés front/back
            └── types/             # Types DTOs et enums partagés
```

---

> [!IMPORTANT]
> **Rappel de Conformité :** Toute modification du flux d'authentification ou des permissions demandées à TikTok nécessite une nouvelle soumission d'approbation sur le portail développeur TikTok. Ne jamais modifier les scopes sans mettre à jour la documentation d'audit.
