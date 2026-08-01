import { GameButton, Hero, Scene, Stars, Avatar, CoachBubble } from "@/components/game/kit";
import { MasteryRow } from "@/components/game/Overlays";
import { rankFor } from "@/game/engine";
import type { Opponent } from "@/game/data";

export type SingleResult = {
  score: number;
  bestCombo: number;
  accuracy: number;
  defeated: number;
  missed: number;
  hints: number;
  duration: number;
  perSign: { signId: string; accuracy: number; stars: number; improved: boolean }[];
  weakSigns: string[];
};

export type MultiResult = {
  outcome: "victory" | "defeat" | "draw";
  battleMode: "normal" | "hard";
  opponent: Opponent;
  player: {
    score: number;
    accuracy: number;
    bestCombo: number;
    attacksSent: number;
    enemiesSent: number;
    defended: number;
    cleared: number;
    bestSpeed: string;
  };
  rival: {
    score: number;
    accuracy: number;
    bestCombo: number;
    attacksSent: number;
    enemiesSent: number;
  };
  summary: string[];
};

function Confetti() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="anim-floatup absolute h-2.5 w-2.5 rounded-sm"
          style={{
            left: `${(i * 7 + 6) % 96}%`,
            bottom: `${10 + (i % 4) * 12}%`,
            background: ["var(--target)", "var(--success)", "var(--magic)", "var(--danger)"][i % 4],
            animationDelay: `${(i % 7) * 0.3}s`,
            animationDuration: "2.4s",
            animationIterationCount: "infinite",
          }}
        />
      ))}
    </div>
  );
}

export function SingleResults({
  result,
  isBest,
  onPlayAgain,
  onPractise,
  onMenu,
}: {
  result: SingleResult;
  isBest: boolean;
  onPlayAgain: () => void;
  onPractise: () => void;
  onMenu: () => void;
}) {
  const { rank, stars } = rankFor(result.score);
  return (
    <Scene dim={0.35}>
      <Confetti />
      <div className="h-full overflow-y-auto p-4">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 pb-8">
          <h2 className="font-display text-4xl font-black text-cream text-outline">
            {isBest ? "NEW BEST SCORE!" : "WAVE COMPLETE!"}
          </h2>
          <div className="flex items-center gap-4">
            <Hero state="victory" className="h-36 w-28" />
            <div className="panel px-6 py-4 text-center">
              <p className="font-display text-6xl font-black tabular-nums text-target-deep">
                {result.score}
              </p>
              <div className="mt-1 flex items-center justify-center gap-2">
                <Stars n={stars} size={22} />
                <span className="hud-chip text-sm">RANK {rank}</span>
              </div>
            </div>
          </div>

          <CoachBubble
            message={isBest ? "You beat your best score!" : "Strong defence — the crystal held!"}
          />

          <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              ["Best combo", `x${result.bestCombo}`],
              ["Accuracy", `${result.accuracy}%`],
              ["Enemies defeated", result.defeated],
              ["Enemies missed", result.missed],
              ["Hints used", result.hints],
              ["Session", `${result.duration}s`],
            ].map(([k, v]) => (
              <div key={k as string} className="hud-chip w-full justify-between !rounded-xl">
                <span className="text-[0.6rem] uppercase tracking-widest opacity-80">{k}</span>
                <span className="tabular-nums">{v}</span>
              </div>
            ))}
          </div>

          {result.perSign.length > 0 && (
            <div className="w-full space-y-2">
              <h3 className="font-display text-lg font-black text-cream text-outline">
                Sign performance
              </h3>
              <ul className="space-y-2">
                {result.perSign.map((p) => (
                  <MasteryRow key={p.signId} {...p} />
                ))}
              </ul>
            </div>
          )}

          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <GameButton tone="play" size="lg" className="flex-1" onClick={onPlayAgain}>
              Play Again
            </GameButton>
            <GameButton tone="magic" size="lg" className="flex-1" onClick={onPractise}>
              Practise Weak Signs
            </GameButton>
            <GameButton tone="neutral" size="lg" className="flex-1" onClick={onMenu}>
              Main Menu
            </GameButton>
          </div>
        </div>
      </div>
    </Scene>
  );
}

