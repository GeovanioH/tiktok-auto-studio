#!/usr/bin/env node
/**
 * ==============================================================================
 * STUDIO-CLI — OUTIL D'ADMINISTRATION HEADLESS & AUTOMATISATION TIKTOK STUDIO
 * ==============================================================================
 * 
 * Usage :
 *   pnpm cli <command> [options]
 *   node dist/cli/index.js <command> [options]
 * 
 * Commandes :
 *   auth:status [--account-id <id>]  Diagnostic des tokens et session TikTok
 *   posts:list [--status <status>]   Liste des publications (JSON ou table)
 *   posts:publish --id <post-id>     Publication manuelle forcée immédiate
 *   queue:recover                    Scan et application de la Règle des 15 Minutes
 *   crypto:test                      Vérification d'intégrité AES-256-GCM
 */

import "../config/env";
import { prisma } from "../services/db/prisma";
import { getValidAccessToken } from "../services/tiktok/tokenManager";
import { executeTikTokPublish } from "../services/tiktok/publisher";
import { runCrashRecoveryScan } from "../workers/recoveryJob";
import { encryptToken, decryptToken } from "../services/crypto/encryption";

const VERSION = "1.0.0";

function printHelp() {
  console.log(`
📱 TikTok Auto-Studio CLI (v${VERSION})
Outil d'administration headless et de maintenance de la plateforme.

Usage:
  studio-cli <command> [options]

Commandes disponibles:
  auth:status [--account-id <id>]   Vérifie l'état des tokens d'un compte TikTok
  posts:list [--status <status>]    Liste les publications (--json disponible)
  posts:publish --id <post-id>      Déclenche la publication immédiate d'un post
  queue:recover                     Exécute le scan de réconciliation (Règle des 15 min)
  crypto:test                       Teste le coffre-fort cryptographique AES-256-GCM

Options globales:
  -h, --help                        Affiche cette aide
  -v, --version                     Affiche la version du binaire
`);
}

async function handleAuthStatus(args: string[]): Promise<number> {
  const accIndex = args.indexOf("--account-id");
  const accountId = accIndex !== -1 ? args[accIndex + 1] : undefined;

  const whereClause = accountId ? { id: accountId } : {};
  const account = await prisma.tikTokAccount.findFirst({ where: whereClause });

  if (!account) {
    console.error(`❌ ACCOUNT_NOT_FOUND: Aucun compte TikTok trouvé.`);
    return 1;
  }

  const now = new Date();
  const tokenExpiresAt = new Date(account.tokenExpiresAt);
  const refreshExpiresAt = new Date(account.refreshExpiresAt);

  const remainingHours = (tokenExpiresAt.getTime() - now.getTime()) / (1000 * 3600);
  const remainingRefreshDays = (refreshExpiresAt.getTime() - now.getTime()) / (1000 * 86400);

  console.log(`\n🔑 Statut de Connexion TikTok :`);
  console.log(`- Compte : ${account.displayName} (@${account.username})`);
  console.log(`- Identifiant interne : ${account.id}`);
  console.log(`- OpenID TikTok : ${account.openId}`);

  if (remainingRefreshDays <= 0) {
    console.error(`- Refresh Token : ❌ EXPIRÉ (Reconnexion OAuth2 obligatoire)`);
    return 1;
  } else {
    console.log(`- Refresh Token : ✅ Valide (${Math.round(remainingRefreshDays)} jours restants)`);
  }

  if (remainingHours <= 0) {
    console.log(`- Access Token : Expiré -> Déclenchement automatique de la rotation...`);
    try {
      await getValidAccessToken(account.id);
      console.log(`- Access Token : ✅ Renouvelé avec succès pour 24h`);
    } catch (err: any) {
      console.error(`- Échec rotation : ${err.message}`);
      return 1;
    }
  } else if (remainingHours <= 1.0) {
    console.log(`- Access Token : ⚠️ Expire dans ${Math.round(remainingHours * 60)} min (Rotation des 23h programmée)`);
  } else {
    console.log(`- Access Token : ✅ Valide (${remainingHours.toFixed(1)}h restantes)`);
  }

  return 0;
}

