import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { Gauge, Shield, Sparkles, Waves } from "lucide-react";
import worldBackground from "@/assets/game-world-background-v2.webp";
import { CharacterArt, SignPose } from "@/components/game/CharacterArt";
import type { EnemyKind } from "@/game/data";
import { cn } from "@/lib/utils";

/* ---------------- Buttons ---------------- */

type Tone = "play" | "magic" | "success" | "danger" | "neutral" | "ghost";

const toneClass: Record<Tone, string> = {
  play: "bg-target text-[oklch(0.22_0.05_50)]",
  magic: "bg-magic text-cream",
  success: "bg-success text-[oklch(0.2_0.05_180)]",
  danger: "bg-danger text-cream",
  neutral: "bg-cream text-ink",
  ghost: "bg-[color-mix(in_oklab,var(--ink)_60%,transparent)] text-cream backdrop-blur",
};

export function GameButton({
  tone = "neutral",
  size = "md",
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; size?: "sm" | "md" | "lg" | "xl" }) {
  const sizes = {
    sm: "text-sm px-3 py-1.5",
    md: "text-base px-5 py-2.5",
    lg: "text-xl px-7 py-3.5",
    xl: "text-2xl sm:text-3xl px-10 py-5",
  };
  return (
    <button
      {...rest}
      className={cn("btn-game", toneClass[tone], sizes[size], className)}
      type={rest.type ?? "button"}
    >
      {children}
    </button>
  );
}

export function IconButton({
  label,
  children,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      {...rest}
      type="button"
      aria-label={label}
      title={label}
      className={cn("btn-game bg-cream text-ink h-11 w-11 !px-0 !py-0 rounded-full", className)}
    >
      {children}
    </button>
  );
}

/* ---------------- Scene shell ---------------- */

