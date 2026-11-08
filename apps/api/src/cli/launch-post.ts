import "../config/env";
import { prisma } from "../services/db/prisma";
import { executeTikTokPublish } from "../services/tiktok/publisher";
import { env } from "../config/env";

async function main() {
  console.log(`\n================================================================`);
  console.log(`🚀 TIKTOK AUTO STUDIO — LANCEMENT DE POST EN CLI (SANDBOX)`);
  console.log(`================================================================`);

  // 1. Détection du compte TikTok actif
  const account = await prisma.tikTokAccount.findFirst({
    include: { user: true }
  });

  if (!account) {
    console.error(`\n❌ AUCUN COMPTE TIKTOK TROUVÉ EN BASE DE DONNÉES`);
    console.log(`\nPour que TikTok accepte la publication, un compte doit être relié via OAuth2.`);
    console.log(`👉 Ouvrez ce lien dans votre navigateur pour lier votre compte spinoza954 :`);
    console.log(`   ${env.API_URL}/api/auth/tiktok/login\n`);
    process.exit(1);
  }

  console.log(`\n📱 Compte TikTok : ${account.displayName} (@${account.username})`);
  console.log(`🔑 OpenID : ${account.openId}`);
  console.log(`⚙️ Client Key Sandbox : ${env.TIKTOK_CLIENT_KEY}`);
  console.log(`🔒 Mode de confidentialité : SELF_ONLY (Requis en Sandbox)`);

  const caption = process.argv[2] || "🚀 Test de publication automatique avec TikTok Studio AI (Sandbox) #pourtoi #ia #tech";
  console.log(`📝 Légende : "${caption}"`);

  // 2. Création de la publication en base
  console.log(`\n1️⃣ Enregistrement du post dans la base de données...`);
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
            s3Key: "media/tiktok-sample.jpg",
            publicVerifiedUrl: `${env.S3_PUBLIC_VERIFIED_DOMAIN}/tiktok-sample.jpg`,
            fileSizeByte: 102400,
            widthPx: 1080,
            heightPx: 1920,
            sequenceOrder: 0
          }
        ]
      }
    }
  });

  console.log(`   └─ Post ID créé : ${post.id}`);

  // 3. Appel de l'API TikTok v2
  console.log(`\n2️⃣ Transmission vers l'API TikTok v2 (/post/publish/content/init/)...`);
  try {
    const publishId = await executeTikTokPublish(post.id);
    await prisma.post.update({
      where: { id: post.id },
      data: {
        status: "PUBLISHED",
        tiktokPublishId: publishId,
        publishedAt: new Date()
      }
    });

    console.log(`\n🎉 SUCCÈS : POST PUBLIÉ SUR TIKTOK !`);
    console.log(`----------------------------------------------------------------`);
    console.log(`✅ TikTok Publish ID : ${publishId}`);
    console.log(`✅ Statut : PUBLISHED`);
    console.log(`✅ Visible dans vos créations TikTok (compte ${account.username})`);
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
    console.log(`\nNote Sandbox : Si le jeton est fictif ou expiré, connectez votre compte réel via :`);
    console.log(`👉 ${env.API_URL}/api/auth/tiktok/login\n`);
    process.exit(1);
  }
}

main()
  .catch(e => {
    console.error("Erreur inattendue :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
