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

  const list = useMemo(
    () =>
      SENTENCES.filter(
        (s) =>
          (cat === "All" || s.category === cat) &&
          (s.title.toLowerCase() + s.englishMeaning.toLowerCase()).includes(
            query.trim().toLowerCase(),
          ),
      ),
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

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mt-3 flex flex-wrap items-center gap-2">
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
            className="w-full rounded-full border-[3px] border-ink bg-cream py-2 pl-9 pr-3 font-display font-bold text-ink"
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

      <div className="collection-scroll mt-3 min-h-0 flex-1 space-y-5 overflow-y-scroll pb-4 pr-2">
        {grouped.map(([count, sentences]) => (
          <section key={count} aria-labelledby={`sentence-count-${count}`}>
            <div className="mb-2 flex items-center gap-2">
              <h3
                id={`sentence-count-${count}`}
                className="font-display text-xl font-black text-cream text-outline"
              >
                {count} Signs
              </h3>
              <span className="hud-chip !py-0.5 text-[0.58rem]">
                {sentences.length} {sentences.length === 1 ? "quest" : "quests"}
              </span>
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
                        "btn-game h-full min-h-[27rem] w-full flex-col !items-center gap-3 !px-4 !py-5 text-center",
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
        ))}
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