export function Scene({
  children,
  className,
  dim = 0,
}: {
  children: ReactNode;
  className?: string;
  dim?: number;
}) {
  return (
    <div className={cn("anim-scene relative h-full w-full overflow-hidden", className)}>
      <div
        aria-hidden
        className="scene-backdrop pointer-events-none absolute inset-0"
        style={{
          opacity: 1 - dim * 0.3,
          backgroundImage: `linear-gradient(180deg, rgb(22 76 125 / 18%), transparent 42%, rgb(24 88 77 / 10%)), url(${worldBackground})`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-ink"
        style={{ opacity: dim * 0.34 }}
      />
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}

/* ---------------- HUD ---------------- */

export function HudChip({
  label,
  value,
  icon,
  tone,
  className,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: "target" | "success" | "danger" | "magic";
  className?: string;
}) {
  const toneVar = tone ? `var(--${tone === "target" ? "target" : tone})` : undefined;
  return (
    <div
      className={cn("hud-chip w-fit text-sm sm:text-base", className)}
      style={toneVar ? { borderColor: toneVar } : undefined}
    >
      {icon}
      <span className="text-[0.62rem] font-bold uppercase tracking-widest opacity-75">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

export function Meter({
  value,
  max = 100,
  tone = "target",
  label,
  stages,
}: {
  value: number;
  max?: number;
  tone?: "target" | "success" | "danger" | "magic";
  label?: string;
  stages?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="w-full">
      {label && (
        <div className="mb-1 flex justify-between font-display text-[0.65rem] font-extrabold uppercase tracking-widest">
          <span>{label}</span>
          <span className="tabular-nums">{Math.round(pct)}%</span>
        </div>
      )}
      <div
        className="relative h-4 w-full overflow-hidden rounded-full border-[3px] border-ink bg-[color-mix(in_oklab,var(--ink)_45%,transparent)]"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "meter"}
      >
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${pct}%`, background: `var(--${tone})` }}
        />
        {stages &&
          [25, 50, 75].map((s) => (
            <span
              key={s}
              className="absolute top-0 h-full w-[3px] bg-ink/50"
              style={{ left: `${s}%` }}
            />
          ))}
      </div>
    </div>
  );
}

export function Stars({ n, size = 16 }: { n: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${n} of 3 mastery stars`}>
      {[0, 1, 2].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          aria-hidden
          className={i < n ? "text-target" : "text-ink/25"}
        >
          <path
            fill="currentColor"
            stroke="var(--ink)"
            strokeWidth="1.5"
            d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.4l6.5-.9z"
          />
        </svg>
      ))}
    </span>
  );
}

export function SignMark({
  label,
  signId,
  locked = false,
  size = 56,
  className,
}: {
  label: string;
  signId?: string;
  locked?: boolean;
  size?: number;
  className?: string;
}) {
  const resolvedId = signId ?? label.toLowerCase().replace(/[^a-z0-9]/g, "");
  return (
    <span
      aria-hidden
      className={cn("sign-mark inline-grid shrink-0 place-items-center", className)}
      style={{ width: size, height: size }}
    >
      {locked ? (
        <span className="font-mono text-sm font-black">—</span>
      ) : (
        <SignPose signId={resolvedId} label={label} />
      )}
    </span>
  );
}

/* ---------------- Characters ---------------- */

export type HeroState =
  "idle" | "ready" | "signing" | "correct" | "wrong" | "damage" | "combo" | "victory" | "defeat";

const heroFx: Record<HeroState, string> = {
  idle: "anim-bob",
  ready: "anim-bob",
  signing: "scale-105",
  correct: "-translate-y-3 rotate-[-4deg] scale-110",
  wrong: "anim-shake",
  damage: "anim-shake opacity-80 saturate-50",
  combo: "-translate-y-5 scale-115 rotate-3",
  victory: "anim-bob scale-110",
  defeat: "rotate-6 opacity-75 saturate-50",
};

const heroBubble: Partial<Record<HeroState, string>> = {
  correct: "NICE!",
  combo: "COMBO!",
  wrong: "OOPS",
  damage: "OW!",
  victory: "WE DID IT!",
  defeat: "NEXT TIME!",
};

export function Hero({ state = "idle", className }: { state?: HeroState; className?: string }) {
  return (
    <div className={cn("relative grid aspect-[0.52] select-none place-items-center", className)}>
      {heroBubble[state] && (
        <span className="word-label absolute -top-2 left-1/2 z-10 -translate-x-1/2 text-xs">
          {heroBubble[state]}
        </span>
      )}
      <div
        className={cn(
          "relative grid h-full w-full place-items-center transition-transform duration-300",
          heroFx[state],
        )}
      >
        <CharacterArt className="h-full w-full" />
      </div>
    </div>
  );
}

export function CoachBubble({
  message,
  className,
  side = "left",
}: {
  message: string;
  className?: string;
  side?: "left" | "right";
}) {
  if (!message) return null;
  return (
    <div
      className={cn(
        "anim-scene pointer-events-none flex items-end gap-2",
        side === "right" && "flex-row-reverse",
        className,
      )}
      role="status"
    >
      <CharacterArt
        index={0}
        className="character-art--coach h-16 w-14 shrink-0"
        label="Mei, sign coach"
      />
      <p className="panel max-w-[15rem] px-3 py-2 font-display text-sm font-extrabold leading-snug text-ink">
        {message}
      </p>
    </div>
  );
}

export function Avatar({
  index,
  size = 56,
  className,
  ring,
}: {
  index: number;
  size?: number;
  className?: string;
  ring?: string;
}) {
  return (
    <span
      className={cn("avatar-token inline-grid shrink-0 place-items-center", className)}
      style={{
        width: size,
        height: size,
        boxShadow: ring,
      }}
    >
      <CharacterArt index={index % 4} className="h-full w-full" />
    </span>
  );
}

/* ---------------- Enemy sprite ---------------- */

export function EnemySprite({
  kind,
  word,
  active,
  status,
  fromOpponent,
  hideWord,
  style,
  className,
}: {
  kind: EnemyKind;
  word: string;
  active?: boolean;
  status?: "idle" | "hit" | "defeated";
  fromOpponent?: boolean;
  hideWord?: boolean;
  style?: CSSProperties;
  className?: string;
}) {
  const size = kind === "wave" ? 150 : kind === "shield" ? 120 : kind === "fast" ? 92 : 108;
  const EnemyIcon =
    kind === "wave" ? Waves : kind === "shield" ? Shield : kind === "fast" ? Gauge : Sparkles;
  const signId = word.toLowerCase().replace(/[^a-z0-9]/g, "");
  return (
    <div
      className={cn(
        "absolute flex flex-col items-center transition-transform",
        status === "defeated" && "anim-pop",
        status === "hit" && "anim-shake",
        className,
      )}
      style={style}
    >
      {active && (
        <div className="mb-1 flex flex-col items-center gap-0.5">
          <span className="word-label bg-target text-[0.6rem] tracking-[0.18em] text-[oklch(0.2_0.05_50)]">
            SIGN THIS!
          </span>
          <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden>
            <path d="M9 12 0 0h18z" fill="var(--target)" stroke="var(--ink)" strokeWidth="1.5" />
          </svg>
        </div>
      )}
      <div
        className={cn("relative grid place-items-center", active && "anim-target")}
        style={{ width: size, height: size }}
      >
        {fromOpponent && (
          <span
            aria-hidden
            className="absolute inset-[-6px] rounded-full border-[3px] border-dashed border-magic"
          />
        )}
        <div
          role="img"
          aria-label={`${kind} word target carrying the word ${word}, ${
            fromOpponent ? "sent by your rival" : "field spawn"
          }`}
          className={cn(
            "enemy-token anim-bob grid h-[72%] w-[72%] place-items-center",
            `enemy-token--${kind}`,
            active && "enemy-token--active",
          )}
        >
          <SignPose signId={signId} label={word} className="h-[78%] w-[78%]" />
          <EnemyIcon
            aria-hidden
            className="absolute right-1 top-1 h-4 w-4 stroke-[2.2] opacity-65"
          />
          <span className="absolute bottom-1 font-mono text-[0.45rem] font-black uppercase tracking-widest">
            {kind}
          </span>
        </div>
        {fromOpponent && (
          <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full border-2 border-ink bg-magic text-xs text-cream">
            ⚡
          </span>
        )}
      </div>
      <span
        className={cn(
          "word-label -mt-3 text-sm sm:text-base",
          active && "bg-target text-[oklch(0.2_0.05_50)] scale-110",
        )}
      >
        {hideWord ? "? ? ?" : word}
      </span>
      <span
        className={cn(
          "mt-1 rounded-full border px-2 py-0.5 font-display text-[0.52rem] font-black uppercase tracking-[0.12em] shadow-sm",
          fromOpponent
            ? "border-magic bg-magic text-cream"
            : "border-success bg-success text-[oklch(0.2_0.05_180)]",
        )}
      >
        {fromOpponent ? "Rival attack" : "Field spawn"}
      </span>
    </div>
  );
}

/* ---------------- Feedback ---------------- */

export function FloatingText({
  text,
  tone = "success",
  style,
}: {
  text: string;
  tone?: "success" | "danger" | "target" | "magic";
  style?: CSSProperties;
}) {
  return (
    <span
      className="anim-floatup pointer-events-none absolute z-30 font-display text-3xl font-black text-outline"
      style={{ color: `var(--${tone})`, ...style }}
      aria-hidden
    >
      {text}
    </span>
  );
}

export function Overlay({ children, labelledBy }: { children: ReactNode; labelledBy?: string }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      className="anim-scene absolute inset-0 z-50 grid place-items-center bg-[color-mix(in_oklab,var(--ink)_65%,transparent)] p-4 backdrop-blur-sm"
    >
      {children}
    </div>
  );
}

export function CrystalZone({ health, flash }: { health: number; flash?: boolean }) {
  return (
    <div className="pointer-events-none relative w-full">
      <div
        className={cn(
          "h-14 w-full rounded-t-[2rem] border-t-[4px] border-dashed transition-colors",
          flash ? "border-danger bg-danger/25" : "border-success bg-success/15",
        )}
      />
      <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 flex-col items-center">
        <svg
          width="44"
          height="44"
          viewBox="0 0 48 48"
          aria-hidden
          className={cn("anim-bob drop-shadow", flash && "anim-shake")}
        >
          <path
            d="M24 3 41 20 24 45 7 20z"
            fill="var(--success)"
            stroke="var(--ink)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M24 3 24 45M7 20h34" stroke="var(--ink)" strokeWidth="2" opacity="0.5" />
        </svg>
        <span className="hud-chip text-[0.6rem]">CRYSTAL {Math.max(0, Math.round(health))}%</span>
      </div>
    </div>
  );
}
