# Test Strategy & Quality Assurance Plan (TEST_PLAN) — TikTok Auto-Studio

> **Nom du Projet :** TikTok Auto-Studio  
> **Version :** 1.0.0  
> **Statut :** Validé — Spécification des Protocoles de Test & Recette  
> **Auteur(s) :** Principal Software Architect & Staff Fullstack AI Engineer  
> **Dernière mise à jour :** 30 Octobre 2026

---

## 1. Pyramide de Tests & Objectifs de Couverture

Pour garantir la fiabilité de grade bancaire exigée par la manipulation des jetons d'accès et la publication sur des comptes officiels, la stratégie de test est structurée en 3 niveaux :

```text
       /\
      /  \      Tests E2E Playwright (10%)
     /----\     Parcours complets : Auth TikTok -> Studio 3-Clics -> Calendrier
    /      \
   /--------\   Tests d'Intégration Vitest (30%)
  /          \  BullMQ Scheduler, Worker FFmpeg, Upload R2, Base Prisma
 /------------\
/              \ Tests Unitaires Vitest (60%)
---------------- Moteur Crypto AES-256-GCM, Validateurs Zod, Conversion Sharp
```

### 1.1 Objectifs Chiffrés de Couverture
- **Couverture globale de code :** $\ge 85\%$ des lignes (Lines Coverage).
- **Couverture du module cryptographique (`src/lib/crypto/`) :** $100\%$ obligatoire.
- **Couverture des validateurs de requêtes et schémas Zod :** $100\%$.
- **Zéro régression sur la gestion des tokens et le renouvellement OAuth.**

---

## 2. Tests Unitaires Cryptographiques (AES-256-GCM)

Le fichier `tests/unit/crypto.test.ts` valide les propriétés mathématiques et de sécurité du chiffrement au repos :

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { encryptToken, decryptToken } from "@/lib/crypto/encryption";

describe("Service Cryptographique — AES-256-GCM", () => {
  const SAMPLE_TOKEN = "act.tiktok.sample_access_token_super_secret_123456789";

  it("doit chiffrer et déchiffrer avec succès un token valide", () => {
    const encrypted = encryptToken(SAMPLE_TOKEN);
    expect(encrypted).not.toBe(SAMPLE_TOKEN);
    expect(encrypted.split(":")).toHaveLength(3); // iv:tag:ciphertext

    const decrypted = decryptToken(encrypted);
    expect(decrypted).toBe(SAMPLE_TOKEN);
  });

  it("doit générer un vecteur d'initialisation (IV) unique à chaque appel", () => {
    const encrypted1 = encryptToken(SAMPLE_TOKEN);
    const encrypted2 = encryptToken(SAMPLE_TOKEN);

    const iv1 = encrypted1.split(":")[0];
    const iv2 = encrypted2.split(":")[0];

    expect(iv1).not.toBe(iv2); // Deux IV distincts garantis
    expect(encrypted1).not.toBe(encrypted2);
  });

  it("doit lever une exception critique si l'Auth Tag a été altéré (Intégrité)", () => {
    const encrypted = encryptToken(SAMPLE_TOKEN);
    const [iv, tag, ciphertext] = encrypted.split(":");

    // Altération intentionnelle d'un octet de l'Auth Tag
    const corruptedTag = Buffer.from(tag, "base64");
    corruptedTag[0] = corruptedTag[0] ^ 0xff; // Inversion de bits
    const corruptedPayload = `${iv}:${corruptedTag.toString("base64")}:${ciphertext}`;

    expect(() => decryptToken(corruptedPayload)).toThrowError(
      /SECURITY_INTEGRITY_ERROR.*Auth Tag mismatch/
    );
  });

  it("doit refuser un token vide ou non textuel", () => {
    expect(() => encryptToken("")).toThrowError(/INVALID_INPUT/);
  });
});
```

---

## 3. Mocks de l'API TikTok v2 via Mock Service Worker (MSW)

Pour tester de bout en bout l'intégration sans dépendre de l'infrastructure externe de ByteDance ni consommer de quotas, nous mettons en place des mocks exhaustifs via MSW (`tests/mocks/tiktokApiHandlers.ts`) :

```typescript
import { http, HttpResponse } from "msw";

