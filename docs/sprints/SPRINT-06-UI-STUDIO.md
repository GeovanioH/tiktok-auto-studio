# ==============================================================================
# MASTER PROMPT D'INGÉNIERIE — SPRINT 06 : INTERFACE UTILISATEUR & STUDIO IA 3-CLICS
# ==============================================================================

> **Destinataire du Prompt :** Agent Autonome d'Ingénierie Logicielle (Lead Frontend & UX/UI Engineer)  
> **Niveau de Contexte Initial :** Zéro Connaissance Préalable (Self-Contained Master Prompt)  
> **Projet :** TikTok Auto-Studio  
> **Objectif du Sprint :** Conception et développement complet de l'application frontend pure **React 18/19 (Vite SPA)** sous TypeScript, TailwindCSS, et Shadcn/ui dans `apps/web`, comprenant le Layout Dashboard réactif avec gestion des quotas via TanStack Query, le Studio IA en 3 Clics avec prévisualisation smartphone 9:16 et Safe Area TikTok, le Calendrier interactif de programmation avec détection de fuseau horaire, l'écran de suivi des publications avec bouton de réessai en 1 clic, et l'espace de gestion du compte TikTok conforme aux chartes visuelles ByteDance.

---

## 1. RÔLE, POSTURE ET RÈGLES D'ENGAGEMENT DE L'AGENT

Tu agis en tant que **Principal Frontend Architect & Senior Product Designer**.
Tu vas donner vie à l'expérience utilisateur de TikTok Auto-Studio.

### Règles d'or absolues :
1. **Design System & Esthétique Studio :** Interface moderne, sombre (Dark Mode natif inspiré de Linear/Vercel/TikTok Studio), épurée, contrastée, fluide, utilisant **TailwindCSS**, **Lucide Icons** et les briques de **Shadcn/ui**.
2. **Prévisualisation Smartphone Réaliste (Safe Area) :** Le composant de prévisualisation doit simuler fidèlement l'interface d'un smartphone moderne (ratio 9:16) en incrustant en surimpression légère les icônes officielles de TikTok (profil, cœur, commentaire, bookmark, partage, vinyle audio rotatif) pour permettre à l'utilisateur de vérifier que ses sous-titres et éléments clés ne sont pas masqués.
3. **Zéro Layout Shift (CLS = 0) :** Chaque composant asynchrone doit disposer de son état de chargement avec des squelettes animés (*Skeletons shimmer*) aux dimensions exactes.
4. **Gestion Universelle des 4 États UI :** Chaque vue doit gérer explicitement ses 4 états canoniques : *Loading*, *Error* (avec bouton de remédiation en français), *Empty* (avec illustration et CTA), et *Success*.
5. **Ergonomie 3 Clics Stricte :** Le Studio IA doit permettre de passer d'une idée brute à un post planifié en exactement 3 interactions claires sans formulaires superflus.

---

## 2. CONTEXTE GLOBAL DU PROJET : "TIKTOK AUTO-STUDIO"

### 2.1 Qu'est-ce que TikTok Auto-Studio ?
**TikTok Auto-Studio** est la première plateforme SaaS permettant de créer et de programmer des vidéos et carrousels TikTok sans jamais avoir à toucher à son smartphone.

### 2.2 Quels sont les écrans majeurs attendus par les utilisateurs ?
1. **Le Studio IA en 3 Clics (`/studio`) :**
   - *Clic 1 :* L'utilisateur tape son idée ou choisit une suggestion et sélectionne le format (Vidéo 9:16 ou Carrousel Photos).
   - *Clic 2 :* L'utilisateur clique sur « Générer ». Une barre en 4 étapes montre la progression en temps réel (1. Script $\rightarrow$ 2. Visuels $\rightarrow$ 3. Voix $\rightarrow$ 4. Montage).
   - *Clic 3 :* L'utilisateur valide dans la prévisualisation smartphone et clique sur « Publier maintenant » ou « Programmer ».
