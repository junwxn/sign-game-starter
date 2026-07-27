import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Gamepad2, Play, Sparkles, Target, Trophy } from "lucide-react";
import { CoachAvatar, CoachBubble } from "@/components/Coach";
import { DifficultyPill } from "@/components/SignDetails";
import { Button } from "@/components/ui/button";
import { BADGES, RECENT_ACTIVITY, SIGNS } from "@/lib/sign-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign Game — Learn Singapore Sign Language the fun way" },
      {
        name: "description",
        content:
          "Track your streak, practise signs, and play arcade rounds in this playful Singapore Sign Language learning prototype.",
      },
      { property: "og:title", content: "Sign Game — Learn signs, build confidence, have fun" },
      {
        property: "og:description",
        content: "A colourful dashboard for learning Singapore Sign Language with coach Pip.",
      },
    ],
  }),
  component: HomePage,
});

const STATS = [
  { label: "Day streak", value: "7", sub: "Keep it alive!", icon: Flame, tone: "bg-gradient-sunset" },
  { label: "Signs learned", value: "24", sub: "of 60 in library", icon: Sparkles, tone: "bg-gradient-sky" },
  { label: "Practice accuracy", value: "86%", sub: "+4% this week", icon: Target, tone: "bg-gradient-mint" },
  { label: "Best score", value: "2,110", sub: "Arcade mode", icon: Trophy, tone: "bg-gradient-grape" },
];

function HomePage() {
  const recommended = SIGNS.filter((s) => s.accuracy < 70).slice(0, 4);

  return (
    <div className="space-y-6">
      <section className="animate-rise relative overflow-hidden rounded-3xl border border-primary/40 bg-gradient-grape p-6 text-primary-foreground shadow-[var(--shadow-pop)] sm:p-8">
        <div className="pointer-events-none absolute inset-0 arcade-grid opacity-50" />
        <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold tracking-[0.25em] text-accent uppercase">
              Player 1 · Ready
            </p>
            <h1 className="mt-2 font-display text-2xl leading-tight tracking-wide text-glow sm:text-4xl">
              PRESS START TO SIGN
            </h1>
            <p className="mt-3 max-w-md text-sm opacity-90">
              Clear quests, chain combos, and level up your Singapore Sign Language.
            </p>
          </div>
          <CoachAvatar size={96} className="animate-float hidden sm:block" />
        </div>
        <div className="relative mt-5 flex flex-wrap gap-3">
          <Button
            asChild
            size="lg"
            className="animate-neon rounded-2xl bg-primary font-display tracking-widest text-primary-foreground hover:bg-primary/90"
          >
            <Link to="/play">
              <Gamepad2 className="mr-1.5 h-4 w-4" /> START GAME
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-2xl border-accent/70 bg-transparent font-display tracking-widest text-accent hover:bg-accent/15 hover:text-accent"
          >
            <Link to="/practice">
              <Play className="mr-1.5 h-4 w-4" /> TRAINING
            </Link>
          </Button>
        </div>
      </section>

      <CoachBubble message="Ready hands? Let's learn something new today!" />

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="hud-panel hover-lift animate-rise overflow-hidden p-4">
            <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${s.tone}`}>
              <s.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <p className="font-display text-2xl tracking-wide text-glow">{s.value}</p>
            <p className="text-[11px] font-extrabold tracking-widest uppercase">{s.label}</p>
            <p className="text-xs text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </section>


      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card-soft animate-rise p-5 lg:col-span-2">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold">Daily Challenge</h2>
              <p className="text-sm text-muted-foreground">
                Sign 5 greeting words before the timer runs out.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-sunny/40 px-3 py-1 text-xs font-extrabold text-sunny-foreground">
              +150 XP
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Hello", "Thank You", "Please", "Sorry", "Good Morning"].map((w, i) => (
              <span
                key={w}
                className={`rounded-xl px-3 py-1.5 text-sm font-bold ${
                  i < 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {w}
              </span>
            ))}
          </div>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-3/5 rounded-full bg-gradient-sunset" />
          </div>
          <div className="mt-4">
            <Button asChild className="rounded-xl font-extrabold">
              <Link to="/play">Take the challenge</Link>
            </Button>
          </div>
        </section>

        <section className="card-soft animate-rise p-5">
          <h2 className="text-lg font-extrabold">Badges</h2>
          <ul className="mt-3 grid grid-cols-3 gap-2">
            {BADGES.map((b) => (
              <li
                key={b.id}
                className={`rounded-2xl p-3 text-center ${b.earned ? "bg-secondary" : "bg-muted opacity-55"}`}
              >
                <span className="text-2xl" aria-hidden>
                  {b.emoji}
                </span>
                <p className="mt-1 text-[10px] leading-tight font-extrabold">{b.label}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card-soft animate-rise p-5">
          <h2 className="text-lg font-extrabold">Recent activity</h2>
          <ul className="mt-3 space-y-3">
            {RECENT_ACTIVITY.map((a) => (
              <li key={a.id} className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-card text-lg">
                  {a.icon}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card-soft animate-rise p-5">
          <h2 className="text-lg font-extrabold">Recommended signs to practise</h2>
          <ul className="mt-3 space-y-3">
            {recommended.map((s) => (
              <li
                key={s.id}
                className="hover-lift flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-xl">
                  {s.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold">{s.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <DifficultyPill difficulty={s.difficulty} />
                    <span className="text-xs text-muted-foreground">{s.accuracy}% accuracy</span>
                  </div>
                </div>
                <Button asChild size="sm" variant="secondary" className="shrink-0 rounded-xl font-extrabold">
                  <Link to="/practice">Practise</Link>
                </Button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
