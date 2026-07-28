import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera, Keyboard, Gauge, Swords, Users, Library, Settings as SettingsIcon, Play, Zap,
  Heart, Search, Trophy, ArrowLeft, ArrowRight, RefreshCw, Home, Sparkles, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SkyScene, Crystal, Portal } from "@/components/game/SkyScene";
import { CharacterSprite, CoachBubble, AvatarBadge } from "@/components/game/Characters";
import { EnemyCreature } from "@/components/game/EnemyCreature";
import { GameButton, GameOverlay, IconButton, BackButton, ChoiceTile, Stars, Meter } from "@/components/game/ui";
import { GameHUD, PowerUpBar, AttackMeter, DemoControls } from "@/components/game/Hud";
import { CameraPrototype, KeyboardInput, RecognitionStatus, type RecogStatus } from "@/components/game/Input";
import { SignReference, SignCollectionItem, SentenceSequence, QuestTile } from "@/components/game/Signs";
import { SettingsOverlay } from "@/components/game/SettingsOverlay";
import { useStore } from "@/game/store";
import { useBattle } from "@/game/useBattle";
import { ACHIEVEMENTS, COACH, OPPONENTS, SENTENCES, SGSL_REVIEW_NOTE, SIGNS, DIFFICULTY_CONFIG } from "@/game/data";
import type { Difficulty, InputStyle, LearningType, MultiResult, SingleResult } from "@/game/types";

type Scene =
  | "splash" | "menu" | "sp-setup" | "sp-game" | "sp-results"
  | "mp-setup" | "matchmaking" | "mp-battle" | "mp-results" | "local-vs"
  | "library" | "sign-detail" | "sentence-detail";

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export function Game() {
  const store = useStore();
  const [scene, setScene] = useState<Scene>("splash");
  const [showSettings, setShowSettings] = useState(false);
  const [input, setInput] = useState<InputStyle>("camera");
  const [learning, setLearning] = useState<LearningType>("words");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [mpMode, setMpMode] = useState<"normal" | "hard">("normal");
  const [opponent, setOpponent] = useState(OPPONENTS[0]);
  const [spResult, setSpResult] = useState<SingleResult | null>(null);
  const [mpResult, setMpResult] = useState<MultiResult | null>(null);
  const [signId, setSignId] = useState(SIGNS[0].id);
  const [sentenceId, setSentenceId] = useState(SENTENCES[0].id);

  useEffect(() => {
    if (!store.hydrated) return;
    setInput(store.settings.inputStyle);
    setDifficulty(store.settings.difficulty);
  }, [store.hydrated, store.settings.inputStyle, store.settings.difficulty]);

  const finishSingle = (r: SingleResult) => {
    setSpResult(r);
    store.setProgress({
      bestScore: Math.max(store.progress.bestScore, r.score),
      recentResult: r,
      level: Math.max(store.progress.level, 1 + Math.floor(r.score / 800)),
      lastDifficulty: difficulty,
    });
    if (r.bestCombo >= 10) store.unlock("combo-10");
    setScene("sp-results");
  };

  const finishMulti = (r: MultiResult) => {
    setMpResult(r);
    store.setProgress({ bestScore: Math.max(store.progress.bestScore, r.playerScore) });
    setScene("mp-results");
  };

  return (
    <div key={scene} className="sg-fade-up">
      {scene === "splash" && <Splash onStart={() => setScene("menu")} />}
      {scene === "menu" && (
        <Menu
          onPlay={() => setScene("sp-setup")}
          onMulti={() => setScene("mp-setup")}
          onLibrary={() => setScene("library")}
          onSettings={() => setShowSettings(true)}
        />
      )}
      {scene === "sp-setup" && (
        <>
          <Menu onPlay={() => {}} onMulti={() => {}} onLibrary={() => {}} onSettings={() => {}} />
          <SetupOverlay
            input={input} setInput={setInput}
            learning={learning} setLearning={setLearning}
            difficulty={difficulty} setDifficulty={setDifficulty}
            onClose={() => setScene("menu")}
            onStart={() => setScene("sp-game")}
          />
        </>
      )}
      {scene === "sp-game" && (
        <BattleScene
          mode="single" input={input} learning={learning} difficulty={difficulty}
          onQuit={() => setScene("menu")} onFinish={finishSingle}
        />
      )}
      {scene === "sp-results" && spResult && (
        <SingleResults
          result={spResult}
          onAgain={() => setScene("sp-game")}
          onPractise={() => setScene("library")}
          onLibrary={() => setScene("library")}
          onMenu={() => setScene("menu")}
        />
      )}
      {scene === "mp-setup" && (
        <MultiSetup
          mpMode={mpMode} setMpMode={setMpMode}
          onBack={() => setScene("menu")}
          onQuick={() => setScene("matchmaking")}
          onLocal={() => setScene("local-vs")}
        />
      )}
      {scene === "matchmaking" && (
        <Matchmaking
          onCancel={() => setScene("mp-setup")}
          onFound={(o) => { setOpponent(o); setScene("mp-battle"); }}
        />
      )}
      {scene === "mp-battle" && (
        <BattleScene
          mode={mpMode} input={input} learning="words" difficulty={mpMode === "hard" ? "hard" : "normal"}
          opponent={opponent} onQuit={() => setScene("menu")}
          onFinishMulti={finishMulti} onFinish={() => {}}
        />
      )}
      {scene === "local-vs" && (
        <LocalVersus input={input} onBack={() => setScene("mp-setup")} onFinish={finishMulti} />
      )}
      {scene === "mp-results" && mpResult && (
        <MultiResults
          result={mpResult}
          onRematch={() => setScene(mpResult.mode === "local" ? "local-vs" : "mp-battle")}
          onChange={() => setScene("mp-setup")}
          onLibrary={() => setScene("library")}
          onMenu={() => setScene("menu")}
        />
      )}
      {scene === "library" && (
        <SignLibrary
          onBack={() => setScene("menu")}
          onSign={(id) => { setSignId(id); setScene("sign-detail"); }}
          onSentence={(id) => { setSentenceId(id); setScene("sentence-detail"); }}
        />
      )}
      {scene === "sign-detail" && (
        <SignDetail id={signId} setId={setSignId} onBack={() => setScene("library")} />
      )}
      {scene === "sentence-detail" && (
        <SentenceDetail id={sentenceId} onBack={() => setScene("library")} />
      )}

      {showSettings && <SettingsOverlay onClose={() => setShowSettings(false)} />}
      <AchievementToasts />
    </div>
  );
}

