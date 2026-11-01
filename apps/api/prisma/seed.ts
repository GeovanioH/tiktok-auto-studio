import { prisma, Role, SubscriptionPlan, SubscriptionStatus } from "../src/services/db/prisma";
import { encryptToken } from "../src/services/crypto/encryption";

async function main() {
  console.log("🌱 Démarrage du Seeding de la base de données TikTok Auto-Studio...");

  // Nettoyage préalable des tables dépendantes
  await prisma.publishAuditLog.deleteMany();
  await prisma.scheduleJob.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tikTokAccount.deleteMany();
  await prisma.aiQuota.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();

  // 1. Utilisateur Administrateur
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@tiktokautostudio.io",
      fullName: "Administrateur Système",
      passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$mocked_admin_hash_secure",
      role: Role.ADMIN,
      subscription: {
        create: {
          planType: SubscriptionPlan.AGENCY,
          status: SubscriptionStatus.ACTIVE
        }
      },
      aiQuota: {
        create: {
          dailyLimit: 1000,
          dailyConsumed: 0,
          resetAt: new Date(new Date().setUTCHours(24, 0, 0, 0))
        }
      }
    }
  });
  console.log(`✅ Administrateur créé : ${adminUser.email} (Quota: 1000)`);

  // 2. Utilisateur Gratuit (Free Tier)
  const freeUser = await prisma.user.create({
    data: {
      email: "user@example.com",
      fullName: "Créateur Débutant",
      passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$mocked_user_hash_secure",
      role: Role.USER,
      subscription: {
        create: {
          planType: SubscriptionPlan.FREE,
          status: SubscriptionStatus.ACTIVE
        }
      },
      aiQuota: {
        create: {
          dailyLimit: 3,
          dailyConsumed: 0,
          resetAt: new Date(new Date().setUTCHours(24, 0, 0, 0))
        }
      }
    }
  });
  console.log(`✅ Utilisateur Free créé : ${freeUser.email} (Quota: 3)`);

  // 3. Compte Agence Pro
  const agencyUser = await prisma.user.create({
    data: {
      email: "agency@marketing.com",
      fullName: "Studio Médias Paris",
      passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$mocked_agency_hash_secure",
      role: Role.AGENCY_OWNER,
      subscription: {
        create: {
          planType: SubscriptionPlan.AGENCY,
          status: SubscriptionStatus.ACTIVE,
          stripeCustomerId: "cus_mock_agency_12345",
          stripeSubscriptionId: "sub_mock_agency_67890"
        }
      },
      aiQuota: {
        create: {
          dailyLimit: 100,
          dailyConsumed: 0,
          resetAt: new Date(new Date().setUTCHours(24, 0, 0, 0))
        }
      }
    }
  });
  console.log(`✅ Compte Agence créé : ${agencyUser.email} (Quota: 100)`);

  // 4. Compte TikTok associé avec tokens chiffrés AES-256-GCM
  const sampleAccessToken = "act.tiktok_real_mock_access_token_v2_9876543210_abcdefghijklmnopqrstuvwxyz";
  const sampleRefreshToken = "rft.tiktok_real_mock_refresh_token_v2_1234567890_zyxwvutsrqponmlkjihgfedcba";

  const tiktokAccount = await prisma.tikTokAccount.create({
    data: {
      userId: agencyUser.id,
      openId: "tiktok_open_id_agency_paris_001",
      unionId: "tiktok_union_id_agency_paris_001",
      username: "agency_paris_creators",
      displayName: "Agence Paris Studio",
      avatarUrl: "https://p16-va.tiktokcdn.com/tos-maliva-avt-0068/agency_avatar.jpeg",
      encryptedAccessToken: encryptToken(sampleAccessToken),
      encryptedRefreshToken: encryptToken(sampleRefreshToken),
      tokenExpiresAt: new Date(Date.now() + 24 * 3600 * 1000), // ~24h
      refreshExpiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000), // ~365j
      isCreatorInfoVerified: true,
      maxVideoDuration: { max_duration_seconds: 600 },
      privacyLevelsAllowed: ["PUBLIC_TO_EVERYONE", "MUTUAL_FOLLOW_FRIENDS", "SELF_ONLY"]
    }
  });
  console.log(`✅ Compte TikTok lié : @${tiktokAccount.username} avec tokens chiffrés AES-256-GCM.`);

  console.log("🌟 Seeding terminé avec succès !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur pendant le seeding :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
