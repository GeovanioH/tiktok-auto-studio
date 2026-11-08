import "../config/env";
import { prisma } from "../services/db/prisma";
import { executeTikTokPublish } from "../services/tiktok/publisher";
import { getValidAccessToken } from "../services/tiktok/tokenManager";
import { env } from "../config/env";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchPublishStatus(accessToken: string, publishId: string) {
  try {
    const res = await fetch("https://open.tiktokapis.com/v2/post/publish/status/fetch/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ publish_id: publishId })
    });
    return (await res.json()) as any;
  } catch (err: any) {
    return { error: { code: "network_error", message: err.message } };
  }
}

async function waitForTikTokAccount() {
  let attempt = 0;
  console.log(`\n================================================================`);
  console.log(`⏳ ATTENTE D'AUTORISATION TIKTOK SANDBOX (BOUCLE ACTIVE)`);
  console.log(`================================================================`);
  console.log(`👉 Lien d'autorisation :`);
  console.log(`   ${env.API_URL}/api/auth/tiktok/login\n`);
  console.log(`Instructions :`);
  console.log(` 1. Ouvrez ce lien dans votre navigateur.`);
  console.log(` 2. Connectez-vous avec votre compte test Sandbox (ex: spinoza954).`);
  console.log(` 3. Cliquez sur "Autoriser".`);
  console.log(`\nLa boucle détectera automatiquement votre connexion en temps réel...\n`);

  while (true) {
    attempt++;
    let account = null;
    try {
      account = await prisma.tikTokAccount.findFirst({
        orderBy: { updatedAt: "desc" },
        include: { user: true }
      });
    } catch (err: any) {
      try {
        await prisma.$disconnect();
      } catch (_) {}
      const timeStr = new Date().toLocaleTimeString();
      process.stdout.write(`\r[${timeStr}] Reconnexion base... (Tentative #${attempt})`);
      await sleep(3000);
      continue;
    }

    if (account) {
      console.log(`\n✨ COMPTE TIKTOK DÉTECTÉ AVEC SUCCÈS (Tentative #${attempt}) !`);
      console.log(`   └─ Nom : ${account.displayName} (@${account.username})`);
      console.log(`   └─ OpenID : ${account.openId}`);
      console.log(`   └─ Expiration Token : ${new Date(account.tokenExpiresAt).toLocaleString()}`);
      return account;
    }

    const timeStr = new Date().toLocaleTimeString();
    process.stdout.write(`\r[${timeStr}] En attente du compte Sandbox... (Tentative #${attempt})`);
    await sleep(3000);
  }
}