/* ---------------- Achievements ---------------- */
function AchievementToasts() {
  const { toasts } = useStore();
  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed top-3 left-1/2 z-[60] flex -translate-x-1/2 flex-col gap-2">
      {toasts.map((id, i) => {
        const a = ACHIEVEMENTS.find((x) => x.id === id);
        if (!a) return null;
        return (
          <div key={`${id}-${i}`} className="sg-panel sg-pop flex items-center gap-2 px-4 py-2">
            <Sparkles className="text-target h-5 w-5" aria-hidden />
            <div>
              <p className="font-display text-ink text-sm font-black">{a.name} unlocked!</p>
              <p className="text-muted-foreground text-[11px]">{a.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Splash ---------------- */
function Splash({ onStart }: { onStart: () => void }) {
  return (
    <SkyScene>
      <button
        onClick={onStart}
        className="flex min-h-dvh w-full flex-col items-center justify-center gap-4 px-6 text-center"
        aria-label="Press to start Sign Game"
      >
        <div className="relative flex items-end gap-3">
          <EnemySilhouette className="h-16 w-16 opacity-50" />
          <div>
            <h1 className="font-display text-ink text-5xl font-black drop-shadow-sm sm:text-7xl">
              SIGN<span className="text-magic">GAME</span>
            </h1>
            <p className="text-ink/70 font-display text-sm font-bold sm:text-lg">Sign fast. Save the words.</p>
          </div>
          <EnemySilhouette className="h-12 w-12 opacity-40" />
        </div>
        <CharacterSprite pose="ready" hue={300} className="h-52 w-52" name="Kai the sign guardian" />
        <span className="sg-hud-chip animate-pulse px-6 py-3 text-lg">Press to Start</span>
      </button>
    </SkyScene>
  );
}

function EnemySilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 96" className={cn("sg-float text-ink", className)} aria-hidden>
      <circle cx="50" cy="50" r="34" fill="currentColor" />
      <circle cx="40" cy="44" r="6" fill="oklch(0.95 0.02 268)" />
      <circle cx="62" cy="44" r="6" fill="oklch(0.95 0.02 268)" />
    </svg>
  );
}

/* ---------------- Menu ---------------- */
function Menu({ onPlay, onMulti, onLibrary, onSettings }: Record<"onPlay" | "onMulti" | "onLibrary" | "onSettings", () => void>) {
  const { progress } = useStore();
  return (
    <SkyScene>
      <div className="relative flex min-h-dvh flex-col items-center justify-center gap-5 px-5 py-10">
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <span className="sg-hud-chip text-xs"><Trophy className="text-target h-3.5 w-3.5" aria-hidden />Best {progress.bestScore}</span>
          <IconButton label="Settings" onClick={onSettings}><SettingsIcon className="h-5 w-5" aria-hidden /></IconButton>
        </div>
        <h1 className="font-display text-ink text-4xl font-black sm:text-6xl">
          SIGN<span className="text-magic">GAME</span>
        </h1>
        <CharacterSprite pose="celebrate" hue={300} className="h-44 w-44" />
        <div className="flex w-full max-w-xs flex-col gap-3">
          <GameButton size="xl" variant="target" onClick={onPlay} icon={<Play className="h-6 w-6" />}>PLAY</GameButton>
          <GameButton variant="magic" size="lg" onClick={onMulti} icon={<Users className="h-5 w-5" />}>Multiplayer</GameButton>
          <GameButton variant="ghost" size="lg" onClick={onLibrary} icon={<Library className="h-5 w-5" />}>Sign Library</GameButton>
        </div>
        <p className="text-ink/70 text-xs font-bold">Level {progress.level} · {progress.streak} day streak</p>
      </div>
    </SkyScene>
  );
}

/* ---------------- Setup ---------------- */
function SetupOverlay(p: {
  input: InputStyle; setInput: (v: InputStyle) => void;
  learning: LearningType; setLearning: (v: LearningType) => void;
  difficulty: Difficulty; setDifficulty: (v: Difficulty) => void;
  onClose: () => void; onStart: () => void;
}) {
  return (
    <GameOverlay title="Prepare your hands" subtitle="Choose how you want to play" onClose={p.onClose}>
      <div className="space-y-4">
        <Field label="Input style">
          <ChoiceTile selected={p.input === "camera"} onClick={() => p.setInput("camera")} title="Camera Prototype" hint="Simulated only" icon={<Camera />} />
          <ChoiceTile selected={p.input === "keyboard"} onClick={() => p.setInput("keyboard")} title="Keyboard Demo" hint="Type the sign" icon={<Keyboard />} />
        </Field>
        <Field label="Learning type">
          <ChoiceTile selected={p.learning === "words"} onClick={() => p.setLearning("words")} title="Word Battle" icon={<Swords />} />
          <ChoiceTile selected={p.learning === "sentences"} onClick={() => p.setLearning("sentences")} title="Sentence Quest" icon={<Sparkles />} />
        </Field>
        <Field label="Difficulty">
          {(["easy", "normal", "hard"] as Difficulty[]).map((d) => (
            <ChoiceTile key={d} selected={p.difficulty === d} onClick={() => p.setDifficulty(d)} title={DIFFICULTY_CONFIG[d].label} icon={<Gauge />} />
          ))}
        </Field>
        <GameButton size="lg" variant="target" className="w-full" onClick={p.onStart}>START</GameButton>
      </div>
    </GameOverlay>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-muted-foreground mb-1.5 text-[11px] font-bold tracking-wide uppercase">{label}</p>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

/* ---------------- Battle Scene (single + multiplayer) ---------------- */
function BattleScene({
  mode, input, learning, difficulty, opponent, onQuit, onFinish, onFinishMulti, roundSeconds = 90, localLabel,
}: {
  mode: "single" | "normal" | "hard" | "local";
  input: InputStyle;
  learning: LearningType;
  difficulty: Difficulty;
  opponent?: (typeof OPPONENTS)[number];
  onQuit: () => void;
  onFinish: (r: SingleResult) => void;
  onFinishMulti?: (r: MultiResult) => void;
  roundSeconds?: number;
  localLabel?: string;
}) {
  const { settings, progress, unlock } = useStore();
  const [paused, setPaused] = useState(false);
  const [hint, setHint] = useState(false);
  const [time, setTime] = useState(0);
  const [status, setStatus] = useState<RecogStatus>("move-into-frame");
  const [coach, setCoach] = useState<string | null>(COACH.intro[0]);
  const [attack, setAttack] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [oppCombo, setOppCombo] = useState(0);
  const [incoming, setIncoming] = useState(0);
  const [attacksSent, setAttacksSent] = useState(0);
  const [attacksReceived, setAttacksReceived] = useState(0);
  const [defences, setDefences] = useState(0);
  const [banner, setBanner] = useState<string | null>(null);
  const [flyAttack, setFlyAttack] = useState(false);
  const [comeback, setComeback] = useState(false);
  const [bestSpeed, setBestSpeed] = useState("—");
  const [cleanClears, setCleanClears] = useState(0);
  const started = useRef(Date.now());
  const isMulti = mode === "normal" || mode === "hard";

  const battle = useBattle({
    difficulty, mode: learning, running: !paused,
    onGameOver: () => end(),
    onCorrect: (ms, combo) => {
      const speed = ms < 2000 ? "Perfect Speed" : ms < 4000 ? "Fast" : ms < 6000 ? "Good" : "—";
      if (speed !== "—") setBestSpeed((b) => (b === "Perfect Speed" ? b : speed));
      if (mode === "hard") {
        setAttack((a) => Math.min(100, a + 12 + (ms < 2000 ? 12 : ms < 4000 ? 6 : 0) + combo));
        if ([3, 5, 8, 12].includes(combo)) sendAttack(combo);
      }
      if (incoming > 0) {
        setIncoming((n) => Math.max(0, n - 1));
        setCleanClears((c) => c + 1);
        setDefences((d) => d + 1);
        if (incoming === 1) { setBanner("PERFECT DEFENCE!"); unlock("perfect-defence"); }
      }
      if (settings.coachMessages && combo % 4 === 0) setCoach(pick(COACH.correct));
    },
    onMiss: () => settings.coachMessages && setCoach(pick(COACH.miss)),
  });

  const activeWord = battle.active?.word ?? "";
  const activeSign = SIGNS.find((s) => s.name.toUpperCase() === activeWord);

  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(() => setTime((v) => v + 1), 1000);
    return () => window.clearInterval(t);
  }, [paused]);

  useEffect(() => {
    if (!isMulti && mode !== "local") return;
    if (time >= roundSeconds) end();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time]);

  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(() => setBanner(null), 1400);
    return () => window.clearTimeout(t);
  }, [banner]);

  /* simulated opponent */
  useEffect(() => {
    if (!isMulti || paused) return;
    const t = window.setInterval(() => {
      const good = Math.random() > 0.28;
      if (good) {
        setOppCombo((c) => {
          const n = c + 1;
          if (mode === "hard" && [4, 7, 10].includes(n)) receiveAttack(n >= 10 ? 3 : n >= 7 ? 2 : 1);
          return n;
        });
        setOppScore((s) => s + 90 + Math.floor(Math.random() * 80));
      } else {
        setOppCombo(0);
      }
    }, 2300);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMulti, paused, mode]);

  /* comeback boost */
  useEffect(() => {
    if (!isMulti || comeback) return;
    if (oppScore > battle.score + 900) {
      setComeback(true);
      battle.grantShield();
      setBanner("COMEBACK BOOST!");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oppScore, battle.score]);

  function sendAttack(combo: number) {
    const count = combo >= 12 ? 4 : combo >= 8 ? 3 : combo >= 5 ? 2 : 1;
    const name = combo >= 12 ? "COMMUNICATION BURST!" : combo >= 8 ? "SIGN STORM!" : combo >= 5 ? "COMBO STRIKE!" : "WORD ATTACK!";
    setBanner(name);
    setAttacksSent((n) => n + count);
    setAttack(0);
    setFlyAttack(true);
    window.setTimeout(() => setFlyAttack(false), 800);
    setOppScore((s) => Math.max(0, s - count * 40));
  }

  function receiveAttack(count: number) {
    if (time < 8) return;
    setBanner(count > 2 ? "SIGN STORM INCOMING!" : `${count} ENEMIES INCOMING!`);
    if (settings.coachMessages) setCoach(pick(COACH.attack));
    setIncoming((n) => n + count);
    setAttacksReceived((n) => n + count);
    window.setTimeout(() => battle.addEnemies(count, count > 2 ? ["basic", "basic", "shield"] : ["basic", "basic"]), 900);
  }

  function end() {
    const duration = Math.round((Date.now() - started.current) / 1000);
    if (isMulti || mode === "local") {
      onFinishMulti?.({
        outcome: battle.score > oppScore ? "victory" : battle.score < oppScore ? "defeat" : "draw",
        playerScore: battle.score, opponentScore: oppScore,
        accuracy: battle.accuracy, opponentAccuracy: 60 + Math.floor(Math.random() * 30),
        bestCombo: battle.bestCombo, opponentCombo: oppCombo,
        attacksSent, attacksReceived, defences, bestSpeed,
        opponent: opponent?.name ?? "Player Two", mode: mode === "local" ? "local" : mode,
      });
      return;
    }
    onFinish({
      score: battle.score,
      stars: battle.score > 2500 ? 3 : battle.score > 1200 ? 2 : 1,
      accuracy: battle.accuracy, bestCombo: battle.bestCombo,
      defeated: battle.defeated, missed: battle.missed,
      sentences: battle.sentencesDone, hints: battle.hintsUsed,
      duration, mode: learning,
    });
  }

  const cfg = DIFFICULTY_CONFIG[difficulty];

  return (
    <SkyScene variant="arena" className={cn(battle.shake && "sg-shake")}>
      <div className="relative flex min-h-dvh flex-col">
        <GameHUD
          score={battle.score} combo={battle.combo} lives={battle.lives} maxLives={cfg.lives}
          wave={battle.wave} time={time} onPause={() => setPaused(true)} onHint={() => { setHint(true); battle.useHint(); }}
        />

        {isMulti && opponent && (
          <div className="sg-panel absolute top-16 left-1/2 z-30 flex w-[min(94%,540px)] -translate-x-1/2 items-center gap-3 px-3 py-2 sm:top-20">
            <AvatarBadge name={opponent.name} hue={opponent.hue} label="Simulated Opponent" size="sm" pose={oppCombo > 3 ? "celebrate" : "ready"} />
            <div className="min-w-0 flex-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span>{opponent.name} · x{oppCombo}</span><span>{oppScore}</span>
              </div>
              <Meter value={Math.min(100, oppScore / 40)} tone="danger" />
            </div>
            <span className="sg-hud-chip px-2 py-0.5 text-[10px]">VS {Math.max(0, roundSeconds - time)}s</span>
          </div>
        )}

        {banner && (
          <p className="font-display text-target sg-pop pointer-events-none absolute top-1/3 left-1/2 z-40 -translate-x-1/2 text-2xl font-black drop-shadow sm:text-4xl">
            {banner}
          </p>
        )}
        {flyAttack && (
          <div className="pointer-events-none absolute top-1/2 left-0 z-30" style={{ animation: "sg-attack-fly 0.8s ease-in" }} aria-hidden>
            <Portal className="h-12 w-28" />
          </div>
        )}

        {/* play field */}
        <div className="relative mt-28 min-h-72 flex-1 sm:mt-32">
          {incoming > 0 && <Portal className="absolute top-0 left-1/2 h-10 w-40 -translate-x-1/2" tone="danger" />}
          {battle.enemies.map((e) => (
            <div key={e.id} className="absolute transition-[top] duration-100" style={{ top: `${e.progress}%`, left: `${8 + e.lane * 22}%` }}>
              <EnemyCreature enemy={e} active={battle.active?.id === e.id} />
            </div>
          ))}
          {battle.popups.map((p) => (
            <span key={p.id} className={cn("font-display pointer-events-none absolute text-lg font-black", p.tone === "good" ? "text-success" : p.tone === "bad" ? "text-danger" : "text-magic")}
              style={{ top: `${p.top}%`, left: `${10 + p.lane * 22}%`, animation: "sg-score-pop 1.1s ease-out forwards" }}>
              {p.text}
            </span>
          ))}
        </div>

        {/* protection zone + crystal + character */}
        <div className={cn("relative flex items-end justify-center gap-2 border-t-4 border-dashed px-3 pt-2", battle.zoneFlash ? "border-danger bg-danger/15" : "border-success/60 bg-success/5")}>
          <CharacterSprite pose={battle.charState} hue={300} className={cn("h-24 w-24 sm:h-32 sm:w-32", settings.leftHanded && "scale-x-[-1]")} />
          <Crystal flash={battle.zoneFlash} className="h-20 w-14 sm:h-28 sm:w-20" />
          {settings.coachMessages && <CoachBubble message={coach} compact className="hidden sm:flex" />}
        </div>

        {/* input area */}
        <div className="relative z-20 grid gap-2 p-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-4">
          <div>
            {input === "keyboard" ? (
              <KeyboardInput
                target={activeWord} status={status} confidence={battle.confidence}
                showConfidence={settings.showConfidence}
                onResult={(ok) => { setStatus(ok ? "accepted" : "try-again"); ok ? battle.correct() : battle.incorrect(); }}
              />
            ) : (
              <div className="flex items-start gap-3">
                <CameraPrototype status={status} confidence={battle.confidence} showConfidence={settings.showConfidence} className="w-40 shrink-0 sm:w-56" />
                <div className="flex-1 space-y-2">
                  <p className="text-muted-foreground text-[11px] font-bold uppercase">Sign this word</p>
                  <p className="font-display text-target text-2xl font-black">{activeWord || "—"}</p>
                  <div className="flex flex-wrap gap-2">
                    <GameButton variant="success" size="sm" onClick={() => { setStatus("accepted"); battle.correct(); }}>Correct Sign</GameButton>
                    <GameButton variant="danger" size="sm" onClick={() => { setStatus("try-again"); battle.incorrect(); }}>Incorrect</GameButton>
                    <GameButton variant="ghost" size="sm" onClick={() => { setStatus("checking"); battle.uncertain(); }}>Uncertain</GameButton>
                  </div>
                </div>
              </div>
            )}
            {battle.active && battle.active.sequence.length > 1 && (
              <div className="sg-panel mt-2 p-2">
                <p className="text-muted-foreground text-[11px] font-bold uppercase">{battle.active.meaning}</p>
                <SentenceSequence sequence={battle.active.sequence} activeIndex={battle.active.stage} size="sm" />
                <Meter value={(battle.active.stage / battle.active.sequence.length) * 100} tone="success" />
              </div>
            )}
          </div>
          <div className="flex flex-col justify-end gap-2">
            {mode === "hard" && <AttackMeter value={attack} incoming={incoming} />}
            <PowerUpBar shield={battle.shield} slowActive={battle.slowActive} onShield={battle.grantShield} onSlow={battle.slowTime} onHint={() => { setHint(true); battle.useHint(); }} />
          </div>
        </div>

        <DemoControls
          actions={
            mode === "hard"
              ? [
                  { label: "Player Fast Clear", onClick: battle.fastClear },
                  { label: "Add Combo", onClick: () => battle.correct() },
                  { label: "Fill Attack Meter", onClick: () => setAttack(100) },
                  { label: "Trigger Player Attack", onClick: () => sendAttack(8) },
                  { label: "Trigger Opponent Attack", onClick: () => receiveAttack(2) },
                  { label: "Clear Incoming Wave", onClick: () => { setIncoming(0); setDefences((d) => d + 1); setBanner("PERFECT DEFENCE!"); } },
                  { label: "Comeback Boost", onClick: () => { setComeback(true); setBanner("COMEBACK BOOST!"); } },
                  { label: "End Match", onClick: end },
                ]
              : [
                  { label: "Correct Sign", onClick: () => battle.correct() },
                  { label: "Incorrect Sign", onClick: battle.incorrect },
                  { label: "Uncertain", onClick: battle.uncertain },
                  { label: "Miss Enemy", onClick: battle.missActive },
                  { label: "Fast Clear", onClick: battle.fastClear },
                  { label: "End Game", onClick: end },
                ]
          }
        />
      </div>

      {paused && (
        <GameOverlay title="Paused" subtitle={localLabel ?? "Take a breath"} onClose={() => setPaused(false)}>
          <div className="flex flex-col gap-2">
            <GameButton variant="success" onClick={() => setPaused(false)}>Resume</GameButton>
            <GameButton variant="ghost" onClick={() => setHint(true)}>Show hint</GameButton>
            <GameButton variant="danger" onClick={end}>End round</GameButton>
            <GameButton variant="ghost" onClick={onQuit}>Quit to menu</GameButton>
          </div>
        </GameOverlay>
      )}

      {hint && (
        <GameOverlay title={`Hint · ${activeWord || "Sign"}`} onClose={() => setHint(false)}>
          {activeSign ? (
            <div className="flex gap-3">
              <SignReference sign={activeSign} />
              <div className="space-y-1 text-sm">
                <p><strong>Hand shape:</strong> {activeSign.handShape}</p>
                <p><strong>Movement:</strong> {activeSign.movement}</p>
                <p className="text-danger"><strong>Watch out:</strong> {activeSign.commonMistake}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm">{SGSL_REVIEW_NOTE}</p>
          )}
        </GameOverlay>
      )}
      <p className="sr-only" aria-live="polite">{battle.feedback?.text}</p>
      {comeback && <span className="sr-only">Comeback boost active</span>}
      <span className="sr-only">{RecognitionLabel(status)}</span>
    </SkyScene>
  );
}

function RecognitionLabel(s: RecogStatus) { return s.replace(/-/g, " "); }

/* ---------------- Multiplayer setup + matchmaking ---------------- */
function MultiSetup({ mpMode, setMpMode, onBack, onQuick, onLocal }: {
  mpMode: "normal" | "hard"; setMpMode: (m: "normal" | "hard") => void;
  onBack: () => void; onQuick: () => void; onLocal: () => void;
}) {
  return (
    <SkyScene variant="portal">
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-5">
        <div className="absolute top-3 left-3"><BackButton onClick={onBack} /></div>
        <h2 className="font-display text-ink text-3xl font-black">Choose your battle</h2>
        <div className="sg-panel w-full max-w-md space-y-4 p-5">
          <Field label="Battle mode">
            <ChoiceTile selected={mpMode === "normal"} onClick={() => setMpMode("normal")} title="Normal Battle" hint="Score race" icon={<Swords />} />
            <ChoiceTile selected={mpMode === "hard"} onClick={() => setMpMode("hard")} title="Hard Battle" hint="Send word attacks" icon={<Zap />} />
          </Field>
          <GameButton size="lg" variant="target" className="w-full" onClick={onQuick} icon={<Users className="h-5 w-5" />}>Quick Match</GameButton>
          <GameButton size="lg" variant="ghost" className="w-full" onClick={onLocal}>Local Versus (same device)</GameButton>
          <p className="text-muted-foreground text-[11px]">All opponents are simulated locally. No network play.</p>
        </div>
      </div>
    </SkyScene>
  );
}

function Matchmaking({ onCancel, onFound }: { onCancel: () => void; onFound: (o: (typeof OPPONENTS)[number]) => void }) {
  const [idx, setIdx] = useState(0);
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const spin = window.setInterval(() => setIdx((i) => (i + 1) % OPPONENTS.length), 420);
    const prog = window.setInterval(() => setPct((p) => Math.min(100, p + 7)), 180);
    const done = window.setTimeout(() => onFound(pick(OPPONENTS)), 2800);
    return () => { window.clearInterval(spin); window.clearInterval(prog); window.clearTimeout(done); };
  }, [onFound]);
  return (
    <SkyScene variant="portal" dim>
      <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-5 text-center">
        <h2 className="font-display text-ink text-2xl font-black">Finding an opponent…</h2>
        <div className="flex items-center gap-6">
          <CharacterSprite pose="ready" hue={300} className="h-28 w-28" />
          <span className="font-display text-magic text-2xl font-black">VS</span>
          <div className="sg-panel p-3"><AvatarBadge name={OPPONENTS[idx].name} hue={OPPONENTS[idx].hue} label="Simulated Opponent" /></div>
        </div>
        <div className="w-full max-w-xs"><Meter value={pct} tone="magic" label="Scanning the sky village" showValue /></div>
        <GameButton variant="ghost" onClick={onCancel}>Cancel</GameButton>
      </div>
    </SkyScene>
  );
}

/* ---------------- Local Versus ---------------- */
function LocalVersus({ input, onBack, onFinish }: { input: InputStyle; onBack: () => void; onFinish: (r: MultiResult) => void }) {
  const [stage, setStage] = useState<"p1" | "handover" | "p2">("p1");
  const [p1, setP1] = useState<MultiResult | null>(null);

  if (stage === "handover" && p1) {
    return (
      <SkyScene variant="portal" dim>
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-5 text-center">
          <h2 className="font-display text-ink text-3xl font-black">Pass the device</h2>
          <div className="sg-panel space-y-1 p-5 text-sm font-bold">
            <p>Player One score: {p1.playerScore}</p>
            <p>Accuracy: {p1.accuracy}% · Best combo: x{p1.bestCombo}</p>
            <p>Attacks generated: {p1.attacksSent}</p>
          </div>
          <GameButton size="lg" variant="target" onClick={() => setStage("p2")}>Player Two, ready!</GameButton>
        </div>
      </SkyScene>
    );
  }

  return (
    <BattleScene
      key={stage}
      mode="local" input={input} learning="words" difficulty="normal"
      roundSeconds={60}
      localLabel={stage === "p1" ? "Player One round" : "Player Two round"}
      onQuit={onBack}
      onFinish={() => {}}
      onFinishMulti={(r) => {
        if (stage === "p1") { setP1({ ...r, attacksSent: Math.max(1, Math.floor(r.bestCombo / 3)) }); setStage("handover"); }
        else if (p1) {
          onFinish({
            ...r, outcome: r.playerScore > p1.playerScore ? "defeat" : r.playerScore < p1.playerScore ? "victory" : "draw",
            opponentScore: p1.playerScore, opponentAccuracy: p1.accuracy, opponentCombo: p1.bestCombo,
            attacksReceived: p1.attacksSent, opponent: "Player One", mode: "local",
          });
        }
      }}
    />
  );
}

/* ---------------- Results ---------------- */
function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-border/60 flex items-center justify-between gap-3 border-b py-1.5 text-sm last:border-0">
      <span className="text-muted-foreground font-bold">{label}</span>
      <span className="font-display text-ink font-black">{value}</span>
    </div>
  );
}

