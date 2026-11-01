# ==============================================================================
# MASTER PROMPT D'INGÉNIERIE — SPRINT 07 : TESTS E2E & PACK D'AUDIT TIKTOK
# ==============================================================================

> **Destinataire du Prompt :** Agent Autonome d'Ingénierie Logicielle (QA Lead & Compliance Specialist)  
> **Niveau de Contexte Initial :** Zéro Connaissance Préalable (Self-Contained Master Prompt)  
> **Projet :** TikTok Auto-Studio  
> **Objectif du Sprint :** Finalisation de l'assurance qualité avec mise en place des tests End-to-End Playwright, validation des mocks de l'API TikTok v2 avec MSW, tests systématiques des 5 cas limites critiques (edge cases), et rédaction du guide complet du screencast d'audit commercial pour validation par les équipes de ByteDance.

---

## 1. RÔLE, POSTURE ET RÈGLES D'ENGAGEMENT DE L'AGENT

Tu agis en tant que **Principal QA Architect & TikTok Developer Compliance Officer**.
Tu as la responsabilité finale de vérifier qu'aucun bug critique ne subsiste et que l'application remplit à 100% les critères d'approbation commerciale de TikTok.

### Règles d'or absolues :
1. **Zéro Faux Positif :** Les suites de tests doivent être stables, reproductibles et déterministes.
2. **Couverture des 5 Cas Limites :** Chaque edge case documenté dans `docs/07-TEST_PLAN.md` doit posséder son test automatisé validé.
3. **Intransigeance sur les Règles d'Audit TikTok :**
   - Le bouton "Continuer avec TikTok" respecte les directives visuelles officielles.
   - Les permissions demandées sont limitées au strict nécessaire (`user.info.basic`, `video.publish`, `video.upload`).
   - L'appel préalable à `POST /v2/post/publish/creator_info/query/` est prouvé.
   - Le tag `is_aigc: true` est systématiquement présent.
   - La visibilité est obligatoirement contrainte à `SELF_ONLY` en mode pré-audit.
   - Le mécanisme de révocation d'accès est visible et fonctionnel.

---

## 2. CONTEXTE GLOBAL DU PROJET : "TIKTOK AUTO-STUDIO"

### 2.1 Qu'est-ce que TikTok Auto-Studio ?
**TikTok Auto-Studio** est une plateforme SaaS complète permettant de concevoir via l'IA et de publier automatiquement sur TikTok des vidéos 9:16 et des carrousels photos sans intervention mobile.

### 2.2 Qu'est-ce que l'Audit Commercial TikTok (Developer Review) ?
Pour passer d'un mode de développement (Sandbox réservé aux comptes de test) à la production (permettant à n'importe quel créateur dans le monde de connecter son compte et de poster publiquement), TikTok impose un **audit humain rigoureux** :
- Un ingénieur de ByteDance examine la demande et inspecte un screencast vidéo de 3 à 5 minutes.
- Il vérifie la sécurité des tokens, le respect des marques déposées TikTok, l'étiquetage obligatoire des contenus générés par IA, et le respect des paramètres de confidentialité.
- Tout rejet retarde la commercialisation de 2 à 4 semaines.

---

## 3. ÉTAT DU PROJET AVANT CE SPRINT (POINT DE DÉPART)

Avant de démarrer le Sprint 07, l'ensemble des fonctionnalités logicielles a été implémenté au fil des Sprints 01 à 06 :
- Le socle et la cryptographie AES-256-GCM (Sprint 01).
- La base relationnelle PostgreSQL et Prisma (Sprint 02).
- L'authentification OAuth2 PKCE et la gestion des tokens TikTok (Sprint 03).
- Le studio de génération IA et le worker FFmpeg (Sprint 04).
- Le moteur asynchrone BullMQ et la règle des 15 minutes (Sprint 05).
- L'interface web complète et la prévisualisation 9:16 (Sprint 06).

---

## 4. MISSION PRÉCISE DU SPRINT 07

Tu dois finaliser la qualité et préparer l'audit commercial en réalisant les 5 actions suivantes :
1. **Serveur de Mocks MSW Officiel TikTok v2 (`tests/mocks/tiktokHandlers.ts`) :** Interception réaliste des appels HTTP vers `https://open.tiktokapis.com/v2/*` simulant l'échange de code, le rafraîchissement de token, la consultation de `creator_info`, et la confirmation de publication.
2. **Suite de Tests des Cas Limites (`tests/integration/edgeCases.test.ts`) :** Tests automatisés pour les 5 cas limites critiques (conversion PNG transparente, expiration de refresh token, rejet de programmation $< +5\text{ min}$, interception de prompt banni, reprise après coupure réseau).
3. **Tests End-to-End Playwright (`tests/e2e/studioFlow.spec.ts`) :** Scénario E2E complet en navigateur simulant :
   - L'arrivée sur le dashboard.
   - La connexion simulée TikTok.
   - La saisie d'un prompt dans le Studio IA.
   - La génération et l'affichage dans le lecteur 9:16.
   - La programmation dans le calendrier.
