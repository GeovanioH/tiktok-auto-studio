# Product Requirements Document (PRD) — TikTok Auto-Studio

> **Nom du Projet :** TikTok Auto-Studio  
> **Version :** 1.0.0  
> **Statut :** Validé — Spécification de Référence  
> **Auteur(s) :** Principal Software Architect & Staff Fullstack AI Engineer  
> **Dernière mise à jour :** 30 Octobre 2026

---

## 1. Vision & Proposition de Valeur

### 1.1 Problème Résolu
La croissance sur TikTok impose un rythme soutenu de 1 à 3 publications quotidiennes. Les créateurs individuels, les agences marketing et les e-commerçants se heurtent à trois obstacles majeurs :
1. **Friction créative et technique :** La conception d'un post engageant (hook, script, images percutantes, voix-off et sous-titres animés) mobilise entre 45 minutes et 2 heures par contenu.
2. **Dépendance mobile et rupture de flux :** L'obligation d'intervenir manuellement depuis un smartphone à l'heure exacte de publication fragmente le temps de travail et génère des oublis fréquents.
3. **Risque de bannissement :** L'usage de scripts de contournement (émulateurs Android, scraping, bots Selenium) viole les Conditions d'Utilisation de ByteDance et mène systématiquement au *shadowban* ou à la clôture de compte.

### 1.2 Proposition de Valeur
**TikTok Auto-Studio** est la première plateforme SaaS d'automatisation clé-en-main connectée directement aux **APIs officielles certifiées de TikTok (Login Kit & Content Posting API v2)** :
- **Studio IA Multimodal en 3 Clics :** Une simple idée ou un sujet est transformé en un post complet (carrousel photo ou vidéo 9:16 montée avec Ken Burns, voix-off et sous-titres animés `.ass`) en moins de 60 secondes.
- **Pilotage Zéro Application Mobile :** Programmation de publications différées sans aucune notification mobile de validation requise.
- **Conformité & Sérénité Totales :** Chiffrement militaire des jetons (AES-256-GCM), respect strict des quotas, marquage légal IA (`is_aigc: true`) et hébergement sur CDN validé par TikTok.

### 1.3 Objectifs Stratégiques & KPIs (SMART)
- **KPI-01 (Fiabilité de publication) :** Taux de succès d'exécution des jobs de publication $\ge 99.5\%$ sur les créneaux programmés.
- **KPI-02 (Vitesse de création) :** Temps moyen de génération complète d'un asset IA (texte + visuels 9:16 + vidéo montée) $\le 60\text{ secondes}$.
- **KPI-03 (Résilience au crash) :** 100% des publications différées soumises à la règle des 15 minutes (envoi si $\le 15\text{ min}$, bascule sécurisée en `MISSED` si $> 15\text{ min}$).
- **KPI-04 (Sécurité absolue) :** 0 fuite de token, 0 token stocké en clair, 100% des jetons chiffrés AES-256-GCM.
- **KPI-05 (Conformité TikTok) :** 100% des publications vérifiées préalablement via l'endpoint `creator_info/query/` et étiquetées `is_aigc: true`.

---

## 2. Personas & Utilisateurs Cibles

### Persona 1 : Thomas — Créateur Solo & Infopreneur (Plan Free / Pro)
- **Profil :** Créateur de contenu tech & productivité, produit du contenu quotidien pour monétiser des formations.
- **Besoins majeurs :** Automatiser la création de carrousels photos éducatifs et de courtes vidéos sans passer par Premiere Pro ou CapCut.
- **Frustrations :** Perte de temps sur mobile le soir pour poster, manque d'inspiration pour renouveler les hooks.
- **Fonctionnalités requises :** Studio IA 3-clics, calendrier visuel, programmation sur 7 jours.

### Persona 2 : Sarah — Head of Social Media en Agence (Plan Agency)
- **Profil :** Supervise 15 comptes de marques clientes aux identités variées.
- **Besoins majeurs :** Gérer plusieurs comptes TikTok depuis un tableau de bord unique, préparer les plannings du mois à l'avance.
- **Frustrations :** Jongler entre 15 téléphones ou comptes connectés, erreurs manuelles de publication.
- **Fonctionnalités requises :** Multi-comptes TikTok, bascule rapide, historique complet des statuts et logs d'erreur explicites, quotas élevés.

