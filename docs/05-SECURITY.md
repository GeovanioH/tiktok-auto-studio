# Security, Cryptography & Compliance Architecture (SECURITY) — TikTok Auto-Studio

> **Nom du Projet :** TikTok Auto-Studio  
> **Version :** 1.0.0  
> **Statut :** Validé — Spécification Sécurité & Conformité TikTok v2  
> **Auteur(s) :** Principal Software Architect & Staff Fullstack AI Engineer  
> **Dernière mise à jour :** 30 Octobre 2026

---

## 1. Moteur Cryptographique des Tokens (AES-256-GCM)

La compromission d'un jeton d'accès TikTok autoriserait la publication de contenus non sollicités au nom du créateur. La sécurité des secrets au repos applique donc le chiffrement symétrique authentifié **AES-256-GCM**.

### 1.1 Invariants Cryptographiques
- **Algorithme :** `aes-256-gcm` (NIST SP 800-38D).
- **Clé Maîtresse (`ENCRYPTION_MASTER_KEY`) :** 256 bits (32 octets), injectée via l'environnement sous forme d'une chaîne hexadécimale de 64 caractères.
- **Vecteur d'Initialisation (IV) :** 96 bits (12 octets) généré de manière pseudo-aléatoire cryptographiquement sûre (`crypto.randomBytes(12)`) à **chaque opération d'écriture**. Ne jamais réutiliser un IV avec la même clé.
- **Tag d'Authentification (Auth Tag) :** 128 bits (16 octets) généré lors du chiffrement pour vérifier l'intégrité et l'authenticité des données.
- **Format de Sérialisation :** `base64(iv):base64(authTag):base64(ciphertext)`.

### 1.2 Implémentation de Référence (`src/lib/crypto/encryption.ts`)

```typescript
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH_BYTES = 12; // 96 bits recommandé pour GCM
const AUTH_TAG_LENGTH_BYTES = 16; // 128 bits

function getMasterKey(): Buffer {
  const hexKey = process.env.ENCRYPTION_MASTER_KEY;
  if (!hexKey || hexKey.length !== 64) {
    throw new Error("CRITICAL_SECURITY_ERROR: ENCRYPTION_MASTER_KEY doit être une chaîne hexadécimale de 64 caractères (32 octets).");
  }
  return Buffer.from(hexKey, "hex");
}

export interface EncryptedPayload {
  serialized: string;
}

/**
 * Chiffre un token en clair via AES-256-GCM.
 */
export function encryptToken(plainText: string): string {
  if (!plainText || typeof plainText !== "string") {
    throw new Error("INVALID_INPUT: Le token à chiffrer ne peut pas être vide.");
  }

  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH_BYTES });

  let encrypted = cipher.update(plainText, "utf8", "base64");
  encrypted += cipher.final("base64");

  const authTag = cipher.getAuthTag();

  // Format de sortie sérialisé : iv:tag:ciphertext (chacun en Base64)
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
}

/**
 * Déchiffre un token au repos et vérifie son authenticité.
 */
export function decryptToken(serializedPayload: string): string {
  if (!serializedPayload || typeof serializedPayload !== "string") {
    throw new Error("INVALID_INPUT: Le payload chiffré est manquant.");
  }

  const parts = serializedPayload.split(":");
  if (parts.length !== 3) {
    throw new Error("SECURITY_INTEGRITY_ERROR: Format de payload chiffré invalide.");
  }

  const [ivBase64, authTagBase64, cipherTextBase64] = parts;
  const key = getMasterKey();
  const iv = Buffer.from(ivBase64, "base64");
  const authTag = Buffer.from(authTagBase64, "base64");

  if (iv.length !== IV_LENGTH_BYTES || authTag.length !== AUTH_TAG_LENGTH_BYTES) {
    throw new Error("SECURITY_INTEGRITY_ERROR: Longueur d'IV ou d'Auth Tag altérée.");
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH_BYTES });
  decipher.setAuthTag(authTag);

  try {
    let decrypted = decipher.update(cipherTextBase64, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    // Si l'Auth Tag ne correspond pas ou si les données ont été altérées
    throw new Error("SECURITY_INTEGRITY_ERROR: Échec d'authentification des données chiffrées (Auth Tag mismatch).");
  }
}
```

---

## 2. Authentification & Gestion des Sessions

### 2.1 Cookies de Session HttpOnly
- Les jetons de session d'application (JWT signés ou identifiants de session Redis) sont transportés exclusivement via des cookies HTTP avec les attributs stricts suivants :
  - `HttpOnly: true` (inaccessible au code JavaScript client, immunité totale contre les attaques XSS).
  - `Secure: true` (transmission réservée aux connexions chiffrées TLS / HTTPS).
  - `SameSite: Strict` (isolation contre les attaques Cross-Site Request Forgery).
  - `Path: /` avec expiration glissante de 7 jours.

