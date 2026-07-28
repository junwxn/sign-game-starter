import type { CSSProperties } from "react";
import { Stars } from "@/components/game/kit";
import { tokenById } from "@/game/sentences";
import { cn } from "@/lib/utils";

export type TokenState = "locked" | "todo" | "current" | "done" | "wrong";

/**
 * One sign token in a sentence path — reference placeholder + completion state.
 * The active token always uses the orange target colour used by active enemies.
 */
export function SignToken({
  tokenId,
  state = "todo",
  stars,
  size = "md",
  index,
  onClick,
  className,
  style,
}: {
  tokenId: string;
  state?: TokenState;
  stars?: number;
  size?: "sm" | "md" | "lg";
  index?: number;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}) {
  const t = tokenById(tokenId);
  const sizes = {
    sm: "min-w-[4.5rem] px-2 py-1.5 text-xs",
    md: "min-w-[6rem] px-3 py-2 text-sm",
    lg: "min-w-[7.5rem] px-4 py-3 text-base",
  };
  const emojiSize = { sm: "text-2xl", md: "text-3xl", lg: "text-4xl" }[size];
  const tone =
    state === "current"
      ? "bg-target text-[oklch(0.2_0.05_50)] anim-target"
      : state === "done"
        ? "bg-success text-[oklch(0.2_0.05_180)]"
        : state === "wrong"
          ? "bg-danger text-cream anim-shake"
          : state === "locked"
            ? "bg-cream/60 text-ink/60"
            : "bg-cream text-ink";
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      {...(onClick ? { type: "button" as const, onClick } : {})}
      style={style}
      aria-current={state === "current" ? "step" : undefined}
      className={cn(
        "btn-game shrink-0 flex-col !items-center gap-0.5 text-center",
        sizes[size],
        tone,
        !onClick && "cursor-default",
        className,
      )}
    >
      <span className="flex w-full items-center justify-between gap-2 text-[0.55rem] font-black uppercase tracking-widest opacity-70">
        <span>{index !== undefined ? `#${index + 1}` : ""}</span>
        <span>{state === "done" ? "✓" : state === "locked" ? "🔒" : ""}</span>
      </span>
      <span aria-hidden className={cn(emojiSize, state === "current" && "anim-bob")}>
        {state === "locked" ? "❔" : t.emoji}
      </span>
      <span className="font-display font-black uppercase leading-tight">{t.name}</span>
      {stars !== undefined && <Stars n={stars} size={11} />}
    </Tag>
  );
}

export function PathArrow({ lit }: { lit?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center font-display text-2xl font-black",
        lit ? "text-target" : "text-cream/70",
      )}
    >
      →
    </span>
  );
}

/** Connected path of sign tokens: I → WANT → WATER */
export function SentencePath({
  sequence,
  currentIndex,
  doneIndexes = [],
  wrongIndexes = [],
  starsFor,
  size = "md",
  onSelect,
  className,
}: {
  sequence: string[];
  currentIndex?: number;
  doneIndexes?: number[];
  wrongIndexes?: number[];
  starsFor?: (tokenId: string) => number | undefined;
  size?: "sm" | "md" | "lg";
  onSelect?: (index: number) => void;
  className?: string;
}) {
  return (
    <ol
      className={cn(
        "flex w-full items-stretch gap-1 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible",
        className,
      )}
      aria-label="Sign sequence"
    >
      {sequence.map((id, i) => (
        <li key={`${id}-${i}`} className="flex items-center gap-1">
          <SignToken
            tokenId={id}
            index={i}
            size={size}
            stars={starsFor?.(id)}
            state={
              wrongIndexes.includes(i)
                ? "wrong"
                : currentIndex === i
                  ? "current"
                  : doneIndexes.includes(i)
                    ? "done"
                    : "todo"
            }
            onClick={onSelect ? () => onSelect(i) : undefined}
          />
          {i < sequence.length - 1 && <PathArrow lit={(currentIndex ?? -1) > i} />}
        </li>
      ))}
    </ol>
  );
}

/** Timing line used by the demonstration playback. */
export function SequenceProgressLine({ value, max }: { value: number; max: number }) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full border-[3px] border-ink bg-[color-mix(in_oklab,var(--ink)_35%,transparent)]">
      <div
        className="h-full rounded-full bg-target transition-[width] duration-200"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
