import { createFileRoute } from "@tanstack/react-router";
import { Clock, Flame, Sparkles, Target, TrendingUp, Trophy } from "lucide-react";
import { CoachBubble } from "@/components/Coach";
import { DAILY_MINUTES, SESSION_HISTORY, WEEKLY_ACCURACY } from "@/lib/sign-data";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — Sign Game" },
      {
        name: "description",
        content:
          "See your weekly streak, accuracy trend, practice minutes and session history in the Sign Game progress dashboard.",
      },
      { property: "og:title", content: "Progress — Sign Game" },
      {
        property: "og:description",
        content: "Charts, streaks and session history for your sign language practice.",
      },
    ],
  }),
  component: ProgressPage,
});

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const STATS = [
  { label: "Total signs practised", value: "24", icon: Sparkles, tone: "bg-gradient-sky" },
  { label: "Average accuracy", value: "83%", icon: Target, tone: "bg-gradient-mint" },
  { label: "Best score", value: "2,110", icon: Trophy, tone: "bg-gradient-grape" },
  { label: "Practice minutes", value: "96", icon: Clock, tone: "bg-gradient-sunset" },
];

const COMPLETION = [
  { label: "Greetings", value: 92 },
  { label: "Daily Needs", value: 74 },
  { label: "People", value: 58 },
  { label: "Conversation", value: 47 },
  { label: "School & Places", value: 31 },
];

function ProgressPage() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Your Progress</h1>
        <p className="text-sm text-muted-foreground">Sample data for prototype demonstration.</p>
      </header>

      <section className="card-soft animate-rise p-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-sunset">
              <Flame className="h-6 w-6 text-accent-foreground" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-2xl font-extrabold">7-day streak</p>
              <p className="truncate text-sm text-muted-foreground">Longest streak: 12 days</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-1.5">
            {DAYS.map((d, i) => (
              <div key={i} className="text-center">
                <div
                  className={`grid h-9 w-9 place-items-center rounded-xl text-xs font-extrabold ${
                    i < 6 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {d}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CoachBubble message="Your streak is growing! One more day for a new badge." mood="cheer" size={64} />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="card-soft hover-lift p-4">
            <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${s.tone}`}>
              <s.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <p className="font-display text-2xl font-extrabold">{s.value}</p>
            <p className="text-xs font-bold text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card-soft p-5">
          <h2 className="text-lg font-extrabold">Weekly accuracy</h2>
          <div className="mt-4 flex h-44 items-end gap-2">
            {WEEKLY_ACCURACY.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] font-extrabold text-muted-foreground">{d.value}%</span>
                <div
                  className="w-full rounded-t-xl bg-gradient-sky transition-all"
                  style={{ height: `${d.value}%` }}
                />
                <span className="text-[10px] font-bold text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card-soft p-5">
          <h2 className="text-lg font-extrabold">Daily practice (minutes)</h2>
          <div className="mt-4 flex h-44 items-end gap-2">
            {DAILY_MINUTES.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] font-extrabold text-muted-foreground">{d.value}</span>
                <div
                  className="w-full rounded-t-xl bg-gradient-sunset transition-all"
                  style={{ height: `${(d.value / 25) * 100}%` }}
                />
                <span className="text-[10px] font-bold text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card-soft p-5">
          <h2 className="text-lg font-extrabold">Sign completion</h2>
          <ul className="mt-3 space-y-3">
            {COMPLETION.map((c) => (
              <li key={c.label}>
                <div className="flex justify-between text-sm font-bold">
                  <span>{c.label}</span>
                  <span className="text-muted-foreground">{c.value}%</span>
                </div>
                <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-mint" style={{ width: `${c.value}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-4">
          <section className="card-soft flex items-center gap-3 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-mint text-2xl">
              📈
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-muted-foreground">Most improved sign</p>
              <p className="font-display text-xl font-extrabold">Thank You · +18%</p>
            </div>
          </section>
          <section className="card-soft flex items-center gap-3 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-destructive/15 text-2xl">
              🎯
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-muted-foreground">Needs more practice</p>
              <p className="font-display text-xl font-extrabold">Understand · 38%</p>
            </div>
          </section>
          <section className="card-soft p-5">
            <h2 className="flex items-center gap-2 text-sm font-extrabold">
              <TrendingUp className="h-4 w-4 text-primary" /> Recent scores
            </h2>
            <div className="mt-3 flex h-20 items-end gap-1.5">
              {[780, 960, 1420, 1650, 1840, 2110].map((v, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-lg bg-gradient-grape"
                  style={{ height: `${(v / 2110) * 100}%` }}
                  title={String(v)}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="card-soft p-5">
        <h2 className="text-lg font-extrabold">Session history</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="text-xs font-extrabold text-muted-foreground">
                <th className="pb-2">Date</th>
                <th className="pb-2">Mode</th>
                <th className="pb-2">Score</th>
                <th className="pb-2">Accuracy</th>
                <th className="pb-2">Duration</th>
                <th className="pb-2">Signs</th>
              </tr>
            </thead>
            <tbody>
              {SESSION_HISTORY.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="py-3 font-bold">{s.date}</td>
                  <td className="py-3">
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-extrabold text-secondary-foreground">
                      {s.mode}
                    </span>
                  </td>
                  <td className="py-3 font-extrabold">{s.score.toLocaleString()}</td>
                  <td className="py-3 text-muted-foreground">{s.accuracy}%</td>
                  <td className="py-3 text-muted-foreground">{s.duration}</td>
                  <td className="py-3 text-muted-foreground">{s.signsCompleted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
