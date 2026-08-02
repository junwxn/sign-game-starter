import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Heart, Lightbulb, Pause } from "lucide-react";
import {
  CoachBubble,
  CrystalZone,
  EnemySprite,
  FloatingText,
  GameButton,
  Hero,
  HudChip,
  IconButton,
  Scene,
  type HeroState,
} from "@/components/game/kit";
import {
  DevPanel,
  KeyboardInput,
  MockCamera,
  type RecogStatus,
} from "@/components/game/InputPanel";
import { HintOverlay, PauseOverlay } from "@/components/game/Overlays";
import { COACH_LINES, pick, signById, type Difficulty, type InputMode } from "@/game/data";
import { MAX_ENEMIES, makeEnemy, useTicker, type Enemy } from "@/game/engine";
import type { Settings } from "@/game/storage";
import type { SingleResult } from "@/components/game/Results";
import { cn } from "@/lib/utils";

const SESSION_SECONDS = 90;

type Float = {
  id: number;
  text: string;
  tone: "success" | "danger" | "target" | "magic";
  x: number;
  y: number;
};

export function SinglePlayer({
  inputMode,
  difficulty,
  settings,
  onFinish,
  onMenu,
  onOpenSettings,
  onRestart,
}: {
  inputMode: InputMode;
  difficulty: Difficulty;
  settings: Settings;
  onFinish: (
    r: SingleResult,
    attempts: { signId: string; correct: boolean; confidence: number }[],
  ) => void;
  onMenu: () => void;
  onOpenSettings: () => void;
  onRestart: () => void;
}) {
  const [enemies, setEnemies] = useState<Enemy[]>(() => [makeEnemy({ y: -5 }, difficulty)]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [time, setTime] = useState(SESSION_SECONDS);
  const [status, setStatus] = useState<RecogStatus>("framing");
  const [confidence, setConfidence] = useState(42);
  const [heroState, setHeroState] = useState<HeroState>("ready");
  const [coach, setCoach] = useState("Ready hands? Sign the orange word!");
  const [floats, setFloats] = useState<Float[]>([]);
  const [paused, setPaused] = useState(false);
  const [hint, setHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [shake, setShake] = useState(false);
  const [crystalFlash, setCrystalFlash] = useState(false);
  const [defeated, setDefeated] = useState(0);
  const [missed, setMissed] = useState(0);

  const attempts = useRef<{ signId: string; correct: boolean; confidence: number }[]>([]);
  const floatId = useRef(0);
  const finished = useRef(false);
  const busy = useRef(false);

  const running = !paused && !hint;

  const target = useMemo(
    () => enemies.filter((e) => e.status === "idle").sort((a, b) => b.y - a.y)[0],
    [enemies],
  );

  const addFloat = useCallback((text: string, tone: Float["tone"], x = 50, y = 45) => {
    const id = ++floatId.current;
    setFloats((f) => [...f, { id, text, tone, x, y }]);
    setTimeout(() => setFloats((f) => f.filter((i) => i.id !== id)), 1200);
  }, []);

  const flashHero = useCallback((s: HeroState) => {
    setHeroState(s);
    setTimeout(() => setHeroState("ready"), 700);
  }, []);

  /* movement + spawn */
  useTicker(
    () => {
      setEnemies((list) => {
        const moved = list.map((e) =>
          e.status === "defeated" ? e : { ...e, y: e.y + e.speed * 0.45 },
        );
        const gone = moved.filter((e) => e.y >= 100 && e.status !== "defeated");
        if (gone.length) {
          handleMiss(gone.length);
        }
        return moved.filter((e) => e.y < 100 && e.status !== "defeated");
      });
    },
    90,
    running,
  );

  useTicker(
    () => {
      setEnemies((list) => {
        const alive = list.filter((e) => e.status !== "defeated");
        if (alive.length >= MAX_ENEMIES) return list;
        return [...list, makeEnemy({}, difficulty)];
      });
    },
    difficulty === "hard" ? 1900 : difficulty === "easy" ? 3200 : 2500,
    running,
  );

  useTicker(
    () => {
      setTime((t) => t - 1);
    },
    1000,
    running,
  );

  useEffect(() => {
    if (time > 0 && time % 30 === 0 && time !== SESSION_SECONDS) setWave((w) => w + 1);
  }, [time]);

  /* mock camera drift */
  useTicker(
    () => {
      setStatus((s) => (s === "framing" ? "hands" : s === "hands" ? "hands" : s));
      setConfidence((c) => Math.min(88, c + 3 + Math.random() * 4));
    },
    900,
    running && inputMode === "camera",
  );

  const end = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    const list = attempts.current;
    const correct = list.filter((a) => a.correct).length;
    const bySign = new Map<string, { total: number; ok: number }>();
    list.forEach((a) => {
      const cur = bySign.get(a.signId) ?? { total: 0, ok: 0 };
      cur.total++;
      if (a.correct) cur.ok++;
      bySign.set(a.signId, cur);
    });
    const perSign = [...bySign.entries()].map(([signId, v]) => {
      const acc = Math.round((v.ok / v.total) * 100);
      return {
        signId,
        accuracy: acc,
        stars: acc > 80 ? 3 : acc > 55 ? 2 : acc > 25 ? 1 : 0,
        improved: acc >= 60,
      };
    });
    onFinish(
      {
        score,
        bestCombo,
        accuracy: list.length ? Math.round((correct / list.length) * 100) : 0,
        defeated,
        missed,
        hints: hintsUsed,
        duration: SESSION_SECONDS - time,
        perSign,
        weakSigns: perSign.filter((p) => p.accuracy < 60).map((p) => p.signId),
      },
      list,
    );
  }, [score, bestCombo, defeated, missed, hintsUsed, time, onFinish]);

  useEffect(() => {
    if (lives <= 0 || time <= 0) end();
  }, [lives, time, end]);

  function handleMiss(count = 1) {
    setLives((l) => l - count);
    setCombo(0);
    setMissed((m) => m + count);
    setCrystalFlash(true);
    setShake(true);
    setTimeout(() => setCrystalFlash(false), 600);
    setTimeout(() => setShake(false), 450);
    flashHero("damage");
    setCoach(pick(COACH_LINES.miss));
    addFloat("MISSED!", "danger", 50, 70);
  }

  function resolve(kind: "correct" | "wrong" | "uncertain" | "nohands") {
    if (!target || busy.current || !running) return;
    if (kind === "nohands") {
      setStatus("nohands");
      setConfidence((c) => Math.max(10, c - 25));
      setCoach("Keep both hands visible!");
      return;
    }
    busy.current = true;
    setStatus("checking");
    setHeroState("signing");
    const delay = 420;
    setTimeout(() => {
      busy.current = false;
      if (kind === "correct") {
        const gained = 100 + combo * 15;
        const nextCombo = combo + 1;
        setScore((s) => s + gained);
        setCombo(nextCombo);
        setBestCombo((b) => Math.max(b, nextCombo));
        setDefeated((d) => d + 1);
        setStatus("accepted");
        setConfidence(78 + Math.floor(Math.random() * 20));
        setEnemies((l) => l.map((e) => (e.id === target.id ? { ...e, status: "defeated" } : e)));
        setTimeout(() => setEnemies((l) => l.filter((e) => e.id !== target.id)), 420);
        addFloat(`+${gained}`, "success", target.x, target.y);
        addFloat(
          nextCombo >= 5 ? `COMBO x${nextCombo}!` : pick(["PERFECT!", "GREAT SIGN!", "AWESOME!"]),
          "target",
          46,
          32,
        );
        flashHero(nextCombo >= 5 ? "combo" : "correct");
        setCoach(pick(COACH_LINES.correct));
        attempts.current.push({ signId: target.signId, correct: true, confidence: 85 });
      } else {
        const uncertain = kind === "uncertain";
        setStatus(uncertain ? "almost" : "rejected");
        setConfidence((c) => Math.max(12, c - (uncertain ? 12 : 24)));
        setEnemies((l) => l.map((e) => (e.id === target.id ? { ...e, status: "hit" } : e)));
        setTimeout(
          () =>
            setEnemies((l) => l.map((e) => (e.id === target.id ? { ...e, status: "idle" } : e))),
          450,
        );
        addFloat(uncertain ? "ALMOST!" : "TRY AGAIN!", "danger", target.x, target.y);
        flashHero("wrong");
        setCoach(pick(COACH_LINES.wrong));
        attempts.current.push({ signId: target.signId, correct: false, confidence: 40 });
      }
    }, delay);
  }

  const submitWord = (value: string) => {
    if (!target) return;
    resolve(value.trim().toLowerCase() === target.word.toLowerCase() ? "correct" : "wrong");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPaused((p) => !p);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Scene dim={0.12} className={cn(shake && "anim-shake-screen")}>
      <div className="flex h-full flex-col">
        {/* HUD */}
        <div className="flex items-start justify-between gap-2 p-2 sm:p-3">
          <div className="flex flex-col items-start gap-1">
            <HudChip label="Score" value={score} tone="target" />
            <HudChip label="Wave" value={wave} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <HudChip
              label="Combo"
              value={`x${combo}`}
              tone="success"
              className={combo >= 3 ? "scale-110 transition-transform" : ""}
            />
            <HudChip label="Time" value={`${Math.max(0, time)}s`} />
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="hud-chip" aria-label={`${lives} lives remaining`}>
              {[0, 1, 2].map((i) => (
                <Heart
                  key={i}
                  className={cn("h-4 w-4", i < lives ? "fill-danger text-danger" : "text-cream/35")}
                  aria-hidden
                />
              ))}
            </div>
            <div className="flex gap-1">
              <IconButton
                label="Hint"
                className="h-9 w-9"
                onClick={() => {
                  setHint(true);
                  setHintsUsed((h) => h + 1);
                }}
              >
                <Lightbulb className="mx-auto h-4 w-4" aria-hidden />
              </IconButton>
              <IconButton label="Pause" className="h-9 w-9" onClick={() => setPaused(true)}>
                <Pause className="mx-auto h-4 w-4" aria-hidden />
              </IconButton>
            </div>
          </div>
        </div>

        {/* play field */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {enemies.map((e) => (
            <EnemySprite
              key={e.id}
              kind={e.kind}
              word={e.word}
              active={target?.id === e.id}
              status={e.status}
              className={target?.id === e.id ? "z-20" : "z-10 opacity-80"}
              style={{ left: `${e.x}%`, top: `${e.y}%`, transition: "top 90ms linear" }}
            />
          ))}
          {floats.map((f) => (
            <FloatingText
              key={f.id}
              text={f.text}
              tone={f.tone}
              style={{ left: `${f.x}%`, top: `${f.y}%` }}
            />
          ))}
          {settings.coachMessages && (
            <CoachBubble
              message={coach}
              className="absolute bottom-16 left-1 z-30 origin-bottom-left scale-90 sm:bottom-2 sm:left-2 sm:scale-100"
            />
          )}
          <Hero
            state={heroState}
            className="absolute bottom-0 right-2 z-20 h-32 w-24 sm:h-44 sm:w-32"
          />
          <div className="absolute inset-x-0 bottom-0">
            <CrystalZone health={(lives / 3) * 100} flash={crystalFlash} />
          </div>
        </div>

        {/* input */}
        <div className="flex shrink-0 items-end gap-3 p-2 sm:p-3">
          <div className="w-full max-w-md">
            {inputMode === "camera" ? (
              <div className="flex items-end gap-3">
                <div className="w-44 sm:w-56">
                  <MockCamera
                    status={status}
                    confidence={confidence}
                    showConfidence={settings.showConfidence}
                  />
                </div>
                <div className="space-y-2">
                  <span className="word-label block bg-target text-center text-lg text-[oklch(0.2_0.05_50)]">
                    {target?.word ?? "—"}
                  </span>
                  <GameButton tone="success" onClick={() => resolve("correct")}>
                    Perform sign
                  </GameButton>
                </div>
              </div>
            ) : (
              <KeyboardInput
                target={target?.word ?? ""}
                onSubmit={submitWord}
                disabled={!target}
                status={status}
                confidence={confidence}
                showConfidence={settings.showConfidence}
              />
            )}
          </div>
          <div className="ml-auto">
            <DevPanel
              actions={[
                { label: "Correct Sign", onClick: () => resolve("correct") },
                { label: "Incorrect Sign", onClick: () => resolve("wrong") },
                { label: "Uncertain Result", onClick: () => resolve("uncertain") },
                { label: "Hands Not Visible", onClick: () => resolve("nohands") },
                { label: "Miss Enemy", onClick: () => handleMiss(1) },
              ]}
            />
          </div>
        </div>
      </div>

      {paused && (
        <PauseOverlay
          onResume={() => setPaused(false)}
          onRestart={onRestart}
          onSettings={onOpenSettings}
          onMenu={onMenu}
        />
      )}
      {hint && target && <HintOverlay signId={target.signId} onClose={() => setHint(false)} />}
      <span className="sr-only" aria-live="polite">
        {target ? `Current target sign: ${signById(target.signId).name}` : ""}
      </span>
    </Scene>
  );
}