### 2.2 Sécurisation du Flux OAuth2 TikTok (PKCE + State CSRF)
Lors de l'initiation du flux de connexion TikTok (`UC1`) :
1. Génération d'un `code_verifier` de 64 caractères aléatoires.
2. Dérivation du `code_challenge` via `BASE64URL(SHA256(code_verifier))`.
3. Génération d'un `state` aléatoire cryptographique associé à un cookie temporaire chiffré d'une durée de vie de 10 minutes.
4. Lors du callback, le serveur vérifie la correspondance stricte du `state` avant de transmettre le `code_verifier` pour obtenir les tokens.

---

## 3. Matrice de Contrôle d'Accès (RBAC & ABAC)

| Ressource / Action | `USER` | `AGENCY_MEMBER` | `AGENCY_OWNER` | `ADMIN` |
| :--- | :---: | :---: | :---: | :---: |
| **Générer via Studio IA** | Selon quota perso | Selon quota agence | Selon quota agence | Illimité |
| **Programmer / Publier un post** | Ses posts | Posts de l'agence | Posts de l'agence | Tous |
| **Connecter un compte TikTok** | Max 1 (Free) / 3 (Pro) | Non | Jusqu'à 15 | Illimité |
| **Révoquer un compte TikTok** | Ses comptes | Non | Comptes agence | Tous |
| **Consulter l'Audit Log** | Ses posts | Ses posts | Tous les posts agence | Tous |
| **Gérer la facturation Stripe** | Personnel | Non | Accès complet | Accès financier |
| **Suspendre un utilisateur** | Non | Non | Non | Oui |

### Règle d'Isolation Multi-Tenant (ABAC)
Aucune requête SQL/Prisma ne peut s'exécuter sans inclure le filtre de partitionnement :
```typescript
// Exemple de requête cloisonnée obligatoire
const post = await prisma.post.findFirst({
  where: {
    id: postId,
    userId: session.user.id // Contrôle strict d'appartenance
  }
});
if (!post) throw new ForbiddenError("Accès non autorisé à cette ressource.");
```

---

## 4. Quotas Glissants & Limitation de Débit (Rate Limiting Redis)

Pour se prémunir des abus de ressources et des coûts d'API IA (Gemini & Imagen 3), un algorithme de limitation à fenêtre glissante (*Sliding Window Counter*) est implémenté sur Redis :

1. **Clé Redis Quota Journalier :** `quota:daily:<userId>:<YYYY-MM-DD>` avec TTL de 48 heures.
2. **Clé Redis Rate Limit API :** `ratelimit:ip:<clientIp>` ou `ratelimit:user:<userId>`.
   - Limite : 60 requêtes / minute pour les endpoints standards.
   - Limite Studio IA : 5 requêtes de génération / minute.
3. En cas de dépassement, retour immédiat du code HTTP `429 Too Many Requests` avec l'en-tête standard `Retry-After`.

---

## 5. Conformité TikTok API v2 & Exigences d'Audit Commercial

L'approbation commerciale par TikTok Developer Operations requiert le respect sans compromis des critères suivants :

1. **Pré-contrôle systématique de capacité (`creator_info/query`) :**
   - Aucune publication ne peut être initialisée sans interroger au préalable cet endpoint pour respecter les restrictions du compte créateur.
2. **Hébergement des Carrousels Photos sur Domaine Vérifié :**
   - Toutes les images transmises à `POST /v2/post/publish/content/init/` doivent pointer sur un domaine enregistré dans la console développeur TikTok (`https://assets.mondomaine-verifie.com`).
   - Tout lien pointant sur un bucket brut (ex: `s3.amazonaws.com` ou `r2.cloudflarestorage.com`) est strictement interdit.
3. **Format d'Image JPEG/WEBP Stricte :**
   - Les fichiers PNG provoquent un rejet immédiat par TikTok. Le service de téléversement Sharp applique systématiquement la conversion en JPEG haute qualité.
4. **Marquage Légal du Contenu Synthétique (`is_aigc: true`) :**
   - Obligation légale et contractuelle : chaque publication issue ou assistée par le Studio IA transmet `is_aigc: true` dans le payload de publication.
5. **Restriction Sandbox Pré-Audit :**
   - Variable d'environnement `TIKTOK_AUDIT_APPROVED="false"` par défaut.
   - Force le paramètre `privacy_level: "SELF_ONLY"` (Privé) sur tous les envois pour les tests en bac à sable.
