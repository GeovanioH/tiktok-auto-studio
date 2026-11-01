# Matrice de Tests Infaillibles — TikTok Auto-Studio

> **Emplacement :** `C:\Users\ADMIN\Documents\TEST`  
> **Objectif :** Valider sous tous les angles (nominal, limites, erreurs, concurrence, temps, non-régression) chaque implémentation unitaire.  
> **Garantie mathématique :** 0% de faux positifs, couverture complète des branches d'exécution, isolation hermétique sans dépendance réseau.

---

## 1. Inventaire des 9 Suites de Test (Unitaires, E2E & CLI)

| Fichier de Test | Type de Test | Périmètre & Propriétés Éprouvées |
| :--- | :---: | :--- |
| **[`TEST-01-SOCLE-CRYPTO.test.ts`](./TEST-01-SOCLE-CRYPTO.test.ts)** | **Unitaire** | IV unique 12 octets (zéro collision), Auth Tag 16 octets (détection bit-flip), protection contre chaînes vides/null/undefined, tokens de 1 à 10 000 car., UTF-8 complexe. |
| **[`TEST-02-BDD-PRISMA.test.ts`](./TEST-02-BDD-PRISMA.test.ts)** | **Intégration BDD** | Intégrité référentielle, cascade de suppression (`onDelete: Cascade`), unicité d'email et d'OpenID, blocage strict des quotas IA journaliers, limites 150/2200 car. |
| **[`TEST-03-TIKTOK-API.test.ts`](./TEST-03-TIKTOK-API.test.ts)** | **Intégration API** | Challenge PKCE SHA-256 (RFC 7636), protection CSRF state, **règle des 23h** de rotation proactive de token via fausse horloge, expiration 365j. |
| **[`TEST-04-AI-OMNI-PIPELINE.test.ts`](./TEST-04-AI-OMNI-PIPELINE.test.ts)** | **Intégration IA** | Couverture des 3 modes (`PHOTO_CAROUSEL`, `OMNI_NATIVE_VIDEO`, `COMPOSITE_STUDIO_VIDEO`), schéma Zod, conversion Sharp PNG $\rightarrow$ JPEG 95%, sous-titres `.ass`, domaine vérifié R2. |
| **[`TEST-05-BULLMQ-SCHEDULER.test.ts`](./TEST-05-BULLMQ-SCHEDULER.test.ts)** | **Intégration Worker** | Idempotence absolue `jobId`, verrou Redlock, **règle des 15 minutes** (reprise après crash serveur : $\le 15\text{ min} \rightarrow$ envoi, $> 15\text{ min} \rightarrow$ `MISSED`), backoff 5xx. |
| **[`TEST-06-UI-STUDIO.test.ts`](./TEST-06-UI-STUDIO.test.ts)** | **Unitaire UI** | Règle temporelle des **+5 minutes minimales** du calendrier, Safe Area TikTok sur smartphone 9:16, gestion des 4 états UI, action "Réessayer" en 1 clic. |
| **[`TEST-07-CONFORMITE-AUDIT.test.ts`](./TEST-07-CONFORMITE-AUDIT.test.ts)** | **Intégration Audit** | Bridage obligatoire `SELF_ONLY` en mode pré-audit (Sandbox), étiquetage légal `is_aigc: true`, appel préalable `creator_info/query/`, rejet formel des PNG. |
| **[`TEST-E2E-STUDIO-FLOW.spec.ts`](./TEST-E2E-STUDIO-FLOW.spec.ts)** | **End-to-End (E2E)** | Parcours complets Playwright (React 5173 $\leftrightarrow$ API Node 4000) : Studio 3-Clics, Safe Area 9:16, blocage créneau < 5 min, flux OAuth2, bouton Retry et modale de quota 403. |
| **[`TEST-CLI-COMMANDS.test.ts`](./TEST-CLI-COMMANDS.test.ts)** | **CLI Headless** | Validation de l'outil `studio-cli` : `auth:status` (rotation 23h), `posts:list` (--json), `posts:publish`, `queue:recover` (règle des 15 min), `crypto:test`, exit codes 0, 1, 2. |

---

## 2. Principes & Règles d'Or des Tests

1. **Un test = Un comportement précis :** Le nom de chaque test décrit fidèlement la règle métier éprouvée.
2. **Indépendance Totale :** Aucun test ne dépend de l'état d'un autre ; ils peuvent s'exécuter dans n'importe quel ordre et en parallèle.
3. **Rapides & Déterministes :** Aucun appel réseau réel (mocks in-memory / interception Playwright `route`), pas d'attente d'horloge réelle (`vi.useFakeTimers()`).
4. **Zéro Échappatoire :** Entrées nulles, valeurs vides, caractères exotiques, attaques par modification de bits (*bit-flipping*) et dépassements de capacités sont systématiquement passés au crible.

---

## 3. Commandes d'Exécution

```bash
# 1. Exécuter tous les tests unitaires, d'intégration et CLI (Vitest)
pnpm vitest run C:\Users\ADMIN\Documents\TEST

# 2. Exécuter spécifiquement les tests CLI
pnpm vitest run C:\Users\ADMIN\Documents\TEST\TEST-CLI-COMMANDS.test.ts

# 3. Exécuter les tests End-to-End en navigateur réel (Playwright)
pnpm playwright test C:\Users\ADMIN\Documents\TEST\TEST-E2E-STUDIO-FLOW.spec.ts
```