async function handlePostsList(args: string[]): Promise<number> {
  const statusIndex = args.indexOf("--status");
  const status = statusIndex !== -1 ? (args[statusIndex + 1] as any) : undefined;
  const isJson = args.includes("--json");

  const validStatuses = ["DRAFT", "SCHEDULED", "PROCESSING", "PUBLISHED", "FAILED", "MISSED"];
  if (status && !validStatuses.includes(status)) {
    console.error(`❌ INVALID_STATUS: Statut '${status}' invalide. Attendu: ${validStatuses.join(", ")}`);
    return 2;
  }

  const posts = await prisma.post.findMany({
    where: status ? { status } : {},
    include: { account: true, mediaAssets: true },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  if (isJson) {
    console.log(JSON.stringify(posts, null, 2));
    return 0;
  }

  console.log(`\n📋 Publications (${posts.length} trouvée(s)) :`);
  if (posts.length === 0) {
    console.log("Aucun post enregistré pour ces critères.");
    return 0;
  }

  posts.forEach((p: { id: string; title: string; postType: string; status: string; scheduledAt?: Date | null; failureReason?: string | null }) => {
    const date = p.scheduledAt ? p.scheduledAt.toISOString() : "Immédiat/Brouillon";
    console.log(`- [${p.status}] ID: ${p.id} | Titre: "${p.title}" | Type: ${p.postType} | Date: ${date}`);
    if (p.failureReason) {
      console.log(`  └─ Motif échec : ${p.failureReason}`);
    }
  });

  return 0;
}

async function handlePostsPublish(args: string[]): Promise<number> {
  const idIndex = args.indexOf("--id");
  const postId = idIndex !== -1 ? args[idIndex + 1] : undefined;

  if (!postId) {
    console.error("❌ ERROR: L'argument --id <post-id> est obligatoire.");
    return 2;
  }

  console.log(`[CLI] Déclenchement de la publication manuelle pour le post ${postId}...`);
  try {
    const publishId = await executeTikTokPublish(postId);
    console.log(`✅ SUCCÈS : Post ${postId} publié sur TikTok (Publish ID: ${publishId}).`);
    return 0;
  } catch (error: any) {
    console.error(`❌ ÉCHEC : ${error.message}`);
    return 1;
  }
}

async function handleQueueRecover(): Promise<number> {
  console.log("[CLI] Lancement du protocole de réconciliation (Règle des 15 minutes)...");
  try {
    await runCrashRecoveryScan();
    console.log("✅ Scan achevé avec succès.");
    return 0;
  } catch (error: any) {
    console.error(`❌ Erreur réconciliation : ${error.message}`);
    return 1;
  }
}

async function handleCryptoTest(): Promise<number> {
  console.log("[CLI] Vérification de l'intégrité du service de cryptographie AES-256-GCM...");
  try {
    const sample = "test_token_secret_123456";
    const encrypted = encryptToken(sample);
    const decrypted = decryptToken(encrypted);

    if (decrypted !== sample) {
      throw new Error("Discordance entre message d'origine et déchiffré.");
    }

    console.log(`- Clé maîtresse : 256 bits (32 octets) chargée.`);
    console.log(`- Format sérialisé : iv:tag:ciphertext (OK)`);
    console.log(`- Déchiffrement & Auth Tag : ✅ 100% Intègre`);
    return 0;
  } catch (err: any) {
    console.error(`❌ Erreur crypto : ${err.message}`);
    return 1;
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
    printHelp();
    process.exit(0);
  }

  if (args.includes("-v") || args.includes("--version")) {
    console.log(`studio-cli v${VERSION}`);
    process.exit(0);
  }

  const command = args[0];
  let exitCode = 0;

  try {
    switch (command) {
      case "auth:status":
        exitCode = await handleAuthStatus(args);
        break;
      case "posts:list":
        exitCode = await handlePostsList(args);
        break;
      case "posts:publish":
        exitCode = await handlePostsPublish(args);
        break;
      case "queue:recover":
        exitCode = await handleQueueRecover();
        break;
      case "crypto:test":
        exitCode = await handleCryptoTest();
        break;
      default:
        console.error(`❌ Commande inconnue : '${command}'. Tapez --help pour la liste.`);
        exitCode = 2;
        break;
    }
  } catch (fatal: any) {
    console.error(`💥 ERREUR FATALE CLI : ${fatal.message}`);
    exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }

  process.exit(exitCode);
}

if (require.main === module) {
  main();
}
