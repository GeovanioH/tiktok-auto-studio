# GUIDE DE DÉMONSTRATION VIDÉO (SCREENCAST) POUR L'AUDIT COMMERCIAL BYTEDANCE / TIKTOK API v2

> **Document de Référence :** TikTok Developer Direct Publishing API Review  
> **Application :** TikTok Auto-Studio  
> **Version API :** TikTok Display & Direct Publishing API v2  

---

## 1. OBJECTIF DU SCREENCAST D'AUDIT

Pour débloquer les autorisations commerciales et passer du mode Sandbox (`SELF_ONLY`) au mode Public (`PUBLIC_TO_EVERYONE`), l'équipe de modération ByteDance exige une vidéo de démonstration (Screencast) de 2 à 4 minutes sans coupure.

Ce guide décrit précisément les étapes à filmer, les éléments de marque à mettre en évidence et les règles d'or à respecter.

---

## 2. CHECKLIST OBLIGATOIRE DES ÉLÉMENTS À MONTRER

| # | Étape Vidéo | Ce que les Réviseurs TikTok veulent voir | Fichier / Composant Source |
|---|---|---|---|
| **1** | **Bouton Officiel de Connexion** | Bouton noir conforme aux *TikTok Brand Guidelines*, logo officiel sans déformation, libellé exact (*"Continuer avec TikTok"*). | `src/components/auth/TikTokLoginButton.tsx` |
| **2** | **Écran d'Autorisation OAuth2 PKCE** | URL dans la barre d'adresse (`tiktok.com/v2/auth/authorize/`), présence de `client_key`, `code_challenge_method=S256`, et liste des scopes demandés (`user.info.basic`, `video.publish`, `video.upload`). | `apps/api/src/services/tiktok/pkce.ts` |
| **3** | **Consentement de l'Utilisateur** | Clic sur "Autoriser", redirection vers `http://localhost:5173/accounts?status=connected`, affichage du nom et de l'avatar TikTok récupérés. | `src/pages/AccountsPage.tsx` |
| **4** | **Transparence AIGC (Intelligence Artificielle)** | Présence du badge obligatoire `"Généré par IA"` et transmission systématique de `is_aigc: true` dans le payload de publication. | `src/components/studio/TikTokPreview.tsx` |
| **5** | **Safe Area Smartphone 9:16** | Prévisualisation verticale simulant l'écran TikTok (disque musical, icônes likes, commentaires, titre et légende) garantissant que rien n'est masqué. | `src/components/studio/TikTokPreview.tsx` |
| **6** | **Règle Temporelle des +5 Minutes** | Démonstration dans le calendrier qu'un créneau dans moins de 5 minutes est immédiatement bloqué avec message explicite. | `src/components/studio/ScheduleModal.tsx` |
| **7** | **Mode Bac à Sable (Sandbox)** | Notification visible indiquant que les publications sont bridées en `SELF_ONLY` en attente de validation de l'audit. | `src/pages/AccountsPage.tsx` |
| **8** | **Déconnexion & Révocation Propre** | Clic sur "Déconnecter" : invalidation du token auprès de TikTok et purge des identifiants chiffrés. | `src/pages/AccountsPage.tsx` |

---

## 3. SCRIPT DU SCREENCAST (PAS-À-PAS)

### Scène 1 : Introduction & Connexion Officielle (0:00 - 0:45)
- Ouvrir le navigateur sur `http://localhost:5173/accounts`.
- Montrer le bouton officiel TikTok conforme.
- Cliquer sur le bouton. Montrer la redirection vers la page officielle de connexion TikTok v2.
- Valider le consentement des permissions requises.
- Constater la redirection retour avec le message `"Compte connecté avec succès"`.

### Scène 2 : Création Studio en 3 Clics & Safe Area (0:45 - 1:45)
- Naviguer vers `/studio`.
- Clic 1 : Sélectionner le format "Vidéo Native Omni" ou "Carrousel Photos" et saisir un sujet.
- Clic 2 : Cliquer sur "Générer avec l'IA". Montrer les 4 étapes animées du pipeline multimodal.
- Montrer la prévisualisation 9:16 avec Safe Area et le badge officiel `is_aigc: true`.

### Scène 3 : Programmation Temporelle & Sécurité (1:45 - 2:30)
- Cliquer sur "Programmer".
- Tenter de saisir un créneau à +2 minutes : montrer le blocage immédiat par l'interface.
- Saisir un créneau conforme (demain à 18h00) et valider.
- Vérifier la présence du post dans `/calendar` et `/posts`.

### Scène 4 : Révocation & Confidentialité (2:30 - 3:00)
- Revenir sur `/accounts`.
- Montrer l'explication du chiffrement AES-256-GCM.
- Cliquer sur "Déconnecter" pour attester de la révocation complète des jetons.

---

## 4. DONNÉES TECHNIQUES POUR LE DOSSIER D'ENREGISTREMENT

- **App ID ByteDance :** Renseigné dans `.env.local` (`TIKTOK_CLIENT_KEY`)
- **Redirect URI :** `http://localhost:4000/api/auth/tiktok/callback`
- **Domaine Hébergeant les Médias Vérifié :** `https://assets.mondomaine-verifie.com`
- **Format des Carrousels :** JPEG 95% 1080x1920 (PNG strictement filtré et converti par Sharp)
- **Chiffrement des Jetons :** AES-256-GCM (IV 12 octets + Auth Tag 16 octets)
