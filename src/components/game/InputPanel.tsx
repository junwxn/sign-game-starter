import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Send } from "lucide-react";
import { GameButton, Meter } from "@/components/game/kit";
import { cn } from "@/lib/utils";

export type RecogStatus =
  | "idle"
  | "framing"
  | "hands"
  | "checking"
  | "accepted"
  | "almost"
  | "rejected"
  | "nohands";

export const statusText: Record<RecogStatus, string> = {
  idle: "Move into frame",
  framing: "Move into frame",
  hands: "Both hands visible",
  checking: "Checking sign…",
  accepted: "Sign accepted",
  almost: "Almost — try once more",
  rejected: "Try again",
  nohands: "Keep both hands visible!",
};

const statusTone: Record<RecogStatus, string> = {
  idle: "text-cream",
  framing: "text-cream",
  hands: "text-success",
  checking: "text-target",
  accepted: "text-success",
  almost: "text-target",
  rejected: "text-danger",
  nohands: "text-danger",
};

export function RecognitionStatus({
  status,
  confidence,
  show,
}: {
  status: RecogStatus;
  confidence: number;
  show: boolean;
}) {
  return (
    <div className="w-full space-y-1">
      <p
        className={cn(
          "font-display text-sm font-black uppercase tracking-wide drop-shadow",
          statusTone[status],
        )}
        role="status"
        aria-live="polite"
      >
        {status === "accepted" ? "✓ " : status === "rejected" || status === "nohands" ? "✕ " : "• "}
        {statusText[status]}
      </p>
      {show && (
        <Meter
          value={confidence}
          label="Confidence"
          tone={confidence > 65 ? "success" : "target"}
        />
      )}
    </div>
  );
}

/** Stylised mock camera — no webcam access at any point. */
export function MockCamera({
  status,
  confidence,
  showConfidence,
}: {
  status: RecogStatus;
  confidence: number;
  showConfidence: boolean;
}) {
  return (
    <div className="panel relative aspect-[4/3] w-full overflow-hidden !rounded-2xl bg-[color-mix(in_oklab,var(--sky-deep)_75%,var(--ink))] p-0">
      <div
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, color-mix(in oklab, var(--magic) 45%, transparent), transparent 62%)",
        }}
      />
      {/* face + hand guides */}
      <div aria-hidden className="absolute inset-0 grid place-items-center">
        <div className="relative h-[72%] w-[58%]">
          <span className="absolute left-1/2 top-0 h-16 w-16 -translate-x-1/2 rounded-full border-[3px] border-dashed border-cream/70" />
          <span className="absolute bottom-6 left-0 h-14 w-14 rounded-2xl border-[3px] border-dashed border-target/80" />
          <span className="absolute bottom-6 right-0 h-14 w-14 rounded-2xl border-[3px] border-dashed border-target/80" />
          <span className="absolute bottom-0 left-1/2 h-24 w-24 -translate-x-1/2 rounded-t-full bg-cream/15" />
          {[..."123456"].map((_, i) => (
            <span
              key={i}
              className="absolute h-2 w-2 rounded-full bg-success anim-bob"
              style={{
                left: `${12 + i * 14}%`,
                bottom: `${18 + (i % 3) * 12}%`,
                animationDelay: `${i * 0.25}s`,
              }}
            />
          ))}
        </div>
      </div>
      <span className="absolute left-2 top-2 hud-chip text-[0.6rem]">PROTOTYPE PREVIEW</span>
      <div className="absolute inset-x-2 bottom-2 text-cream">
        <RecognitionStatus status={status} confidence={confidence} show={showConfidence} />
      </div>
    </div>
  );
}

export function KeyboardInput({
  target,
  onSubmit,
  disabled,
  status,
  confidence,
  showConfidence,
}: {
  target: string;
  onSubmit: (value: string) => void;
  disabled?: boolean;
  status: RecogStatus;
  confidence: number;
  showConfidence: boolean;
}) {
  const [value, setValue] = useState("");
  useEffect(() => setValue(""), [target]);
  return (
    <form
      className="panel w-full space-y-2 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim() || disabled) return;
        onSubmit(value.trim());
        setValue("");
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
          Target sign
        </span>
        <span className="word-label bg-target text-sm text-[oklch(0.2_0.05_50)]">
          {target || "—"}
        </span>
      </div>
      <div className="flex gap-2">
        <label className="sr-only" htmlFor="sign-input">
          Type the target word
        </label>
        <input
          id="sign-input"
          value={value}
          disabled={disabled}
          autoComplete="off"
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type the sign…"
          className="min-w-0 flex-1 rounded-xl border-[3px] border-ink bg-cream px-3 py-2 font-display text-lg font-extrabold text-ink placeholder:text-muted-foreground"
        />
        <GameButton tone="play" type="submit" disabled={disabled} aria-label="Submit sign">
          <Send className="h-5 w-5" aria-hidden />
        </GameButton>
      </div>
      <RecognitionStatus status={status} confidence={confidence} show={showConfidence} />
    </form>
  );
}

export function DevPanel({
  title = "Prototype controls",
  actions,
}: {
  title?: string;
  actions: { label: string; onClick: () => void }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pointer-events-auto w-full max-w-xs">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-lg border-2 border-dashed border-cream/60 bg-ink/70 px-2 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-widest text-cream/90 backdrop-blur"
      >
        {title}
        {open ? (
          <ChevronDown className="h-3 w-3" aria-hidden />
        ) : (
          <ChevronUp className="h-3 w-3" aria-hidden />
        )}
      </button>
      {open && (
        <div className="mt-1 grid grid-cols-2 gap-1 rounded-lg border-2 border-dashed border-cream/50 bg-ink/70 p-1.5 backdrop-blur">
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={a.onClick}
              className="rounded border border-cream/40 px-1.5 py-1 font-mono text-[0.6rem] font-bold text-cream hover:bg-cream/15"
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
