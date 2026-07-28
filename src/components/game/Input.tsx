import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, Send, XCircle, Loader2, Hand } from "lucide-react";
import { cn } from "@/lib/utils";
import { GameButton, Meter } from "./ui";

export type RecogStatus =
  | "move-into-frame"
  | "hands-visible"
  | "checking"
  | "accepted"
  | "almost"
  | "try-again";

export const STATUS_TEXT: Record<RecogStatus, string> = {
  "move-into-frame": "Move into frame",
  "hands-visible": "Both hands visible",
  checking: "Checking sign…",
  accepted: "Sign accepted",
  almost: "Almost",
  "try-again": "Try again",
};

const STATUS_TONE: Record<RecogStatus, string> = {
  "move-into-frame": "text-muted-foreground",
  "hands-visible": "text-magic",
  checking: "text-magic",
  accepted: "text-success",
  almost: "text-target",
  "try-again": "text-danger",
};

export function RecognitionStatus({
  status,
  confidence,
  showConfidence,
}: {
  status: RecogStatus;
  confidence: number;
  showConfidence: boolean;
}) {
  const Icon =
    status === "accepted"
      ? CheckCircle2
      : status === "try-again"
        ? XCircle
        : status === "checking"
          ? Loader2
          : Hand;
  return (
    <div className="w-full" aria-live="polite">
      <p className={cn("font-display flex items-center gap-1.5 text-sm font-extrabold", STATUS_TONE[status])}>
        <Icon className={cn("h-4 w-4", status === "checking" && "animate-spin")} aria-hidden />
        {STATUS_TEXT[status]}
      </p>
      {showConfidence && (
        <div className="mt-1.5">
          <Meter
            value={confidence * 100}
            tone={confidence > 0.75 ? "success" : confidence > 0.5 ? "target" : "danger"}
            label="Confidence"
            showValue
          />
        </div>
      )}
    </div>
  );
}

/** Stylised, fully simulated camera frame. No webcam is ever requested. */
export function CameraPrototype({
  status,
  confidence,
  showConfidence,
  className,
}: {
  status: RecogStatus;
  confidence: number;
  showConfidence: boolean;
  className?: string;
}) {
  return (
    <div className={cn("sg-panel relative overflow-hidden p-2", className)}>
      <div className="bg-surface-2 relative aspect-[4/3] w-full overflow-hidden rounded-xl">
        {/* scan line */}
        <div
          className="bg-magic/60 absolute inset-x-0 h-0.5"
          style={{ animation: "sg-scan 2.6s linear infinite" }}
          aria-hidden
        />
        <svg viewBox="0 0 120 90" className="relative h-full w-full">
          {/* face guide */}
          <ellipse
            cx="60"
            cy="30"
            rx="15"
            ry="18"
            fill="none"
            stroke="oklch(0.72 0.18 55)"
            strokeWidth="1.2"
            strokeDasharray="4 3"
          />
          {/* person silhouette */}
          <circle cx="60" cy="30" r="12" fill="oklch(0.9 0.03 268 / 0.5)" />
          <path d="M38 90c0-16 10-26 22-26s22 10 22 26z" fill="oklch(0.9 0.03 268 / 0.5)" />
          {/* hand guides */}
          <rect x="24" y="52" width="20" height="20" rx="6" fill="none" stroke="oklch(0.62 0.19 300)" strokeWidth="1.2" strokeDasharray="3 3" />
          <rect x="76" y="52" width="20" height="20" rx="6" fill="none" stroke="oklch(0.62 0.19 300)" strokeWidth="1.2" strokeDasharray="3 3" />
          {/* mock tracking points */}
          <g fill="oklch(0.72 0.13 175)">
            {[
              [30, 58],
              [34, 62],
              [38, 58],
              [34, 68],
              [82, 58],
              [86, 62],
              [90, 58],
              [86, 68],
              [56, 26],
              [64, 26],
              [60, 34],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="1.6" className="sg-glow" />
            ))}
          </g>
        </svg>
        <span className="sg-hud-chip absolute top-2 left-2 px-2 py-0.5 text-[10px]">
          <Camera className="h-3 w-3" aria-hidden /> Simulated Camera
        </span>
      </div>
      <div className="px-1 pt-2">
        <RecognitionStatus status={status} confidence={confidence} showConfidence={showConfidence} />
      </div>
    </div>
  );
}

/** Compact HUD-integrated typing demo. */
export function KeyboardInput({
  target,
  status,
  confidence,
  showConfidence,
  onResult,
  className,
}: {
  target: string;
  status: RecogStatus;
  confidence: number;
  showConfidence: boolean;
  onResult: (correct: boolean) => void;
  className?: string;
}) {
  const [value, setValue] = useState("");
  const [checking, setChecking] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  function submit() {
    if (!value.trim() || checking) return;
    setChecking(true);
    const ok = value.trim().toUpperCase().replace(/\s+/g, "-") === target.toUpperCase();
    timer.current = window.setTimeout(() => {
      setChecking(false);
      setValue("");
      onResult(ok);
    }, 520);
  }

  return (
    <div className={cn("sg-panel p-3", className)}>
      <p className="text-muted-foreground text-[11px] font-bold tracking-wide uppercase">
        Current target
      </p>
      <p className="font-display text-target text-xl font-black">{target || "—"}</p>
      <div className="mt-2 flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Type the sign…"
          aria-label="Type the sign shown on the active enemy"
          className="bg-muted text-ink placeholder:text-muted-foreground border-border min-h-11 w-full rounded-xl border-2 px-3 font-bold outline-none focus:border-magic"
        />
        <GameButton variant="target" onClick={submit} disabled={checking} icon={<Send className="h-4 w-4" />}>
          <span className="sr-only sm:not-sr-only">Send</span>
        </GameButton>
      </div>
      <div className="mt-2">
        <RecognitionStatus
          status={checking ? "checking" : status}
          confidence={confidence}
          showConfidence={showConfidence}
        />
      </div>
    </div>
  );
}
