import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DIFFICULTY_CONFIG, SENTENCES, SIGNS } from "./data";
import type { Difficulty, EnemyKind, LearningType } from "./types";

export interface Enemy {
  id: number;
  word: string;
  kind: EnemyKind;
  lane: number;
  progress: number;
  hp: number;
  maxHp: number;
  state: "alive" | "hit" | "dead";
  sequence: string[];
  stage: number;
  incoming: boolean;
  meaning?: string;
  sentenceId?: string;
}

export interface Popup {
  id: number;
  text: string;
  tone: "good" | "bad" | "info";
  lane: number;
  top: number;
}

const KIND_SPEED: Record<EnemyKind, number> = { basic: 1, fast: 1.7, shield: 0.7, wave: 0.55 };
const KIND_HP: Record<EnemyKind, number> = { basic: 1, fast: 1, shield: 2, wave: 3 };

let uid = 1;
const nextId = () => uid++;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeEnemy(mode: LearningType, kind: EnemyKind, incoming = false): Enemy {
  if (mode === "sentences") {
    const s = pick(SENTENCES);
    return {
      id: nextId(),
      word: s.sequence[0],
      kind: kind === "fast" ? "basic" : kind,
      lane: Math.floor(Math.random() * 4),
      progress: incoming ? 6 : 0,
      hp: s.sequence.length,
      maxHp: s.sequence.length,
      state: "alive",
      sequence: s.sequence,
      stage: 0,
      incoming,
      meaning: s.meaning,
      sentenceId: s.id,
    };
  }
  const sign = pick(SIGNS);
  return {
    id: nextId(),
    word: sign.name.toUpperCase(),
    kind,
    lane: Math.floor(Math.random() * 4),
    progress: incoming ? 6 : 0,
    hp: KIND_HP[kind],
    maxHp: KIND_HP[kind],
    state: "alive",
    sequence: [sign.name.toUpperCase()],
    stage: 0,
    incoming,
  };
}

function rollKind(wave: number): EnemyKind {
  const r = Math.random();
  if (r > 0.92) return "wave";
  if (r > 0.75) return "shield";
  if (r > 0.5 && wave > 1) return "fast";
  return "basic";
}

export interface BattleOptions {
  difficulty: Difficulty;
  mode: LearningType;
  running: boolean;
  maxEnemies?: number;
  onMiss?: () => void;
  onCorrect?: (speedMs: number, combo: number) => void;
  onDefeat?: (enemy: Enemy) => void;
  onGameOver?: () => void;
  lives?: number;
}

