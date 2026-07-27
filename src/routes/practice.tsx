import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Hand, Lightbulb } from "lucide-react";
import { CoachBubble } from "@/components/Coach";
import { DifficultyPill } from "@/components/SignDetails";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/settings-store";
import { SIGNS } from "@/lib/sign-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Practice — Sign Game" },
      {
        name: "description",
        content:
          "A calm practice space with signing tips, common mistakes and mock confidence scores for each Singapore Sign Language sign.",
      },
      { property: "og:title", content: "Practice — Sign Game" },
      {
        property: "og:description",
        content: "Slow down and practise one sign at a time with coach Pip.",
      },
    ],
  }),
  component: PracticePage,
});

function PracticePage() {
  const { markPractised, practised } = useSettings();
  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState(4);
  const [successes, setSuccesses] = useState(3);
  const [confidence, setConfidence] = useState(78);
  const [coach, setCoach] = useState("Take your time — smooth hands beat fast hands.");

  const sign = SIGNS[index];
  const accuracy = useMemo(
    () => Math.round((successes / Math.max(1, attempts)) * 100),
    [successes, attempts],
  );

  const trySign = () => {
    const ok = Math.random() > 0.35;
    setAttempts((a) => a + 1);
    if (ok) setSuccesses((s) => s + 1);
    setConfidence(ok ? 82 + Math.floor(Math.random() * 15) : 34 + Math.floor(Math.random() * 25));
    setCoach(ok ? "Great attempt! That shape was clear." : "Almost — keep both hands visible.");
  };

  const move = (dir: -1 | 1) => {
    setIndex((i) => (i + dir + SIGNS.length) % SIGNS.length);
    setCoach("New sign! Watch the shape first, then copy it.");
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Practice Studio</h1>
        <p className="text-sm text-muted-foreground">No timers, no pressure. Just repetition.</p>
      </header>

      <div className="-mx-4 overflow-x-auto px-4 pb-1">
        <div className="flex gap-2">
          {SIGNS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIndex(i)}
              className={cn(
                "shrink-0 rounded-2xl px-4 py-2 text-sm font-extrabold transition-all",
                i === index
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                  : "bg-card text-card-foreground ring-1 ring-border hover:bg-secondary",
              )}
            >
              <span className="mr-1.5" aria-hidden>
                {s.emoji}
              </span>
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <section className="card-soft animate-rise p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <h2 className="truncate font-display text-2xl font-extrabold">{sign.name}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <DifficultyPill difficulty={sign.difficulty} />
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-extrabold text-secondary-foreground">
                  {sign.category}
                </span>
              </div>
            </div>
            {practised.includes(sign.id) && (
              <CheckCircle2 className="h-6 w-6 shrink-0 text-mint" />
            )}
          </div>

          <div className="mt-4 grid h-56 place-items-center rounded-2xl bg-gradient-sky text-7xl">
            <span aria-hidden>{sign.emoji}</span>
          </div>
          <p className="mt-2 text-center text-[11px] font-extrabold text-muted-foreground">
            Sign video placeholder — prototype only
          </p>

          <p className="mt-4 text-sm text-muted-foreground">{sign.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-xl font-extrabold" onClick={() => move(-1)}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
            <Button className="rounded-xl font-extrabold" onClick={trySign}>
              <Hand className="mr-1.5 h-4 w-4" /> Try Sign
            </Button>
            <Button
              variant="secondary"
              className="rounded-xl font-extrabold"
              onClick={() => {
                markPractised(sign.id);
                setCoach("Marked as practised — your streak is growing!");
              }}
            >
              Mark as Practised
            </Button>
            <Button variant="outline" className="rounded-xl font-extrabold" onClick={() => move(1)}>
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </section>

        <div className="space-y-4">
          <section className="card-soft p-5">
            <CoachBubble message={coach} size={56} />
            <div className="mt-4">
              <div className="flex justify-between text-xs font-bold text-muted-foreground">
                <span>Mock confidence score</span>
                <span>{confidence}%</span>
              </div>
              <div className="mt-1.5 h-3.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-mint transition-all duration-500"
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Mini label="Attempts" value={String(attempts)} />
              <Mini label="Successful" value={String(successes)} />
              <Mini label="Accuracy" value={`${accuracy}%`} />
            </div>
          </section>

          <section className="card-soft p-5">
            <h3 className="flex items-center gap-2 text-sm font-extrabold">
              <Lightbulb className="h-4 w-4 text-accent" /> Signing tips
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              {sign.tips.map((t) => (
                <li key={t}>• {t}</li>
              ))}
            </ul>
            <h3 className="mt-4 text-sm font-extrabold">Common mistakes</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              {sign.mistakes.map((m) => (
                <li key={m}>⚠️ {m}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <section className="card-soft p-5">
        <h3 className="text-sm font-extrabold">Step by step</h3>
        <ol className="mt-3 grid gap-3 sm:grid-cols-2">
          {sign.steps.map((s, i) => (
            <li key={s} className="flex gap-3 rounded-2xl bg-muted/60 p-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground">
                {i + 1}
              </span>
              <span className="text-sm">{s}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary/70 p-2.5 text-center">
      <p className="font-display text-lg font-extrabold text-secondary-foreground">{value}</p>
      <p className="text-[10px] font-bold text-muted-foreground">{label}</p>
    </div>
  );
}
