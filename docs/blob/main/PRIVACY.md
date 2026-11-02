# Politique de Confidentialité — TikTok Auto Studio

*Dernière mise à jour : Novembre 2026*

La présente Politique de Confidentialité décrit la manière dont l'application **TikTok Auto Studio** (« le Studio », « nous ») collecte, utilise, protège et traite les données des utilisateurs dans le cadre de l'intégration avec l'API TikTok for Developers (Login Kit & Content Posting API).

---

## 1. Responsable du Traitement
L'application **TikTok Auto Studio** est un outil open-source d'automatisation de publication vidéo et photo respectant les spécifications officielles de ByteDance / TikTok.

- **Dépôt du projet** : https://github.com/GeovanioH/tiktok-auto-studio
- **Architecture** : Hébergement auto-géré / local sécurisé.

---

## 2. Données Collectées & Finalités
Nous limitons strictement la collecte aux données strictement requises pour le bon fonctionnement des autorisations accordées par l'utilisateur :

| Donnée | Finalité | Durée de conservation |
| :--- | :--- | :--- |
| **Identifiant TikTok (`open_id`)** | Identification du profil créateur cible | Durée de l'association du compte |
| **Jeton d'accès OAuth (`access_token`)** | Envoi des requêtes de publication vers l'API TikTok | 24 heures (renouvelé automatiquement) |
| **Jeton de rafraîchissement (`refresh_token`)** | Maintien de la connexion sans ré-authentification | Jusqu'à révocation explicite |
| **Nom d'affichage & Avatar public** | Affichage dans l'interface de travail locale | Durée de la session |
| **Fichiers médias & Métadonnées** | Traitement vidéo local et envoi différé | Supprimés après publication validée |

---

## 3. Sécurité & Chiffrement Militaire (AES-256-GCM)
Conformément aux exigences de sécurité TikTok for Developers :
- **Chiffrement au repos** : Tous les jetons d'authentification (`access_token`, `refresh_token`) sont chiffrés en base de données selon le standard militaire **AES-256-GCM** avec un vecteur d'initialisation unique (IV 96-bit) et un tag d'authentification d'intégrité (128-bit).
- **Zéro fuite client** : Aucune clé API ni jeton TikTok brut n'est exposé au navigateur web. Toutes les requêtes transitent par le serveur backend Fastify.
- **Aucune revente de données** : Vos données et vidéos ne sont jamais vendues, louées, ni partagées avec des régies publicitaires tierces.

---

## 4. Partage avec des Tiers
Les seules communications externes effectuées par l'application sont :
1. **TikTok API (ByteDance)** : Pour l'authentification et l'initiation des téléversements (`/v2/post/publish/video/init/`, `/v2/post/publish/creator_info/query/`).
2. **Google AI Studio (Gemini)** : Pour la génération facultative de scripts et descriptions textuelles (sans envoi de données personnelles).
3. **Cloudflare R2 / S3 (si configuré)** : Pour le stockage transitoire des médias lors de la publication directe par URL.

---

## 5. Droits de l'Utilisateur & Révocation
Vous conservez à tout moment un contrôle absolu sur vos données :
- **Droit d'accès et de rectification** : Consultable directement depuis l'onglet « Comptes Liés » de l'application.
- **Révocation instantanée** : Un clic sur « Déconnecter le compte » ou l'appel à la route `/api/auth/tiktok/unlink` purge immédiatement tous les jetons chiffrés de la base de données locale.
- **Gestion côté TikTok** : Vous pouvez également révoquer les accès à tout moment depuis les paramètres de votre compte TikTok (*Paramètres > Sécurité et autorisations > Applications tierces autorisées*).

---

## 6. Contact
Pour toute question relative à cette politique de confidentialité ou pour signaler une anomalie de sécurité, veuillez ouvrir une issue sur le dépôt officiel : https://github.com/GeovanioH/tiktok-auto-studio/issues.
