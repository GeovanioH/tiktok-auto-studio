# TikTok Auto Studio — Guide de Reprise de Projet

*Ce document récapitule l'état technique, visuel et réglementaire du projet pour continuer le travail dans une nouvelle session ou sur une autre machine.*

---

## 1. Informations Essentielles & Dépôt

* **Dépôt GitHub** : [https://github.com/GeovanioH/tiktok-auto-studio](https://github.com/GeovanioH/tiktok-auto-studio) *(Public, branche principale : `main`)*
* **Site Web Officiel & Landing Page** : [https://geovanioh.github.io/tiktok-auto-studio/](https://geovanioh.github.io/tiktok-auto-studio/) *(Déployé via GitHub Pages sur `main/docs` — HTTP 200 OK)*
* **Dernier commit `main`** : `bf05fad` (Totalement synchronisé avec `develop`)
* **Couverture des tests** : **156/156 tests validés** (15 suites Vitest, 0 échec)
* **Build Web** : Compilé sans erreur (`vite v5.4.21`, TypeScript strict)

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
   * Remplacement des faux badges système et compteurs fictifs par un système honnête initialisé à **0** par défaut (`posts: []`, `quotaUsed: 0/20`).
2. **Centre de Notifications interactif** ([`NotificationPopover.tsx`](file:///C:/Users/ADMIN/Documents/tiktok-auto-studio/apps/web/src/components/layout/NotificationPopover.tsx)) :
   * Cloche animée avec badge de compteur non lu, onglets Toutes/Non lues, persistance dans le `localStorage` et déclenchement temps réel.
3. **Menu Profil interactif** ([`UserMenuPopover.tsx`](file:///C:/Users/ADMIN/Documents/tiktok-auto-studio/apps/web/src/components/layout/UserMenuPopover.tsx)) :
   * Remplace l'avatar statique « TT » par un menu complet avec jauge de quota, statut OAuth réel, et liens rapides.
4. **Sidebar Collapsible corrigée** ([`Sidebar.tsx`](file:///C:/Users/ADMIN/Documents/tiktok-auto-studio/apps/web/src/components/layout/Sidebar.tsx)) :
   * Logo centré verticalement sans coupure lors de la rétractation du menu.

---

## 4. Statut du Dossier TikTok Developer Portal

| Champ requis | Valeur configurée |
| :--- | :--- |
| **App Name** | `Auto Studio AI` *(Sans le mot réservé « TikTok »)* |
| **Category** | `Business` |
| **Description** | `Automated 9:16 video creation, scheduling, and publishing tool for content creators and businesses.` |
| **Web/Desktop URL** | `https://geovanioh.github.io/tiktok-auto-studio/` |
| **Terms of Service** | `https://github.com/GeovanioH/tiktok-auto-studio/blob/main/TERMS.md` |
| **Privacy Policy** | `https://github.com/GeovanioH/tiktok-auto-studio/blob/main/PRIVACY.md` |
| **Scopes** | `user.info.basic`, `video.upload` |
| **Redirect URI (Local)**| `https://<votre-tunnel>.loca.lt/api/auth/tiktok/callback` via `npx localtunnel --port 4000` |

### Action en cours à terminer :
* Dans la modale TikTok **« Select property type »**, l'option **URL prefix** est sélectionnée pour `https://geovanioh.github.io/tiktok-auto-studio/`.
* Dès que TikTok affiche le nom du fichier de signature (ex: `tiktok_developers_XXXXX.txt`), il suffit de placer ce fichier dans le dossier [`docs/`](file:///C:/Users/ADMIN/Documents/tiktok-auto-studio/docs) et de le pousser sur GitHub pour que la validation passe en vert.

---

## 5. Guide de Démarrage Rapide (Pour continuer ailleurs)

```bash
# 1. Cloner le projet
git clone https://github.com/GeovanioH/tiktok-auto-studio.git
cd tiktok-auto-studio

# 2. Installer les dépendances
pnpm install

# 3. Lancer les conteneurs (PostgreSQL + Redis)
docker compose up -d

# 4. Initialiser la base de données
pnpm --filter @tiktok-studio/api prisma db push

# 5. Lancer l'environnement de développement complet (API :4000 + Web :5173)
pnpm dev

# 6. Exposer le backend local pour le callback OAuth TikTok (0€, sans hébergement)
npx localtunnel --port 4000

# 7. Vérifier la suite de tests
pnpm vitest run
```
