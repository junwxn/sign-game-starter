import { CoachBubble, GameButton, Hero, Scene, Stars, Avatar } from "@/components/game/kit";
import { sentenceById } from "@/game/sentences";
import type { Opponent } from "@/game/data";

export type SentenceRunResult = {
  score: number;
  sentencesCompleted: number;
  signsCompleted: number;
  orderPct: number;
  flowScore: number;
  bestSentenceId?: string;
  weakSentenceId?: string;
  hints: number;
  bestCombo: number;
  stars: number;
  versus?: {
    outcome: "victory" | "defeat" | "draw";
    opponent: Opponent;
    rivalScore: number;
    attacksSent: number;
    enemiesSent: number;
    summary: string[];
  };
};

export function SentenceResults({
  result,
  onTryAgain,
  onPractiseWeak,
  onQuests,
  onMenu,
}: {
  result: SentenceRunResult;
  onTryAgain: () => void;
  onPractiseWeak: () => void;
  onQuests: () => void;
  onMenu: () => void;
}) {
  const v = result.versus;
  const heading = v
    ? v.outcome === "victory"
      ? "SENTENCE VICTORY!"
      : v.outcome === "defeat"
        ? "GOOD FIGHT!"
        : "PERFECT DRAW!"
    : "SENTENCE RUN COMPLETE!";

  return (
    <Scene dim={0.35}>
      <div className="h-full overflow-y-auto p-4">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 pb-8">
          <h2 className="text-center font-display text-4xl font-black text-cream text-outline">
            {heading}
          </h2>

          <div className="flex items-center gap-4">
            <Hero state={v?.outcome === "defeat" ? "idle" : "victory"} className="h-36 w-28" />
            <div className="panel px-6 py-4 text-center">
              <p className="font-display text-6xl font-black tabular-nums text-target-deep">
                {result.score}
              </p>
              <div className="mt-1 flex items-center justify-center gap-2">
                <Stars n={result.stars} size={22} />
                <span className="hud-chip text-sm">{result.sentencesCompleted} sentences</span>
              </div>
            </div>
            {v && (
              <div className="flex flex-col items-center gap-1">
                <Avatar index={v.opponent.avatar} size={64} />
                <span className="hud-chip text-xs">{v.opponent.name}</span>
                <span className="hud-chip text-[0.6rem] uppercase">
                  {v.opponent.difficulty} · {v.opponent.style} AI
                </span>
                <span className="hud-chip text-xs tabular-nums">{v.rivalScore}</span>
              </div>
            )}
          </div>

          <CoachBubble
            message={
              result.orderPct >= 90
                ? "PERFECT SEQUENCE work — your sign order is strong!"
                : "Good flow! Keep the signs connected and the order will lock in."
            }
          />

          <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              ["Sentences completed", result.sentencesCompleted],
              ["Signs completed", result.signsCompleted],
              ["Correct order", `${Math.round(result.orderPct)}%`],
              ["Smooth flow", `${Math.round(result.flowScore)}%`],
              ["Highest combo", `x${result.bestCombo}`],
              ["Hints used", result.hints],
              ...(v
                ? ([
                    ["Attacks sent", v.attacksSent],
                    ["Enemies sent", v.enemiesSent],
                  ] as [string, number][])
                : []),
            ].map(([k, val]) => (
              <div key={k as string} className="hud-chip w-full justify-between !rounded-xl">
                <span className="text-[0.6rem] uppercase tracking-widest opacity-80">{k}</span>
                <span className="tabular-nums">{val}</span>
              </div>
            ))}
          </div>

          <div className="grid w-full gap-2 sm:grid-cols-2">
            <div className="panel p-3">
              <p className="font-display text-[0.6rem] font-black uppercase tracking-widest text-muted-foreground">
                Best sentence
              </p>
              <p className="font-display text-lg font-black">
                {result.bestSentenceId
                  ? sentenceById(result.bestSentenceId).englishMeaning
                  : "Keep practising!"}
              </p>
            </div>
            <div className="panel p-3">
              <p className="font-display text-[0.6rem] font-black uppercase tracking-widest text-muted-foreground">
                Needs more practice
              </p>
              <p className="font-display text-lg font-black">
                {result.weakSentenceId
                  ? sentenceById(result.weakSentenceId).englishMeaning
                  : "Nothing — great run!"}
              </p>
            </div>
          </div>

          {v && v.summary.length > 0 && (
            <ul className="w-full space-y-1">
              {v.summary.map((line) => (
                <li key={line} className="panel px-3 py-1.5 text-sm font-bold">
                  {line}
                </li>
              ))}
            </ul>
          )}

          <div className="grid w-full gap-2 sm:grid-cols-2">
            <GameButton tone="play" size="lg" onClick={onTryAgain}>
              Try Again
            </GameButton>
            <GameButton tone="magic" size="lg" onClick={onPractiseWeak}>
              Practise Weak Sentence
            </GameButton>
            <GameButton tone="success" size="lg" onClick={onQuests}>
              Sentence Quests
            </GameButton>
            <GameButton tone="neutral" size="lg" onClick={onMenu}>
              Main Menu
            </GameButton>
          </div>
        </div>
      </div>
    </Scene>
  );
}