### Persona 3 : Alexandre — E-commerçant Dropshipping / D2C (Plan Pro)
- **Profil :** Dirige 2 boutiques en ligne et publie des démonstrations produits.
- **Besoins majeurs :** Transformer des fiches produits en vidéos dynamiques avec voix-off et sous-titres engageants.
- **Frustrations :** Coût élevé des monteurs freelances, retards de livraison des vidéos.
- **Fonctionnalités requises :** Génération vidéo automatique FFmpeg avec zooms Ken Burns et voix-off percutante, suivi des échecs avec bouton retry.

---

## 3. Périmètre Fonctionnel Détaillé (Méthode MoSCoW)

### 3.1 Must Have (Indispensable pour le MVP v1.0)

| ID | Cas d'Usage | Description Fonctionnelle Détaillée |
| :--- | :--- | :--- |
| **US-01** | **UC1 : Connexion TikTok OAuth2** | En tant qu'utilisateur, je veux connecter mon compte TikTok en 1 clic via le flux OAuth2 PKCE officiel afin de donner l'autorisation de publication sécurisée. |
| **US-02** | **UC2 : Création Manuelle de Post** | En tant qu'utilisateur, je veux uploader une vidéo (MP4/MOV) ou 1 à 35 photos (JPEG/WEBP), saisir un titre/légende (2200 car.) et définir les options de confidentialité. |
| **US-03** | **UC2 : Contrôle Préalable Créateur** | En tant que système, je dois interroger `creator_info/query/` pour adapter dynamiquement l'interface (durée vidéo maximale, niveaux de visibilité autorisés, duos/collages). |
| **US-04** | **UC3 : Programmation Temporelle** | En tant qu'utilisateur, je veux choisir une date et une heure (UTC calculé, minimum +5 minutes) pour planifier une publication sans intervention future. |
| **US-05** | **UC4 : Studio IA Multimodal 3-Clics** | En tant qu'utilisateur, je veux saisir une idée textuelle et obtenir en 60s un carrousel ou une vidéo montée 9:16 avec voix-off et sous-titres animés, prête à valider. |
| **US-06** | **UC5 : Moteur de Publication BullMQ** | En tant que système, je dois exécuter les publications à l'heure exacte avec clé d'idempotence `jobId: "post_" + id`, gestion du refresh token et upload résilient. |
| **US-07** | **UC5 : Règle des 15 Minutes** | En tant que système, lors d'une reprise après incident, si le retard $\le 15\text{ min}$, je publie immédiatement ; si $> 15\text{ min}$, je bascule en `MISSED`. |
| **US-08** | **UC6 : Suivi des Statuts & Retry** | En tant qu'utilisateur, je veux visualiser mes posts par statuts (`DRAFT`, `SCHEDULED`, `PROCESSING`, `PUBLISHED`, `FAILED`, `MISSED`) et pouvoir relancer un post échoué en 1 clic. |
| **US-09** | **UC7 : Révocation & Déconnexion** | En tant qu'utilisateur, je veux révoquer l'accès TikTok en purgeant les tokens chiffrés et en annulant tous les jobs programmés correspondants. |
| **US-10** | **Sécurité Cryptographique** | En tant qu'architecte, je dois garantir que tous les tokens d'accès et de rafraîchissement sont chiffrés avec AES-256-GCM et qu'aucun secret ne fuite côté client. |
| **US-11** | **Conformité & Étiquetage AIGC** | En tant que système, je dois marquer systématiquement `is_aigc: true` pour tout contenu généré et convertir automatiquement tout PNG en JPEG/WEBP. |

### 3.2 Should Have (Version 1.5 — Monétisation & Post-Audit)

| ID | Domaine | Description Fonctionnelle |
| :--- | :--- | :--- |
| **US-12** | **Abonnements Stripe** | Gestion des forfaits Free (3 posts IA/jour), Pro (20 posts IA/jour) et Agency (100 posts IA/jour + multi-comptes) avec portail client Stripe. |
| **US-13** | **Ouverture Public post-Audit** | Activation de la visibilité `PUBLIC_TO_EVERYONE` dès la validation officielle de l'audit commercial TikTok. |
| **US-14** | **Notifications Webhook/Email** | Alertes e-mail et notifications in-app lors d'un échec de publication ou d'un post passé en statut `MISSED`. |
| **US-15** | **Rechargement de Quotas** | Possibilité pour l'utilisateur d'acheter des packs d'inférences IA supplémentaires hors abonnement. |

