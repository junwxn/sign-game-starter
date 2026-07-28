import { useEffect, useState } from "react";
import { GameButton, Hero, Scene, Avatar } from "@/components/game/kit";
import { SinglePlayer } from "@/components/game/SinglePlayer";
import type { SingleResult } from "@/components/game/Results";
import type { Settings } from "@/game/storage";
import type { Difficulty, InputMode } from "@/game/data";

type Turn = { result: SingleResult; attackEnemies: number };

const attacksFrom = (r: SingleResult) =>
  Math.min(8, Math.floor(r.bestCombo / 3) + Math.floor(r.defeated / 4));

export function LocalVersus({
  inputMode,
  difficulty,
  settings,
  onAttempt,
  onExit,
  onSave,
}: {
  inputMode: InputMode;
  difficulty: Difficulty;
  settings: Settings;
  onAttempt: (signId: string, correct: boolean, confidence: number) => void;
  onExit: () => void;
  onSave: (data: unknown) => void;
}) {
  const [phase, setPhase] = useState<"intro1" | "p1" | "handover" | "p2" | "results">("intro1");
  const [p1, setP1] = useState<Turn | null>(null);
  const [p2, setP2] = useState<Turn | null>(null);

  const record = (
    r: SingleResult,
    list: { signId: string; correct: boolean; confidence: number }[],
  ) => {
    list.forEach((a) => onAttempt(a.signId, a.correct, a.confidence));
    return { result: r, attackEnemies: attacksFrom(r) };
  };

  if (phase === "p1" || phase === "p2") {
    const isP1 = phase === "p1";
    return (
      <SinglePlayer
        key={phase}
        inputMode={inputMode}
        difficulty={difficulty}
        settings={settings}
        onOpenSettings={() => {}}
        onMenu={onExit}
        onRestart={() => setPhase(isP1 ? "intro1" : "handover")}
        onFinish={(r, list) => {
          const turn = record(r, list);
          if (isP1) {
            setP1(turn);
            setPhase("handover");
          } else {
            setP2(turn);
            setPhase("results");
          }
        }}
      />
    );
  }

  if (phase === "intro1" || phase === "handover") {
    const first = phase === "intro1";
    return (
      <Scene dim={0.4}>
        <div className="grid h-full place-items-center p-4">
          <div className="panel anim-scene w-full max-w-md space-y-4 p-6 text-center">
            <h2 className="font-display text-3xl font-black">
              {first ? "Player One — get ready" : "Pass the device"}
            </h2>
            {first ? (
              <Hero state="ready" className="mx-auto h-40 w-32" />
            ) : (
              <div className="flex items-center justify-center gap-4">
                <Avatar index={1} size={64} />
                <span className="font-display text-2xl font-black text-target-deep">→</span>
                <Avatar index={4} size={64} />
              </div>
            )}
            {!first && p1 && (
              <div className="space-y-1 text-sm font-bold">
                <p>
                  Player One scored <strong>{p1.result.score}</strong> with a x{p1.result.bestCombo}{" "}
                  combo.
                </p>
                <p className="text-magic">
                  Player Two will face {p1.attackEnemies} extra word enemies earned by Player One.
                </p>
              </div>
            )}
            <GameButton
              tone="play"
              size="lg"
              className="w-full"
              onClick={() => setPhase(first ? "p1" : "p2")}
            >
              {first ? "Start Player One" : "Start Player Two"}
            </GameButton>
            <GameButton tone="neutral" className="w-full" onClick={onExit}>
              Main Menu
            </GameButton>
          </div>
        </div>
      </Scene>
    );
  }

  const a = p1!;
  const b = p2!;
  const totalA = a.result.score + a.result.accuracy * 2;
  const totalB = b.result.score + b.result.accuracy * 2;
  const winner =
    totalA === totalB ? "Draw!" : totalA > totalB ? "Player One wins!" : "Player Two wins!";

  const rows: [string, string | number, string | number][] = [
    ["Score", a.result.score, b.result.score],
    ["Accuracy", `${a.result.accuracy}%`, `${b.result.accuracy}%`],
    ["Best combo", `x${a.result.bestCombo}`, `x${b.result.bestCombo}`],
    ["Attacks generated", a.attackEnemies, b.attackEnemies],
    ["Enemies cleared", a.result.defeated, b.result.defeated],
    [
      "Crystal held",
      `${Math.max(0, 100 - a.result.missed * 12)}%`,
      `${Math.max(0, 100 - b.result.missed * 12)}%`,
    ],
  ];

  return (
    <Scene dim={0.4}>
      <SaveOnce onSave={onSave} data={{ p1: a.result.score, p2: b.result.score, winner }} />
      <div className="h-full overflow-y-auto p-4">
        <div className="mx-auto w-full max-w-xl space-y-4 pb-8 text-center">
          <h2 className="font-display text-4xl font-black text-cream text-outline">{winner}</h2>
          <div className="flex items-center justify-around">
            <div className="flex flex-col items-center gap-1">
              <Avatar index={1} size={72} />
              <span className="hud-chip text-xs">PLAYER ONE</span>
            </div>
            <span className="font-display text-3xl font-black text-cream text-outline">VS</span>
            <div className="flex flex-col items-center gap-1">
              <Avatar index={4} size={72} />
              <span className="hud-chip text-xs">PLAYER TWO</span>
            </div>
          </div>
          <ul className="space-y-1.5">
            {rows.map(([k, x, y]) => (
              <li
                key={k}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl border-[3px] border-ink bg-cream px-3 py-1.5"
              >
                <span className="text-left font-display text-lg font-black tabular-nums">{x}</span>
                <span className="text-center text-[0.6rem] font-extrabold uppercase tracking-widest text-muted-foreground">
                  {k}
                </span>
                <span className="text-right font-display text-lg font-black tabular-nums">{y}</span>
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-2 gap-2">
            <GameButton
              tone="play"
              onClick={() => {
                setP1(null);
                setP2(null);
                setPhase("intro1");
              }}
            >
              Rematch
            </GameButton>
            <GameButton tone="neutral" onClick={onExit}>
              Main Menu
            </GameButton>
          </div>
        </div>
      </div>
    </Scene>
  );
}

function SaveOnce({ onSave, data }: { onSave: (d: unknown) => void; data: unknown }) {
  useEffect(() => {
    onSave(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
