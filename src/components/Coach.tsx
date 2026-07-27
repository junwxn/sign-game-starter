import { cn } from "@/lib/utils";

interface CoachProps {
  size?: number;
  className?: string;
  mood?: "happy" | "cheer" | "think";
}

/** Pip — the original Sign Game coach: a friendly rounded character with waving hands. */
export function CoachAvatar({ size = 88, className, mood = "happy" }: CoachProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label="Pip the Sign Game coach"
      className={cn("shrink-0 drop-shadow-sm", className)}
    >
      <circle cx="60" cy="60" r="56" fill="var(--color-secondary)" />
      <circle cx="60" cy="62" r="42" fill="var(--color-primary)" />
      <path d="M28 44a32 32 0 0 1 64 0Z" fill="var(--color-sunny)" />
      <circle cx="47" cy="60" r="7" fill="#fff" />
      <circle cx="73" cy="60" r="7" fill="#fff" />
      <circle cx={mood === "think" ? 49 : 47} cy="61" r="3.6" fill="var(--color-foreground)" />
      <circle cx={mood === "think" ? 75 : 73} cy="61" r="3.6" fill="var(--color-foreground)" />
      <circle cx="36" cy="72" r="6" fill="var(--color-bubble)" opacity="0.55" />
      <circle cx="84" cy="72" r="6" fill="var(--color-bubble)" opacity="0.55" />
      {mood === "cheer" ? (
        <path d="M48 74q12 14 24 0q-12 6 -24 0Z" fill="var(--color-foreground)" />
      ) : (
        <path
          d="M50 74q10 9 20 0"
          stroke="var(--color-foreground)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      )}
      <g className="origin-[18px_82px] animate-wiggle">
        <ellipse cx="16" cy="80" rx="11" ry="13" fill="var(--color-accent)" />
        <rect x="12" y="62" width="4" height="12" rx="2" fill="var(--color-accent)" />
        <rect x="18" y="60" width="4" height="14" rx="2" fill="var(--color-accent)" />
      </g>
      <g className="origin-[104px_82px] animate-wiggle">
        <ellipse cx="104" cy="80" rx="11" ry="13" fill="var(--color-accent)" />
        <rect x="98" y="60" width="4" height="14" rx="2" fill="var(--color-accent)" />
        <rect x="104" y="62" width="4" height="12" rx="2" fill="var(--color-accent)" />
      </g>
    </svg>
  );
}

export function CoachBubble({
  message,
  size = 72,
  className,
  mood = "happy",
}: CoachProps & { message: string }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <CoachAvatar size={size} mood={mood} className="animate-float" />
      <div className="relative min-w-0 rounded-2xl rounded-bl-sm bg-card px-4 py-3 shadow-[var(--shadow-soft)] ring-1 ring-border">
        <p className="text-sm font-semibold text-card-foreground sm:text-base">{message}</p>
      </div>
    </div>
  );
}