export const tiktokApiHandlers = [
  // 1. Échange du code d'autorisation OAuth2
  http.post("https://open.tiktokapis.com/v2/oauth/token/", async () => {
    return HttpResponse.json({
      access_token: "mock_access_token_xyz123",
      expires_in: 86400,
      open_id: "mock_open_id_user_999",
      refresh_token: "mock_refresh_token_abc789",
      refresh_expires_in: 31536000,
      token_type: "Bearer"
    });
  }),

  // 2. Interrogation obligatoire des permissions créateur
  http.post("https://open.tiktokapis.com/v2/post/publish/creator_info/query/", async () => {
    return HttpResponse.json({
      data: {
        creator_avatar_url: "https://p16-sign.tiktokcdn.com/avatar.jpg",
        creator_nickname: "Créateur Test",
        creator_username: "creator_test",
        max_video_post_duration_sec: 180,
        privacy_level_options: [
          "PUBLIC_TO_EVERYONE",
          "MUTUAL_FOLLOW_FRIENDS",
          "FOLLOWER_OF_CREATOR",
          "SELF_ONLY"
        ],
        duet_disabled: false,
        stitch_disabled: false,
        comment_disabled: false
      },
      error: { code: "ok", message: "" }
    });
  }),

  // 3. Initialisation de publication Photo (Carrousel)
  http.post("https://open.tiktokapis.com/v2/post/publish/content/init/", async ({ request }) => {
    const body = (await request.json()) as any;

    // Vérification du domaine vérifié
    const images: string[] = body?.source_info?.photo_images || [];
    const invalidDomain = images.some(
      (url) => !url.startsWith("https://assets.mondomaine-verifie.com")
    );
    if (invalidDomain) {
      return HttpResponse.json({
        error: { code: "invalid_image_url", message: "Domain not verified" }
      }, { status: 400 });
    }

    return HttpResponse.json({
      data: { publish_id: "pub_photo_mock_001" },
      error: { code: "ok", message: "" }
    });
  }),

  // 4. Initialisation de publication Vidéo
  http.post("https://open.tiktokapis.com/v2/post/publish/video/init/", async () => {
    return HttpResponse.json({
      data: {
        publish_id: "pub_video_mock_002",
        upload_url: "https://open-upload.tiktokapis.com/video/?upload_token=xyz"
      },
      error: { code: "ok", message: "" }
    });
  }),

  // 5. Polling de l'état de publication
  http.post("https://open.tiktokapis.com/v2/post/publish/status/fetch/", async () => {
    return HttpResponse.json({
      data: {
        status: "PUBLISH_COMPLETE",
        fail_reason: ""
      },
      error: { code: "ok", message: "" }
    });
  })
];
```

---

## 4. Tests de Résilience du Moteur Asynchrone (BullMQ)

Les tests d'intégration du worker `tests/integration/scheduler.test.ts` valident la tolérance aux pannes :

1. **Test d'Idempotence Absolue :**
   - Tentative d'ajout successif de deux jobs avec le même `jobId: "post_123"`.
   - Résultat attendu : BullMQ conserve un seul job unique dans Redis ; aucune duplication d'envoi.
2. **Test de la Règle des 15 Minutes (Reprise après Sinistre) :**
   - *Scénario A :* Post programmé pour $T - 10\text{ min}$. Le worker redémarre. Le post est immédiatement envoyé (`RECOVERED_EXECUTION`).
   - *Scénario B :* Post programmé pour $T - 20\text{ min}$. Le worker redémarre. Le post bascule automatiquement en statut `MISSED` sans publication sur TikTok.
3. **Test du Backoff Exponentiel :**
   - Simulation d'un code HTTP 503 TikTok.
   - Vérification des 3 tentatives successives avec délais respectifs de 1 min, 5 min et 15 min avant bascule en statut `FAILED`.

---

## 5. Matrice des Cas Limites (Edge Cases)

| ID | Cas Limite Testé | Comportement Attendu du Système |
| :--- | :--- | :--- |
| **EC-01** | Upload d'une image PNG transparente | Détection du format PNG par Sharp, conversion sans perte en JPEG 95% avant envoi R2. |
| **EC-02** | Refresh Token TikTok expiré (> 365 jours) | Détection de l'échec de rafraîchissement, notification utilisateur, post en `FAILED` avec libellé explicite : *"Reconnexion TikTok requise"*. |
| **EC-03** | Programmation à moins de 5 minutes du présent | Blocage immédiat par le validateur Zod avec message d'erreur : *"Le créneau doit être supérieur d'au moins 5 minutes"*. |
| **EC-04** | Prompt IA non conforme (termes haineux/interdits) | Interception par le filtre de sécurité Gemini avant tout appel Imagen 3 ; aucun crédit décrémenté ; alerte explicite à l'utilisateur. |
| **EC-05** | Perte réseau pendant l'upload vidéo vers TikTok | Interception du stream socket, conservation du verrou Redlock et reprise de la tentative au point d'arrêt via backoff. |

---

## 6. Definition of Done (DoD) pour toute Tâche d'Ingénierie

Une tâche de développement n'est considérée comme achevée que lorsque les conditions suivantes sont toutes satisfaites :
1. **Zéro TODO :** Tout le code TypeScript est écrit, documenté et typé sans `any`.
2. **Compilation TypeScript :** `pnpm typecheck` s'exécute sans aucune erreur.
3. **Linter :** `pnpm lint` propre à 100%.
4. **Couverture de Tests :** Tests unitaires ou d'intégration associés rédigés et validés avec `pnpm test`.
5. **Validation Métier :** Le comportement satisfait les critères d'acceptation du Product Requirements Document (01) et du Technical Requirements Document (02).