4. **Dossier & Guide du Screencast d'Audit (`docs/AUDIT_SCREENCAST_GUIDE.md`) :** Document d'instructions chirurgicales détaillant le script vidéo pas-à-pas pour la soumission auprès de ByteDance.
5. **Rapport Final de Recette Globale :** Validation et pointage final de l'ensemble des tâches dans `docs/08-IMPLEMENTATION_PLAN.md`.

---

## 5. SPÉCIFICATIONS TECHNIQUES DÉTAILLÉES DES TESTS

### 5.1 Suite de Tests des Cas Limites (`tests/integration/edgeCases.test.ts`)

```typescript
import { describe, it, expect, vi } from "vitest";
import { convertToTikTokCompliantJpeg } from "@/lib/media/converter";
import { schedulePostJob } from "@/lib/queue/publishQueue";
import { CreatePostRequestSchema } from "@/lib/tiktok/types";
import sharp from "sharp";

describe("Assurance Qualité — Validation des 5 Cas Limites Critiques", () => {
  // EC-01 : Rejet des PNG par TikTok -> Conversion automatique Sharp en JPEG 95%
  it("[EC-01] doit convertir sans perte un PNG transparent en un JPEG 1080x1920 valide", async () => {
    // Création d'un buffer PNG transparent de test 400x400
    const rawPngBuffer = await sharp({
      create: {
        width: 400,
        height: 400,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 0.5 }
      }
    }).png().toBuffer();

    const outputBuffer = await convertToTikTokCompliantJpeg(rawPngBuffer);
    const metadata = await sharp(outputBuffer).metadata();

    expect(metadata.format).toBe("jpeg");
    expect(metadata.width).toBe(1080);
    expect(metadata.height).toBe(1920);
  });

  // EC-02 : Validation de la règle des 5 minutes minimales de programmation
  it("[EC-02] doit rejeter via Zod une programmation planifiée dans 2 minutes", () => {
    const twoMinutesFromNow = new Date(Date.now() + 2 * 60 * 1000).toISOString();

    const invalidPayload = {
      accountId: "00000000-0000-0000-0000-000000000001",
      title: "Post trop proche",
      caption: "Test",
      postType: "PHOTO",
      privacyLevel: "SELF_ONLY",
      isAigc: true,
      mediaAssetIds: ["00000000-0000-0000-0000-000000000002"],
      scheduledAt: twoMinutesFromNow
    };

    const result = CreatePostRequestSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errorMsg = result.error.errors[0]?.message;
      expect(errorMsg).toMatch(/5 minutes/);
    }
  });

  // EC-03 : Blocage strict des domaines non vérifiés pour les carrousels photos
  it("[EC-03] doit refuser la publication si l'URL ne provient pas du domaine vérifié", async () => {
    const unverifiedUrls = ["https://random-s3-bucket.amazonaws.com/image1.jpg"];
    // Le service doit bloquer avant l'appel à TikTok
    expect(unverifiedUrls[0].startsWith("https://assets.mondomaine-verifie.com")).toBe(false);
  });
});
```

### 5.2 Scénario End-to-End Playwright (`tests/e2e/studioFlow.spec.ts`)

```typescript
import { test, expect } from "@playwright/test";

test.describe("Parcours Utilisateur Complet — Studio IA & Calendrier", () => {
  test("de l'expression du besoin à la planification sur le calendrier", async ({ page }) => {
    // 1. Navigation vers le Dashboard
    await page.goto("/studio");
    await expect(page).toHaveTitle(/TikTok Auto-Studio/);

    // 2. Clic 1 : Saisie de l'idée
    const promptInput = page.locator('textarea[name="prompt"]');
    await promptInput.fill("3 techniques avancées pour doubler sa mémorisation");

    // Sélection du format Carrousel
    await page.locator('button:has-text("Carrousel Photos")').click();

    // 3. Clic 2 : Lancement de la génération IA
    await page.locator('button:has-text("Générer avec l\'IA")').click();

    // Vérification de l'animation de progression
    await expect(page.locator("text=Génération du script en cours")).toBeVisible();
    await expect(page.locator("text=Création des visuels 9:16")).toBeVisible({ timeout: 15000 });

    // 4. Clic 3 : Validation dans la prévisualisation 9:16
    await expect(page.locator('div[data-testid="tiktok-preview"]')).toBeVisible({ timeout: 30000 });

    // Clic sur "Programmer"
    await page.locator('button:has-text("Programmer")').click();

    // Choix d'une date à demain 18h00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.locator('input[type="datetime-local"]').fill(
      `${tomorrow.toISOString().split("T")[0]}T18:00`
    );

    await page.locator('button:has-text("Confirmer la programmation")').click();

    // 5. Redirection et confirmation sur le calendrier
    await page.waitForURL("/calendar");
    await expect(page.locator("text=3 techniques avancées")).toBeVisible();
  });
});
```

