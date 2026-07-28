import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Gamepad2,
  Hand,
  Keyboard,
  Library,
  Settings as SettingsIcon,
  Swords,
  Trophy,
  Users,
  X,
} from "lucide-react";
import {
  Avatar,
  CoachBubble,
  EnemySprite,
  GameButton,
  Hero,
  IconButton,
  Scene,
} from "@/components/game/kit";
import {
  art,
  makeOpponent,
  type BattleMode,
  type Difficulty,
  type InputMode,
  type Opponent,
} from "@/game/data";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("select-none text-center", className)}>
      <h1 className="font-display text-5xl font-black leading-none text-cream text-outline sm:text-7xl">
        SIGN<span className="text-target"> GAME</span>
      </h1>
      <p className="mt-1 font-display text-sm font-extrabold uppercase tracking-[0.35em] text-cream/90 drop-shadow sm:text-base">
        Sign fast. Save the words.
      </p>
    </div>
  );
}

/* ---------------- Splash ---------------- */

export function SplashScene({ onStart }: { onStart: () => void }) {
  return (
    <Scene dim={0.15}>
      <button
        onClick={onStart}
        className="absolute inset-0 z-40 cursor-pointer"
        aria-label="Press to start Sign Game"
      />
      <div className="relative flex h-full flex-col items-center justify-between py-8">
        <div className="anim-scene mt-4">
          <Logo />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-1/3 flex justify-between px-6 opacity-70">
          {(["basic", "fast", "shield", "wave"] as const).map((k, i) => (
            <span
              key={k}
              className="anim-sway relative block h-20 w-20 brightness-0 opacity-30 sm:h-28 sm:w-28"
              style={{ animationDelay: `${i * 0.6}s` }}
            >
              <EnemySprite kind={k} word="" style={{ position: "static" }} />
            </span>
          ))}
        </div>

        <Hero state="ready" className="anim-scene h-[38vh] max-h-80" />

        <div className="anim-scene flex flex-col items-center gap-3">
          <GameButton tone="play" size="xl" onClick={onStart} className="anim-target">
            <Gamepad2 className="h-7 w-7" aria-hidden /> PRESS TO START
          </GameButton>
        </div>
      </div>
    </Scene>
  );
}

/* ---------------- Main menu ---------------- */

export function MainMenu({
  best,
  level,
  streak,
  onPlay,
  onMultiplayer,
  onLibrary,
  onSettings,
}: {
  best: number;
  level: number;
  streak: number;
  onPlay: () => void;
  onMultiplayer: () => void;
  onLibrary: () => void;
  onSettings: () => void;
}) {
  return (
    <Scene dim={0.1}>
      <div className="flex h-full flex-col items-center justify-between px-4 py-6">
        <div className="flex w-full items-start justify-between">
          <span className="hud-chip text-xs">
            <Trophy className="h-4 w-4 text-target" aria-hidden /> BEST {best}
          </span>
          <IconButton label="Settings" onClick={onSettings}>
            <SettingsIcon className="mx-auto h-5 w-5" aria-hidden />
          </IconButton>
        </div>

        <Logo className="-mt-6" />

        <Hero state="idle" className="h-[32vh] max-h-72" />

        <div className="flex w-full max-w-sm flex-col items-center gap-3 pb-2">
          <GameButton tone="play" size="xl" onClick={onPlay} className="w-full">
            ▶ PLAY
          </GameButton>
          <div className="grid w-full grid-cols-2 gap-3">
            <GameButton tone="magic" onClick={onMultiplayer}>
              <Users className="h-5 w-5" aria-hidden /> Multiplayer
            </GameButton>
            <GameButton tone="neutral" onClick={onLibrary}>
              <Library className="h-5 w-5" aria-hidden /> Signs
            </GameButton>
          </div>
          <p className="font-display text-xs font-extrabold uppercase tracking-widest text-cream/85 drop-shadow">
            Level {level} · {streak} day streak
          </p>
        </div>
      </div>
    </Scene>
  );
}