export function MultiResults({
  result,
  onRematch,
  onChangeMode,
  onLibrary,
  onMenu,
}: {
  result: MultiResult;
  onRematch: () => void;
  onChangeMode: () => void;
  onLibrary: () => void;
  onMenu: () => void;
}) {
  const title =
    result.outcome === "victory" ? "VICTORY!" : result.outcome === "defeat" ? "DEFEAT" : "DRAW";
  const tone =
    result.outcome === "victory"
      ? "text-success"
      : result.outcome === "defeat"
        ? "text-danger"
        : "text-target";

  const rows: [string, string | number, string | number][] = [
    ["Score", result.player.score, result.rival.score],
    ["Accuracy", `${result.player.accuracy}%`, `${result.rival.accuracy}%`],
    ["Best combo", `x${result.player.bestCombo}`, `x${result.rival.bestCombo}`],
    ["Attacks sent", result.player.attacksSent, result.rival.attacksSent],
    ["Enemies sent", result.player.enemiesSent, result.rival.enemiesSent],
    ["Attacks received", result.rival.attacksSent, result.player.attacksSent],
  ];

  return (
    <Scene dim={0.4}>
      {result.outcome === "victory" && <Confetti />}
      <div className="h-full overflow-y-auto p-4">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 pb-8">
          <h2 className={`font-display text-5xl font-black text-outline ${tone}`}>{title}</h2>

          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex flex-col items-center">
              <Hero
                state={result.outcome === "defeat" ? "defeat" : "victory"}
                className="h-28 w-24"
              />
              <span className="hud-chip text-xs">YOU</span>
            </div>
            <span className="font-display text-3xl font-black text-cream text-outline">VS</span>
            <div className="flex flex-col items-center gap-1">
              <Avatar
                index={result.opponent.avatar}
                size={80}
                className={result.outcome === "defeat" ? "anim-bob" : "opacity-70 saturate-50"}
              />
              <span className="hud-chip text-xs">{result.opponent.name}</span>
              <span className="hud-chip text-[0.6rem] uppercase">
                {result.opponent.difficulty} · {result.opponent.style} AI
              </span>
            </div>
          </div>

          <ul className="w-full space-y-1.5">
            {rows.map(([k, a, b]) => (
              <li
                key={k}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl border-[3px] border-ink bg-cream px-3 py-1.5"
              >
                <span className="text-left font-display text-lg font-black tabular-nums">{a}</span>
                <span className="text-center text-[0.6rem] font-extrabold uppercase tracking-widest text-muted-foreground">
                  {k}
                </span>
                <span className="text-right font-display text-lg font-black tabular-nums">{b}</span>
              </li>
            ))}
          </ul>

          <div className="panel w-full space-y-1 p-3">
            <p className="font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
              Match summary
            </p>
            {result.summary.map((s) => (
              <p key={s} className="text-sm font-bold">
                • {s}
              </p>
            ))}
            <p className="text-sm font-bold">• Best speed rating: {result.player.bestSpeed}</p>
            <p className="text-sm font-bold">
              • Successful defences: {result.player.defended} · incoming cleared:{" "}
              {result.player.cleared}
            </p>
          </div>

          <div className="grid w-full grid-cols-2 gap-2">
            <GameButton tone="play" onClick={onRematch}>
              Rematch
            </GameButton>
            <GameButton tone="magic" onClick={onChangeMode}>
              Change AI Mode
            </GameButton>
            <GameButton tone="success" onClick={onLibrary}>
              Sign Library
            </GameButton>
            <GameButton tone="neutral" onClick={onMenu}>
              Main Menu
            </GameButton>
          </div>
        </div>
      </div>
    </Scene>
  );
}
