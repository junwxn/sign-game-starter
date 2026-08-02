import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Send } from "lucide-react";
import { GameButton, Meter } from "@/components/game/kit";
import { cn } from "@/lib/utils";
import { LiveRecognizer } from "@/recognizer/LiveRecognizer";
import type { AttemptResult } from "@/recognizer/types";
import { SIGN_REFERENCES } from "@/signReferences";

export type RecogStatus =
  "idle" | "framing" | "hands" | "checking" | "accepted" | "almost" | "rejected" | "nohands";

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

/** Live camera preview and sign-recognition overlay. */
export function LiveCamera({
  targets,
  showConfidence,
  active = true,
  onResult,
  onError,
  onReady,
}: {
  targets: string[];
  showConfidence: boolean;
  active?: boolean;
  onResult: (result: AttemptResult) => void;
  onError?: (error: Error) => void;
  onReady?: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<HTMLParagraphElement>(null);
  const recognizerRef = useRef<LiveRecognizer | null>(null);
  const lastPreviewUpdateRef = useRef(0);
  const callbacksRef = useRef({ onResult, onError, onReady });
  const [status, setStatus] = useState<RecogStatus>("framing");
  const [confidence, setConfidence] = useState(0);
  const targetKey = targets.join("\0");

  callbacksRef.current = { onResult, onError, onReady };

  useEffect(() => {
    const panel = panelRef.current;
    const video = videoRef.current;
    const overlay = overlayRef.current;
    const state = stateRef.current;
    if (!panel || !video || !overlay || !state) return;

    const recognizer = new LiveRecognizer({ panel, video, overlay, state });
    recognizerRef.current = recognizer;

    const handleStart = () => setStatus("checking");
    const handleCancel = () => setStatus("hands");
    const handleResult = (result: AttemptResult) => {
      setConfidence(Math.round(result.confidence * 100));
      setStatus(result.accepted ? "accepted" : "rejected");
      callbacksRef.current.onResult(result);
    };
    const handlePreview = (message: string) => {
      const now = performance.now();
      if (now - lastPreviewUpdateRef.current < 100) return;
      lastPreviewUpdateRef.current = now;
      const match = message.match(/\b(\d{1,3})%/);
      if (match) setConfidence(Number(match[1]));
      if (message.includes("watching")) setStatus("hands");
      if (message.includes("hold")) setStatus("checking");
    };
    const handleError = (error: Error) => {
      setStatus("nohands");
      callbacksRef.current.onError?.(error);
    };

    recognizer.on("attemptStart", handleStart);
    recognizer.on("attemptCancel", handleCancel);
    recognizer.on("attemptResult", handleResult);
    recognizer.on("inputPreview", handlePreview);
    recognizer.on("error", handleError);
    recognizer.setActiveTargets([]);
    void recognizer
      .start()
      .then(() => callbacksRef.current.onReady?.())
      .catch(handleError);

    return () => {
      recognizer.off("attemptStart", handleStart);
      recognizer.off("attemptCancel", handleCancel);
      recognizer.off("attemptResult", handleResult);
      recognizer.off("inputPreview", handlePreview);
      recognizer.off("error", handleError);
      recognizer.stop();
      if (recognizerRef.current === recognizer) recognizerRef.current = null;
    };
    // The recognizer owns the camera for this component's lifetime.
  }, []);

  useEffect(() => {
    recognizerRef.current?.setActiveTargets(active && targetKey ? targetKey.split("\0") : []);
  }, [active, targetKey]);

  return (
    <div
      ref={panelRef}
      className="panel relative aspect-[4/3] w-full overflow-hidden !rounded-2xl bg-ink p-0"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
        autoPlay
        muted
        playsInline
        aria-label="Live webcam preview"
      />
      <canvas
        ref={overlayRef}
        className="pointer-events-none absolute inset-0 h-full w-full -scale-x-100 object-cover"
        aria-hidden
      />
      <span className="absolute left-2 top-2 hud-chip text-[0.6rem]">LIVE CV</span>
      <p
        ref={stateRef}
        className="absolute inset-x-2 top-2 ml-16 truncate text-right font-mono text-[0.55rem] font-bold text-cream drop-shadow"
        role="status"
      >
        Loading camera…
      </p>
      <div className="absolute inset-x-2 bottom-2 text-cream">
        <RecognitionStatus status={status} confidence={confidence} show={showConfidence} />
      </div>
    </div>
  );
}

export function SignReferenceCard({ signId, className }: { signId?: string; className?: string }) {
  const reference = signId ? SIGN_REFERENCES[signId.toLowerCase()] : undefined;
  if (!reference) return null;

  return (
    <a
      href={reference.sourceUrl}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "panel block overflow-hidden !rounded-xl p-1 text-center transition-transform hover:scale-[1.02]",
        className,
      )}
      aria-label={`Open ${signId} in the NTU SgSL Sign Bank`}
    >
      <img
        src={reference.mediaUrl}
        alt={`${signId?.toUpperCase()} sign example, ${reference.variant}`}
        className="h-28 w-full rounded-lg bg-cream object-contain sm:h-36"
        loading="eager"
        referrerPolicy="no-referrer"
      />
      <span className="mt-1 block font-display text-[0.55rem] font-black uppercase tracking-wide text-ink">
        NTU example · {reference.variant}
      </span>
    </a>
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
