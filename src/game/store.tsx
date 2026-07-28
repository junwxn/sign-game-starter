import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { DEFAULT_PROGRESS, DEFAULT_SETTINGS, SIGNS } from "./data";
import type { Progress, Settings, SignMastery } from "./types";

const KEY_SETTINGS = "signgame.settings.v1";
const KEY_PROGRESS = "signgame.progress.v1";

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as object) } as T;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

interface StoreValue {
  settings: Settings;
  progress: Progress;
  hydrated: boolean;
  setSettings: (patch: Partial<Settings>) => void;
  setProgress: (patch: Partial<Progress>) => void;
  masteryFor: (id: string) => SignMastery;
  recordSignAttempt: (id: string, success: boolean, confidence: number) => void;
  toggleFavourite: (id: string) => void;
  recordSentence: (id: string, score: number, stars: number) => void;
  unlock: (id: string) => void;
  resetAll: () => void;
  toasts: string[];
}

const StoreContext = createContext<StoreValue | null>(null);

export function GameStoreProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);
  const [progress, setProgressState] = useState<Progress>(DEFAULT_PROGRESS);
  const [hydrated, setHydrated] = useState(false);
  const [toasts, setToasts] = useState<string[]>([]);

  useEffect(() => {
    setSettingsState(load(KEY_SETTINGS, DEFAULT_SETTINGS));
    setProgressState(load(KEY_PROGRESS, DEFAULT_PROGRESS));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.dataset.textscale = settings.textSize;
    root.dataset.reducedMotion = String(settings.reducedMotion);
    root.classList.toggle("hc", settings.highContrast);
  }, [settings, hydrated]);

  const setSettings = useCallback((patch: Partial<Settings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...patch };
      save(KEY_SETTINGS, next);
      return next;
    });
  }, []);

  const setProgress = useCallback((patch: Partial<Progress>) => {
    setProgressState((prev) => {
      const next = { ...prev, ...patch };
      save(KEY_PROGRESS, next);
      return next;
    });
  }, []);

  const unlock = useCallback((id: string) => {
    setProgressState((prev) => {
      if (prev.achievements.includes(id)) return prev;
      const next = { ...prev, achievements: [...prev.achievements, id] };
      save(KEY_PROGRESS, next);
      return next;
    });
    setToasts((t) => [...t, id]);
    window.setTimeout(() => setToasts((t) => t.slice(1)), 3200);
  }, []);

  const masteryFor = useCallback(
    (id: string): SignMastery =>
      progress.signMastery[id] ?? { stars: 0, attempts: 0, bestConfidence: 0, favourite: false },
    [progress.signMastery],
  );

  const recordSignAttempt = useCallback(
    (id: string, success: boolean, confidence: number) => {
      setProgressState((prev) => {
        const cur = prev.signMastery[id] ?? {
          stars: 0,
          attempts: 0,
          bestConfidence: 0,
          favourite: false,
        };
        const updated: SignMastery = {
          ...cur,
          attempts: cur.attempts + 1,
          bestConfidence: Math.max(cur.bestConfidence, confidence),
          stars: success ? Math.min(3, cur.stars + (cur.attempts % 2 === 1 ? 1 : 0)) : cur.stars,
        };
        const next = { ...prev, signMastery: { ...prev.signMastery, [id]: updated } };
        save(KEY_PROGRESS, next);
        return next;
      });
      if (success) unlock("first-sign");
    },
    [unlock],
  );

  const toggleFavourite = useCallback((id: string) => {
    setProgressState((prev) => {
      const cur = prev.signMastery[id] ?? {
        stars: 0,
        attempts: 0,
        bestConfidence: 0,
        favourite: false,
      };
      const next = {
        ...prev,
        signMastery: { ...prev.signMastery, [id]: { ...cur, favourite: !cur.favourite } },
      };
      save(KEY_PROGRESS, next);
      return next;
    });
  }, []);

  const recordSentence = useCallback(
    (id: string, score: number, stars: number) => {
      setProgressState((prev) => {
        const cur = prev.sentenceMastery[id] ?? { stars: 0, bestScore: 0, completed: false };
        const next = {
          ...prev,
          sentenceMastery: {
            ...prev.sentenceMastery,
            [id]: {
              stars: Math.max(cur.stars, stars),
              bestScore: Math.max(cur.bestScore, score),
              completed: true,
            },
          },
        };
        save(KEY_PROGRESS, next);
        return next;
      });
      unlock("sentence-starter");
    },
    [unlock],
  );

  const resetAll = useCallback(() => {
    setProgressState(DEFAULT_PROGRESS);
    save(KEY_PROGRESS, DEFAULT_PROGRESS);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const unlockedAll = SIGNS.every((s) => s.unlockAt <= progress.bestScore);
    if (unlockedAll && !progress.achievements.includes("sign-collector")) unlock("sign-collector");
  }, [progress.bestScore, progress.achievements, hydrated, unlock]);

  const value = useMemo(
    () => ({
      settings,
      progress,
      hydrated,
      setSettings,
      setProgress,
      masteryFor,
      recordSignAttempt,
      toggleFavourite,
      recordSentence,
      unlock,
      resetAll,
      toasts,
    }),
    [
      settings,
      progress,
      hydrated,
      setSettings,
      setProgress,
      masteryFor,
      recordSignAttempt,
      toggleFavourite,
      recordSentence,
      unlock,
      resetAll,
      toasts,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside GameStoreProvider");
  return ctx;
}