2. **Le Calendrier Temporel (`/calendar`) :**
   - Vue visuelle par semaine et par mois.
   - Les créneaux occupés affichent les vignettes des posts avec pastille de statut colorée.
   - Détection automatique du fuseau horaire du navigateur et conversion silencieuse en UTC pour le backend.
   - Interdiction de planifier dans le passé ou à moins de 5 minutes de l'instant présent.
3. **Le Suivi des Publications & Relance (`/posts`) :**
   - Tableau et cartes récapitulant les statuts du post (`DRAFT`, `SCHEDULED`, `PROCESSING`, `PUBLISHED`, `FAILED`, `MISSED`).
   - Pour les posts en `FAILED`, explication claire du motif de l'échec et bouton « Réessayer » en 1 clic.
4. **La Gestion des Comptes TikTok (`/accounts`) :**
   - Bouton officiel conforme TikTok : « Se connecter avec TikTok ».
   - Badge de statut de connexion, affichage de l'avatar et du nom TikTok officiel.
   - Bouton de révocation et déconnexion sécurisée.

---

## 3. ÉTAT DU PROJET AVANT CE SPRINT (POINT DE DÉPART)

Avant de démarrer le Sprint 06, toute la logique backend est prête :
- Les routes API REST sont en place : `/api/auth/tiktok/*`, `/api/ai/generate`, `/api/posts`, `/api/posts/[id]/retry`.
- Le modèle de données Prisma et la base PostgreSQL sont configurés.
- Le moteur BullMQ et le worker de publication sont opérationnels.

---

## 4. MISSION PRÉCISE DU SPRINT 06

Tu dois concevoir et coder l'ensemble du frontend en réalisant les 6 actions suivantes :
1. **Composants d'Infrastructure UI & Layout Dashboard (`src/app/(dashboard)/layout.tsx`) :**
   - Barre latérale de navigation (`Sidebar`) avec liens actifs, logo animé, sélecteur de compte TikTok actif, et jauge de quota d'inférence journalier restant.
   - Barre supérieure (`Navbar`) avec notifications et profil utilisateur.
2. **Composant Smartphone 9:16 & Safe Area TikTok (`src/components/studio/TikTokPreview.tsx`) :**
   - Cadre de smartphone avec coins arrondis simulant un écran iPhone/Android.
   - Lecteur vidéo HTML5 ou carrousel photo avec navigation par swipe/clic.
   - Overlay avec les icônes standards TikTok sur le côté droit et en bas (titre, légende tronquée avec bouton "plus").
3. **Page Studio IA 3-Clics (`src/app/(dashboard)/studio/page.tsx`) :**
   - Formulaire d'idée avec 4 suggestions pré-remplies.
   - Sélecteur de format à deux options (Carrousel Photos vs Vidéo Verticale).
   - Stepper de progression animé durant l'inférence.
   - Modale de déclenchement temporel (`ScheduleModal`).
4. **Page Calendrier Interactif (`src/app/(dashboard)/calendar/page.tsx`) :**
   - Grille de calendrier moderne avec affichage des créneaux horaires d'audience optimale.
   - Badges colorés selon le statut du post.
   - Validation stricte de la règle des 5 minutes minimales.
5. **Page Historique des Posts & Bouton Réessayer (`src/app/(dashboard)/posts/page.tsx`) :**
   - Onglets de filtrage par statut (`Tous`, `Programmés`, `Publiés`, `Échecs`).
   - Modal d'erreur affichant le motif précis de rejet TikTok et le bouton de relance immédiate vers `/api/posts/[id]/retry`.
6. **Page Connexion & Paramètres TikTok (`src/app/(dashboard)/accounts/page.tsx`) :**
   - Bouton officiel stylisé conforme aux consignes de marque TikTok Developer Guidelines.
   - Alerte visuelle informative précisant le mode bac à sable pré-audit (`SELF_ONLY`).

---

## 5. SPÉCIFICATIONS TECHNIQUES DÉTAILLÉES DES COMPOSANTS UI

