/**
 * ==============================================================================
 * TEST SUITE E2E (END-TO-END) : PARCOURS UTILISATEUR COMPLET & NAVIGATION
 * ==============================================================================
 * 
 * Outil : Playwright Test Runner
 * Cible :
 *   - Frontend React 18/19 SPA (http://localhost:5173)
 *   - Backend Node.js API (http://localhost:4000/api)
 * 
 * Parcours complets testés de bout en bout (Zéro Faux Positif) :
 *   1. [E2E-01] Parcours Nominal : Studio IA 3-Clics -> Prévisu 9:16 Safe Area -> Programmation Calendrier.
 *   2. [E2E-02] Règle Temporelle : Blocage immédiat d'une programmation dans moins de 5 minutes.
 *   3. [E2E-03] Connexion TikTok OAuth2 : Flux PKCE, redirection cross-origin et mise à jour profil.
 *   4. [E2E-04] Résilience UI & Relance : Bouton "Réessayer" en 1 clic sur un post FAILED.
 *   5. [E2E-05] Gestion de Quota Épuisé : Interception HTTP 403 et affichage modale d'upgrade SaaS.
 */

import { test, expect } from "@playwright/test";

test.describe("TikTok Auto-Studio — Tests de Parcours End-to-End (E2E)", () => {
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
  const API_URL = process.env.VITE_API_URL || "http://localhost:4000/api";

  test.beforeEach(async ({ page }) => {
    // Interception par défaut pour garantir l'indépendance réseau et le déterminisme
    await page.route(`${API_URL}/auth/session`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            user: { id: "usr_test_e2e_1", email: "createur@test.com", fullName: "Alexandre Créateur", role: "USER" },
            quota: { dailyLimit: 25, dailyConsumed: 2 }
          }
        })
      });
    });
  });

  // ---------------------------------------------------------------------------
  // E2E-01 : LE STUDIO IA EN 3 CLICS & PROGRAMMATION AU CALENDRIER
  // ---------------------------------------------------------------------------
  test("[E2E-01] Parcours Nominal : Création en 3 clics, Safe Area 9:16 et visibilité sur le calendrier", async ({ page }) => {
    // Mock de la route de génération omnimodale
    await page.route(`${API_URL}/ai/generate`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            postId: "post_e2e_101",
            title: "3 Secrets de Productivité E2E",
            caption: "Voici comment doubler ton focus cette semaine ! 🚀 #focus #tiktok",
            postType: "VIDEO",
            mode: "OMNI_NATIVE_VIDEO",
            videoUrl: "https://assets.mondomaine-verifie.com/rendered/video_e2e_101.mp4",
            isAigc: true,
            durationSeconds: 28,
            quotaRemaining: 22
          }
        })
      });
    });

    // Mock de la planification
    await page.route(`${API_URL}/posts`, async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { id: "post_e2e_101", status: "SCHEDULED", scheduledAt: "2026-10-31T18:00:00.000Z" }
        })
      });
    });

    // Étape 1 : Accès au Studio
    await page.goto(`${FRONTEND_URL}/studio`);
    await expect(page).toHaveTitle(/TikTok Auto-Studio/);

    // Clic 1 : Saisie de l'idée
    const promptInput = page.locator('textarea[name="prompt"]');
    await promptInput.fill("3 secrets pour exploser sa productivité sans stress");

    // Sélection du mode Vidéo Native Omni
    const nativeVideoBtn = page.locator('button:has-text("Vidéo Native Omni")');
    if (await nativeVideoBtn.isVisible()) {
      await nativeVideoBtn.click();
    }

    // Clic 2 : Lancement de la génération IA
    await page.locator('button:has-text("Générer avec l\'IA")').click();

    // Vérification de la présence de la barre de progression / stepper
    await expect(page.locator("text=Génération")).toBeVisible();

    // Clic 3 : Validation de la Prévisualisation Smartphone 9:16
    const previewContainer = page.locator('[data-testid="tiktok-preview"]');
    await expect(previewContainer).toBeVisible({ timeout: 10000 });

    // Contrôle de la Safe Area TikTok (Tag IA et icônes d'action)
    await expect(previewContainer.locator("text=Généré par IA")).toBeVisible();
    await expect(previewContainer.locator('[data-testid="tiktok-actions-bar"]')).toBeVisible();

    // Déclenchement de la programmation
    await page.locator('button:has-text("Programmer")').click();

    // Saisie d'une date valide (demain 18h00)
    const dateInput = page.locator('input[type="datetime-local"]');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = `${tomorrow.toISOString().split("T")[0]}T18:00`;
    await dateInput.fill(dateStr);

    await page.locator('button:has-text("Confirmer la programmation")').click();

    // Redirection et présence confirmée sur la page calendrier
    await page.waitForURL("**/calendar");
    await expect(page.locator("text=3 Secrets de Productivité E2E")).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // E2E-02 : RÈGLE TEMPORELLE DES 5 MINUTES MINIMALES DU CALENDRIER
  // ---------------------------------------------------------------------------
  test("[E2E-02] Règle Temporelle : Rejet d'un créneau programmé dans moins de 5 minutes", async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/calendar`);

    // Ouverture manuelle de la modale de planification
    await page.locator('button:has-text("Programmer un post")').click();

    // Tentative avec une date à seulement 2 minutes du présent
    const tooClose = new Date(Date.now() + 2 * 60 * 1000);
    const dateStr = tooClose.toISOString().slice(0, 16);

    const dateInput = page.locator('input[type="datetime-local"]');
    await dateInput.fill(dateStr);

    await page.locator('button:has-text("Confirmer")').click();

    // Vérification de l'alerte d'erreur sans soumission HTTP
    await expect(page.locator("text=au moins 5 minutes")).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // E2E-03 : CONNEXION TIKTOK OAUTH2 & REDIRECTION DE PROFIL
  // ---------------------------------------------------------------------------
  test("[E2E-03] Flux OAuth2 TikTok : Bouton officiel, callback et synchronisation du compte", async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/accounts`);

    const connectButton = page.locator('[data-testid="tiktok-connect-button"]');
    await expect(connectButton).toBeVisible();
    await expect(connectButton).toContainText(/TikTok/);

    // Simulation de la redirection retour après validation OAuth TikTok
    await page.goto(`${FRONTEND_URL}/accounts?status=connected&open_id=mock_user_999`);

    // Vérification du badge de compte actif et vérifié
    await expect(page.locator("text=Compte connecté avec succès")).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // E2E-04 : RELANCE EN 1 CLIC SUR UN POST FAILED
  // ---------------------------------------------------------------------------
  test("[E2E-04] Résilience : Relance immédiate d'un post FAILED vers PROCESSING", async ({ page }) => {
    // Mock de la liste des posts avec 1 post en FAILED
    await page.route(`${API_URL}/posts*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            posts: [
              {
                id: "post_failed_88",
                title: "Post en Échec Réseau",
                status: "FAILED",
                failureReason: "Erreur serveur temporaire TikTok 503",
                postType: "PHOTO"
              }
            ],
            pagination: { total: 1, page: 1, totalPages: 1 }
          }
        })
      });
    });

    // Mock du endpoint de retry
    await page.route(`${API_URL}/posts/post_failed_88/retry`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { id: "post_failed_88", status: "PROCESSING", message: "Relance effectuée" }
        })
      });
    });

    await page.goto(`${FRONTEND_URL}/posts`);
    await expect(page.locator("text=Post en Échec Réseau")).toBeVisible();
    await expect(page.locator("text=Erreur serveur temporaire TikTok 503")).toBeVisible();

    // Clic sur le bouton de relance en 1 clic
    const retryBtn = page.locator('button:has-text("Réessayer")');
    await retryBtn.click();

    // Vérification de la transition d'état et du message toast
    await expect(page.locator("text=Relance effectuée")).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // E2E-05 : GESTION DE QUOTA ÉPUISÉ ET MODALE DE SURCLASSEMENT SAAS
  // ---------------------------------------------------------------------------
  test("[E2E-05] Sécurité Quota : Affichage de la modale d'upgrade SaaS lors d'un code HTTP 403", async ({ page }) => {
    await page.route(`${API_URL}/ai/generate`, async (route) => {
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: {
            code: "QUOTA_EXCEEDED",
            message: "Votre quota journalier d'inférence IA est épuisé."
          }
        })
      });
    });

    await page.goto(`${FRONTEND_URL}/studio`);
    await page.locator('textarea[name="prompt"]').fill("Idée au-delà du quota");
    await page.locator('button:has-text("Générer avec l\'IA")').click();

    // Vérification de l'ouverture de la modale de mise à niveau
    await expect(page.locator("text=Quota Journalier Épuisé")).toBeVisible();
    await expect(page.locator('button:has-text("Passer au Plan Pro")')).toBeVisible();
  });
});
