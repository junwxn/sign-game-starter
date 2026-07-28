import { useMemo, useState } from "react";
import { ArrowLeft, Search, Star } from "lucide-react";
import { GameButton, IconButton, Scene, Stars } from "@/components/game/kit";
import { SENTENCES, SENTENCE_CATEGORIES, SENTENCE_REVIEW_NOTE } from "@/game/sentences";
import type { SentenceProgress } from "@/game/storage";
import { cn } from "@/lib/utils";

export function isSentenceUnlocked(
  index: number,
  id: string,
  progress: Record<string, SentenceProgress>,
  unlocked: string[],
) {
  if (SENTENCES[index]?.isUnlocked || unlocked.includes(id)) return true;
  const completed = SENTENCES.filter((s) => (progress[s.id]?.completions ?? 0) > 0).length;
  return index < 4 + completed;
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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
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

      <ul className="mt-3 grid flex-1 grid-cols-1 content-start gap-3 overflow-y-auto pb-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((s) => {
          const index = SENTENCES.findIndex((x) => x.id === s.id);
          const open = isSentenceUnlocked(index, s.id, progress, unlocked);
          const p = progress[s.id];
          const done = (p?.completions ?? 0) > 0;
          const highlight = focusSentence === s.id;
          return (
            <li key={s.id}>
              <button
                type="button"
                disabled={!open}
                onClick={() => onOpen(s.id)}
                className={cn(
                  "btn-game w-full flex-col !items-start gap-1.5 !px-4 !py-3 text-left",
                  highlight
                    ? "bg-target text-[oklch(0.2_0.05_50)]"
                    : open
                      ? "bg-cream text-ink"
                      : "bg-cream/60 text-ink/60",
                )}
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="font-display text-lg font-black leading-tight">
                    {open ? s.title : "🔒 Locked Quest"}
                  </span>
                  {done && (
                    <span className="word-label bg-success text-[0.55rem] text-[oklch(0.2_0.05_180)]">
                      COMPLETE
                    </span>
                  )}
                </span>
                <span className="font-sans text-sm font-semibold leading-snug opacity-85">
                  {open ? s.englishMeaning : "Complete earlier quests to unlock"}
                </span>
                <span className="flex flex-wrap items-center gap-1.5 pt-0.5">
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
