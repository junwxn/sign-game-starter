import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw, Star } from "lucide-react";
import {
  CoachBubble,
  FloatingText,
  GameButton,
  Hero,
  HudChip,
  IconButton,
  Meter,
  Scene,
  SignMark,
  Stars,
  type HeroState,
} from "@/components/game/kit";
import { cameraGridSizeClass, signExampleSizeClass } from "@/components/game/displaySizes";
import {
  DevPanel,
  LiveCamera,
  SignReferenceCard,
  type RecogStatus,
} from "@/components/game/InputPanel";
import { SentencePath, SequenceProgressLine, SignToken } from "@/components/game/SentencePath";
import {
  SENTENCE_COACH,
  SENTENCE_FEEDBACK,
  SENTENCE_REVIEW_NOTE,
  sentenceById,
  sentenceSignIds,
  sentenceStars,
  tokenById,
} from "@/game/sentences";
import { pick, SIGNS } from "@/game/data";
import type { SentenceProgress, Settings } from "@/game/storage";
import { cn } from "@/lib/utils";

type Mode = "overview" | "learn" | "practice" | "build" | "missing";

export type SentenceSessionResult = {
  completed: boolean;
  score: number;
  timeMs: number;
  orderPct: number;
  stars: number;
};

export function SentenceQuestDetail({
  sentenceId,
  progress,
  favourite,
  settings,
  onToggleFavourite,
  onSignAttempt,
  onRecord,
  onClose,
}: {
  sentenceId: string;
  progress?: SentenceProgress;
  favourite: boolean;
  settings: Settings;
  onToggleFavourite: () => void;
  onSignAttempt: (signId: string, correct: boolean, confidence: number) => void;
  onRecord: (id: string, r: SentenceSessionResult) => void;
  onClose: () => void;
}) {
  const sentence = sentenceById(sentenceId);
  const seq = sentence.signSequence;

  const [mode, setMode] = useState<Mode>("overview");
  const [index, setIndex] = useState(0);
  const [learned, setLearned] = useState<number[]>([]);
  const [coach, setCoach] = useState(SENTENCE_COACH.start);
  const [heroState, setHeroState] = useState<HeroState>("ready");
  const [celebrate, setCelebrate] = useState<string | null>(null);

  /* ---- demonstration playback ---- */
  const [playing, setPlaying] = useState(false);
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const step = slow ? 2100 : 1050;
    const t = setInterval(() => {
      setIndex((i) => {
        if (i >= seq.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, step);
    return () => clearInterval(t);
  }, [playing, slow, seq.length]);

  const flashHero = useCallback((s: HeroState) => {
    setHeroState(s);
    setTimeout(() => setHeroState("ready"), 700);
  }, []);

  const creditSigns = useCallback(
    (correct: boolean) => {
      sentenceSignIds(sentence).forEach((id) =>
        onSignAttempt(id, correct, correct ? 78 + Math.floor(Math.random() * 20) : 38),
      );
    },
    [sentence, onSignAttempt],
  );

  const token = tokenById(seq[Math.min(index, seq.length - 1)]);

  /* ---------------- learn flow ---------------- */
  const learnAttempt = (correct: boolean) => {
    if (correct) {
      flashHero("correct");
      setLearned((l) => (l.includes(index) ? l : [...l, index]));
      onSignAttempt(token.signId ?? seq[index], true, 80 + Math.floor(Math.random() * 18));
      if (index >= seq.length - 1) {
        setCoach(SENTENCE_COACH.whole);
        setCelebrate("ALL SIGNS LEARNED!");
        setTimeout(() => {
          setCelebrate(null);
          setMode("overview");
        }, 1400);
      } else {
        setCoach(pick([SENTENCE_COACH.next, SENTENCE_COACH.smooth, SENTENCE_COACH.flow]));
        setIndex((i) => i + 1);
      }
    } else {
      flashHero("wrong");
      onSignAttempt(token.signId ?? seq[index], false, 36);
      setCoach(pick(["Almost! Try once more.", SENTENCE_COACH.smooth, SENTENCE_COACH.face]));
    }
  };

  /* ---------------- shell ---------------- */
  return (
    <Scene dim={0.38}>
      <div className="flex h-full flex-col p-3 sm:p-4">
        <div className="grid shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <IconButton
            label={mode === "overview" ? "Back to Sentence Quests" : "Back to quest"}
            onClick={() => (mode === "overview" ? onClose() : setMode("overview"))}
          >
            <ArrowLeft className="mx-auto h-5 w-5" aria-hidden />
          </IconButton>
          <div className="min-w-0">
            <h2 className="truncate font-display text-2xl font-black text-cream text-outline sm:text-4xl">
              {sentence.title}
            </h2>
            <p className="truncate font-display text-xs font-extrabold uppercase tracking-widest text-cream/90 drop-shadow">
              {sentence.category} · {sentence.difficulty} · {seq.length} signs
            </p>
          </div>
          <IconButton
            label={favourite ? "Remove favourite sentence" : "Add favourite sentence"}
            onClick={onToggleFavourite}
            className={favourite ? "bg-target" : ""}
          >
            <Star className={cn("mx-auto h-5 w-5", favourite && "fill-current")} aria-hidden />
          </IconButton>
        </div>

        <div className="relative mt-3 min-h-0 flex-1 overflow-y-auto">
          {celebrate && (
            <FloatingText
              text={celebrate}
              tone="success"
              style={{ left: "50%", top: "30%", transform: "translateX(-50%)" }}
            />
          )}

          {mode === "overview" && (
            <div className="mx-auto w-full max-w-5xl space-y-3 pb-6">
              <div className="panel space-y-2 p-4 text-center">
                <p className="font-display text-[0.62rem] font-black uppercase tracking-[0.25em] text-muted-foreground">
                  Written English meaning
                </p>
                <p className="font-display text-2xl font-black leading-tight sm:text-4xl">
                  “{sentence.englishMeaning}”
                </p>
                <p className="font-sans text-xs font-bold text-muted-foreground">
                  SgSL sign order can differ from English — follow the path below.
                </p>
              </div>

              <div className="panel space-y-2 p-3">
                <SentencePath
                  sequence={seq}
                  currentIndex={index}
                  doneIndexes={learned}
                  onSelect={(i) => setIndex(i)}
                  size="lg"
                />
                <SequenceProgressLine value={index + 1} max={seq.length} />
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <GameButton
                    tone="neutral"
                    size="sm"
                    onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden /> Previous Sign
                  </GameButton>
                  <GameButton
                    tone="neutral"
                    size="sm"
                    onClick={() => setIndex((i) => Math.min(seq.length - 1, i + 1))}
                  >
                    Next Sign <ArrowRight className="h-4 w-4" aria-hidden />
                  </GameButton>
                  <GameButton
                    tone="magic"
                    size="sm"
                    onClick={() => {
                      setIndex(0);
                      setPlaying(true);
                    }}
                  >
                    <Play className="h-4 w-4" aria-hidden /> Play Full Sequence
                  </GameButton>
                  <GameButton tone="neutral" size="sm" onClick={() => setPlaying((p) => !p)}>
                    <Pause className="h-4 w-4" aria-hidden /> {playing ? "Pause" : "Resume"}
                  </GameButton>
                  <GameButton
                    tone="neutral"
                    size="sm"
                    aria-pressed={slow}
                    className={slow ? "bg-target text-[oklch(0.2_0.05_50)]" : ""}
                    onClick={() => setSlow((s) => !s)}
                  >
                    {slow ? "Slow Speed" : "Normal Speed"}
                  </GameButton>
                  <GameButton
                    tone="neutral"
                    size="sm"
                    onClick={() => {
                      setIndex(0);
                      setPlaying(true);
                    }}
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden /> Replay
                  </GameButton>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_18rem]">
                <div className="panel space-y-2 p-4">
                  <div className="flex items-center gap-3">
                    <SignMark signId={token.id} label={token.name} size={72} className="anim-bob" />
                    <div>
                      <p className="font-display text-2xl font-black">{token.name}</p>
                      <p className="font-display text-[0.6rem] font-bold uppercase tracking-widest text-muted-foreground">
                        Mascot guide · step {index + 1} of {seq.length}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">
                    <strong className="font-display uppercase text-target-deep">
                      Hand shape ·{" "}
                    </strong>
                    {token.handShape}
                  </p>
                  <p className="text-sm font-semibold">
                    <strong className="font-display uppercase text-magic">Movement · </strong>
                    {token.movement}
                  </p>
                  {sentence.facialExpression && (
                    <p className="text-sm font-semibold">
                      <strong className="font-display uppercase text-success">Face · </strong>
                      {sentence.facialExpression}
                    </p>
                  )}
                  {sentence.bodyMovement && (
                    <p className="text-sm font-semibold">
                      <strong className="font-display uppercase text-danger">Body · </strong>
                      {sentence.bodyMovement}
                    </p>
                  )}
                  <ul className="list-disc space-y-0.5 pl-5 text-xs font-semibold text-muted-foreground">
                    {sentence.signingNotes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                    {sentence.commonMistakes.map((n) => (
                      <li key={n}>Common mistake: {n}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <Hero state={heroState} className="h-36 w-28" />
                  <div className="flex items-center gap-2">
                    <Stars n={progress?.stars ?? 0} size={20} />
                    <span className="hud-chip text-xs">Best {progress?.bestScore ?? 0}</span>
                  </div>
                  <CoachBubble message={coach} />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <GameButton
                  tone="play"
                  size="lg"
                  onClick={() => {
                    setMode("learn");
                    setIndex(0);
                    setCoach(SENTENCE_COACH.start);
                  }}
                >
                  Learn Sentence
                </GameButton>
                <GameButton tone="success" size="lg" onClick={() => setMode("practice")}>
                  Practise Full Sentence
                </GameButton>
                <GameButton tone="magic" onClick={() => setMode("build")}>
                  Sentence Builder Mini-Game
                </GameButton>
                <GameButton tone="magic" onClick={() => setMode("missing")}>
                  Missing Sign Mini-Game
                </GameButton>
                <GameButton tone="neutral" className="sm:col-span-2" onClick={onClose}>
                  Back to Sentence Quests
                </GameButton>
              </div>
              <p className="text-center font-display text-[0.6rem] font-bold uppercase tracking-widest text-cream/85 drop-shadow">
                {SENTENCE_REVIEW_NOTE}
              </p>
            </div>
          )}

          {mode === "learn" && (
            <div className="mx-auto w-full max-w-4xl space-y-3 pb-6">
              <div className="panel p-3">
                <SentencePath sequence={seq} currentIndex={index} doneIndexes={learned} size="md" />
                <SequenceProgressLine value={learned.length} max={seq.length} />
              </div>
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_16rem]">
                <div className="panel space-y-2 p-4">
                  <p className="font-display text-[0.6rem] font-black uppercase tracking-[0.25em] text-muted-foreground">
                    Sign {index + 1} of {seq.length} · “{sentence.englishMeaning}”
                  </p>
                  <div className="flex items-center gap-3">
                    <SignMark signId={token.id} label={token.name} size={72} className="anim-bob" />
                    <p className="font-display text-3xl font-black">{token.name}</p>
                  </div>
                  <p className="text-sm font-semibold">
                    <strong className="font-display uppercase text-target-deep">
                      Hand shape ·{" "}
                    </strong>
                    {token.handShape}
                  </p>
                  <p className="text-sm font-semibold">
                    <strong className="font-display uppercase text-magic">Movement · </strong>
                    {token.movement}
                  </p>
                  {sentence.facialExpression && (
                    <p className="text-sm font-semibold">
                      <strong className="font-display uppercase text-success">Face · </strong>
                      {sentence.facialExpression}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <GameButton tone="success" onClick={() => learnAttempt(true)}>
                      Correct Attempt
                    </GameButton>
                    <GameButton tone="danger" onClick={() => learnAttempt(false)}>
                      Try Again
                    </GameButton>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <GameButton
                      tone="neutral"
                      size="sm"
                      onClick={() => setIndex((i) => Math.max(0, i - 1))}
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden /> Previous Sign
                    </GameButton>
                    <GameButton
                      tone="neutral"
                      size="sm"
                      onClick={() => setIndex((i) => Math.min(seq.length - 1, i + 1))}
                    >
                      Next Sign <ArrowRight className="h-4 w-4" aria-hidden />
                    </GameButton>
                    <GameButton
                      tone="magic"
                      size="sm"
                      className="ml-auto"
                      onClick={() => setMode("overview")}
                    >
                      Back to Quest
                    </GameButton>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Hero state={heroState} className="h-36 w-28" />
                  <CoachBubble message={coach} />
                </div>
              </div>
            </div>
          )}

          {mode === "practice" && (
            <FullSentencePractice
              sentenceId={sentenceId}
              settings={settings}
              onCreditSigns={creditSigns}
              onRecord={onRecord}
              onExit={() => setMode("overview")}
            />
          )}

          {mode === "build" && (
            <SentenceBuilderGame
              sentenceId={sentenceId}
              onDone={(stars) => {
                onRecord(sentenceId, {
                  completed: true,
                  score: 200 + stars * 100,
                  timeMs: 0,
                  orderPct: 100,
                  stars,
                });
                creditSigns(true);
              }}
              onExit={() => setMode("overview")}
            />
          )}

          {mode === "missing" && (
            <MissingSignGame
              sentenceId={sentenceId}
              onDone={(correct) => creditSigns(correct)}
              onExit={() => setMode("overview")}
            />
          )}
        </div>
      </div>
    </Scene>
  );
}

/* ================= Full sentence practice ================= */

function FullSentencePractice({
  sentenceId,
  settings,
  onCreditSigns,
  onRecord,
  onExit,
}: {
  sentenceId: string;
  settings: Settings;
  onCreditSigns: (correct: boolean) => void;
  onRecord: (id: string, r: SentenceSessionResult) => void;
  onExit: () => void;
}) {
  const sentence = sentenceById(sentenceId);
  const seq = sentence.signSequence;
  const [pos, setPos] = useState(-1);
  const [done, setDone] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number[]>([]);
  const [flow, setFlow] = useState(60);
  const [accuracy, setAccuracy] = useState(70);
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<RecogStatus>("framing");
  const [coach, setCoach] = useState("Start when your hands are ready.");
  const [banner, setBanner] = useState<string | null>(null);
  const [slowDemo, setSlowDemo] = useState(false);
  const startedAt = useRef<number>(0);

  const running = pos >= 0;
  const currentSignId = running ? tokenById(seq[pos]).signId : undefined;

  const reset = (announce = true) => {
    setPos(-1);
    setDone([]);
    setWrong([]);
    if (announce) setCoach("Ready when you are — start the sentence again.");
  };

  const start = () => {
    setPos(0);
    setDone([]);
    setWrong([]);
    startedAt.current = Date.now();
    setStatus("hands");
    setCoach(SENTENCE_COACH.flow);
  };

  const finish = useCallback(
    (opts: { completed: boolean; orderPct: number; flowScore: number; message: string }) => {
      const timeMs = startedAt.current ? Date.now() - startedAt.current : 0;
      const stars = sentenceStars({
        completed: opts.completed,
        orderPct: opts.orderPct,
        timeMs,
        signCount: seq.length,
      });
      const score = Math.round(
        (opts.completed ? 300 : 80) + opts.orderPct * 2 + opts.flowScore * 1.5 + stars * 120,
      );
      setBanner(opts.message);
      setTimeout(() => setBanner(null), 1800);
      setAttempts((a) => a + 1);
      onCreditSigns(opts.completed);
      onRecord(sentenceId, {
        completed: opts.completed,
        score,
        timeMs,
        orderPct: opts.orderPct,
        stars,
      });
      setPos(-1);
    },
    [onCreditSigns, onRecord, sentenceId, seq.length],
  );

  const performSign = (measuredConfidence?: number) => {
    if (!running) return;
    setDone((d) => [...d, pos]);
    setFlow((f) => Math.min(100, f + 10));
    setAccuracy((a) => measuredConfidence ?? Math.min(100, a + 6));
    setStatus("accepted");
    if (pos >= seq.length - 1) {
      setCoach(pick(SENTENCE_FEEDBACK.perfect));
      finish({
        completed: true,
        orderPct: 100,
        flowScore: 90,
        message: pick(SENTENCE_FEEDBACK.perfect),
      });
    } else {
      setPos(pos + 1);
      setCoach(pick([SENTENCE_COACH.next, SENTENCE_COACH.smooth]));
    }
  };

  /* hidden prototype simulation controls */
  const sim = {
    perfect: () => {
      setDone(seq.map((_, i) => i));
      setFlow(96);
      setAccuracy(97);
      finish({ completed: true, orderPct: 100, flowScore: 96, message: "PERFECT SEQUENCE!" });
    },
    oneMistake: () => {
      setDone(seq.map((_, i) => i).slice(0, -1));
      setFlow(74);
      setAccuracy(80);
      setCoach(SENTENCE_FEEDBACK.minor[0]);
      finish({ completed: true, orderPct: 85, flowScore: 70, message: "GREAT FLOW!" });
    },
    wrongOrder: () => {
      setWrong([0, Math.min(1, seq.length - 1)]);
      setFlow((f) => Math.max(10, f - 25));
      setAccuracy((a) => Math.max(20, a - 18));
      setCoach(pick(SENTENCE_FEEDBACK.order));
      setTimeout(() => setWrong([]), 700);
      finish({ completed: false, orderPct: 45, flowScore: 30, message: "CHECK THE ORDER" });
    },
    tooSlow: () => {
      setFlow((f) => Math.max(8, f - 30));
      setCoach(pick(SENTENCE_FEEDBACK.slow));
      finish({ completed: false, orderPct: 70, flowScore: 20, message: "KEEP THE FLOW" });
    },
    skipSign: () => {
      setCoach(SENTENCE_FEEDBACK.minor[0]);
      finish({ completed: false, orderPct: 60, flowScore: 45, message: "ONE SIGN MISSING" });
    },
    restart: () => reset(),
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-3 pb-6">
      {banner && (
        <FloatingText
          text={banner}
          tone="success"
          style={{ left: "50%", top: "18%", transform: "translateX(-50%)" }}
        />
      )}
      <div className="panel space-y-2 p-3 text-center">
        <p className="font-display text-[0.6rem] font-black uppercase tracking-[0.25em] text-muted-foreground">
          Full sentence practice
        </p>
        <p className="font-display text-xl font-black sm:text-3xl">“{sentence.englishMeaning}”</p>
        <SentencePath
          sequence={seq}
          currentIndex={running ? pos : undefined}
          doneIndexes={done}
          wrongIndexes={wrong}
          size="md"
        />
        <SequenceProgressLine value={done.length} max={seq.length} />
      </div>

      <div className={cn("grid gap-3", cameraGridSizeClass[settings.cameraSize])}>
        {settings.inputMode === "camera" ? (
          <div className="space-y-2">
            <LiveCamera
              targets={currentSignId ? [currentSignId] : []}
              active={running && !!currentSignId}
              showConfidence={settings.showConfidence}
              onResult={(result) => performSign(Math.round(result.confidence * 100))}
              onError={() => setStatus("nohands")}
            />
            <SignReferenceCard
              signId={currentSignId}
              size={settings.exampleSize}
              className={cn("mx-auto", signExampleSizeClass[settings.exampleSize])}
            />
          </div>
        ) : (
          <div className="panel grid min-h-48 place-items-center p-4 text-center">
            <p className="font-display text-sm font-black uppercase text-muted-foreground">
              Keyboard practice controls
            </p>
          </div>
        )}
        <div className="space-y-2">
          <CoachBubble message={coach} />
          <Meter value={flow} label="Flow / rhythm" tone="magic" />
          <Meter value={accuracy} label="Accuracy" tone={accuracy > 65 ? "success" : "target"} />
          <div className="flex flex-wrap gap-2">
            <HudChip label="Attempts" value={attempts} />
            <HudChip
              label="Position"
              value={running ? `${pos + 1}/${seq.length}` : "—"}
              tone="target"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <GameButton tone="play" onClick={start}>
              Start Sentence
            </GameButton>
            {settings.inputMode === "keyboard" ? (
              <GameButton tone="success" disabled={!running} onClick={() => performSign()}>
                Perform Sign
              </GameButton>
            ) : (
              <span className="hud-chip self-center text-xs">Show each sign to camera</span>
            )}
            <GameButton tone="danger" onClick={() => reset()}>
              Try Again
            </GameButton>
            <GameButton
              tone="neutral"
              aria-pressed={slowDemo}
              onClick={() => {
                setSlowDemo(true);
                setCoach("Watch the slow demonstration, then copy the rhythm.");
                setTimeout(() => setSlowDemo(false), 2600);
              }}
            >
              {slowDemo ? "Demonstrating…" : "Slow Demonstration"}
            </GameButton>
            <GameButton tone="magic" className="ml-auto" onClick={onExit}>
              Back to Quest
            </GameButton>
          </div>
          <div className="pt-1">
            <DevPanel
              title="Prototype controls"
              actions={[
                { label: "Complete Correctly", onClick: sim.perfect },
                { label: "One Mistake", onClick: sim.oneMistake },
                { label: "Wrong Sign Order", onClick: sim.wrongOrder },
                { label: "Too Slow", onClick: sim.tooSlow },
                { label: "Skip Sign", onClick: sim.skipSign },
                { label: "Restart Attempt", onClick: sim.restart },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= Sentence builder mini-game ================= */

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function SentenceBuilderGame({
  sentenceId,
  onDone,
  onExit,
}: {
  sentenceId: string;
  onDone: (stars: number) => void;
  onExit: () => void;
}) {
  const sentence = sentenceById(sentenceId);
  const seq = sentence.signSequence;
  const [pool, setPool] = useState<string[]>(() => shuffle(seq.map((_, i) => String(i))));
  const [slots, setSlots] = useState<(string | null)[]>(() => seq.map(() => null));
  const [badSlots, setBadSlots] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [tries, setTries] = useState(0);

  const place = (key: string) => {
    const slot = slots.findIndex((s) => s === null);
    if (slot < 0 || solved) return;
    setSlots((s) => s.map((v, i) => (i === slot ? key : v)));
    setPool((p) => p.filter((k) => k !== key));
  };
  const takeBack = (i: number) => {
    const key = slots[i];
    if (!key || solved) return;
    setSlots((s) => s.map((v, idx) => (idx === i ? null : v)));
    setPool((p) => [...p, key]);
  };
  const resetGame = () => {
    setPool(shuffle(seq.map((_, i) => String(i))));
    setSlots(seq.map(() => null));
    setBadSlots([]);
    setSolved(false);
    setFeedback(null);
  };

  const check = () => {
    if (slots.some((s) => s === null)) {
      setFeedback("Fill every slot before checking the order.");
      return;
    }
    const bad = slots.map((s, i) => (Number(s) === i ? -1 : i)).filter((i) => i >= 0);
    setTries((t) => t + 1);
    if (bad.length === 0) {
      setSolved(true);
      setFeedback(null);
      onDone(tries === 0 ? 3 : tries === 1 ? 2 : 1);
    } else {
      setBadSlots(bad);
      setFeedback("That order is not correct yet. Rearrange the highlighted signs and try again.");
      setTimeout(() => setBadSlots([]), 700);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-3 pb-6">
      <div className="panel space-y-1 p-3 text-center">
        <p className="font-display text-[0.6rem] font-black uppercase tracking-[0.25em] text-muted-foreground">
          Build the sign sequence
        </p>
        <p className="font-display text-xl font-black sm:text-3xl">“{sentence.englishMeaning}”</p>
      </div>

      <div className="panel flex flex-wrap items-center justify-center gap-2 p-3">
        {slots.map((key, i) => (
          <div key={i} className="flex items-center gap-1">
            {key === null ? (
              <span className="grid h-[6.5rem] min-w-[6rem] place-items-center rounded-xl border-[3px] border-dashed border-cream/80 bg-ink/25 font-display text-2xl font-black text-cream/70">
                {i + 1}
              </span>
            ) : (
              <SignToken
                tokenId={seq[Number(key)]}
                state={badSlots.includes(i) ? "wrong" : solved ? "done" : "current"}
                className={solved ? "anim-pop" : ""}
                onClick={() => takeBack(i)}
              />
            )}
            {i < slots.length - 1 && (
              <span aria-hidden className="font-display text-2xl font-black text-cream">
                →
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="panel flex flex-wrap justify-center gap-2 p-3">
        {pool.length === 0 ? (
          <p className="font-display text-sm font-black uppercase tracking-widest text-muted-foreground">
            All tokens placed
          </p>
        ) : (
          pool.map((key) => (
            <SignToken key={key} tokenId={seq[Number(key)]} onClick={() => place(key)} />
          ))
        )}
      </div>

      {feedback && <p className="panel p-2 text-center text-sm font-bold">{feedback}</p>}

      {solved && (
        <div className="flex flex-col items-center gap-2">
          <p className="font-display text-3xl font-black text-target text-outline anim-pop">
            SENTENCE COMPLETE!
          </p>
          <Hero state="victory" className="h-32 w-24" />
          <Stars n={tries <= 1 ? 3 : 2} size={24} />
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        <GameButton tone="play" onClick={check} disabled={solved}>
          Check Order
        </GameButton>
        <GameButton tone="neutral" onClick={resetGame}>
          Reset
        </GameButton>
        <GameButton tone="neutral" onClick={onExit}>
          Back to Quest
        </GameButton>
      </div>
    </div>
  );
}

/* ================= Missing sign mini-game ================= */

function MissingSignGame({
  sentenceId,
  onDone,
  onExit,
}: {
  sentenceId: string;
  onDone: (correct: boolean) => void;
  onExit: () => void;
}) {
  const sentence = sentenceById(sentenceId);
  const seq = sentence.signSequence;
  const [round, setRound] = useState(0);
  const missingIndex = useMemo(
    () => Math.floor(Math.random() * seq.length),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round, sentenceId],
  );
  const choices = useMemo(() => {
    const distractors = SIGNS.map((sign) => sign.id)
      .filter((id) => !seq.includes(id))
      .slice(0, 2);
    return shuffle([seq[missingIndex], ...distractors]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missingIndex, sentenceId]);
  const [picked, setPicked] = useState<string | null>(null);

  const correct = picked === seq[missingIndex];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-3 pb-6">
      <div className="panel space-y-1 p-3 text-center">
        <p className="font-display text-[0.6rem] font-black uppercase tracking-[0.25em] text-muted-foreground">
          Which sign escaped the sequence?
        </p>
        <p className="font-display text-xl font-black sm:text-3xl">“{sentence.englishMeaning}”</p>
      </div>

      <div className="panel flex flex-wrap items-center justify-center gap-2 p-3">
        {seq.map((id, i) => (
          <div key={i} className="flex items-center gap-1">
            {i === missingIndex && !(picked && correct) ? (
              <span className="grid h-[6.5rem] min-w-[6rem] place-items-center rounded-xl border-[3px] border-dashed border-target bg-target/20 font-display text-3xl font-black text-cream anim-target">
                ?
              </span>
            ) : (
              <SignToken tokenId={id} state={i === missingIndex ? "done" : "todo"} />
            )}
            {i < seq.length - 1 && (
              <span aria-hidden className="font-display text-2xl font-black text-cream">
                →
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {choices.map((c) => (
          <SignToken
            key={c}
            tokenId={c}
            size="lg"
            state={picked === c ? (correct ? "done" : "wrong") : "todo"}
            onClick={() => {
              setPicked(c);
              onDone(c === seq[missingIndex]);
            }}
          />
        ))}
      </div>

      {picked && (
        <p
          className={cn(
            "text-center font-display text-2xl font-black text-outline",
            correct ? "text-success" : "text-danger",
          )}
        >
          {correct ? "PERFECT SEQUENCE!" : "Almost — check the order and try again."}
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        <GameButton
          tone="play"
          onClick={() => {
            setPicked(null);
            setRound((r) => r + 1);
          }}
        >
          Next Round
        </GameButton>
        <GameButton tone="neutral" onClick={onExit}>
          Back to Quest
        </GameButton>
      </div>
    </div>
  );
}
