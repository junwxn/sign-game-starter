import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Check,
  Lightbulb,
  Pause,
  Play as PlayIcon,
  RotateCcw,
  Square,
  Timer,
  X,
  Zap,
} from "lucide-react";
import { CoachBubble } from "@/components/Coach";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSettings } from "@/lib/settings-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Play — Sign Game Arcade Preview" },
      {
        name: "description",
        content:
          "A visual mock-up of the Sign Game arcade screen with falling sign words, score, combo, lives and a camera recognition preview.",
      },
      { property: "og:title", content: "Play — Sign Game Arcade Preview" },
      {
        property: "og:description",
        content: "See what a Singapore Sign Language arcade round could look like.",
      },
    ],
  }),
  component: PlayPage,
});

const WORDS = [
  { id: "w1", label: "Hello", top: "-8%", left: "6%", delay: "0s" },
  { id: "w2", label: "Water", top: "-8%", left: "28%", delay: "1.8s" },
  { id: "w3", label: "Help", top: "-8%", left: "50%", delay: "3.4s" },
  { id: "w4", label: "Eat", top: "-8%", left: "14%", delay: "5s" },
  { id: "w5", label: "Thank You", top: "-8%", left: "38%", delay: "6.4s" },
];

const STATUSES = [
  "Both hands visible",
  "Checking sign…",
  "Great job!",
  "Try again",
  "Move hands into view",
];

interface PerSign {
  name: string;
  correct: number;
  attempts: number;
}

