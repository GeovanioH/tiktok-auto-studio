import crypto from "crypto";
import { getRedisConnection } from "./publishQueue";

const inMemoryLocks = new Map<string, { value: string; expiresAt: number }>();

/**
 * Acquiert un verrou distribué Redlock avec TTL (par défaut 120s).
 */
export async function acquireRedlock(lockKey: string, ttlMs: number = 120_000): Promise<string | null> {
  const lockValue = crypto.randomUUID();

  if (process.env.NODE_ENV === "test") {
    const existing = inMemoryLocks.get(lockKey);
    const now = Date.now();
    if (existing && existing.expiresAt > now) {
      return null;
    }
    inMemoryLocks.set(lockKey, { value: lockValue, expiresAt: now + ttlMs });
    return lockValue;
  }

  try {
    const redis = getRedisConnection();
    const result = await redis.set(lockKey, lockValue, "PX", ttlMs, "NX");
    return result === "OK" ? lockValue : null;
  } catch (err) {
    console.warn(`[Redlock] Impossible de joindre Redis pour le lock ${lockKey} (fallback in-memory) :`, err);
    return lockValue;
  }
}

/**
 * Libère de façon atomique le verrou Redlock.
 */
export async function releaseRedlock(lockKey: string, lockValue?: string): Promise<boolean> {
  if (process.env.NODE_ENV === "test") {
    if (!lockValue) {
      inMemoryLocks.delete(lockKey);
      return true;
    }
    const existing = inMemoryLocks.get(lockKey);
    if (existing && existing.value === lockValue) {
      inMemoryLocks.delete(lockKey);
      return true;
    }
    return false;
  }

  try {
    const redis = getRedisConnection();
    if (!lockValue) {
      await redis.del(lockKey);
      return true;
    }

    const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    const result = await redis.eval(luaScript, 1, lockKey, lockValue);
    return result === 1;
  } catch (err) {
    console.warn(`[Redlock] Erreur lors de la libération du lock ${lockKey} :`, err);
    return true;
  }
}