### 5.1 Composant Smartphone 9:16 (`src/components/studio/TikTokPreview.tsx`)

```tsx
"use client";

import React, { useState } from "react";
import { Heart, MessageCircle, Bookmark, Share2, Music, CheckCircle2 } from "lucide-react";

interface TikTokPreviewProps {
  mediaType: "VIDEO" | "PHOTO";
  mediaUrls: string[];
  caption: string;
  accountHandle?: string;
  isAigc?: boolean;
}

export function TikTokPreview({
  mediaType,
  mediaUrls,
  caption,
  accountHandle = "@mon_compte",
  isAigc = true
}: TikTokPreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div className="relative mx-auto w-[320px] h-[568px] sm:w-[360px] sm:h-[640px] bg-black rounded-[40px] border-[8px] border-zinc-800 shadow-2xl overflow-hidden select-none">
      {/* Contenu Média Principal */}
      <div className="absolute inset-0 w-full h-full">
        {mediaType === "VIDEO" ? (
          <video
            src={mediaUrls[0]}
            className="w-full h-full object-cover"
            controls={false}
            autoPlay
            loop
            muted
          />
        ) : (
          <div className="relative w-full h-full">
            <img
              src={mediaUrls[currentSlide]}
              alt={`Slide ${currentSlide + 1}`}
              className="w-full h-full object-cover"
            />
            {mediaUrls.length > 1 && (
              <div className="absolute top-4 right-4 bg-black/60 px-2.5 py-1 rounded-full text-xs text-white font-medium">
                {currentSlide + 1}/{mediaUrls.length}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tag Légal AIGC (Transparence IA) */}
      {isAigc && (
        <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[11px] text-white/90 font-medium">Généré par IA</span>
        </div>
      )}

      {/* Barre d'Action Latérale Droite (Safe Area TikTok) */}
      <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4 text-white">
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-zinc-800/80 backdrop-blur-sm flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-semibold">12.4K</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-zinc-800/80 backdrop-blur-sm flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-semibold">348</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-zinc-800/80 backdrop-blur-sm flex items-center justify-center">
            <Bookmark className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-semibold">1.2K</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-zinc-800/80 backdrop-blur-sm flex items-center justify-center">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-semibold">410</span>
        </div>
        {/* Disque Vinyle Rotatif */}
        <div className="w-9 h-9 rounded-full bg-zinc-900 border-2 border-white/20 flex items-center justify-center animate-spin">
          <Music className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Overlay Bas : Compte & Légende */}
      <div className="absolute left-3 right-16 bottom-4 text-white">
        <p className="font-bold text-sm drop-shadow">{accountHandle}</p>
        <p className="text-xs text-white/90 line-clamp-2 mt-1 drop-shadow">
          {caption}
        </p>
        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-white/80">
          <Music className="w-3 h-3" />
          <span className="truncate">Son original — {accountHandle}</span>
        </div>
      </div>
    </div>
  );
}
```

### 5.2 Écran Studio IA (`src/app/(dashboard)/studio/page.tsx`)

#### Cinématique des 3 Clics :
1. **Panneau de Configuration (Gauche) :**
   - Champ de texte : *"Saisissez votre sujet ou posez une question..."*
   - Suggestions en 1 clic : *"3 erreurs de productivité"*, *"Pourquoi 90% des e-commerçants échouent"*, etc.
   - Sélecteur de format : Vidéo 9:16 ou Carrousel.
   - Bouton primaire CTA : « Générer avec l'IA ».
2. **Animation de Génération (Overlay Progressif) :**
   - Étape 1 : Rédaction du script et des accroches (Gemini Pro) - Icône bleue animée.
   - Étape 2 : Création des visuels photoréalistes 9:16 (Imagen 3) - Icône violette animée.
   - Étape 3 : Synthèse de la voix-off et synchronisation - Icône jaune animée.
   - Étape 4 : Montage vidéo et incrustation des sous-titres (FFmpeg) - Icône verte.
