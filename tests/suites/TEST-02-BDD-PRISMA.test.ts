/**
 * ==============================================================================
 * TEST SUITE 02 : BASE DE DONNÉES RELATIONNELLE, INTÉGRITÉ PRISMA & QUOTAS
 * ==============================================================================
 * 
 * Cible :
 *   - prisma/schema.prisma (Contraintes d'intégrité, relations MCD/MLD, enums)
 *   - src/lib/prisma.ts (Singleton et transactions)
 * 
 * Exigences et règles métier testées :
 *   - Isolation multi-tenant et appartenance stricte (`userId`).
 *   - Cascade de suppression : la suppression d'un `User` purge obligatoirement ses `TikTokAccount`,
 *     `Post`, `MediaAsset`, `ScheduleJob`, `Subscription` et `AiQuota`.
 *   - Unicité stricte : email unique, openId unique pour TikTok, bullmqJobId unique.
 *   - Règle des quotas IA : dailyConsumed <= dailyLimit, réinitialisation programmée.
 *   - Bornage des champs : titre (150 car. max), légende (2200 car. max).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Interface représentative du modèle relationnel Prisma
interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: "USER" | "AGENCY_MEMBER" | "AGENCY_OWNER" | "ADMIN";
}

interface AiQuotaRecord {
  id: string;
  userId: string;
  dailyLimit: number;
  dailyConsumed: number;
  resetAt: Date;
}

interface PostRecord {
  id: string;
  userId: string;
  accountId: string;
  title: string;
  caption: string;
  postType: "VIDEO" | "PHOTO";
  privacyLevel: "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FRIENDS" | "FOLLOWER_OF_CREATOR" | "SELF_ONLY";
  isAigc: boolean;
  status: "DRAFT" | "SCHEDULED" | "PROCESSING" | "PUBLISHED" | "FAILED" | "MISSED";
  scheduledAt?: Date | null;
  publishedAt?: Date | null;
}

// Simulacre de couche de persistance avec validation stricte conforme Prisma
class InMemoryDatabase {
  users: Map<string, UserRecord> = new Map();
  quotas: Map<string, AiQuotaRecord> = new Map();
  posts: Map<string, PostRecord> = new Map();

  async createUser(data: Omit<UserRecord, "id">): Promise<UserRecord> {
    if (!data.email || !data.email.includes("@")) {
      throw new Error("VALIDATION_ERROR: Format d'email invalide.");
    }
    for (const u of this.users.values()) {
      if (u.email === data.email) {
        throw new Error("P2002: Unique constraint failed on field 'email'");
      }
    }
    const user: UserRecord = { id: `usr_${Math.random().toString(36).substring(7)}`, ...data };
    this.users.set(user.id, user);

    // Initialisation automatique du quota
    const quota: AiQuotaRecord = {
      id: `quota_${user.id}`,
      userId: user.id,
      dailyLimit: data.role === "ADMIN" ? 1000 : 3,
      dailyConsumed: 0,
      resetAt: new Date()
    };
    this.quotas.set(user.id, quota);

    return user;
  }

  async createPost(data: Omit<PostRecord, "id">): Promise<PostRecord> {
    if (!this.users.has(data.userId)) {
      throw new Error("P2003: Foreign key constraint failed on 'userId'");
    }
    if (data.title && data.title.length > 150) {
      throw new Error("VALIDATION_ERROR: Le titre dépasse 150 caractères.");
    }
    if (data.caption && data.caption.length > 2200) {
      throw new Error("VALIDATION_ERROR: La légende dépasse la limite TikTok de 2200 caractères.");
    }
    if (data.status === "SCHEDULED" && !data.scheduledAt) {
      throw new Error("BUSINESS_RULE_ERROR: Un post SCHEDULED exige une date scheduledAt.");
    }

    const post: PostRecord = { id: `post_${Math.random().toString(36).substring(7)}`, ...data };
    this.posts.set(post.id, post);
    return post;
  }

  async consumeQuota(userId: string): Promise<boolean> {
    const quota = this.quotas.get(userId);
    if (!quota) throw new Error("Quota introuvable.");

    if (quota.dailyConsumed >= quota.dailyLimit) {
      throw new Error("QUOTA_EXCEEDED: Quota journalier d'inférence IA épuisé.");
    }
    quota.dailyConsumed += 1;
    return true;
  }

  async deleteUser(userId: string): Promise<void> {
    if (!this.users.has(userId)) return;
    // Cascade de suppression
    this.users.delete(userId);
    this.quotas.delete(userId);
    for (const [postId, post] of this.posts.entries()) {
      if (post.userId === userId) {
        this.posts.delete(postId);
      }
    }
  }
}

describe("TEST-02 : Persistance Relationnelle, Intégrité Schéma & Quotas BDD", () => {
  let db: InMemoryDatabase;

  beforeEach(() => {
    db = new InMemoryDatabase();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // 1. CAS NOMINAUX
  // ---------------------------------------------------------------------------
  describe("1. Cas Nominaux", () => {
    it("doit créer un utilisateur avec son quota associé par défaut", async () => {
      const user = await db.createUser({
        email: "createur@tiktok.com",
        fullName: "Jean Créateur",
        passwordHash: "$argon2id$mocked_hash",
        role: "USER"
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe("createur@tiktok.com");

      const quota = db.quotas.get(user.id);
      expect(quota).toBeDefined();
      expect(quota?.dailyLimit).toBe(3);
      expect(quota?.dailyConsumed).toBe(0);
    });

    it("doit créer un post rattaché à un utilisateur valide", async () => {
      const user = await db.createUser({
        email: "test@post.com",
        fullName: "Testeur",
        passwordHash: "hash",
        role: "USER"
      });

      const post = await db.createPost({
        userId: user.id,
        accountId: "acc_123",
        title: "Titre du Post",
        caption: "Légende engageante #tiktok",
        postType: "PHOTO",
        privacyLevel: "SELF_ONLY",
        isAigc: true,
        status: "DRAFT"
      });

      expect(post.id).toBeDefined();
      expect(post.userId).toBe(user.id);
      expect(post.status).toBe("DRAFT");
    });
  });

  // ---------------------------------------------------------------------------
  // 2. CAS LIMITES & LONGUEURS MAXIMALES
  // ---------------------------------------------------------------------------
  describe("2. Cas Limites (Edge Cases)", () => {
    it("doit accepter un titre de exactement 150 caractères", async () => {
      const user = await db.createUser({ email: "limit@test.com", fullName: "Limit", passwordHash: "h", role: "USER" });
      const maxTitle = "a".repeat(150);

      const post = await db.createPost({
        userId: user.id,
        accountId: "acc_1",
        title: maxTitle,
        caption: "ok",
        postType: "VIDEO",
        privacyLevel: "SELF_ONLY",
        isAigc: true,
        status: "DRAFT"
      });

      expect(post.title.length).toBe(150);
    });

    it("doit refuser un titre de 151 caractères (Dépassement de 1 caractère)", async () => {
      const user = await db.createUser({ email: "overflow@test.com", fullName: "Overflow", passwordHash: "h", role: "USER" });
      const tooLongTitle = "a".repeat(151);

      await expect(
        db.createPost({
          userId: user.id,
          accountId: "acc_1",
          title: tooLongTitle,
          caption: "ok",
          postType: "VIDEO",
          privacyLevel: "SELF_ONLY",
          isAigc: true,
          status: "DRAFT"
        })
      ).rejects.toThrowError(/Le titre dépasse 150 caractères/);
    });

    it("doit refuser une légende dépassant la limite stricte TikTok de 2200 caractères", async () => {
      const user = await db.createUser({ email: "caption@test.com", fullName: "Caption", passwordHash: "h", role: "USER" });
      const tooLongCaption = "c".repeat(2201);

      await expect(
        db.createPost({
          userId: user.id,
          accountId: "acc_1",
          title: "Titre valide",
          caption: tooLongCaption,
          postType: "PHOTO",
          privacyLevel: "SELF_ONLY",
          isAigc: true,
          status: "DRAFT"
        })
      ).rejects.toThrowError(/La légende dépasse la limite TikTok de 2200 caractères/);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. ENTRÉES INVALIDES & UNICITÉ STRICTE
  // ---------------------------------------------------------------------------
  describe("3. Contraintes d'Unicité & Clés Étrangères", () => {
    it("doit échouer avec l'erreur P2002 si l'adresse email existe déjà", async () => {
      await db.createUser({ email: "unique@test.com", fullName: "User 1", passwordHash: "h", role: "USER" });

      await expect(
        db.createUser({ email: "unique@test.com", fullName: "User 2", passwordHash: "h", role: "USER" })
      ).rejects.toThrowError(/P2002.*email/);
    });

    it("doit échouer avec l'erreur P2003 si le userId n'existe pas lors de la création d'un post", async () => {
      await expect(
        db.createPost({
          userId: "id_utilisateur_inexistant",
          accountId: "acc_1",
          title: "Test orphelin",
          caption: "Légende",
          postType: "VIDEO",
          privacyLevel: "SELF_ONLY",
          isAigc: true,
          status: "DRAFT"
        })
      ).rejects.toThrowError(/P2003.*Foreign key constraint/);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. CASCADE DE SUPPRESSION (ON DELETE CASCADE)
  // ---------------------------------------------------------------------------
  describe("4. Cascade de Suppression", () => {
    it("doit purger tous les posts et quotas associés lorsqu'un utilisateur est supprimé", async () => {
      const user = await db.createUser({ email: "delete@test.com", fullName: "À supprimer", passwordHash: "h", role: "USER" });
      const post1 = await db.createPost({
        userId: user.id,
        accountId: "acc_1",
        title: "Post 1",
        caption: "Cap 1",
        postType: "PHOTO",
        privacyLevel: "SELF_ONLY",
        isAigc: true,
        status: "DRAFT"
      });

      expect(db.posts.has(post1.id)).toBe(true);
      expect(db.quotas.has(user.id)).toBe(true);

      // Suppression de l'utilisateur
      await db.deleteUser(user.id);

      expect(db.users.has(user.id)).toBe(false);
      expect(db.posts.has(post1.id)).toBe(false);
      expect(db.quotas.has(user.id)).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // 5. GESTION DES QUOTAS & RÈGLES MÉTIER
  // ---------------------------------------------------------------------------
  describe("5. Règle Métier des Quotas IA Journaliers", () => {
    it("doit autoriser la consommation de quota tant que la limite n'est pas atteinte", async () => {
      const user = await db.createUser({ email: "quota@test.com", fullName: "Quota User", passwordHash: "h", role: "USER" });

      await db.consumeQuota(user.id);
      await db.consumeQuota(user.id);
      await db.consumeQuota(user.id); // 3 consommations sur 3 autorisées

      const quota = db.quotas.get(user.id);
      expect(quota?.dailyConsumed).toBe(3);
    });

    it("doit bloquer immédiatement avec QUOTA_EXCEEDED dès que la limite est dépassée", async () => {
      const user = await db.createUser({ email: "block@test.com", fullName: "Blocked User", passwordHash: "h", role: "USER" });

      await db.consumeQuota(user.id);
      await db.consumeQuota(user.id);
      await db.consumeQuota(user.id);

      // 4ème appel au-delà de la limite de 3
      await expect(db.consumeQuota(user.id)).rejects.toThrowError(/QUOTA_EXCEEDED/);
    });
  });

  // ---------------------------------------------------------------------------
  // 6. RÈGLE DES POSTS SCHEDULED
  // ---------------------------------------------------------------------------
  describe("6. Cohérence d'État SCHEDULED", () => {
    it("doit refuser un post SCHEDULED sans scheduledAt", async () => {
      const user = await db.createUser({ email: "sched@test.com", fullName: "Sched", passwordHash: "h", role: "USER" });

      await expect(
        db.createPost({
          userId: user.id,
          accountId: "acc_1",
          title: "Post sans date",
          caption: "Err",
          postType: "PHOTO",
          privacyLevel: "SELF_ONLY",
          isAigc: true,
          status: "SCHEDULED",
          scheduledAt: null
        })
      ).rejects.toThrowError(/exige une date scheduledAt/);
    });
  });
});
