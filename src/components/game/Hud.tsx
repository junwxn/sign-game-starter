import { Heart, Pause, Flame, Trophy, Waves, Timer, Lightbulb, Shield, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton, Meter } from "./ui";

export function GameHUD({
  score,
  combo,
  lives,
  maxLives,
  wave,
  time,
  onPause,
  onHint,
  compact,
}: {
  score: number;
  combo: number;
  lives: number;
  maxLives: number;
  wave: number;
  time: number;
  onPause: () => void;
  onHint?: () => void;
  compact?: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 p-2 sm:p-4">
      <div className="pointer-events-auto flex min-w-0 flex-col items-start gap-1.5">
        <span className="sg-hud-chip text-sm sm:text-base">
          <Trophy className="text-target h-4 w-4" aria-hidden />
          <span className="sr-only">Score</span>
          {score.toLocaleString()}
        </span>
        <span className="sg-hud-chip text-xs">
          <Waves className="text-magic h-3.5 w-3.5" aria-hidden />
          Wave {wave}
        </span>
      </div>

      <div className="pointer-events-auto flex flex-col items-center gap-1.5">
        <span
          className={cn(
            "sg-hud-chip text-sm",
            combo >= 3 && "border-target text-target-foreground bg-target",
          )}
        >
          <Flame className="h-4 w-4" aria-hidden />
          <span className="sr-only">Combo</span>x{combo}
        </span>
        {!compact && (
          <span className="sg-hud-chip text-xs">
            <Timer className="h-3.5 w-3.5" aria-hidden />
            {Math.floor(time / 60)}:{String(time % 60).padStart(2, "0")}
          </span>
        )}
      </div>

      <div className="pointer-events-auto flex flex-col items-end gap-1.5">
        <span className="sg-hud-chip" aria-label={`${lives} of ${maxLives} lives remaining`}>
          {Array.from({ length: maxLives }).map((_, i) => (
            <Heart
              key={i}
              className={cn("h-4 w-4", i < lives ? "fill-danger text-danger" : "text-muted-foreground/40")}
              aria-hidden
            />
          ))}
        </span>
        <div className="flex gap-1.5">
          {onHint && (
            <IconButton label="Show hint" onClick={onHint} className="h-9 w-9">
              <Lightbulb className="h-4 w-4" aria-hidden />
            </IconButton>
          )}
          <IconButton label="Pause game" onClick={onPause} className="h-9 w-9">
            <Pause className="h-4 w-4" aria-hidden />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

export function PowerUpBar({
  shield,
  slowActive,
  onShield,
  onSlow,
  onHint,
  className,
}: {
  shield: number;
  slowActive: boolean;
  onShield: () => void;
  onSlow: () => void;
  onHint: () => void;
  className?: string;
}) {
  const items = [
    { label: "Shield", icon: Shield, onClick: onShield, note: shield > 0 ? `x${shield}` : "ready" },
    { label: "Slow Time", icon: Clock, onClick: onSlow, note: slowActive ? "active" : "ready" },
    { label: "Hint Spark", icon: Lightbulb, onClick: onHint, note: "ready" },
  ];
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {items.map((p) => (
        <button
          key={p.label}
          onClick={p.onClick}
          className="sg-hud-chip min-h-11 flex-col gap-0 px-3 py-1 text-[10px] transition-transform active:translate-y-0.5"
        >
          <p.icon className="text-magic h-4 w-4" aria-hidden />
          <span>{p.label}</span>
          <span className="text-muted-foreground font-bold">{p.note}</span>
        </button>
      ))}
    </div>
  );
}

export function AttackMeter({
  value,
  incoming,
  label = "Attack meter",
}: {
  value: number;
  incoming?: number;
  label?: string;
}) {
  return (
    <div className="sg-panel w-full px-3 py-2">
      <Meter value={value} tone={value >= 100 ? "danger" : "magic"} label={label} showValue />
      <div className="mt-1 flex items-center justify-between text-[11px] font-bold">
        <span className={value >= 100 ? "text-danger" : "text-muted-foreground"}>
          {value >= 100 ? "ATTACK READY!" : "Sign fast to charge"}
        </span>
        {!!incoming && (
          <span className="text-danger" style={{ animation: "sg-warn 0.8s ease-in-out infinite" }}>
            {incoming} INCOMING
          </span>
        )}
      </div>
    </div>
  );
}

export function DemoControls({
  actions,
  title = "Demo Controls",
}: {
  actions: { label: string; onClick: () => void }[];
  title?: string;
}) {
  return (
    <details className="pointer-events-auto absolute right-2 bottom-2 z-40 sm:right-4 sm:bottom-4">
      <summary className="sg-hud-chip cursor-pointer list-none text-[11px] select-none">
        ⚙︎ {title}
      </summary>
      <div className="sg-panel mt-2 grid max-w-56 grid-cols-2 gap-1.5 p-2">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            className="bg-muted hover:bg-accent text-ink min-h-9 rounded-lg px-2 py-1 text-[11px] font-bold transition-colors"
          >
            {a.label}
          </button>
        ))}
      </div>
    </details>
  );
}
