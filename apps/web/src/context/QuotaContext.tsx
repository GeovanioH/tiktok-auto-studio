import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api } from "../lib/api";

interface QuotaContextType {
  quotaUsed: number;
  quotaMax: number;
  quotaPercent: number;
  remainingQuota: number;
  incrementQuota: (amount?: number) => void;
  resetQuota: () => void;
  setQuotaUsed: (val: number) => void;
}

const STORAGE_KEY = "tiktok_studio_daily_quota_v1";
const DEFAULT_MAX = 20;

const QuotaContext = createContext<QuotaContextType | undefined>(undefined);

export function getTodayUtcString(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
}

export function QuotaProvider({ children }: { children: ReactNode }) {
  const [quotaMax] = useState(DEFAULT_MAX);

  const [quotaUsed, setQuotaUsedState] = useState<number>(() => {
    try {
      const today = getTodayUtcString();
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.date === today && typeof parsed.used === "number") {
          return Math.min(DEFAULT_MAX, Math.max(0, parsed.used));
        }
      }
    } catch {
      // Fallback en mémoire
    }
    return 0;
  });

  // Sauvegarder dans localStorage
  const persistQuota = (val: number) => {
    try {
      const today = getTodayUtcString();
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          date: today,
          used: val,
        })
      );
    } catch {
      // Ignore
    }
  };

  const setQuotaUsed = (val: number) => {
    const clamped = Math.min(quotaMax, Math.max(0, val));
    setQuotaUsedState(clamped);
    persistQuota(clamped);
  };

  const incrementQuota = (amount = 1) => {
    setQuotaUsedState((prev) => {
      const next = Math.min(quotaMax, prev + amount);
      persistQuota(next);
      return next;
    });
  };

  const resetQuota = () => {
    setQuotaUsedState(0);
    persistQuota(0);
  };

  // Synchronisation avec l'API Fastify si connectée (compte des posts créés aujourd'hui)
  useEffect(() => {
    const todayStr = new Date().toDateString();
    api
      .get("/posts")
      .then((res) => {
        if (res.data && Array.isArray(res.data.posts)) {
          const apiTodayCount = res.data.posts.filter(
            (p: { createdAt: string }) => new Date(p.createdAt).toDateString() === todayStr
          ).length;
          if (apiTodayCount > 0) {
            setQuotaUsedState((prev) => {
              const maxVal = Math.min(quotaMax, Math.max(prev, apiTodayCount));
              persistQuota(maxVal);
              return maxVal;
            });
          }
        }
      })
      .catch(() => {
        // Mode autonome / hors ligne : conserve le localStorage
      });
  }, [quotaMax]);

  // Surveillance du rollover minuit UTC et écoute inter-onglets
  useEffect(() => {
    const checkRollover = () => {
      const today = getTodayUtcString();
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.date !== today) {
            setQuotaUsedState(0);
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, used: 0 }));
          }
        }
      } catch {
        // Ignore
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.date === getTodayUtcString() && typeof parsed.used === "number") {
            setQuotaUsedState(Math.min(quotaMax, Math.max(0, parsed.used)));
          }
        } catch {
          // Ignore
        }
      }
    };

    window.addEventListener("focus", checkRollover);
    window.addEventListener("storage", handleStorage);
    const interval = setInterval(checkRollover, 60000);

    // Exposition pour tests devtools
    if (typeof window !== "undefined") {
      (window as unknown as { __studioQuota?: unknown }).__studioQuota = {
        get: () => quotaUsed,
        increment: incrementQuota,
        reset: resetQuota,
        set: setQuotaUsed,
      };
    }

    return () => {
      window.removeEventListener("focus", checkRollover);
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [quotaMax, quotaUsed]);

  const quotaPercent = Math.min(100, Math.round((quotaUsed / quotaMax) * 100));
  const remainingQuota = Math.max(0, quotaMax - quotaUsed);

  return (
    <QuotaContext.Provider
      value={{
        quotaUsed,
        quotaMax,
        quotaPercent,
        remainingQuota,
        incrementQuota,
        resetQuota,
        setQuotaUsed,
      }}
    >
      {children}
    </QuotaContext.Provider>
  );
}

export function useQuota() {
  const context = useContext(QuotaContext);
  if (!context) {
    throw new Error("useQuota must be used within a QuotaProvider");
  }
  return context;
}
