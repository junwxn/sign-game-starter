import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Heart, Layers3, Lightbulb, Pause } from "lucide-react";
import {
  CoachBubble,
  CrystalZone,
  FloatingText,
  GameButton,
  Hero,
  HudChip,
  IconButton,
  Scene,
  type HeroState,
} from "@/components/game/kit";
import { cameraViewSizeClass, signExampleSizeClass } from "@/components/game/displaySizes";
import {
  DevPanel,
  LiveCamera,
  SignReferenceCard,
  type RecogStatus,
} from "@/components/game/InputPanel";
import { HintOverlay, PauseOverlay } from "@/components/game/Overlays";
import { SignToken } from "@/components/game/SentencePath";
import { pick, type Difficulty, type InputMode } from "@/game/data";
import { useTicker } from "@/game/engine";
import { MAX_SENTENCE_ENEMIES, makeSentenceEnemy, type SentenceEnemy } from "@/game/sentenceEngine";
import { SENTENCE_FEEDBACK, sentenceById, sentenceStars, tokenById } from "@/game/sentences";
import type { Settings } from "@/game/storage";
import type { SentenceRunResult } from "@/components/game/SentenceResults";
import type { SentenceSessionResult } from "@/components/game/SentenceQuestDetail";
import { cn } from "@/lib/utils";

const SESSION_SECONDS = 90;

