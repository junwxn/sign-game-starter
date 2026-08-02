import { SENTENCES, sentenceById, type SignSentence } from "./sentences";
import type { Difficulty } from "./data";

export type SentenceEnemy = {
  id: string;
  sentenceId: string;
  sequence: string[];
  stage: number;
  x: number;
  y: number;
  speed: number;
  startedAt: number;
  wrongAttempts: number;
  status: "idle" | "hit" | "defeated";
  fromOpponent?: boolean;
};

let seq = 0;
const sid = () => `se${++seq}`;

/** Sentence enemies carry 2–5 sign stages. */
export function pickSentence(unlockedIds: string[], difficulty: Difficulty): SignSentence {
  const available = SENTENCES.filter((s) => s.isUnlocked || unlockedIds.includes(s.id));
  const maxSigns = difficulty === "easy" ? 2 : difficulty === "normal" ? 3 : 5;
  const minSigns = difficulty === "hard" ? 3 : 2;
  const levelPool = available.filter(
    (sentence) =>
      sentence.signSequence.length >= minSigns && sentence.signSequence.length <= maxSigns,
  );
  const list = levelPool.length ? levelPool : available.length ? available : SENTENCES;
  return list[Math.floor(Math.random() * list.length)];
}

export function makeSentenceEnemy(
  unlockedIds: string[],
  difficulty: Difficulty = "normal",
  opts: Partial<SentenceEnemy> = {},
): SentenceEnemy {
  const sentence = opts.sentenceId
    ? sentenceById(opts.sentenceId)
    : pickSentence(unlockedIds, difficulty);
  const sequence = sentence.signSequence.slice(0, 5);
  const diffMul = difficulty === "easy" ? 0.55 : difficulty === "hard" ? 1.15 : 0.8;
  return {
    id: sid(),
    sentenceId: sentence.id,
    sequence,
    stage: 0,
    x: 10 + Math.random() * 55,
    y: -14,
    speed: diffMul * (0.34 + Math.random() * 0.16),
    startedAt: 0,
    wrongAttempts: 0,
    status: "idle",
    ...opts,
  };
}

/** Attack rewards for Hard Sentence Battle. */
export function sentenceAttack(opts: {
  signCount: number;
  perfectOrder: boolean;
  fast: boolean;
}): { name: string; meter: number; enemies: number } | null {
  const { signCount, perfectOrder, fast } = opts;
  if (signCount >= 5 && perfectOrder) return { name: "PHRASE STORM!", meter: 60, enemies: 3 };
  if (signCount >= 4 && fast) return { name: "SENTENCE SURGE!", meter: 45, enemies: 2 };
  if (signCount >= 3 && perfectOrder) return { name: "SENTENCE STRIKE!", meter: 32, enemies: 1 };
  if (signCount >= 2) return { name: "PHRASE PUSH", meter: 18, enemies: 0 };
  return null;
}

export const MAX_SENTENCE_ENEMIES = 2;
