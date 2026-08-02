import { useEffect, useRef } from "react";
import { SIGNS, enemyMeta, type Difficulty, type EnemyKind } from "./data";

export type Enemy = {
  id: string;
  kind: EnemyKind;
  signId: string;
  word: string;
  x: number;
  y: number;
  speed: number;
  status: "idle" | "hit" | "defeated";
  fromOpponent?: boolean;
  hideWord?: boolean;
  bornAt: number;
};

let seq = 0;
export const uid = () => `e${++seq}`;

export function makeEnemy(opts: Partial<Enemy> = {}, difficulty: Difficulty = "normal"): Enemy {
  const kind: EnemyKind = opts.kind ?? pickKind();
  const sign = SIGNS[Math.floor(Math.random() * SIGNS.length)];
  const diffMul = difficulty === "easy" ? 0.7 : difficulty === "hard" ? 1.35 : 1;
  return {
    id: uid(),
    kind,
    signId: sign.id,
    word: sign.name,
    x: 8 + Math.random() * 72,
    y: -12 - Math.random() * 10,
    speed: enemyMeta[kind].speed * diffMul * (0.5 + Math.random() * 0.25),
    status: "idle",
    bornAt: Date.now(),
    ...opts,
  };
}

function pickKind(): EnemyKind {
  const r = Math.random();
  if (r > 0.92) return "wave";
  if (r > 0.78) return "shield";
  if (r > 0.55) return "fast";
  return "basic";
}

/** Simple rAF-free interval loop that pauses cleanly. */
export function useTicker(cb: () => void, ms: number, running: boolean) {
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => ref.current(), ms);
    return () => clearInterval(id);
  }, [ms, running]);
}

export function speedRating(elapsedMs: number) {
  if (elapsedMs < 2000) return { label: "PERFECT SPEED", bonus: 26, tag: "QUICK HANDS!" };
  if (elapsedMs < 4000) return { label: "FAST", bonus: 18, tag: "FAST SIGN!" };
  if (elapsedMs < 6000) return { label: "GOOD", bonus: 11, tag: "SPEED BONUS!" };
  return { label: "STEADY", bonus: 5, tag: "" };
}

export function comboAttack(combo: number) {
  if (combo >= 12)
    return {
      name: "COMMUNICATION BURST!",
      count: 4,
      kinds: ["basic", "fast", "shield", "fast"] as EnemyKind[],
    };
  if (combo >= 8)
    return { name: "SIGN STORM!", count: 3, kinds: ["basic", "fast", "shield"] as EnemyKind[] };
  if (combo >= 5)
    return { name: "COMBO STRIKE!", count: 2, kinds: ["basic", "fast"] as EnemyKind[] };
  if (combo >= 3) return { name: "WORD ATTACK!", count: 1, kinds: ["basic"] as EnemyKind[] };
  return null;
}

export const MAX_ENEMIES = 6;

export function rankFor(score: number) {
  if (score >= 3000) return { rank: "S", stars: 3 };
  if (score >= 1800) return { rank: "A", stars: 3 };
  if (score >= 1000) return { rank: "B", stars: 2 };
  if (score >= 450) return { rank: "C", stars: 1 };
  return { rank: "D", stars: 0 };
}
