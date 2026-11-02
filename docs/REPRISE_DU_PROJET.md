# TikTok Auto Studio — Guide de Reprise de Projet

*Ce document récapitule l'état technique, visuel et réglementaire du projet pour continuer le travail dans une nouvelle session ou sur une autre machine.*

---

## 1. Informations Essentielles & Dépôt

* **Dépôt GitHub** : [https://github.com/GeovanioH/tiktok-auto-studio](https://github.com/GeovanioH/tiktok-auto-studio) *(Public, branche principale : `main`)*
* **Couverture des tests** : **156/156 tests validés** (15 suites Vitest, 0 échec)
* **Build Web & API** : Compilés sans erreur (`vite v5.4.21`, TypeScript strict)
* **Architecture d'Hébergement** : Conteneur de production unifié (`Fastify` + `React SPA`), Blueprint Render (`render.yaml`), Railway (`railway.json`), et Docker Compose VPS avec reverse-proxy SSL Caddy automatique (`docker-compose.prod.yml`).

---

## 2. Identité Visuelle & Design System

### Le Logo « L'Orbite Prisme » (100% Propriétaire)
* Purge totale de la note de musique ByteDance.
* Conception originale combinant le monogramme « AS » (Auto Studio) en flux vertical 9:16 infini ($\infty$), un prisme 3D Quantum Play et une étincelle d'intelligence IA.
* **Assets générés disponibles dans `apps/web/public/`** :
  * `tiktok-icon-1024.png` : $1024\times 1024\text{ px}$ (106 KB), fond plein Midnight Slate, zone de sécurité circulaire incluse pour TikTok.
  * `tiktok-icon-1024.jpg` : $1024\times 1024\text{ px}$ (112 KB).
  * `tiktok-icon-squircle-1024.png` : $1024\times 1024\text{ px}$ (103 KB), châssis chanfreiné transparent.
  * `logo-1080.png` ($1080\times 1080\text{ px}$) et `logo-2048.png` ($2048\times 2048\text{ px}$).
  * `logo.svg` et `favicon.svg`.

### Charte Chromatique (Ni noir pur, ni blanc pur)
* **Mode Sombre (Midnight Slate)** :
  * Fond principal : `#0F172A` (Slate 900)
  * Cartes & Conteneurs : `#1E293B` (Slate 800)
  * Bordures & Séparateurs : `#334155` (Slate 700)
  * Texte : `#F8FAFC` (Slate 50) et `#94A3B8` (Slate 400)
* **Mode Clair (Studio Platine Minéral)** :
  * Fond principal : `#E2E8F0` (Slate 200)
  * Cartes & Conteneurs : `#EDF2F7` (Slate 100)
  * Panneaux structurés : `#D9E2EC`
  * Bordures : `#CBD5E1`
  * Texte : `#0F172A` (Slate 900, contraste AAA)
* **Accents TikTok** : Rouge Corail `#FE2C55` et Cyan Néon `#00F5D4`.

---

## 3. Ergonomie & Composants Développés

1. **Suppression des simulations artificielles** :
   * Système honnête initialisé à **0** par défaut (`posts: []`, `quotaUsed: 0/20`).
2. **Centre de Notifications interactif** (`NotificationPopover.tsx`) :
   * Cloche animée avec badge de compteur non lu, persistance dans le `localStorage` et déclenchement temps réel.
3. **Menu Profil interactif** (`UserMenuPopover.tsx`) :
   * Jauge de quota, statut OAuth réel, et liens rapides.
4. **Pages Légales Intégrées** :
   * [`/privacy`](file:///C:/Users/ADMIN/Documents/tiktok-auto-studio/apps/web/src/pages/PrivacyPage.tsx) et [`/terms`](file:///C:/Users/ADMIN/Documents/tiktok-auto-studio/apps/web/src/pages/TermsPage.tsx) directement servies par l'application pour la validation TikTok Developer.
5. **Sidebar Collapsible corrigée** (`Sidebar.tsx`) :
   * Logo centré verticalement sans coupure lors de la rétractation du menu.

---

## 4. Hébergement Réel en Production (Adieu GitHub Pages & Localtunnel)

Le serveur Fastify sert nativement en production le build de l'interface React (`apps/web/dist`) via `@fastify/static`. Un seul domaine HTTPS couvre l'application, l'API et les callbacks OAuth TikTok.

Consultez le guide complet : [`docs/GUIDE_HEBERGEMENT_PRODUCTION.md`](file:///C:/Users/ADMIN/Documents/tiktok-auto-studio/docs/GUIDE_HEBERGEMENT_PRODUCTION.md).

### Configuration TikTok Developer Portal Définitive :
| Champ requis | Valeur configurée |
| :--- | :--- |
| **App Name** | `Auto Studio AI` *(Sans le mot réservé « TikTok »)* |
| **Category** | `Business` |
| **Description** | `Automated 9:16 video creation, scheduling, and publishing tool for content creators and businesses.` |
| **Web/Desktop URL** | `https://<votre-domaine-cloud>/` |
| **Terms of Service** | `https://<votre-domaine-cloud>/terms` |
| **Privacy Policy** | `https://<votre-domaine-cloud>/privacy` |
| **Scopes** | `user.info.basic`, `video.upload` |
| **Redirect URI (OAuth)**| `https://<votre-domaine-cloud>/api/auth/tiktok/callback` |

---

## 5. Guide de Démarrage Rapide

### A. Développement Local
```bash
# 1. Cloner le projet
git clone https://github.com/GeovanioH/tiktok-auto-studio.git
cd tiktok-auto-studio

# 2. Installer les dépendances
pnpm install

# 3. Lancer PostgreSQL + Redis en local
docker compose up -d

# 4. Initialiser la base Prisma
pnpm --filter @tiktok-studio/api prisma db push

# 5. Démarrer l'environnement de dev complet
pnpm dev

# 6. Vérifier la suite de tests
pnpm test
```

### B. Déploiement en Production Cloud
* **Render (Recommandé)** : Connectez le repo sur [Render.com](https://render.com) en sélectionnant *Blueprint* (`render.yaml`).
* **Railway** : Déployez le repo sur [Railway.app](https://railway.app) via `railway.json`.
* **VPS Dédié** : `DOMAIN=studio.mondomaine.com docker compose -f docker-compose.prod.yml up -d --build`.
