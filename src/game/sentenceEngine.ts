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

export const SENTENCE_LENGTH_BY_DIFFICULTY: Record<
  Difficulty,
  { min: number; max: number; label: string }
> = {
  easy: { min: 2, max: 2, label: "2-sign foundations" },
  normal: { min: 3, max: 3, label: "3-sign connections" },
  hard: { min: 4, max: Number.POSITIVE_INFINITY, label: "full long sentences" },
};

/** Difficulty is driven by the number of signs the learner must connect. */
export function pickSentence(unlockedIds: string[], difficulty: Difficulty): SignSentence {
  const available = SENTENCES.filter((s) => s.isUnlocked || unlockedIds.includes(s.id));
  const source = available.length ? available : SENTENCES;
  const { min, max } = SENTENCE_LENGTH_BY_DIFFICULTY[difficulty];
  const levelPool = source.filter(({ signSequence }) => {
    const length = signSequence.length;
    return length >= min && length <= max;
  });
  const distanceFromTier = ({ signSequence }: SignSentence) => {
    const length = signSequence.length;
    return length < min ? min - length : length > max ? length - max : 0;
  };
  const closestDistance = Math.min(...source.map(distanceFromTier));
  const closestPool = source.filter((sentence) => distanceFromTier(sentence) === closestDistance);
  const list = levelPool.length ? levelPool : closestPool;
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
  const sequence = [...sentence.signSequence];
  // Longer sentences get a larger total completion window while higher tiers
  // allow slightly less time per sign. This keeps challenge fair without
  // truncating the full sentence the learner is meant to practise.
  const challengeFactor = difficulty === "easy" ? 1.1 : difficulty === "hard" ? 0.92 : 1;
  const travelSeconds = (12 + sequence.length * 7) * challengeFactor;
  const speed = (92 / (travelSeconds / 0.11)) * (0.95 + Math.random() * 0.1);
  return {
    id: sid(),
    sentenceId: sentence.id,
    sequence,
    stage: 0,
    x: 10 + Math.random() * 55,
    y: -14,
    speed,
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
