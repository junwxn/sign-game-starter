import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Heart, Search } from "lucide-react";
import { DifficultyPill, SignDetailsDialog } from "@/components/SignDetails";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/lib/settings-store";
import { SIGNS, type Sign } from "@/lib/sign-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Sign Library — Sign Game" },
      {
        name: "description",
        content:
          "Browse, search and favourite Singapore Sign Language signs with difficulty, category and practice stats.",
      },
      { property: "og:title", content: "Sign Library — Sign Game" },
      {
        property: "og:description",
        content: "A searchable grid of signs with tips, steps and common mistakes.",
      },
    ],
  }),
  component: LibraryPage,
});

const FILTERS = [
  "All signs",
  "Beginner",
  "Intermediate",
  "Practised",
  "Not practised",
  "Favourites",
] as const;

function LibraryPage() {
  const { favourites, toggleFavourite, practised } = useSettings();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All signs");
  const [selected, setSelected] = useState<Sign | null>(null);

  const isPractised = (s: Sign) => s.practised || practised.includes(s.id);

  const list = useMemo(
    () =>
      SIGNS.filter((s) => {
        const q = query.trim().toLowerCase();
        if (q && !s.name.toLowerCase().includes(q) && !s.category.toLowerCase().includes(q))
          return false;
        switch (filter) {
          case "Beginner":
            return s.difficulty === "Beginner";
          case "Intermediate":
            return s.difficulty === "Intermediate";
          case "Practised":
            return isPractised(s);
          case "Not practised":
            return !isPractised(s);
          case "Favourites":
            return favourites.includes(s.id);
          default:
            return true;
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, filter, favourites, practised],
  );

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Sign Library</h1>
        <p className="text-sm text-muted-foreground">
          {list.length} signs · tap a card for steps, tips and mistakes.
        </p>
      </header>

      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search signs or categories…"
          className="h-12 rounded-2xl pl-10 font-semibold"
        />
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-1">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition-all",
                filter === f
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                  : "bg-card text-card-foreground ring-1 ring-border hover:bg-secondary",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="card-soft p-10 text-center font-bold text-muted-foreground">
          No signs match that search yet — try another word.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => {
            const fav = favourites.includes(s.id);
            return (
              <li key={s.id} className="card-soft hover-lift animate-rise overflow-hidden">
                <button
                  onClick={() => setSelected(s)}
                  className="grid h-32 w-full place-items-center bg-gradient-mint text-5xl"
                  aria-label={`Open details for ${s.name}`}
                >
                  <span aria-hidden>{s.emoji}</span>
                </button>
                <div className="p-4">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-lg font-extrabold">{s.name}</h2>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <DifficultyPill difficulty={s.difficulty} />
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-extrabold text-secondary-foreground">
                          {s.category}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFavourite(s.id)}
                      aria-label={fav ? `Unfavourite ${s.name}` : `Favourite ${s.name}`}
                      className="shrink-0 rounded-full p-1.5 transition-transform hover:scale-110"
                    >
                      <Heart
                        className={cn("h-5 w-5 text-muted-foreground", fav && "fill-bubble text-bubble")}
                      />
                    </button>
                  </div>

                  <div className="mt-3 flex justify-between text-xs font-bold text-muted-foreground">
                    <span>{s.practiceCount} practices</span>
                    <span>{s.accuracy}% accuracy</span>
                  </div>
                  <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-sky"
                      style={{ width: `${s.accuracy}%` }}
                    />
                  </div>

                  <Button
                    className="mt-3 w-full rounded-xl font-extrabold"
                    onClick={() => setSelected(s)}
                  >
                    Practise
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <SignDetailsDialog sign={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}