function PlayPage() {
  const { settings } = useSettings();
  const [score, setScore] = useState(680);
  const [combo, setCombo] = useState(3);
  const [bestCombo, setBestCombo] = useState(6);
  const [lives, setLives] = useState(3);
  const [hints, setHints] = useState(1);
  const [paused, setPaused] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [status, setStatus] = useState(STATUSES[0]);
  const [confidence, setConfidence] = useState(72);
  const [feedback, setFeedback] = useState("Ready hands? Sign the orange word!");
  const [results, setResults] = useState(false);
  const [perSign, setPerSign] = useState<PerSign[]>([
    { name: "Hello", correct: 3, attempts: 3 },
    { name: "Water", correct: 2, attempts: 3 },
    { name: "Help", correct: 1, attempts: 2 },
    { name: "Eat", correct: 2, attempts: 2 },
    { name: "Thank You", correct: 3, attempts: 4 },
  ]);

  const bump = (name: string, ok: boolean) =>
    setPerSign((prev) =>
      prev.map((p) =>
        p.name === name ? { ...p, attempts: p.attempts + 1, correct: p.correct + (ok ? 1 : 0) } : p,
      ),
    );

  const onCorrect = () => {
    const next = combo + 1;
    setScore((s) => s + 100 + next * 10);
    setCombo(next);
    setBestCombo((b) => Math.max(b, next));
    setStatus("Great job!");
    setConfidence(94);
    setFeedback("Beautiful shape — your combo is climbing!");
    bump("Hello", true);
  };

  const onTryAgain = () => {
    setCombo(0);
    setStatus("Try again");
    setConfidence(41);
    setFeedback("Almost! Keep your fingers together and try once more.");
    bump("Water", false);
  };

  const onHint = () => {
    setHints((h) => h + 1);
    setShowHint(true);
    setStatus("Checking sign…");
    setFeedback("Hint: palm faces forward, beside your forehead.");
  };

  const onMiss = () => {
    setLives((l) => Math.max(0, l - 1));
    setCombo(0);
    setStatus("Move hands into view");
    setConfidence(18);
    setFeedback("That word slipped past. Mistakes help you learn!");
    bump("Help", false);
  };

  const totalAttempts = perSign.reduce((a, p) => a + p.attempts, 0);
  const totalCorrect = perSign.reduce((a, p) => a + p.correct, 0);
  const accuracy = Math.round((totalCorrect / Math.max(1, totalAttempts)) * 100);

  return (
    <div className="space-y-5">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold sm:text-3xl">Arcade Preview</h1>
          <p className="text-sm text-muted-foreground">
            Interface mock-up — no real game engine or sign detection.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-secondary px-3 py-1.5 text-xs font-extrabold text-secondary-foreground">
          {settings.inputMode} mode · {settings.difficulty}
        </span>
      </header>

      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        <Stat label="Score" value={score.toLocaleString()} tone="bg-gradient-sky" />
        <Stat label="Combo" value={`x${combo}`} tone="bg-gradient-sunset" />
        <Stat
          label="Lives"
          value={"❤️".repeat(lives) || "—"}
          tone="bg-gradient-grape"
        />
        <Stat label="Wave" value="3" tone="bg-gradient-mint" />
        <Stat label="Timer" value="01:24" tone="bg-gradient-sky" />
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="card-soft relative h-[360px] overflow-hidden bg-gradient-grape p-0">
          <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] [background-size:26px_26px]" />
          {WORDS.map((w, i) => (
            <span
              key={w.id}
              style={{ left: w.left, top: w.top, animationDelay: w.delay }}
              className={cn(
                "absolute animate-drift rounded-2xl px-4 py-2 font-display text-lg font-extrabold shadow-[var(--shadow-pop)]",
                i === 0
                  ? "bg-accent text-accent-foreground ring-4 ring-white/60"
                  : "bg-card text-card-foreground",
                paused && "[animation-play-state:paused]",
              )}
            >
              {w.label}
            </span>
          ))}
          <div className="absolute inset-x-0 bottom-0 h-14 bg-black/25 backdrop-blur-sm" />
          <p className="absolute bottom-4 left-4 text-sm font-extrabold text-white">
            {paused ? "Paused — interface frozen" : "Sign the orange word before it lands"}
          </p>
          <div className="absolute top-3 right-3 z-20 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="rounded-xl font-extrabold"
              onClick={onHint}
            >
              <Lightbulb className="mr-1 h-4 w-4" /> Hint
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="rounded-xl font-extrabold"
              onClick={() => setPaused((p) => !p)}
            >
              {paused ? <PlayIcon className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          </div>
          {showHint && (
            <div className="animate-pop absolute inset-x-4 top-16 rounded-2xl bg-card/95 p-4 shadow-[var(--shadow-pop)]">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                <p className="text-sm font-bold">
                  Hint for “Hello”: open palm beside your forehead, then arc outward.
                </p>
                <button
                  onClick={() => setShowHint(false)}
                  className="shrink-0 text-muted-foreground"
                  aria-label="Close hint"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="card-soft p-4">
          <div className="grid h-44 place-items-center rounded-2xl border-2 border-dashed border-border bg-muted/60">
            <div className="relative grid h-full w-full place-items-center">
              <div className="absolute top-4 h-16 w-16 rounded-full border-2 border-dashed border-primary/60" />
              <p className="absolute top-[26px] text-[10px] font-extrabold text-primary">FACE</p>
              <div className="absolute bottom-5 flex gap-8">
                <div className="grid h-14 w-12 place-items-center rounded-xl border-2 border-dashed border-accent/70 text-[10px] font-extrabold text-accent">
                  HAND
                </div>
                <div className="grid h-14 w-12 place-items-center rounded-xl border-2 border-dashed border-accent/70 text-[10px] font-extrabold text-accent">
                  HAND
                </div>
              </div>
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] font-extrabold text-muted-foreground">
            Camera recognition preview — prototype only
          </p>

          <div className="mt-3 flex items-center gap-2 rounded-xl bg-secondary px-3 py-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-mint" />
            <p className="text-sm font-extrabold text-secondary-foreground">{status}</p>
          </div>

          {settings.showConfidence && (
            <div className="mt-3">
              <div className="flex justify-between text-xs font-bold text-muted-foreground">
                <span>Recognition confidence</span>
                <span>{confidence}%</span>
              </div>
              <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-mint transition-all duration-500"
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-4 rounded-2xl bg-muted/60 p-3">
            <CoachBubble message={feedback} size={52} mood="cheer" />
          </div>
        </section>
      </div>

      <section className="card-soft p-4">
        <h2 className="mb-3 text-sm font-extrabold text-muted-foreground">
          Demo controls (updates the mock interface only)
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button className="rounded-xl font-extrabold" onClick={onCorrect}>
            <Check className="mr-1.5 h-4 w-4" /> Correct Sign
          </Button>
          <Button variant="secondary" className="rounded-xl font-extrabold" onClick={onTryAgain}>
            <RotateCcw className="mr-1.5 h-4 w-4" /> Try Again
          </Button>
          <Button variant="outline" className="rounded-xl font-extrabold" onClick={onHint}>
            <Lightbulb className="mr-1.5 h-4 w-4" /> Show Hint
          </Button>
          <Button variant="outline" className="rounded-xl font-extrabold" onClick={onMiss}>
            <Zap className="mr-1.5 h-4 w-4" /> Miss Word
          </Button>
          <Button
            variant="destructive"
            className="rounded-xl font-extrabold"
            onClick={() => setResults(true)}
          >
            <Square className="mr-1.5 h-4 w-4" /> End Session
          </Button>
        </div>
      </section>

      <Dialog open={results} onOpenChange={setResults}>
        <DialogContent className="max-h-[88vh] max-w-lg overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-extrabold">Session complete!</DialogTitle>
          </DialogHeader>
          <CoachBubble message="You beat your best score! Great hands today." size={56} mood="cheer" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <ResultStat label="Final score" value={score.toLocaleString()} />
            <ResultStat label="Highest combo" value={`x${bestCombo}`} />
            <ResultStat label="Accuracy" value={`${accuracy}%`} />
            <ResultStat label="Signs completed" value={String(totalCorrect)} />
            <ResultStat label="Signs missed" value={String(totalAttempts - totalCorrect)} />
            <ResultStat label="Hints used" value={String(hints)} />
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-secondary p-3 text-sm font-bold text-secondary-foreground">
            <Timer className="h-4 w-4" /> Session duration · 6m 12s
          </div>
          <div>
            <h3 className="mb-2 text-sm font-extrabold">Per-sign performance</h3>
            <ul className="space-y-2">
              {perSign.map((p) => {
                const pct = Math.round((p.correct / Math.max(1, p.attempts)) * 100);
                return (
                  <li key={p.name} className="rounded-2xl bg-muted/60 p-3">
                    <div className="flex justify-between text-sm font-bold">
                      <span>{p.name}</span>
                      <span className="text-muted-foreground">
                        {p.correct}/{p.attempts} · {pct}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-background">
                      <div className="h-full rounded-full bg-gradient-sky" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              className="flex-1 rounded-xl font-extrabold"
              onClick={() => {
                setResults(false);
                setScore(0);
                setCombo(0);
                setLives(3);
                setHints(0);
                setFeedback("New round! Ready hands?");
              }}
            >
              Play Again
            </Button>
            <Button asChild variant="secondary" className="rounded-xl font-extrabold">
              <a href="/practice">Practise Weak Signs</a>
            </Button>
            <Button asChild variant="outline" className="rounded-xl font-extrabold">
              <a href="/">Return Home</a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={`rounded-2xl ${tone} p-3 text-primary-foreground shadow-[var(--shadow-soft)]`}>
      <p className="text-[11px] font-extrabold opacity-90">{label}</p>
      <p className="font-display text-xl font-extrabold">{value}</p>
    </div>
  );
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/70 p-3 text-center">
      <p className="font-display text-xl font-extrabold">{value}</p>
      <p className="text-[11px] font-bold text-muted-foreground">{label}</p>
    </div>
  );
}