function SingleResults({ result, onAgain, onPractise, onLibrary, onMenu }: {
  result: SingleResult; onAgain: () => void; onPractise: () => void; onLibrary: () => void; onMenu: () => void;
}) {
  return (
    <SkyScene dim>
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-5 py-8">
        <CharacterSprite pose={result.stars >= 2 ? "victory" : "idle"} hue={300} className="h-32 w-32" />
        <h2 className="font-display text-ink text-3xl font-black">Round complete!</h2>
        <Stars value={result.stars} size={28} />
        <div className="sg-panel w-full max-w-sm p-4">
          <p className="font-display text-target text-center text-4xl font-black">{result.score}</p>
          <StatRow label="Accuracy" value={`${result.accuracy}%`} />
          <StatRow label="Highest combo" value={`x${result.bestCombo}`} />
          <StatRow label="Enemies defeated" value={result.defeated} />
          <StatRow label="Enemies missed" value={result.missed} />
          <StatRow label="Sentences completed" value={result.sentences} />
          <StatRow label="Hints used" value={result.hints} />
          <StatRow label="Session" value={`${result.duration}s`} />
        </div>
        <div className="grid w-full max-w-sm grid-cols-2 gap-2">
          <GameButton variant="target" onClick={onAgain} icon={<RefreshCw className="h-4 w-4" />}>Play Again</GameButton>
          <GameButton variant="magic" onClick={onPractise}>Practise Weak Signs</GameButton>
          <GameButton variant="ghost" onClick={onLibrary}>Sign Library</GameButton>
          <GameButton variant="ghost" onClick={onMenu} icon={<Home className="h-4 w-4" />}>Main Menu</GameButton>
        </div>
      </div>
    </SkyScene>
  );
}