async function runPublishWorkflow(account: any, captionArg?: string) {
  const caption = captionArg || "🚀 Test de publication automatique avec TikTok Studio AI (Sandbox) #pourtoi #ia #tech";
  console.log(`\n📱 Compte TikTok : ${account.displayName} (@${account.username})`);
  console.log(`⚙️ Client Key Sandbox : ${env.TIKTOK_CLIENT_KEY}`);
  console.log(`🔒 Mode de confidentialité : SELF_ONLY (Requis en Sandbox)`);
  console.log(`📝 Légende : "${caption}"`);

  // 1. Enregistrement du post en base
  console.log(`\n1️⃣ Enregistrement du post dans PostgreSQL (Render Cloud)...`);
  const post = await prisma.post.create({
    data: {
      userId: account.userId,
      accountId: account.id,
      title: "Test Publication Sandbox",
      caption,
      postType: "PHOTO",
      privacyLevel: "SELF_ONLY",
      isAigc: true,
      status: "PROCESSING",
      mediaAssets: {
        create: [
          {
            mediaType: "IMAGE",
            mimeType: "image/jpeg",
            s3Key: "public/tiktok-icon-1024.jpg",
            publicVerifiedUrl: `${env.S3_PUBLIC_VERIFIED_DOMAIN}/tiktok-icon-1024.jpg`,
            fileSizeByte: 112392,
            widthPx: 1024,
            heightPx: 1024,
            sequenceOrder: 0
          }
        ]
      }
    }
  });

  console.log(`   └─ Post ID créé : ${post.id}`);

  // 2. Transmission vers l'API TikTok v2
  console.log(`\n2️⃣ Transmission vers l'API TikTok v2 (/post/publish/content/init/)...`);
  let publishId: string;
  try {
    publishId = await executeTikTokPublish(post.id);
    await prisma.post.update({
      where: { id: post.id },
      data: {
        status: "PUBLISHED",
        tiktokPublishId: publishId,
        publishedAt: new Date()
      }
    });

    console.log(`\n🎉 SUCCÈS : POST INITIALISÉ SUR TIKTOK !`);
    console.log(`----------------------------------------------------------------`);
    console.log(`✅ TikTok Publish ID : ${publishId}`);
    console.log(`✅ Statut : PUBLISHED`);
    console.log(`----------------------------------------------------------------\n`);
  } catch (err: any) {
    await prisma.post.update({
      where: { id: post.id },
      data: {
        status: "FAILED",
        failureReason: err.message
      }
    });

    console.error(`\n❌ RETOUR DE L'API TIKTOK :`);
    console.error(`   ${err.message}`);
    return { success: false, error: err.message };
  }

  // 3. Boucle de vérification du statut ByteDance (/v2/post/publish/status/fetch/)
  console.log(`3️⃣ Suivi du traitement TikTok (/v2/post/publish/status/fetch/)...`);
  const accessToken = await getValidAccessToken(account.id);

  for (let poll = 1; poll <= 15; poll++) {
    await sleep(4000);
    const statusRes = await fetchPublishStatus(accessToken, publishId);
    const statusData = statusRes?.data?.status;

    if (statusData === "PUBLISH_COMPLETE") {
      const publicPostIds = statusRes?.data?.publicaly_available_post_id || [];
      console.log(`\n🏆 PUBLICATION TERMINÉE AVEC SUCCÈS SUR TIKTOK !`);
      console.log(`   └─ Statut ByteDance : PUBLISH_COMPLETE`);
      if (publicPostIds.length > 0) {
        console.log(`   └─ ID Public TikTok : ${publicPostIds.join(", ")}`);
      }
      return { success: true, publishId, status: "PUBLISH_COMPLETE" };
    } else if (statusData === "FAILED") {
      const reason = statusRes?.data?.fail_reason || "Raison inconnue";
      console.warn(`\n⚠️ Échec du traitement TikTok : ${reason}`);
      return { success: false, publishId, status: "FAILED", reason };
    } else {
      console.log(`   [Poll #${poll}/15] Statut ByteDance en cours : ${statusData || "PROCESSING"}`);
    }
  }

  return { success: true, publishId, status: "PROCESSING" };
}

async function main() {
  console.log(`\n================================================================`);
  console.log(`🚀 TIKTOK AUTO STUDIO — LANCEMENT DE POST EN CLI (TEST & LOOP)`);
  console.log(`================================================================`);

  // Vérification de compte ou boucle d'attente
  let account = null;
  try {
    account = await prisma.tikTokAccount.findFirst({
      orderBy: { updatedAt: "desc" },
      include: { user: true }
    });
  } catch (_) {
    try { await prisma.$disconnect(); } catch (_) {}
  }

  if (!account) {
    account = await waitForTikTokAccount();
  }

  const captionArg = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
  const result = await runPublishWorkflow(account, captionArg);

  // Mode boucle continue si --loop spécifié
  const isContinuousLoop = process.argv.includes("--loop");
  if (isContinuousLoop) {
    console.log(`\n🔁 Mode boucle activé (--loop). Surveillance et maintien de session...`);
    while (true) {
      await sleep(10000);
      const current = await prisma.tikTokAccount.findFirst({
        orderBy: { updatedAt: "desc" }
      });
      if (current) {
        process.stdout.write(`\r[${new Date().toLocaleTimeString()}] Session TikTok active (${current.username}). Prêt pour un nouveau déclenchement.`);
      }
    }
  }

  if (!result.success) {
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("Erreur inattendue :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