---

## 6. CONTENU DU DOSSIER D'AUDIT COMMERCIAL TIKTOK (`docs/AUDIT_SCREENCAST_GUIDE.md`)

Ce document doit structurer la vidéo de démonstration soumise aux auditeurs de ByteDance :

### Plan de Tournage du Screencast Officiel (Durée : 3 min 30 s)
1. **Introduction & Login Kit (0:00 - 0:45) :**
   - Montrer la page d'accueil avec le bouton officiel conforme TikTok.
   - Cliquer sur le bouton et montrer l'écran d'autorisation officiel TikTok avec affichage précis des scopes : `user.info.basic`, `video.publish`, `video.upload`.
   - Valider la connexion et montrer la redirection transparente vers le dashboard avec l'avatar et le nom du profil.
2. **Démonstration de la Requête `creator_info` (0:45 - 1:15) :**
   - Montrer dans les outils de développement (Network tab) ou dans l'interface l'interrogation automatique de `POST /v2/post/publish/creator_info/query/`.
   - Expliquer comment l'UI adapte les durées vidéo permises et les niveaux de vie privée.
3. **Création & Marquage IA Obligatoire (1:15 - 2:15) :**
   - Générer un contenu dans le Studio IA.
   - Montrer explicitement le badge visuel *"Généré par IA"* dans la prévisualisation smartphone.
   - Inspecter le payload envoyé au backend et montrer la présence de `"is_aigc": true`.
4. **Respect du Mode Privé Pré-Audit (2:15 - 2:45) :**
   - Montrer que le sélecteur de confidentialité est verrouillé sur `SELF_ONLY` avec la mention explicite expliquant le mode bac à sable en attente de validation commerciale.
5. **Révocation d'Accès & Droit à l'Oubli (2:45 - 3:30) :**
   - Aller dans l'onglet Paramètres / Comptes.
   - Cliquer sur « Déconnecter et Révoquer l'accès ».
   - Montrer la confirmation d'invalidation du token et la purge immédiate des accès.

---

## 7. INVENTAIRE DES FICHIERS À PRODUIRE DANS CE SPRINT

```text
docs/
└── AUDIT_SCREENCAST_GUIDE.md
tests/
├── mocks/
│   └── tiktokHandlers.ts
├── integration/
│   └── edgeCases.test.ts
└── e2e/
    └── studioFlow.spec.ts
```

---

## 8. PROTOCOLE D'EXÉCUTION ET DE VALIDATION

1. **Vérification globale du typage :**
   ```bash
   pnpm typecheck
   ```
2. **Exécution des tests unitaires et d'intégration :**
   ```bash
   pnpm test
   ```
3. **Exécution des tests E2E Playwright :**
   ```bash
   pnpm test:e2e
   ```
4. **Vérification de la conformité du dossier d'audit.**

---

## 9. FORMAT DE RESTITUTION DU RAPPORT FINAL DE MISSION

```markdown
### 🏆 RAPPORT FINAL DE MISSION — CLÔTURE DU SPRINT 07 & PRÉPARATION AUDIT TIKTOK

1. **Statut :** TOUS LES TESTS AU VERT — SOCLE 100% CONFORME
2. **Bilan des Livrables :**
   - Mocks MSW TikTok v2 : Opérationnels
   - Tests d'intégration des 5 cas limites : 100% de réussite
   - Scénarios E2E Playwright : Validés
   - Guide du Screencast d'Audit : Prêt pour soumission ByteDance
3. **Alignement Réglementaire TikTok :**
   - Scope strict respecté
   - Chiffrement AES-256-GCM validé
   - Domaine vérifié Cloudflare R2 respecté
   - Tag `is_aigc: true` injecté
   - Mode `SELF_ONLY` pré-audit actif
4. **Prochaine Action Recommandée :** Enregistrement de la vidéo de démonstration et soumission du formulaire d'audit sur `https://developers.tiktok.com/`.
```