function MultiResults({ result, onRematch, onChange, onLibrary, onMenu }: {
  result: MultiResult; onRematch: () => void; onChange: () => void; onLibrary: () => void; onMenu: () => void;
}) {
  const title = result.outcome === "victory" ? "VICTORY!" : result.outcome === "defeat" ? "DEFEAT" : "DRAW";
  return (
    <SkyScene dim>
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-5 py-8">
        <h2 className={cn("font-display text-4xl font-black", result.outcome === "victory" ? "text-success" : result.outcome === "defeat" ? "text-danger" : "text-magic")}>{title}</h2>
        <div className="flex items-end gap-4">
          <CharacterSprite pose={result.outcome === "victory" ? "victory" : "defeat"} hue={300} className="h-28 w-28" />
          <span className="font-display text-ink text-xl font-black">{result.playerScore} — {result.opponentScore}</span>
          <CharacterSprite kind="opponent" pose={result.outcome === "victory" ? "defeat" : "victory"} hue={200} className="h-28 w-28" />
        </div>
        <div className="sg-panel w-full max-w-sm p-4">
          <StatRow label="Accuracy" value={`${result.accuracy}% vs ${result.opponentAccuracy}%`} />
          <StatRow label="Highest combo" value={`x${result.bestCombo} vs x${result.opponentCombo}`} />
          <StatRow label="Attacks sent" value={result.attacksSent} />
          <StatRow label="Attacks received" value={result.attacksReceived} />
          <StatRow label="Successful defences" value={result.defences} />
          <StatRow label="Best speed" value={result.bestSpeed} />
          <StatRow label="Opponent" value={result.opponent} />
        </div>
        <div className="grid w-full max-w-sm grid-cols-2 gap-2">
          <GameButton variant="target" onClick={onRematch}>Rematch</GameButton>
          <GameButton variant="magic" onClick={onChange}>Change Mode</GameButton>
          <GameButton variant="ghost" onClick={onLibrary}>Sign Library</GameButton>
          <GameButton variant="ghost" onClick={onMenu}>Main Menu</GameButton>
        </div>
      </div>
    </SkyScene>
  );
}