### 3.3 Could Have (Version 2.0 — Scale & Fonctionnalités Avancées)

| ID | Domaine | Description Fonctionnelle |
| :--- | :--- | :--- |
| **US-16** | **Batch Content Generator** | Génération en 1 clic d'un pack de 7 jours de contenus programmés sur une thématique donnée. |
| **US-17** | **Brand Kit Personnalisé** | Sauvegarde des polices, chartes de couleurs pour sous-titres, et sélection de voix-off ElevenLabs custom. |
| **US-18** | **Multi-Plateformes (Cross-Post)** | Publication simultanée vers Instagram Reels et YouTube Shorts à partir du même rendu 9:16. |

### 3.4 Won't Have (Strictement Hors Périmètre Initial)
- **Interaction sociale automatisée :** Pas de réponse automatique aux commentaires ni d'envoi de messages privés TikTok (DMs).
- **Abonnements/Désabonnements automatisés :** Aucune action de type follow/unfollow bot (strictement prohibé par l'API officielle).
- **Éditeur vidéo timeline lourd dans le navigateur :** L'édition repose sur le pipeline déclaratif automatisé FFmpeg, pas sur un clone complet de CapCut.

---

## 4. Modèle SaaS, Rôles & Quotas

### 4.1 Grille Tarifaire & Quotas Journaliers

| Plan | Prix Mensuel | Comptes TikTok | Quota IA / Jour | Max Durée Vidéo | Rétention Médias |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Free** | 0 € / mois | 1 compte | 3 générations | 60 secondes | 7 jours |
| **Pro** | 29 € / mois | 3 comptes | 25 générations | 180 secondes | 30 jours |
| **Agency** | 99 € / mois | 15 comptes | 100 générations | 600 secondes | 90 jours |

### 4.2 Matrice des Droits et Rôles Applicatifs

| Rôle | Accès Studio IA | Programmation | Connexion TikTok | Facturation & Plans | Gestion Utilisateurs |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **User (Free/Pro)** | Selon Quota | Oui | Oui (1 à 3) | Vue personnelle | Non |
| **Agency Member** | Selon Quota | Oui | Oui (jusqu'à 15) | Lecture seule | Non |
| **Agency Owner** | Illimité Agence | Oui | Oui (jusqu'à 15) | Gestion Stripe | Oui (Inviter membres) |
| **System Admin** | Support / Audit | Support | Support | Vue Globale | Modération / Suspension |

---

## 5. Critères d'Acceptation & Contraintes Métier Non-Négociables

1. **Validation Stricte des Formats d'Images :**
   - Format source accepté : JPEG, WEBP.
   - Si l'utilisateur ou le générateur IA fournit un format PNG, le système **doit le convertir sans perte en JPEG qualité 95** avant tout upload vers Cloudflare R2.
   - Poids unitaire d'image $\le 20\text{ Mo}$, ratio vertical recommandé 9:16 (1080x1920).
2. **Validation des Fichiers Vidéo :**
   - Format conteneur : MP4 ou MOV.
   - Codec vidéo : H.264 / AVC. Codec audio : AAC stéréo.
   - Résolution : $1080 \times 1920$ (ratio 9:16 strict). Poids max : 500 Mo.
3. **Contraintes Temporelles de Programmation :**
   - Tout créneau programmé doit être positionné à au moins **+5 minutes** par rapport à l'horodatage UTC actuel.
   - La programmation maximale est bornée à **30 jours** dans le futur.
4. **Contrainte Pré-Audit TikTok :**
   - Tant que l'audit développeur TikTok est en cours de révision, la variable système `TIKTOK_AUDIT_APPROVED` est à `false`.
   - Tout post envoyé doit obligatoirement avoir `privacy_level: "SELF_ONLY"`.
   - L'interface utilisateur doit afficher un badge explicatif : *"Mode Bac à Sable : Vos publications sont temporairement publiées en visibilité Privée en attendant l'audit final de TikTok"*.
5. **Rétention des Tokens :**
   - L'Access Token expire après 86400 secondes (24h). Il doit être régénéré proactivement dès qu'il atteint 23h de vie.
   - Le Refresh Token expire après 365 jours. Si expiration à moins de 15 jours, alerte bannière dans l'UI.
