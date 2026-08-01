import { useMemo, useState } from "react";
import { ArrowLeft, Search, Star } from "lucide-react";
import { GameButton, IconButton, Scene, SignMark, Stars } from "@/components/game/kit";
import { SENTENCES, SENTENCE_CATEGORIES, SENTENCE_REVIEW_NOTE, tokenById } from "@/game/sentences";
import type { SentenceProgress } from "@/game/storage";
import { cn } from "@/lib/utils";

export function isSentenceUnlocked(
  _index: number,
  _id: string,
  _progress: Record<string, SentenceProgress>,
  _unlocked: string[],
) {
  return true;
}

export function SentenceQuests({
  progress,
  favourites,
  unlocked,
  focusSentence,
  onOpen,
}: {
  progress: Record<string, SentenceProgress>;
  favourites: string[];
  unlocked: string[];
  focusSentence?: string;
  onOpen: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<(typeof SENTENCE_CATEGORIES)[number]>("All");
  const [signCountFilter, setSignCountFilter] = useState<number | "All">("All");

  const availableCounts = useMemo(() => {
    const set = new Set<number>();
    SENTENCES.forEach((s) => set.add(s.signSequence.length));
    return Array.from(set).sort((a, b) => a - b);
  }, []);

  const signCountStats = useMemo(() => {
    const stats: Record<number, number> = {};
    SENTENCES.filter(
      (s) =>
        (cat === "All" || s.category === cat) &&
        (s.title.toLowerCase() + s.englishMeaning.toLowerCase()).includes(
          query.trim().toLowerCase(),
        ),
    ).forEach((s) => {
      const len = s.signSequence.length;
      stats[len] = (stats[len] || 0) + 1;
    });
    return stats;
  }, [query, cat]);

  const list = useMemo(
    () =>
      SENTENCES.filter(
        (s) =>
          (cat === "All" || s.category === cat) &&
          (signCountFilter === "All" || s.signSequence.length === signCountFilter) &&
          (s.title.toLowerCase() + s.englishMeaning.toLowerCase()).includes(
            query.trim().toLowerCase(),
          ),
      ),
    [query, cat, signCountFilter],
  );

  const totalFilteredCount = useMemo(
    () =>
      SENTENCES.filter(
        (s) =>
          (cat === "All" || s.category === cat) &&
          (s.title.toLowerCase() + s.englishMeaning.toLowerCase()).includes(
            query.trim().toLowerCase(),
          ),
      ).length,
    [query, cat],
  );

  const grouped = useMemo(() => {
    const groups = new Map<number, (typeof SENTENCES)[number][]>();
    list.forEach((sentence) => {
      const count = sentence.signSequence.length;
      groups.set(count, [...(groups.get(count) ?? []), sentence]);
    });
    return [...groups.entries()].sort(([a], [b]) => a - b);
  }, [list]);

  const gridForCount = (count: number) => {
    if (count <= 2) return "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    if (count === 3) return "lg:grid-cols-2 xl:grid-cols-3";
    if (count === 4) return "xl:grid-cols-2";
    return "2xl:grid-cols-2";
  };

  const handleResetFilters = () => {
    setQuery("");
    setCat("All");
    setSignCountFilter("All");
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-2.5">
      {/* Search & Category Filter */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <label className="sr-only" htmlFor="sentence-search">
            Search sentence quests
          </label>
          <input
            id="sentence-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sentence quests…"
            className="w-full rounded-full border-[3px] border-ink bg-cream py-1.5 pl-9 pr-3 font-display text-sm font-bold text-ink"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SENTENCE_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cat === c}
              onClick={() => setCat(c)}
              className={cn(
                "btn-game !px-3 !py-1 text-xs uppercase",
                cat === c ? "bg-magic text-cream" : "bg-cream text-ink",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Sign Count Segregation Bubbles Bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border-[3px] border-ink/40 bg-ink/30 p-2.5 backdrop-blur">
        <span className="font-display text-xs font-black uppercase tracking-wider text-cream text-outline">
          Filter by Signs:
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            aria-pressed={signCountFilter === "All"}
            onClick={() => setSignCountFilter("All")}
            className={cn(
              "btn-game !px-3.5 !py-1 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 rounded-full",
              signCountFilter === "All"
                ? "bg-target text-[oklch(0.2_0.05_50)] scale-105 shadow-md ring-2 ring-cream"
                : "bg-cream/90 text-ink hover:bg-cream"
            )}
          >
            <span>All Signs</span>
            <span className="rounded-full bg-ink/15 px-1.5 py-0.2 text-[0.65rem] font-black">
              {totalFilteredCount}
            </span>
          </button>

          {availableCounts.map((count) => {
            const countQty = signCountStats[count] ?? 0;
            const isSelected = signCountFilter === count;
            return (
              <button
                key={count}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSignCountFilter(isSelected ? "All" : count)}
                className={cn(
                  "btn-game !px-3.5 !py-1 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 rounded-full",
                  isSelected
                    ? "bg-target text-[oklch(0.2_0.05_50)] scale-105 shadow-md ring-2 ring-cream"
                    : countQty > 0
                      ? "bg-cream text-ink hover:bg-white"
                      : "bg-cream/50 text-ink/50"
                )}
              >
                <span>{count} Signs</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[0.65rem] font-black",
                    isSelected ? "bg-ink/20 text-ink" : "bg-ink/10 text-ink"
                  )}
                >
                  {countQty}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Segregation Status Indicator */}
      {signCountFilter !== "All" && (
        <div className="flex items-center justify-between rounded-xl bg-target/90 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-[oklch(0.2_0.05_50)] shadow">
          <span>Showing {signCountFilter}-Sign Quests ({list.length})</span>
          <button
            type="button"
            onClick={() => setSignCountFilter("All")}
            className="rounded-full bg-ink/20 px-2.5 py-0.5 text-[0.65rem] font-black hover:bg-ink/30"
          >
            ✕ View All Signs
          </button>
        </div>
      )}

      {/* Main List / Grid */}
      <div className="collection-scroll min-h-0 flex-1 space-y-5 overflow-y-scroll pb-4 pr-2">
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-[3px] border-dashed border-cream/40 bg-ink/20 py-12 text-center text-cream">
            <p className="font-display text-lg font-bold">No sentence quests match your filters</p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn-game bg-target !px-4 !py-2 text-xs uppercase text-[oklch(0.2_0.05_50)]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          grouped.map(([count, sentences]) => (
            <section key={count} aria-labelledby={`sentence-count-${count}`}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3
                    id={`sentence-count-${count}`}
                    className="font-display text-xl font-black text-cream text-outline"
                  >
                    {count} Signs
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setSignCountFilter(signCountFilter === count ? "All" : count)
                    }
                    title={`Click to ${signCountFilter === count ? "show all" : `filter ${count}-sign quests`}`}
                    className={cn(
                      "hud-chip !py-0.5 text-[0.6rem] transition-transform hover:scale-105 cursor-pointer",
                      signCountFilter === count && "bg-target text-[oklch(0.2_0.05_50)] font-black"
                    )}
                  >
                    {sentences.length} {sentences.length === 1 ? "quest" : "quests"}
                    {signCountFilter === count ? " (Active)" : " · Click to filter"}
                  </button>
                </div>
              </div>
              <ul className={cn("grid grid-cols-1 items-stretch gap-4", gridForCount(count))}>
                {sentences.map((s) => {
                  const index = SENTENCES.findIndex((x) => x.id === s.id);
                  const open = isSentenceUnlocked(index, s.id, progress, unlocked);
                  const p = progress[s.id];
                  const done = (p?.completions ?? 0) > 0;
                  const highlight = focusSentence === s.id;
                  return (
                    <li key={s.id} className="h-full">
                      <button
                        type="button"
                        onClick={() => onOpen(s.id)}
                        className={cn(
                          "btn-game h-full min-h-[27rem] w-full flex-col !items-center gap-3 !px-4 !py-5 text-center transition-transform hover:scale-[1.01]",
                          highlight
                            ? "bg-target text-[oklch(0.2_0.05_50)]"
                            : open
                              ? "bg-cream text-ink"
                              : "bg-cream/60 text-ink/60",
                        )}
                      >
                        <span className="flex w-full flex-col items-center gap-2">
                          <span className="font-display text-lg font-black leading-tight">
                            {open ? s.title : "Locked / Complete earlier quest"}
                          </span>
                          {done && (
                            <span className="word-label bg-success text-[0.55rem] text-[oklch(0.2_0.05_180)]">
                              COMPLETE
                            </span>
                          )}
                        </span>
                        <span className="min-h-10 font-sans text-sm font-semibold leading-snug opacity-85">
                          {open ? s.englishMeaning : "Complete earlier quests to unlock"}
                        </span>
                        <span className="collection-scroll block min-h-36 w-full flex-1 overflow-x-auto rounded-xl bg-[color-mix(in_srgb,var(--magic)_8%,white)] p-3">
                          <span className="mx-auto flex w-max min-w-full items-center justify-center gap-2">
                            {s.signSequence.map((tokenId, tokenIndex) => {
                              const token = tokenById(tokenId);
                              return (
                                <SignMark
                                  key={`${tokenId}-${tokenIndex}`}
                                  signId={tokenId}
                                  label={token.name}
                                  size={112}
                                  className="sentence-sign-mark"
                                />
                              );
                            })}
                          </span>
                        </span>
                        <span className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
                          <span className="hud-chip !py-0.5 text-[0.6rem]">
                            {s.signSequence.length} signs
                          </span>
                          <span className="hud-chip !py-0.5 text-[0.6rem]">{s.difficulty}</span>
                          <span className="hud-chip !py-0.5 text-[0.6rem]">{s.category}</span>
                          {favourites.includes(s.id) && (
                            <Star className="h-3.5 w-3.5 fill-current text-target-deep" aria-hidden />
                          )}
                        </span>
                        <span className="flex w-full items-center justify-between gap-2 pt-0.5">
                          <Stars n={p?.stars ?? 0} />
                          <span className="text-[0.62rem] font-bold uppercase tracking-widest opacity-70">
                            Best {p?.bestScore ?? 0}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>

      <p className="pb-2 font-display text-[0.6rem] font-bold uppercase tracking-widest text-cream/85 drop-shadow">
        {SENTENCE_REVIEW_NOTE}
      </p>
    </div>
  );
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex w-fit gap-1 rounded-full border-[3px] border-ink bg-ink/60 p-1 backdrop-blur"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-full px-4 py-1.5 font-display text-sm font-black uppercase tracking-wide transition-transform",
            value === o.value
              ? "bg-target text-[oklch(0.2_0.05_50)] scale-105"
              : "text-cream/85 hover:text-cream",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SentenceQuestsHeaderButton({ onClick }: { onClick: () => void }) {
  return (
    <GameButton tone="magic" onClick={onClick}>
      Sentence Quests
    </GameButton>
  );
}

export function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <IconButton label={label} onClick={onClick}>
      <ArrowLeft className="mx-auto h-5 w-5" aria-hidden />
    </IconButton>
  );
}

export { Scene };