/* ---------------- Selection primitives ---------------- */

function PickCard({
  active,
  title,
  desc,
  icon,
  onClick,
}: {
  active: boolean;
  title: string;
  desc: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "btn-game w-full flex-col items-start gap-1 !px-4 !py-3 text-left",
        active ? "bg-target text-[oklch(0.2_0.05_50)]" : "bg-cream text-ink",
      )}
    >
      <span className="flex items-center gap-2 font-display text-lg">
        {icon} {title} {active && <span className="text-xs">✓ SELECTED</span>}
      </span>
      <span className="font-sans text-xs font-semibold leading-snug opacity-80">{desc}</span>
    </button>
  );
}

function DiffPicker({ value, onChange }: { value: Difficulty; onChange: (d: Difficulty) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Difficulty">
      {(["easy", "normal", "hard"] as Difficulty[]).map((d) => (
        <button
          key={d}
          type="button"
          aria-pressed={value === d}
          onClick={() => onChange(d)}
          className={cn(
            "btn-game !px-2 !py-2 text-sm uppercase",
            value === d ? "bg-magic text-cream" : "bg-cream text-ink",
          )}
        >
          {d}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Single-player mode select ---------------- */

export function ModeSelect({
  inputMode,
  difficulty,
  onChange,
  onStart,
  onBack,
}: {
  inputMode: InputMode;
  difficulty: Difficulty;
  onChange: (p: { inputMode?: InputMode; difficulty?: Difficulty }) => void;
  onStart: () => void;
  onBack: () => void;
}) {
  return (
    <Scene dim={0.35}>
      <div className="grid h-full place-items-center p-4">
        <div className="panel anim-scene w-full max-w-md space-y-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-black">Choose your mode</h2>
            <IconButton label="Back" onClick={onBack}>
              <X className="mx-auto h-5 w-5" aria-hidden />
            </IconButton>
          </div>
          <PickCard
            active={inputMode === "camera"}
            title="Camera Mode"
            desc="Perform the sign before the enemy reaches the protection zone."
            icon={<Hand className="h-5 w-5" aria-hidden />}
            onClick={() => onChange({ inputMode: "camera" })}
          />
          <PickCard
            active={inputMode === "keyboard"}
            title="Keyboard Demo Mode"
            desc="Type the target word to simulate sign recognition."
            icon={<Keyboard className="h-5 w-5" aria-hidden />}
            onClick={() => onChange({ inputMode: "keyboard" })}
          />
          <DiffPicker value={difficulty} onChange={(d) => onChange({ difficulty: d })} />
          <GameButton tone="play" size="lg" className="w-full" onClick={onStart}>
            START GAME
          </GameButton>
        </div>
      </div>
    </Scene>
  );
}

/* ---------------- Multiplayer menu ---------------- */

export function MultiplayerMenu({
  onQuick,
  onLocal,
  onBack,
}: {
  onQuick: () => void;
  onLocal: () => void;
  onBack: () => void;
}) {
  return (
    <Scene dim={0.3}>
      <div className="grid h-full place-items-center p-4">
        <div className="anim-scene w-full max-w-md space-y-4 text-center">
          <h2 className="font-display text-4xl font-black text-cream text-outline">MULTIPLAYER</h2>
          <GameButton tone="magic" size="lg" className="w-full" onClick={onQuick}>
            <Swords className="h-6 w-6" aria-hidden /> Quick Match
          </GameButton>
          <p className="font-display text-xs font-bold uppercase tracking-widest text-cream/90 drop-shadow">
            Offline demo — opponent is simulated on this device
          </p>
          <GameButton tone="success" size="lg" className="w-full" onClick={onLocal}>
            <Users className="h-6 w-6" aria-hidden /> Local Versus
          </GameButton>
          <GameButton tone="ghost" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" aria-hidden /> Back
          </GameButton>
        </div>
      </div>
    </Scene>
  );
}

/* ---------------- Battle mode select ---------------- */

export function BattleModeSelect({
  battleMode,
  difficulty,
  onChange,
  onStart,
  onBack,
}: {
  battleMode: BattleMode;
  difficulty: Difficulty;
  onChange: (p: { battleMode?: BattleMode; difficulty?: Difficulty }) => void;
  onStart: () => void;
  onBack: () => void;
}) {
  return (
    <Scene dim={0.35}>
      <div className="grid h-full place-items-center p-4">
        <div className="panel anim-scene w-full max-w-md space-y-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-black">Battle type</h2>
            <IconButton label="Back" onClick={onBack}>
              <X className="mx-auto h-5 w-5" aria-hidden />
            </IconButton>
          </div>
          <PickCard
            active={battleMode === "normal"}
            title="Normal Battle"
            desc="Score-focused duel. No attacks — the fastest, most accurate signer wins."
            icon={<Trophy className="h-5 w-5" aria-hidden />}
            onClick={() => onChange({ battleMode: "normal" })}
          />
          <PickCard
            active={battleMode === "hard"}
            title="Hard Battle"
            desc="Fast signs and big combos send extra word enemies to your opponent."
            icon={<Swords className="h-5 w-5" aria-hidden />}
            onClick={() => onChange({ battleMode: "hard" })}
          />
          <DiffPicker value={difficulty} onChange={(d) => onChange({ difficulty: d })} />
          <GameButton tone="play" size="lg" className="w-full" onClick={onStart}>
            FIND OPPONENT
          </GameButton>
        </div>
      </div>
    </Scene>
  );
}

/* ---------------- Matchmaking ---------------- */

export function Matchmaking({
  difficulty,
  onFound,
  onCancel,
}: {
  difficulty: Difficulty;
  onFound: (o: Opponent) => void;
  onCancel: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [spin, setSpin] = useState(0);

  useEffect(() => {
    const opponent = makeOpponent(difficulty);
    const t = setInterval(() => setProgress((p) => Math.min(100, p + 4 + Math.random() * 6)), 120);
    const s = setInterval(() => setSpin((v) => (v + 1) % 6), 260);
    const done = setTimeout(() => onFound(opponent), 3200);
    return () => {
      clearInterval(t);
      clearInterval(s);
      clearTimeout(done);
    };
  }, [difficulty, onFound]);

  return (
    <Scene dim={0.4}>
      <div className="grid h-full place-items-center p-4">
        <div className="anim-scene flex w-full max-w-md flex-col items-center gap-5 text-center">
          <h2 className="font-display text-3xl font-black text-cream text-outline">
            Finding an opponent…
          </h2>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <img
                src={art.hero}
                alt="You"
                width={768}
                height={896}
                className="h-24 w-24 object-contain"
              />
              <span className="hud-chip text-xs">YOU</span>
            </div>
            <span className="font-display text-4xl font-black text-target text-outline">VS</span>
            <div className="flex flex-col items-center gap-1">
              <Avatar index={spin} size={84} className="anim-bob" />
              <span className="hud-chip text-xs">? ? ?</span>
            </div>
          </div>
          <div className="panel w-full p-3">
            <div className="h-3 w-full overflow-hidden rounded-full border-2 border-ink bg-muted">
              <div className="h-full bg-magic transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 font-display text-xs font-extrabold uppercase tracking-widest">
              Scanning the sky village · simulated opponent
            </p>
          </div>
          <GameButton tone="danger" onClick={onCancel}>
            Cancel
          </GameButton>
        </div>
      </div>
    </Scene>
  );
}

export function OpponentFoundCard({ o }: { o: Opponent }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar index={o.avatar} size={52} />
      <div className="min-w-0">
        <p className="truncate font-display text-lg font-black leading-tight">{o.name}</p>
        <p className="text-xs font-bold text-muted-foreground">
          Lv {o.level} · Best {o.best} · {o.accuracy}% acc
        </p>
      </div>
    </div>
  );
}

export function CoachHint({ message }: { message: string }) {
  return <CoachBubble message={message} className="absolute bottom-4 left-4 z-30" />;
}