/* ---------------- Sign Library ---------------- */
function SignLibrary({ onBack, onSign, onSentence }: { onBack: () => void; onSign: (id: string) => void; onSentence: (id: string) => void }) {
  const { progress, masteryFor } = useStore();
  const [tab, setTab] = useState<"signs" | "sentences">("signs");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const cats = useMemo(() => ["all", ...Array.from(new Set(SIGNS.map((s) => s.category)))], []);
  const list = SIGNS.filter((s) => (cat === "all" || s.category === cat) && s.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <SkyScene>
      <div className="min-h-dvh px-3 py-4 sm:px-6">
        <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <BackButton onClick={onBack} />
            <h2 className="font-display text-ink truncate text-2xl font-black">My Sign Collection</h2>
          </div>
        </div>

        <div className="bg-muted border-border mx-auto mb-4 flex w-full max-w-xs gap-1 rounded-xl border-2 p-1" role="tablist">
          {(["signs", "sentences"] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
              className={cn("font-display min-h-10 flex-1 rounded-lg text-sm font-extrabold capitalize", tab === t ? "bg-magic text-magic-foreground" : "text-muted-foreground")}>
              {t}
            </button>
          ))}
        </div>

        {tab === "signs" ? (
          <>
            <div className="mx-auto mb-4 flex max-w-2xl flex-wrap items-center gap-2">
              <label className="sg-panel flex min-w-0 flex-1 items-center gap-2 px-3 py-2">
                <Search className="text-muted-foreground h-4 w-4" aria-hidden />
                <span className="sr-only">Search signs</span>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search signs…" className="text-ink min-h-8 w-full bg-transparent font-bold outline-none" />
              </label>
              <label className="sg-panel px-3 py-2">
                <span className="sr-only">Filter by category</span>
                <select value={cat} onChange={(e) => setCat(e.target.value)} className="text-ink min-h-8 bg-transparent text-sm font-bold capitalize outline-none">
                  {cats.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
            </div>
            <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {list.map((s) => {
                const m = masteryFor(s.id);
                return <SignCollectionItem key={s.id} sign={s} stars={m.stars} bestConfidence={m.bestConfidence} favourite={m.favourite} locked={s.unlockAt > progress.bestScore} onClick={() => onSign(s.id)} />;
              })}
            </div>
          </>
        ) : (
          <>
            <h3 className="font-display text-ink mb-3 text-center text-lg font-black">Sentence Quests</h3>
            <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
              {SENTENCES.map((s) => {
                const m = progress.sentenceMastery[s.id] ?? { stars: 0, bestScore: 0, completed: false };
                return <QuestTile key={s.id} meaning={s.meaning} count={s.sequence.length} difficulty={s.difficulty} stars={m.stars} bestScore={m.bestScore} completed={m.completed} onClick={() => onSentence(s.id)} />;
              })}
            </div>
            <p className="text-muted-foreground mx-auto mt-4 max-w-3xl text-center text-[11px]">{SGSL_REVIEW_NOTE}</p>
          </>
        )}
      </div>
    </SkyScene>
  );
}