3. **Panneau d'Aperçu & Déclenchement (Droite) :**
   - Affichage immédiat du composant `TikTokPreview`.
   - Boutons d'action en bas :
     - « Publier maintenant » (déclenche immédiatement `executeTikTokPublish`).
     - « Programmer » (ouvre le datepicker modal avec validation $\ge +5\text{ min}$).
     - « Enregistrer brouillon ».

### 5.3 Bouton Officiel de Connexion TikTok (`src/components/auth/TikTokLoginButton.tsx`)
Conforme aux **TikTok Brand Guidelines** :
- Fond noir `#000000` avec logo TikTok officiel blanc/cyan/magenta.
- Texte obligatoire : *"Continuer avec TikTok"* ou *"Connect with TikTok"*.
- Jamais de déformation du logo ni de modification des couleurs officielles de marque.

---

## 6. INVENTAIRE DES FICHIERS À PRODUIRE DANS CE SPRINT

```text
apps/web/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
└── src/
    ├── main.tsx                       # Montage React 18/19 & QueryClientProvider
    ├── App.tsx                        # Définition des routes React Router v6
    ├── lib/
    │   └── api.ts                     # Instance Axios (baseURL: http://localhost:4000/api, withCredentials: true)
    ├── pages/
    │   ├── DashboardPage.tsx
    │   ├── StudioPage.tsx
    │   ├── CalendarPage.tsx
    │   ├── PostsPage.tsx
    │   └── AccountsPage.tsx
    └── components/
        ├── layout/
        │   ├── DashboardLayout.tsx
        │   ├── Sidebar.tsx
        │   └── Navbar.tsx
        ├── studio/
        │   ├── TikTokPreview.tsx
        │   ├── PromptForm.tsx
        │   └── ScheduleModal.tsx
        ├── calendar/
        │   └── CalendarGrid.tsx
        ├── posts/
        │   ├── PostTable.tsx
        │   └── StatusBadge.tsx
        └── auth/
            └── TikTokLoginButton.tsx
```

---

## 7. PROTOCOLE D'EXÉCUTION ET DE VALIDATION

1. **Vérification de Compilation Vite & TypeScript :**
   ```bash
   pnpm --filter @tiktok-studio/web typecheck
   pnpm --filter @tiktok-studio/web lint
   ```
2. **Lancement du Serveur de Développement Frontend :**
   ```bash
   pnpm --filter @tiktok-studio/web dev
   ```
3. **Contrôle Visuel des Écrans :**
   - Accéder à `http://localhost:5173/studio` et tester la prévisualisation 9:16.
   - Accéder à `http://localhost:5173/calendar` et vérifier le blocage des créneaux passés.
   - Accéder à `http://localhost:5173/accounts` et vérifier le bouton officiel TikTok.

---

## 8. FORMAT DE RESTITUTION DU RAPPORT DE FIN DE SPRINT

```markdown
### ✅ RAPPORT DE CLÔTURE — SPRINT 06 : FRONTEND PUR REACT VITE & STUDIO 3-CLICS

1. **Statut :** TERMINE AVEC SUCCÈS
2. **Fichiers créés :**
   - `apps/web/src/pages/` : `DashboardPage.tsx`, `StudioPage.tsx`, `CalendarPage.tsx`, `PostsPage.tsx`, `AccountsPage.tsx`
   - `apps/web/src/components/studio/TikTokPreview.tsx`, `PromptForm.tsx`, `ScheduleModal.tsx`
   - `apps/web/src/components/layout/DashboardLayout.tsx`, `Sidebar.tsx`, `Navbar.tsx`
   - `apps/web/src/components/auth/TikTokLoginButton.tsx`
   - `apps/web/src/lib/api.ts` (Client Axios avec cookies cross-domain)
3. **Preuves de Validation :**
   - Responsive & Dark mode testés
   - Safe Area TikTok intégrée dans la prévisualisation 9:16
   - Compilation Vite SPA sans aucune erreur de typage
4. **Prêt pour le Sprint 07 :** Matrice de Tests Automatisés & Dossier d'Audit Commercial TikTok.
```