/** Speech-cloud sentence creature — its shield segments are the sign stages. */
export function SentenceEnemySprite({
  enemy,
  active,
  style,
}: {
  enemy: SentenceEnemy;
  active?: boolean;
  style?: React.CSSProperties;
}) {
  const remaining = enemy.sequence.length - enemy.stage;
  const meaning = sentenceById(enemy.sentenceId).englishMeaning;
  return (
    <div
      className={cn(
        "absolute flex w-[16rem] flex-col items-center sm:w-[20rem]",
        enemy.status === "defeated" && "anim-pop",
        enemy.status === "hit" && "anim-shake",
      )}
      style={style}
    >
      <div className="panel w-full !rounded-[1.6rem] px-2 py-1.5">
        <p className="truncate text-center font-display text-[0.7rem] font-black uppercase tracking-widest">
          {meaning}
        </p>
        <ol className="mt-1 flex items-stretch justify-center gap-0.5 overflow-x-auto">
          {enemy.sequence.map((t, i) => (
            <li key={i} className="flex items-center gap-0.5">
              <SignToken
                tokenId={t}
                size="sm"
                state={
                  i < enemy.stage
                    ? "done"
                    : i === enemy.stage && active
                      ? "current"
                      : i === enemy.stage
                        ? "todo"
                        : "locked"
                }
              />
              {i < enemy.sequence.length - 1 && (
                <span aria-hidden className="font-display text-sm font-black text-ink/70">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
      <div className={cn("relative mt-1 grid place-items-center", active && "anim-target")}>
        {enemy.fromOpponent && (
          <span
            aria-hidden
            className="absolute inset-[-6px] rounded-full border-[3px] border-dashed border-magic"
          />
        )}
        <div
          role="img"
          aria-label={`Sentence target carrying ${enemy.sequence.length} signs, ${
            enemy.fromOpponent ? "sent by your rival" : "field spawn"
          }`}
          className={cn(
            "enemy-token grid h-20 w-20 place-items-center",
            remaining > 3
              ? "enemy-token--wave"
              : remaining > 1
                ? "enemy-token--shield"
                : "enemy-token--basic",
          )}
        >
          <Layers3 aria-hidden className="h-9 w-9 stroke-[1.7]" />
        </div>
        <span className="word-label absolute -bottom-2 bg-target text-[0.6rem] text-[oklch(0.2_0.05_50)]">
          {enemy.stage}/{enemy.sequence.length} SIGNS
        </span>
      </div>
      <span
        className={cn(
          "mt-3 rounded-full border px-2 py-0.5 font-display text-[0.52rem] font-black uppercase tracking-[0.12em] shadow-sm",
          enemy.fromOpponent
            ? "border-magic bg-magic text-cream"
            : "border-success bg-success text-[oklch(0.2_0.05_180)]",
        )}
      >
        {enemy.fromOpponent ? "Rival attack" : "Field spawn"}
      </span>
    </div>
  );
}

export function SentenceArcade({
  inputMode,
  difficulty,
  settings,
  unlockedSentences,
  onSignAttempt,
  onSentenceComplete,
  onFinish,
  onMenu,
  onOpenSettings,
  onRestart,
}: {
  inputMode: InputMode;
  difficulty: Difficulty;
  settings: Settings;
  unlockedSentences: string[];
  onSignAttempt: (signId: string, correct: boolean, confidence: number) => void;
  onSentenceComplete: (sentenceId: string, result: SentenceSessionResult) => void;
  onFinish: (r: SentenceRunResult) => void;
  onMenu: () => void;
  onOpenSettings: () => void;
  onRestart: () => void;
}) {
  const [enemies, setEnemies] = useState<SentenceEnemy[]>(() => [
    makeSentenceEnemy(unlockedSentences, difficulty, { y: -8 }),
  ]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(SESSION_SECONDS);
  const [status, setStatus] = useState<RecogStatus>("framing");
  const [confidence, setConfidence] = useState(48);
  const [heroState, setHeroState] = useState<HeroState>("ready");
  const [coach, setCoach] = useState("Sign the sentence one stage at a time!");
  const [floats, setFloats] = useState<
    { id: number; text: string; tone: "success" | "danger" | "target"; x: number; y: number }[]
  >([]);
  const [paused, setPaused] = useState(false);
  const [hint, setHint] = useState(false);
  const [cameraReady, setCameraReady] = useState(inputMode !== "camera");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [crystalFlash, setCrystalFlash] = useState(false);
  const [sentencesDone, setSentencesDone] = useState(0);
  const [signsDone, setSignsDone] = useState(0);
  const [orderOk, setOrderOk] = useState(0);
  const [orderTotal, setOrderTotal] = useState(0);
  const [flow, setFlow] = useState(70);
  const bestRef = useRef<string | undefined>(undefined);
  const weakRef = useRef<string | undefined>(undefined);
  const floatId = useRef(0);
  const finished = useRef(false);
  const hintedEnemies = useRef(new Set<string>());

  const running = !paused && !hint && cameraReady;
  const target = useMemo(() => {
    const active = enemies.filter((enemy) => enemy.status !== "defeated");
    return active.find((enemy) => enemy.stage > 0) ?? active.sort((a, b) => b.y - a.y)[0];
  }, [enemies]);
  const currentToken = target ? tokenById(target.sequence[target.stage]) : null;
  const currentSentence = target ? sentenceById(target.sentenceId) : null;

  const addFloat = useCallback(
    (text: string, tone: "success" | "danger" | "target", x = 50, y = 45) => {
      const id = ++floatId.current;
      setFloats((f) => [...f, { id, text, tone, x, y }]);
      setTimeout(() => setFloats((f) => f.filter((i) => i.id !== id)), 1200);
    },
    [],
  );

  const flashHero = useCallback((s: HeroState) => {
    setHeroState(s);
    setTimeout(() => setHeroState("ready"), 700);
  }, []);

  const handleMiss = useCallback(
    (e?: SentenceEnemy) => {
      setLives((l) => l - 1);
      setCombo(0);
      setFlow((f) => Math.max(10, f - 18));
      setCrystalFlash(true);
      setTimeout(() => setCrystalFlash(false), 600);
      flashHero("damage");
      setCoach(SENTENCE_FEEDBACK.minor[0]);
      addFloat("SENTENCE ESCAPED!", "danger", 50, 70);
      if (e) weakRef.current = e.sentenceId;
    },
    [addFloat, flashHero],
  );

  useTicker(
    () => {
      setEnemies((list) => {
        const moved = list.map((e) => (e.status === "defeated" ? e : { ...e, y: e.y + e.speed }));
        const gone = moved.filter((e) => e.y >= 78 && e.status !== "defeated");
        gone.forEach((g) => handleMiss(g));
        return moved.filter((e) => e.y < 78 && e.status !== "defeated");
      });
    },
    110,
    running,
  );

  useTicker(
    () => {
      setEnemies((list) =>
        list.filter((e) => e.status !== "defeated").length >= MAX_SENTENCE_ENEMIES
          ? list
          : [...list, makeSentenceEnemy(unlockedSentences, difficulty)],
      );
    },
    difficulty === "hard" ? 5200 : difficulty === "easy" ? 8000 : 6500,
    running,
  );

  useTicker(() => setTime((t) => t - 1), 1000, running);

  useTicker(
    () => {
      setStatus((s) => (s === "framing" ? "hands" : s));
      setConfidence((c) => Math.min(88, c + 3));
    },
    900,
    running && inputMode === "camera",
  );

  const end = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    const orderPct = orderTotal ? (orderOk / orderTotal) * 100 : 0;
    onFinish({
      score,
      sentencesCompleted: sentencesDone,
      signsCompleted: signsDone,
      orderPct,
      flowScore: flow,
      bestSentenceId: bestRef.current,
      weakSentenceId: weakRef.current,
      hints: hintsUsed,
      bestCombo,
      stars: score > 2200 ? 3 : score > 1200 ? 2 : score > 400 ? 1 : 0,
    });
  }, [score, sentencesDone, signsDone, orderOk, orderTotal, flow, hintsUsed, bestCombo, onFinish]);

  useEffect(() => {
    if (lives <= 0 || time <= 0) end();
  }, [lives, time, end]);

  const resolve = (kind: "correct" | "wrong" | "nohands", measuredConfidence?: number) => {
    if (!target || !running || target.status !== "idle") return;
    if (kind === "nohands") {
      setStatus("nohands");
      setCoach("Keep both hands visible!");
      return;
    }
    setOrderTotal((t) => t + 1);
    if (kind === "wrong") {
      setStatus("rejected");
      setConfidence((c) => Math.max(14, c - 20));
      setFlow((f) => Math.max(10, f - 8));
      setCombo(0);
      flashHero("wrong");
      setCoach(pick(SENTENCE_FEEDBACK.order));
      addFloat("CHECK THE ORDER!", "danger", target.x + 8, target.y + 12);
      onSignAttempt(currentToken?.signId ?? target.sequence[target.stage], false, 38);
      setEnemies((l) =>
        l.map((e) =>
          e.id === target.id
            ? {
                ...e,
                status: "hit",
                startedAt: e.startedAt || Date.now(),
                wrongAttempts: e.wrongAttempts + 1,
              }
            : e,
        ),
      );
      setTimeout(
        () => setEnemies((l) => l.map((e) => (e.id === target.id ? { ...e, status: "idle" } : e))),
        420,
      );
      weakRef.current = target.sentenceId;
      return;
    }

    /* correct stage */
    setOrderOk((o) => o + 1);
    setStatus("accepted");
    const resultConfidence = measuredConfidence ?? 78 + Math.floor(Math.random() * 18);
    setConfidence(resultConfidence);
    setFlow((f) => Math.min(100, f + 6));
    setSignsDone((s) => s + 1);
    onSignAttempt(currentToken?.signId ?? target.sequence[target.stage], true, resultConfidence);
    const nextStage = target.stage + 1;
    const complete = nextStage >= target.sequence.length;
    const gained = complete ? 240 + target.sequence.length * 90 + combo * 30 : 0;
    if (complete) {
      setScore((s) => s + gained);
      addFloat(`+${gained}`, "success", target.x + 8, target.y + 10);
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setBestCombo((b) => Math.max(b, nextCombo));
      setSentencesDone((n) => n + 1);
      bestRef.current = target.sentenceId;
      flashHero(nextCombo >= 3 ? "combo" : "correct");
      setCoach(pick(SENTENCE_FEEDBACK.perfect));
      addFloat(pick(SENTENCE_FEEDBACK.perfect), "target", 44, 30);
      const timeMs = Math.max(1, Date.now() - (target.startedAt || Date.now()));
      const orderPct =
        (target.sequence.length / (target.sequence.length + target.wrongAttempts)) * 100;
      const sentenceHints = hintedEnemies.current.has(target.id) ? 1 : 0;
      onSentenceComplete(target.sentenceId, {
        completed: true,
        score: gained,
        timeMs,
        orderPct,
        hintsUsed: sentenceHints,
        stars: sentenceStars({
          completed: true,
          hintsUsed: sentenceHints,
          orderPct,
          timeMs,
          signCount: target.sequence.length,
        }),
      });
      hintedEnemies.current.delete(target.id);
      setEnemies((l) => l.map((e) => (e.id === target.id ? { ...e, status: "defeated" } : e)));
      setTimeout(() => setEnemies((l) => l.filter((e) => e.id !== target.id)), 420);
    } else {
      flashHero("correct");
      setCoach("Great! Now connect it to the next sign.");
      addFloat(
        `${nextStage}/${target.sequence.length} SIGNS`,
        "success",
        target.x + 8,
        target.y + 10,
      );
      setEnemies((l) =>
        l.map((e) =>
          e.id === target.id ? { ...e, stage: nextStage, startedAt: e.startedAt || Date.now() } : e,
        ),
      );
    }
  };

  return (
    <Scene dim={0.12}>
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-2 p-2 sm:p-3">
          <div className="flex flex-col items-start gap-1">
            <HudChip label="Score" value={score} tone="target" />
            <HudChip label="Sentences" value={sentencesDone} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <HudChip label="Combo" value={`x${combo}`} tone="success" />
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
                  if (target) hintedEnemies.current.add(target.id);
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

        <div className="relative min-h-0 flex-1 overflow-hidden">
          {enemies.map((e) => (
            <SentenceEnemySprite
              key={e.id}
              enemy={e}
              active={target?.id === e.id}
              style={{
                left: `${e.x}%`,
                top: `${e.y}%`,
                transition: "top 110ms linear",
                zIndex: target?.id === e.id ? 20 : 10,
                opacity: target?.id === e.id ? 1 : 0.85,
              }}
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

        <div className="flex shrink-0 items-end gap-3 p-2 sm:p-3">
          <div className="flex w-full max-w-2xl items-end gap-3 overflow-x-auto pb-1">
            {inputMode === "camera" && (
              <div className={cn("shrink-0", cameraViewSizeClass[settings.cameraSize])}>
                <LiveCamera
                  targets={currentToken?.signId ? [currentToken.signId] : []}
                  active={running && !!currentToken?.signId}
                  showConfidence={settings.showConfidence}
                  onReady={() => {
                    setCameraReady(true);
                    setCoach("Camera ready — complete the highlighted sentence in order!");
                  }}
                  onResult={(result) =>
                    resolve(
                      result.accepted ? "correct" : "wrong",
                      Math.round(result.confidence * 100),
                    )
                  }
                  onError={() => {
                    setCameraReady(false);
                    setStatus("nohands");
                    setCoach("Camera stopped — reopen the game or check camera permission.");
                  }}
                />
              </div>
            )}
            <div className="min-w-0 space-y-2">
              {currentSentence && (
                <p className="panel line-clamp-2 px-3 py-2 font-display text-sm font-black sm:text-base">
                  {currentSentence.englishMeaning}
                </p>
              )}
              {target && (
                <ol
                  className="panel flex max-w-full items-center gap-1 overflow-x-auto !rounded-xl p-1.5"
                  aria-label="Current sentence sign order"
                >
                  {target.sequence.map((tokenId, index) => (
                    <li key={`${tokenId}-${index}`} className="flex shrink-0 items-center gap-1">
                      <span
                        className={cn(
                          "rounded-full border-2 border-ink px-2 py-1 font-display text-[0.6rem] font-black uppercase",
                          index < target.stage
                            ? "bg-success text-ink"
                            : index === target.stage
                              ? "bg-target text-ink"
                              : "bg-cream/70 text-ink/60",
                        )}
                      >
                        {tokenById(tokenId).name}
                      </span>
                      {index < target.sequence.length - 1 && (
                        <span className="font-display font-black text-ink/70" aria-hidden>
                          →
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              )}
              {inputMode === "camera" && (
                <SignReferenceCard
                  signId={currentToken?.signId}
                  size={settings.exampleSize}
                  className={signExampleSizeClass[settings.exampleSize]}
                />
              )}
              <div className="flex items-center gap-2">
                <span className="font-display text-[0.6rem] font-black uppercase tracking-widest text-cream drop-shadow">
                  Next sign {target ? `${target.stage + 1}/${target.sequence.length}` : ""}
                </span>
                <span className="word-label bg-target text-sm text-[oklch(0.2_0.05_50)]">
                  {currentToken?.name ?? "—"}
                </span>
              </div>
              {inputMode === "camera" ? (
                <span className="hud-chip block text-center text-xs">Show sign to camera</span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <GameButton tone="success" onClick={() => resolve("correct")}>
                    Perform Next Sign
                  </GameButton>
                  <GameButton tone="danger" onClick={() => resolve("wrong")}>
                    Wrong Sign
                  </GameButton>
                </div>
              )}
            </div>
          </div>
          <div className="ml-auto">
            <DevPanel
              actions={[
                { label: "Correct Stage", onClick: () => resolve("correct") },
                { label: "Wrong Stage", onClick: () => resolve("wrong") },
                { label: "Hands Not Visible", onClick: () => resolve("nohands") },
                { label: "Miss Sentence", onClick: () => handleMiss(target) },
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
      {hint && currentToken && (
        <HintOverlay signId={currentToken.signId ?? "good"} onClose={() => setHint(false)} />
      )}
    </Scene>
  );
}
