import { useCallback, useEffect, useState } from "react";
import type { BattleMode, Difficulty, InputMode } from "./data";

export type DisplaySize = "small" | "medium" | "large";

export type Settings = {
  inputMode: InputMode;
  difficulty: Difficulty;
  battleMode: BattleMode;
  sound: boolean;
  music: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  coachMessages: boolean;
  showConfidence: boolean;
  cameraSize: DisplaySize;
  exampleSize: DisplaySize;
  character: 0 | 1 | 2 | 3;
};

export type Mastery = { attempts: number; correct: number; stars: number; best: number };

/** Sentence progress is tracked separately from individual sign mastery. */
export type SentenceProgress = {
  attempts: number;
  completions: number;
  bestScore: number;
  bestTimeMs: number | null;
  orderPct: number;
  stars: number;
  lastPractisedAt: number | null;
};

export const emptySentenceProgress: SentenceProgress = {
  attempts: 0,
  completions: 0,
  bestScore: 0,
  bestTimeMs: null,
  orderPct: 0,
  stars: 0,
  lastPractisedAt: null,
};

export type SaveData = {
  bestScore: number;
  level: number;
  settings: Settings;
  mastery: Record<string, Mastery>;
  favourites: string[];
  lastSingle: unknown | null;
  lastMulti: unknown | null;
  localVersus: unknown | null;
  sentenceProgress: Record<string, SentenceProgress>;
  sentenceFavourites: string[];
  sentencesUnlocked: string[];
  recentSentences: string[];
};

export const defaultSettings: Settings = {
  inputMode: "camera",
  difficulty: "normal",
  battleMode: "hard",
  sound: true,
  music: true,
  reducedMotion: false,
  highContrast: false,
  coachMessages: true,
  showConfidence: true,
  cameraSize: "medium",
  exampleSize: "medium",
  character: 0,
};

const KEY = "sign-game-save-v1";

const defaultSave: SaveData = {
  bestScore: 0,
  level: 1,
  settings: defaultSettings,
  mastery: {},
  favourites: ["coffee", "good"],
  lastSingle: null,
  lastMulti: null,
  localVersus: null,
  sentenceProgress: {},
  sentenceFavourites: [],
  sentencesUnlocked: [],
  recentSentences: [],
};

export function loadSave(): SaveData {
  if (typeof window === "undefined") return defaultSave;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultSave;
    const parsed = JSON.parse(raw) as Partial<SaveData> & { streak?: number };
    delete parsed.streak;
    return {
      ...defaultSave,
      ...parsed,
      settings: { ...defaultSettings, ...(parsed.settings ?? {}) },
      mastery: parsed.mastery ?? {},
      sentenceProgress: parsed.sentenceProgress ?? {},
      sentenceFavourites: parsed.sentenceFavourites ?? [],
      sentencesUnlocked: parsed.sentencesUnlocked ?? [],
      recentSentences: parsed.recentSentences ?? [],
    };
  } catch {
    return defaultSave;
  }
}

export function useSave() {
  const [save, setSave] = useState<SaveData>(defaultSave);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSave(loadSave());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(save));
    } catch {
      /* storage unavailable — prototype keeps running in memory */
    }
  }, [save, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.classList.toggle("reduce-motion", save.settings.reducedMotion);
    root.classList.toggle("high-contrast", save.settings.highContrast);
  }, [save.settings.reducedMotion, save.settings.highContrast, hydrated]);

  useEffect(() => {
    const positions = ["0%", "33.333%", "66.667%", "100%"];
    document.documentElement.style.setProperty(
      "--character-position",
      positions[save.settings.character] ?? positions[0],
    );
  }, [save.settings.character]);

  const update = useCallback((patch: Partial<SaveData>) => {
    setSave((s) => ({ ...s, ...patch }));
  }, []);

  const setSettings = useCallback((patch: Partial<Settings>) => {
    setSave((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const recordAttempt = useCallback((signId: string, correct: boolean, confidence: number) => {
    setSave((s) => {
      const m = s.mastery[signId] ?? { attempts: 0, correct: 0, stars: 0, best: 0 };
      const attempts = m.attempts + 1;
      const right = m.correct + (correct ? 1 : 0);
      const acc = right / attempts;
      const stars = Math.min(3, Math.floor(acc * 3.2 * Math.min(1, attempts / 3)));
      return {
        ...s,
        mastery: {
          ...s.mastery,
          [signId]: { attempts, correct: right, stars, best: Math.max(m.best, confidence) },
        },
      };
    });
  }, []);

  const toggleFavourite = useCallback((signId: string) => {
    setSave((s) => ({
      ...s,
      favourites: s.favourites.includes(signId)
        ? s.favourites.filter((f) => f !== signId)
        : [...s.favourites, signId],
    }));
  }, []);

  const toggleSentenceFavourite = useCallback((id: string) => {
    setSave((s) => ({
      ...s,
      sentenceFavourites: s.sentenceFavourites.includes(id)
        ? s.sentenceFavourites.filter((f) => f !== id)
        : [...s.sentenceFavourites, id],
    }));
  }, []);

  const unlockSentence = useCallback((id: string) => {
    setSave((s) =>
      s.sentencesUnlocked.includes(id)
        ? s
        : { ...s, sentencesUnlocked: [...s.sentencesUnlocked, id] },
    );
  }, []);

  const recordSentence = useCallback(
    (
      id: string,
      r: {
        completed: boolean;
        score: number;
        timeMs: number;
        orderPct: number;
        stars: number;
      },
    ) => {
      setSave((s) => {
        const p = s.sentenceProgress[id] ?? emptySentenceProgress;
        const next: SentenceProgress = {
          attempts: p.attempts + 1,
          completions: p.completions + (r.completed ? 1 : 0),
          bestScore: Math.max(p.bestScore, r.score),
          bestTimeMs:
            r.completed && r.timeMs > 0
              ? p.bestTimeMs === null
                ? r.timeMs
                : Math.min(p.bestTimeMs, r.timeMs)
              : p.bestTimeMs,
          orderPct: Math.max(p.orderPct, Math.round(r.orderPct)),
          stars: Math.max(p.stars, r.stars),
          lastPractisedAt: Date.now(),
        };
        return {
          ...s,
          sentenceProgress: { ...s.sentenceProgress, [id]: next },
          recentSentences: [id, ...s.recentSentences.filter((x) => x !== id)].slice(0, 6),
        };
      });
    },
    [],
  );

  const reset = useCallback(() => setSave({ ...defaultSave, settings: defaultSettings }), []);

  return {
    save,
    hydrated,
    update,
    setSettings,
    recordAttempt,
    toggleFavourite,
    toggleSentenceFavourite,
    unlockSentence,
    recordSentence,
    reset,
  };
}
