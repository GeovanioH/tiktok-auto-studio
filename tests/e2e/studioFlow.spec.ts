/**
 * Playwright E2E Test Suite : Parcours Complet Studio IA 3-Clics & Calendrier
 */

import { test, expect } from "@playwright/test";

test.describe("Parcours Utilisateur Complet — Studio IA & Calendrier", () => {
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

  test("de l'expression du besoin à la planification sur le calendrier", async ({ page }) => {
    // 1. Navigation vers le Dashboard
    await page.goto(`${FRONTEND_URL}/studio`);
    await expect(page).toHaveTitle(/TikTok Auto-Studio/);

    // 2. Clic 1 : Saisie de l'idée
    const promptInput = page.locator('textarea[name="prompt"]');
    await promptInput.fill("3 techniques avancées pour doubler sa mémorisation");

    // Sélection du format Carrousel
    const carouselBtn = page.locator('button:has-text("Carrousel Photos")');
    if (await carouselBtn.isVisible()) {
      await carouselBtn.click();
    }

    // 3. Clic 2 : Lancement de la génération IA
    await page.locator('button:has-text("Générer avec l\'IA")').click();

    // Vérification de la présence de la barre de progression / stepper
    await expect(page.locator("text=Génération")).toBeVisible();

    // 4. Clic 3 : Validation dans la prévisualisation 9:16
    const previewContainer = page.locator('div[data-testid="tiktok-preview"]');
    await expect(previewContainer).toBeVisible({ timeout: 15000 });

    // Contrôle de la Safe Area TikTok (Tag IA et icônes d'action)
    await expect(previewContainer.locator("text=Généré par IA")).toBeVisible();
    await expect(previewContainer.locator('[data-testid="tiktok-actions-bar"]')).toBeVisible();

    // Clic sur "Programmer"
    await page.locator('button:has-text("Programmer")').click();

    // Choix d'une date à demain 18h00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = `${tomorrow.toISOString().split("T")[0]}T18:00`;
    await page.locator('input[type="datetime-local"]').fill(dateStr);

    await page.locator('button:has-text("Confirmer la programmation")').click();

    // 5. Redirection et confirmation sur le calendrier
    await page.waitForURL("**/calendar");
    await expect(page.locator("text=Calendrier Éditorial")).toBeVisible();
  });
});
