import { Heart, Lock, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Stars } from "./ui";
import type { SignData } from "@/game/types";

/** Reusable illustrated placeholder for a sign reference. */
export function SignReference({
  sign,
  size = "md",
  className,
}: {
  sign: SignData;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dim = size === "sm" ? "h-16 w-16" : size === "lg" ? "h-56 w-full" : "h-28 w-28";
  return (
    <figure className={cn("bg-accent/60 border-border grid place-items-center overflow-hidden rounded-2xl border-2", dim, className)}>
      <svg viewBox="0 0 120 120" className="h-full w-full" role="img" aria-label={`Reference illustration for the sign ${sign.name}. ${sign.description}`}>
        <circle cx="60" cy="60" r="52" fill="oklch(0.95 0.03 250)" />
        <circle cx="60" cy="60" r="52" fill="none" stroke="oklch(0.62 0.19 300 / 0.35)" strokeWidth="3" strokeDasharray="7 6" className="sg-spin-slow" style={{ transformOrigin: "60px 60px" }} />
        {/* stylised hand */}
        <g stroke="oklch(0.32 0.06 268)" strokeWidth="3" strokeLinecap="round">
          <path d="M48 92V58c0-4 6-4 6 0v20" fill="oklch(0.85 0.06 60)" />
          <path d="M54 78V44c0-4 6-4 6 0v34" fill="oklch(0.85 0.06 60)" />
          <path d="M60 78V40c0-4 6-4 6 0v38" fill="oklch(0.85 0.06 60)" />
          <path d="M66 80V48c0-4 6-4 6 0v32" fill="oklch(0.85 0.06 60)" />
          <path d="M42 88c-4-8 0-18 6-18" fill="oklch(0.85 0.06 60)" />
          <path d="M42 86h34v10a10 10 0 0 1-10 10H52a10 10 0 0 1-10-10z" fill="oklch(0.85 0.06 60)" />
        </g>
        {/* movement arrow */}
        <path d="M86 46c10 8 10 24 0 32" fill="none" stroke="oklch(0.72 0.18 55)" strokeWidth="4" strokeLinecap="round" />
        <path d="M86 78l-6-4 8-3z" fill="oklch(0.72 0.18 55)" />
      </svg>
      <figcaption className="sr-only">{sign.description}</figcaption>
    </figure>
  );
}

export function SignCollectionItem({
  sign,
  stars,
  bestConfidence,
  favourite,
  locked,
  onClick,
}: {
  sign: SignData;
  stars: number;
  bestConfidence: number;
  favourite: boolean;
  locked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={locked}
      className={cn(
        "sg-panel group relative flex min-h-44 flex-col items-center gap-1.5 p-3 text-center transition-transform",
        locked ? "opacity-60" : "hover:-translate-y-1",
      )}
    >
      {favourite && (
        <Heart className="text-danger fill-danger absolute top-2 right-2 h-4 w-4" aria-label="Favourite" />
      )}
      {locked && (
        <span className="sg-hud-chip absolute top-2 left-2 px-2 py-0.5 text-[10px]">
          <Lock className="h-3 w-3" aria-hidden /> {sign.unlockAt}
        </span>
      )}
      <SignReference sign={sign} size="sm" />
      <p className="font-display text-ink text-base leading-tight font-black">{sign.name}</p>
      <Stars value={stars} />
      <p className="text-muted-foreground text-[11px] font-bold">
        Best {bestConfidence ? `${Math.round(bestConfidence * 100)}%` : "—"}
      </p>
    </button>
  );
}

/** Ordered sign tokens for a sentence, one active at a time. */
export function SentenceSequence({
  sequence,
  activeIndex,
  doneTo = -1,
  size = "md",
}: {
  sequence: string[];
  activeIndex: number;
  doneTo?: number;
  size?: "sm" | "md";
}) {
  return (
    <ol className="sg-scroll flex items-center gap-1.5 overflow-x-auto pb-1" aria-label="Sign sequence">
      {sequence.map((token, i) => {
        const state = i < doneTo || i < activeIndex ? "done" : i === activeIndex ? "active" : "todo";
        return (
          <li key={`${token}-${i}`} className="flex shrink-0 items-center gap-1.5">
            <span
              className={cn(
                "font-display rounded-xl border-2 px-2.5 py-1 font-black whitespace-nowrap",
                size === "sm" ? "text-[11px]" : "text-sm",
                state === "active" && "bg-target text-target-foreground border-target-foreground/30 shadow-[0_3px_0_0_var(--shadow-edge)]",
                state === "done" && "bg-success/25 text-success-foreground border-success",
                state === "todo" && "bg-card text-muted-foreground border-border",
              )}
            >
              {state === "done" && <span aria-hidden>✓ </span>}
              {state === "active" && <span className="sr-only">Current sign: </span>}
              {token}
            </span>
            {i < sequence.length - 1 && <span className="text-muted-foreground text-xs" aria-hidden>→</span>}
          </li>
        );
      })}
    </ol>
  );
}

export function QuestTile({
  meaning,
  count,
  difficulty,
  stars,
  bestScore,
  completed,
  onClick,
}: {
  meaning: string;
  count: number;
  difficulty: string;
  stars: number;
  bestScore: number;
  completed: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="sg-panel flex min-h-32 flex-col justify-between p-4 text-left transition-transform hover:-translate-y-1">
      <div className="flex items-start justify-between gap-2">
        <p className="font-display text-ink text-base leading-tight font-black">{meaning}</p>
        {completed && <Star className="text-target fill-target h-4 w-4 shrink-0" aria-label="Completed" />}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="sg-hud-chip px-2 py-0.5 text-[10px]">{count} signs</span>
        <span className="sg-hud-chip px-2 py-0.5 text-[10px] capitalize">{difficulty}</span>
        <Stars value={stars} size={13} />
        <span className="text-muted-foreground ml-auto text-[11px] font-bold">Best {bestScore}</span>
      </div>
    </button>
  );
}