/* ---------------- Sign detail + practice ---------------- */
function SignDetail({ id, setId, onBack }: { id: string; setId: (id: string) => void; onBack: () => void }) {
  const { masteryFor, recordSignAttempt, toggleFavourite, settings } = useStore();
  const idx = SIGNS.findIndex((s) => s.id === id);
  const sign = SIGNS[idx];
  const m = masteryFor(id);
  const [practising, setPractising] = useState(false);
  const [status, setStatus] = useState<RecogStatus>("hands-visible");
  const [conf, setConf] = useState(0);
  const [streak, setStreak] = useState(0);
  const [coach, setCoach] = useState<string | null>("Ready hands?");

  return (
    <SkyScene>
      <div className="min-h-dvh px-4 py-4">
        <div className="mb-3 flex items-center gap-3">
          <BackButton onClick={onBack} label="Collection" />
          <h2 className="font-display text-ink truncate text-2xl font-black">{sign.name}</h2>
        </div>
        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
          <div className="sg-panel p-4">
            <SignReference sign={sign} size="lg" />
            <div className="mt-3 flex items-center gap-2">
              <Stars value={m.stars} size={20} />
              <span className="text-muted-foreground text-xs font-bold">{m.attempts} attempts · best {Math.round(m.bestConfidence * 100) || 0}%</span>
              <IconButton label={m.favourite ? "Remove favourite" : "Add favourite"} onClick={() => toggleFavourite(id)} className="ml-auto">
                <Heart className={cn("h-4 w-4", m.favourite && "fill-danger text-danger")} aria-hidden />
              </IconButton>
            </div>
          </div>
          <div className="space-y-3">
            <div className="sg-panel space-y-2 p-4 text-sm">
              <p><strong>Hand shape:</strong> {sign.handShape}</p>
              <p><strong>Movement:</strong> {sign.movement}</p>
              <p className="text-danger"><strong>Common mistake:</strong> {sign.commonMistake}</p>
              <p className="text-muted-foreground text-[11px]">{SGSL_REVIEW_NOTE}</p>
            </div>
            {!practising ? (
              <GameButton size="lg" variant="target" className="w-full" onClick={() => setPractising(true)}>Practise Sign</GameButton>
            ) : (
              <div className="sg-panel space-y-3 p-4">
                <div className="flex gap-3">
                  <CameraPrototype status={status} confidence={conf} showConfidence={settings.showConfidence} className="w-40" />
                  <div className="flex-1">
                    <CoachBubble message={coach} compact />
                    <p className="text-muted-foreground mt-2 text-xs font-bold">Streak: {streak} · Attempts: {m.attempts}</p>
                  </div>
                </div>
                <RecognitionStatus status={status} confidence={conf} showConfidence={settings.showConfidence} />
                <div className="flex flex-wrap gap-2">
                  <GameButton variant="success" size="sm" onClick={() => { const c = 0.85 + Math.random() * 0.14; setConf(c); setStatus("accepted"); setStreak((s) => s + 1); setCoach("Great hand shape!"); recordSignAttempt(id, true, c); }}>Correct Attempt</GameButton>
                  <GameButton variant="danger" size="sm" onClick={() => { const c = 0.35 + Math.random() * 0.2; setConf(c); setStatus("try-again"); setStreak(0); setCoach("Almost! Try once more."); recordSignAttempt(id, false, c); }}>Try Again</GameButton>
                  <GameButton variant="ghost" size="sm" onClick={() => setId(SIGNS[(idx - 1 + SIGNS.length) % SIGNS.length].id)} icon={<ArrowLeft className="h-4 w-4" />}>Previous</GameButton>
                  <GameButton variant="ghost" size="sm" onClick={() => setId(SIGNS[(idx + 1) % SIGNS.length].id)} icon={<ArrowRight className="h-4 w-4" />}>Next</GameButton>
                  <GameButton variant="magic" size="sm" onClick={onBack}>Return to Collection</GameButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SkyScene>
  );
}

/* ---------------- Sentence detail / quest ---------------- */
function SentenceDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const { recordSentence, settings } = useStore();
  const s = SENTENCES.find((x) => x.id === id)!;
  const [mode, setMode] = useState<"learn" | "build" | "practice">("learn");
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [coach, setCoach] = useState<string | null>(COACH.sentence[0]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [slow, setSlow] = useState(false);

  const say = (t: string) => { setFeedback(t); window.setTimeout(() => setFeedback(null), 1400); };

  return (
    <SkyScene>
      <div className="min-h-dvh px-4 py-4">
        <div className="mb-3 flex items-center gap-3">
          <BackButton onClick={onBack} label="Collection" />
          <h2 className="font-display text-ink truncate text-xl font-black">{s.meaning}</h2>
        </div>
        <div className="mx-auto max-w-3xl space-y-3">
          <div className="sg-panel space-y-2 p-4">
            <SentenceSequence sequence={s.sequence} activeIndex={step} />
            <Meter value={(step / s.sequence.length) * 100} tone="success" label="Sentence progress" />
            <p className="text-sm"><strong>Facial expression:</strong> {s.facialGuidance}</p>
            <p className="text-sm"><strong>Movement:</strong> {s.movementNotes}</p>
            <p className="text-danger text-sm"><strong>Common mistakes:</strong> {s.commonMistakes}</p>
            <p className="text-muted-foreground text-[11px]">{SGSL_REVIEW_NOTE}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <GameButton size="sm" variant={mode === "learn" ? "target" : "ghost"} onClick={() => setMode("learn")}>Learn Sentence</GameButton>
            <GameButton size="sm" variant={mode === "build" ? "target" : "ghost"} onClick={() => setMode("build")}>Build Sentence</GameButton>
            <GameButton size="sm" variant={mode === "practice" ? "target" : "ghost"} onClick={() => setMode("practice")}>Practise Full Sequence</GameButton>
          </div>

          <div className="sg-panel flex flex-col gap-3 p-4 sm:flex-row">
            {settings.coachMessages && <CoachBubble message={coach} compact />}
            <div className="flex-1 space-y-2">
              {mode === "learn" && (
                <p className="text-sm font-bold">Step {step + 1} of {s.sequence.length}: sign <span className="text-target">{s.sequence[step]}</span>{slow ? " — slow demonstration" : ""}</p>
              )}
              {mode === "build" && <p className="text-sm font-bold">Place each sign in the correct order. Signs do not follow English word order.</p>}
              {mode === "practice" && <p className="text-sm font-bold">Sign the whole sentence in one flow.</p>}
              {feedback && <p className="font-display text-magic sg-pop text-lg font-black">{feedback}</p>}
              <div className="flex flex-wrap gap-2">
                <GameButton size="sm" variant="success" onClick={() => {
                  const next = step + 1;
                  setScore((v) => v + 120);
                  if (next >= s.sequence.length) {
                    say("PERFECT SEQUENCE!"); setStep(0); setCoach("Sentence complete!");
                    recordSentence(s.id, score + 120, 3);
                  } else { setStep(next); say(pick(["GREAT FLOW!", "CORRECT ORDER!"])); }
                }}>Correct stage</GameButton>
                <GameButton size="sm" variant="danger" onClick={() => { say("Check the hand shape and try again."); setCoach("Almost! Try once more."); }}>Wrong sign</GameButton>
                <GameButton size="sm" variant="danger" onClick={() => say("Check the order and try again.")}>Wrong order</GameButton>
                <GameButton size="sm" variant="ghost" onClick={() => say("One sign was missing.")}>Missing sign</GameButton>
                <GameButton size="sm" variant="magic" onClick={() => { say("SENTENCE COMPLETE!"); setStep(0); recordSentence(s.id, Math.max(score, 400), 3); }}>Complete sentence</GameButton>
                <GameButton size="sm" variant="ghost" onClick={() => setSlow((v) => !v)}>{slow ? "Normal speed" : "Slow demonstration"}</GameButton>
              </div>
              <p className="text-muted-foreground text-xs font-bold">Quest score: {score}</p>
            </div>
            <CharacterSprite pose={feedback ? "celebrate" : "ready"} hue={300} className="h-24 w-24 self-end" />
          </div>
        </div>
      </div>
    </SkyScene>
  );
}