export function useBattle(opts: BattleOptions) {
  const cfg = DIFFICULTY_CONFIG[opts.difficulty];
  const maxEnemies = opts.maxEnemies ?? 6;

  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [lives, setLives] = useState(opts.lives ?? cfg.lives);
  const [wave, setWave] = useState(1);
  const [defeated, setDefeated] = useState(0);
  const [missed, setMissed] = useState(0);
  const [sentencesDone, setSentencesDone] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hits, setHits] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; tone: "good" | "bad" | "info" } | null>(
    null,
  );
  const [shield, setShield] = useState(0);
  const [slowUntil, setSlowUntil] = useState(0);
  const [zoneFlash, setZoneFlash] = useState(false);
  const [shake, setShake] = useState(false);
  const [charState, setCharState] = useState<
    "idle" | "ready" | "signing" | "celebrate" | "wrong" | "hurt" | "victory" | "defeat"
  >("ready");

  const targetSince = useRef(Date.now());
  const gameOverFired = useRef(false);

  const activeId = useMemo(() => {
    const alive = enemies.filter((e) => e.state !== "dead");
    if (!alive.length) return null;
    return alive.reduce((a, b) => (a.progress >= b.progress ? a : b)).id;
  }, [enemies]);

  const active = enemies.find((e) => e.id === activeId) ?? null;

  useEffect(() => {
    targetSince.current = Date.now();
  }, [activeId]);

  const flash = useCallback((text: string, tone: "good" | "bad" | "info", lane = 1) => {
    setFeedback({ text, tone });
    const id = nextId();
    setPopups((p) => [...p.slice(-4), { id, text, tone, lane, top: 40 + Math.random() * 20 }]);
    window.setTimeout(() => setPopups((p) => p.filter((x) => x.id !== id)), 1100);
    window.setTimeout(() => setFeedback((f) => (f && f.text === text ? null : f)), 1200);
  }, []);

  const addEnemies = useCallback(
    (count: number, kinds?: EnemyKind[]) => {
      setEnemies((prev) => {
        const room = Math.max(0, maxEnemies - prev.filter((e) => e.state !== "dead").length);
        const n = Math.min(count, room);
        const extra = Array.from({ length: n }, (_, i) =>
          makeEnemy(opts.mode, kinds?.[i] ?? "basic", true),
        );
        return [...prev, ...extra];
      });
    },
    [maxEnemies, opts.mode],
  );

  const reset = useCallback(() => {
    setEnemies([]);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setLives(opts.lives ?? cfg.lives);
    setWave(1);
    setDefeated(0);
    setMissed(0);
    setSentencesDone(0);
    setAttempts(0);
    setHits(0);
    setHintsUsed(0);
    gameOverFired.current = false;
    setCharState("ready");
  }, [cfg.lives, opts.lives]);

  /* ---- spawning ---- */
  useEffect(() => {
    if (!opts.running) return;
    const t = window.setInterval(() => {
      setEnemies((prev) => {
        const alive = prev.filter((e) => e.state !== "dead");
        if (alive.length >= maxEnemies) return prev;
        return [...prev, makeEnemy(opts.mode, rollKind(wave))];
      });
    }, cfg.spawn);
    return () => window.clearInterval(t);
  }, [opts.running, cfg.spawn, maxEnemies, opts.mode, wave]);

  /* ---- falling tick ---- */
  useEffect(() => {
    if (!opts.running) return;
    const t = window.setInterval(() => {
      const slow = Date.now() < slowUntil;
      const crowdFactor = enemies.length >= maxEnemies - 1 ? 0.7 : 1;
      setEnemies((prev) => {
        let missedNow = 0;
        const next = prev
          .map((e) => {
            if (e.state === "dead") return e;
            const step =
              cfg.speed * KIND_SPEED[e.kind] * (slow ? 0.4 : 1) * (e.incoming ? crowdFactor : 1);
            const progress = e.progress + step;
            if (progress >= 100) {
              missedNow += 1;
              return { ...e, state: "dead" as const, progress: 100 };
            }
            return { ...e, progress };
          })
          .filter((e) => e.state !== "dead" || e.progress < 100);
        if (missedNow > 0) {
          window.setTimeout(() => handleMiss(missedNow), 0);
        }
        return next;
      });
    }, 90);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.running, cfg.speed, slowUntil, enemies.length, maxEnemies]);

  const handleMiss = useCallback(
    (count: number) => {
      setMissed((m) => m + count);
      setCombo(0);
      setZoneFlash(true);
      setShake(true);
      window.setTimeout(() => setZoneFlash(false), 500);
      window.setTimeout(() => setShake(false), 400);
      setCharState("hurt");
      window.setTimeout(() => setCharState("ready"), 600);
      let blocked = false;
      setShield((s) => {
        if (s > 0) {
          blocked = true;
          return s - 1;
        }
        return s;
      });
      window.setTimeout(() => {
        if (blocked) {
          flash("SHIELD BLOCKED!", "info");
          return;
        }
        setLives((l) => {
          const n = Math.max(0, l - count);
          if (n === 0 && !gameOverFired.current) {
            gameOverFired.current = true;
            window.setTimeout(() => opts.onGameOver?.(), 400);
          }
          return n;
        });
        flash("WORD ESCAPED!", "bad");
        opts.onMiss?.();
      }, 0);
    },
    [flash, opts],
  );

  /* ---- actions ---- */
  const correct = useCallback(
    (conf = 0.82 + Math.random() * 0.17) => {
      if (!active) return;
      const speedMs = Date.now() - targetSince.current;
      setAttempts((a) => a + 1);
      setHits((h) => h + 1);
      setConfidence(conf);
      setCharState("celebrate");
      window.setTimeout(() => setCharState("ready"), 700);

      const isSentence = active.sequence.length > 1;
      const lastStage = active.stage >= active.sequence.length - 1;
      const killsIt = !isSentence ? active.hp <= 1 : lastStage;

      const newCombo = combo + 1;
      setCombo(newCombo);
      setBestCombo((b) => Math.max(b, newCombo));

      const speedBonus = speedMs < 2000 ? 50 : speedMs < 4000 ? 30 : speedMs < 6000 ? 15 : 0;
      const gained = (killsIt ? (isSentence ? 250 : 100) : 60) + newCombo * 10 + speedBonus;
      setScore((s) => s + gained);

      if (killsIt) {
        setDefeated((d) => d + 1);
        if (isSentence) setSentencesDone((n) => n + 1);
        setEnemies((prev) => prev.map((e) => (e.id === active.id ? { ...e, state: "dead" } : e)));
        window.setTimeout(
          () => setEnemies((prev) => prev.filter((e) => e.id !== active.id)),
          320,
        );
        flash(
          isSentence
            ? "SENTENCE COMPLETE!"
            : newCombo >= 5
              ? `COMBO x${newCombo}!`
              : pick(["PERFECT!", "GREAT SIGN!", "AWESOME!"]),
          "good",
          active.lane,
        );
        setDefeated((d) => {
          if ((d + 1) % 6 === 0) setWave((w) => w + 1);
          return d;
        });
        opts.onDefeat?.(active);
      } else {
        setEnemies((prev) =>
          prev.map((e) =>
            e.id === active.id
              ? {
                  ...e,
                  hp: e.hp - 1,
                  stage: Math.min(e.sequence.length - 1, e.stage + 1),
                  word: e.sequence[Math.min(e.sequence.length - 1, e.stage + 1)],
                  progress: Math.max(0, e.progress - 12),
                }
              : e,
          ),
        );
        flash(
          isSentence ? pick(["GREAT FLOW!", "CORRECT ORDER!"]) : "SHIELD CRACKED!",
          "good",
          active.lane,
        );
      }
      targetSince.current = Date.now();
      opts.onCorrect?.(speedMs, newCombo);
    },
    [active, combo, flash, opts],
  );

  const incorrect = useCallback(() => {
    if (!active) return;
    setAttempts((a) => a + 1);
    setCombo(0);
    setConfidence(0.3 + Math.random() * 0.2);
    setCharState("wrong");
    window.setTimeout(() => setCharState("ready"), 600);
    setEnemies((prev) => prev.map((e) => (e.id === active.id ? { ...e, state: "hit" } : e)));
    window.setTimeout(
      () =>
        setEnemies((prev) => prev.map((e) => (e.id === active.id ? { ...e, state: "alive" } : e))),
      420,
    );
    flash(pick(["ALMOST!", "TRY AGAIN!", "WATCH THE HAND SHAPE!"]), "bad", active.lane);
  }, [active, flash]);

  const uncertain = useCallback(() => {
    setConfidence(0.55 + Math.random() * 0.1);
    flash("CHECKING… HOLD THE SIGN", "info", active?.lane ?? 1);
  }, [active, flash]);

  const missActive = useCallback(() => {
    if (!active) return;
    setEnemies((prev) => prev.filter((e) => e.id !== active.id));
    handleMiss(1);
  }, [active, handleMiss]);

  const fastClear = useCallback(() => {
    const alive = enemies.filter((e) => e.state !== "dead").length;
    setEnemies([]);
    setScore((s) => s + alive * 120);
    setDefeated((d) => d + alive);
    setCombo((c) => c + alive);
    setBestCombo((b) => Math.max(b, combo + alive));
    setWave((w) => w + 1);
    setCharState("celebrate");
    window.setTimeout(() => setCharState("ready"), 700);
    flash("WAVE CLEARED!", "good");
  }, [enemies, combo, flash]);

  const useHint = useCallback(() => setHintsUsed((h) => h + 1), []);
  const grantShield = useCallback(() => setShield((s) => s + 1), []);
  const slowTime = useCallback(() => setSlowUntil(Date.now() + 6000), []);

  const accuracy = attempts === 0 ? 0 : Math.round((hits / attempts) * 100);

  return {
    enemies,
    active,
    popups,
    score,
    combo,
    bestCombo,
    lives,
    wave,
    defeated,
    missed,
    sentencesDone,
    accuracy,
    hintsUsed,
    confidence,
    feedback,
    shield,
    zoneFlash,
    shake,
    charState,
    slowActive: Date.now() < slowUntil,
    setCharState,
    correct,
    incorrect,
    uncertain,
    missActive,
    fastClear,
    addEnemies,
    useHint,
    grantShield,
    slowTime,
    reset,
    flash,
    setScore,
    setLives,
  };
}
