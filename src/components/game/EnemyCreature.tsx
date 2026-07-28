import { Crown, Shield, Wind, Ghost, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Enemy } from "@/game/useBattle";

const KIND_META = {
  basic: { label: "Basic word creature", icon: Ghost, hue: 300, size: 1 },
  fast: { label: "Fast winged creature", icon: Wind, hue: 200, size: 0.85 },
  shield: { label: "Shielded creature", icon: Shield, hue: 175, size: 1.15 },
  wave: { label: "Wave boss creature", icon: Crown, hue: 22, size: 1.35 },
} as const;

export function EnemyCreature({
  enemy,
  active,
  compact,
}: {
  enemy: Enemy;
  active: boolean;
  compact?: boolean;
}) {
  const meta = KIND_META[enemy.kind];
  const Icon = meta.icon;
  const body = `oklch(0.75 0.12 ${meta.hue})`;
  const bodyDark = `oklch(0.6 0.13 ${meta.hue})`;
  const outline = "oklch(0.32 0.06 268)";
  const scale = (compact ? 0.62 : 1) * meta.size;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center transition-transform",
        enemy.state === "hit" && "sg-shake",
        enemy.state === "dead" && "scale-125 opacity-0 duration-300",
      )}
      style={{ width: 108 * scale }}
    >
      {active && (
        <div className="absolute -top-9 flex flex-col items-center">
          <span className="bg-target text-target-foreground font-display sg-pop rounded-full px-2 py-0.5 text-[10px] font-black tracking-wider whitespace-nowrap">
            SIGN THIS!
          </span>
          <ArrowDown className="text-target h-4 w-4 animate-bounce" aria-hidden />
        </div>
      )}

      {enemy.state === "dead" && (
        <span
          className="bg-success/70 absolute inset-0 rounded-full"
          style={{ animation: "sg-burst 0.35s ease-out forwards" }}
          aria-hidden
        />
      )}

      <div
        className={cn("relative", active ? "sg-bob" : "sg-float")}
        style={{ width: 88 * scale, height: 82 * scale }}
      >
        {active && (
          <div className="bg-target/40 absolute inset-0 rounded-full blur-md" aria-hidden style={{ animation: "sg-glow 1.2s ease-in-out infinite" }} />
        )}
        <svg viewBox="0 0 100 96" className="relative h-full w-full">
          {enemy.kind === "shield" && (
            <circle cx="50" cy="48" r="46" fill="oklch(0.8 0.09 200 / 0.35)" stroke="oklch(0.7 0.12 200)" strokeWidth="3" />
          )}
          {enemy.kind === "fast" && (
            <g fill={bodyDark} stroke={outline} strokeWidth="3">
              <path d="M22 44 2 28l6 24z" />
              <path d="M78 44 98 28l-6 24z" />
            </g>
          )}
          {enemy.kind === "wave" && (
            <path d="M28 18 36 4l10 12 8-14 8 14 10-12 8 14z" fill="oklch(0.72 0.18 55)" stroke={outline} strokeWidth="3" />
          )}
          <circle
            cx="50"
            cy="50"
            r="34"
            fill={body}
            stroke={active ? "oklch(0.72 0.18 55)" : outline}
            strokeWidth={active ? 5 : 3}
          />
          <path d="M22 58a34 34 0 0 0 56 0z" fill={bodyDark} opacity="0.35" />
          {/* eyes */}
          <ellipse cx="40" cy="44" rx="6" ry={enemy.state === "hit" ? 3 : 7} fill="oklch(0.99 0 0)" />
          <ellipse cx="62" cy="44" rx="6" ry={enemy.state === "hit" ? 3 : 7} fill="oklch(0.99 0 0)" />
          <circle cx="41" cy="45" r="3" fill={outline} />
          <circle cx="63" cy="45" r="3" fill={outline} />
          {/* mouth */}
          <path
            d={enemy.state === "hit" ? "M42 64q8 8 16 0" : "M42 62q8 8 16 0"}
            fill="none"
            stroke={outline}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* word label */}
      <div
        className={cn(
          "font-display -mt-2 flex items-center gap-1 rounded-xl border-2 px-2 py-0.5 shadow-[0_3px_0_0_var(--shadow-edge)]",
          active
            ? "bg-target text-target-foreground border-target-foreground/30 text-sm font-black"
            : "bg-card text-ink border-border text-xs font-extrabold opacity-80",
        )}
      >
        <Icon className="h-3 w-3 shrink-0" aria-label={meta.label} />
        <span className="max-w-24 truncate">{enemy.word}</span>
      </div>

      {enemy.maxHp > 1 && (
        <div className="bg-muted border-border mt-1 h-1.5 w-14 overflow-hidden rounded-full border">
          <div
            className="bg-danger h-full transition-[width]"
            style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
