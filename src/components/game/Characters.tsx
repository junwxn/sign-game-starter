import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type Pose =
  | "idle"
  | "ready"
  | "signing"
  | "celebrate"
  | "wrong"
  | "hurt"
  | "victory"
  | "defeat";

const POSE_LABEL: Record<Pose, string> = {
  idle: "resting",
  ready: "ready to sign",
  signing: "signing",
  celebrate: "celebrating a correct sign",
  wrong: "reacting to an incorrect attempt",
  hurt: "taking damage",
  victory: "celebrating victory",
  defeat: "defeated",
};

/**
 * One original cartoon character system, re-skinned by palette.
 * `kind` swaps hair/outfit details so the player, the coach and opponents
 * share identical proportions, outlines and shading.
 */
export function CharacterSprite({
  kind = "player",
  pose = "idle",
  hue = 300,
  className,
  name,
}: {
  kind?: "player" | "coach" | "opponent";
  pose?: Pose;
  hue?: number;
  className?: string;
  name?: string;
}) {
  const skin = "oklch(0.85 0.06 60)";
  const outline = "oklch(0.32 0.06 268)";
  const main = `oklch(0.62 0.17 ${hue})`;
  const mainDark = `oklch(0.5 0.16 ${hue})`;
  const glove = kind === "player" ? "oklch(0.72 0.18 55)" : `oklch(0.75 0.1 ${hue})`;

  const sad = pose === "wrong" || pose === "hurt" || pose === "defeat";
  const happy = pose === "celebrate" || pose === "victory";

  const armAnim =
    pose === "signing"
      ? "sg-bob 0.7s ease-in-out infinite"
      : happy
        ? "sg-bob 0.5s ease-in-out infinite"
        : undefined;

  return (
    <div
      className={cn(
        "relative select-none",
        pose === "hurt" && "sg-shake",
        pose === "wrong" && "sg-shake",
        className,
      )}
      role="img"
      aria-label={`${name ?? (kind === "coach" ? "Coach Mira" : kind === "player" ? "Kai the sign guardian" : "Opponent")}, ${POSE_LABEL[pose]}`}
    >
      {happy && (
        <div className="bg-success/30 sg-glow absolute inset-0 rounded-full blur-xl" aria-hidden />
      )}
      <svg viewBox="0 0 140 170" className={cn("relative h-full w-full", pose !== "defeat" && "sg-float")}>
        {/* shadow */}
        <ellipse cx="70" cy="163" rx="34" ry="7" fill="oklch(0.4 0.05 268 / 0.25)" />

        {/* legs */}
        <g stroke={outline} strokeWidth="3">
          <rect x="52" y="120" width="14" height="34" rx="7" fill={mainDark} />
          <rect x="74" y="120" width="14" height="34" rx="7" fill={mainDark} />
        </g>

        {/* body */}
        <path
          d="M44 78c0-14 12-24 26-24s26 10 26 24v34c0 10-12 16-26 16s-26-6-26-16z"
          fill={main}
          stroke={outline}
          strokeWidth="3"
        />
        {/* chest emblem: communication symbol */}
        <g transform="translate(70 96)">
          <circle r="12" fill="oklch(0.96 0.02 250)" stroke={outline} strokeWidth="2.5" />
          <path
            d="M-6-3h12v6h-4l-3 4-1-4h-4z"
            fill={kind === "coach" ? "oklch(0.72 0.13 175)" : "oklch(0.62 0.19 300)"}
          />
        </g>

        {/* arms + gloves */}
        <g style={{ animation: armAnim, transformOrigin: "70px 84px" }}>
          <g stroke={outline} strokeWidth="3">
            <path
              d={
                happy || pose === "signing" || pose === "ready"
                  ? "M46 84C32 76 26 62 26 50"
                  : "M46 84C34 90 28 100 28 110"
              }
              fill="none"
              strokeWidth="9"
              stroke={main}
              strokeLinecap="round"
            />
            <path
              d={
                happy || pose === "signing"
                  ? "M94 84c14-8 20-22 20-34"
                  : pose === "ready"
                    ? "M94 84c12-6 18-16 18-26"
                    : "M94 84c12 6 18 16 18 26"
              }
              fill="none"
              strokeWidth="9"
              stroke={main}
              strokeLinecap="round"
            />
          </g>
          <circle
            cx={happy || pose === "signing" || pose === "ready" ? 26 : 28}
            cy={happy || pose === "signing" || pose === "ready" ? 46 : 114}
            r="11"
            fill={glove}
            stroke={outline}
            strokeWidth="3"
          />
          <circle
            cx={happy || pose === "signing" ? 114 : pose === "ready" ? 112 : 112}
            cy={happy || pose === "signing" ? 46 : pose === "ready" ? 56 : 112}
            r="11"
            fill={glove}
            stroke={outline}
            strokeWidth="3"
          />
        </g>

        {/* head */}
        <g>
          <circle cx="70" cy="42" r="28" fill={skin} stroke={outline} strokeWidth="3" />
          {/* hair / headgear differs per kind */}
          {kind === "coach" ? (
            <path
              d="M42 38c2-20 16-28 28-28s26 8 28 28c-8-8-18-10-28-10s-20 2-28 10z"
              fill="oklch(0.45 0.07 190)"
              stroke={outline}
              strokeWidth="3"
            />
          ) : (
            <path
              d="M42 38c0-18 13-28 28-28s28 10 28 28c-6-6-12-6-18-10-6 6-24 6-38 10z"
              fill={mainDark}
              stroke={outline}
              strokeWidth="3"
            />
          )}
          {/* eyes */}
          {pose === "defeat" ? (
            <g stroke={outline} strokeWidth="3" strokeLinecap="round">
              <path d="M56 42l8 8M64 42l-8 8M76 42l8 8M84 42l-8 8" />
            </g>
          ) : (
            <>
              <ellipse cx="60" cy="44" rx="4" ry={happy ? 2.4 : 5} fill={outline} />
              <ellipse cx="80" cy="44" rx="4" ry={happy ? 2.4 : 5} fill={outline} />
            </>
          )}
          {/* brows */}
          <g stroke={outline} strokeWidth="2.5" strokeLinecap="round">
            <path d={sad ? "M54 34l10 4" : happy ? "M54 33l10-2" : "M54 34h10"} />
            <path d={sad ? "M86 34l-10 4" : happy ? "M86 33l-10-2" : "M86 34h-10"} />
          </g>
          {/* mouth */}
          <path
            d={
              happy
                ? "M60 54q10 12 20 0q-10 6-20 0z"
                : sad
                  ? "M62 58q8-8 16 0"
                  : "M62 55q8 6 16 0"
            }
            fill={happy ? "oklch(0.45 0.14 20)" : "none"}
            stroke={outline}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* blush */}
          <circle cx="50" cy="52" r="4" fill="oklch(0.78 0.11 25 / 0.55)" />
          <circle cx="90" cy="52" r="4" fill="oklch(0.78 0.11 25 / 0.55)" />
        </g>

        {/* hand-motion sparkles */}
        {(pose === "signing" || happy) && (
          <g fill="oklch(0.72 0.18 55)">
            <circle cx="20" cy="34" r="3" className="sg-glow" />
            <circle cx="120" cy="34" r="3" className="sg-glow" />
            <circle cx="104" cy="20" r="2" className="sg-glow" />
          </g>
        )}
      </svg>
    </div>
  );
}

/** Short-lived coach speech bubble. */
export function CoachBubble({
  message,
  side = "left",
  className,
  compact,
}: {
  message: string | null;
  side?: "left" | "right";
  className?: string;
  compact?: boolean;
}) {
  const [shown, setShown] = useState(message);
  useEffect(() => setShown(message), [message]);
  if (!shown) return null;
  return (
    <div
      className={cn("pointer-events-none flex items-end gap-2", side === "right" && "flex-row-reverse", className)}
      aria-live="polite"
    >
      <CharacterSprite kind="coach" hue={175} pose="ready" className={compact ? "h-16 w-16" : "h-24 w-24"} />
      <div className="sg-pop bg-card border-border relative max-w-56 rounded-2xl rounded-bl-none border-2 px-3 py-2 shadow-[0_4px_0_0_var(--shadow-edge)]">
        <p className="text-ink text-xs leading-snug font-bold">{shown}</p>
      </div>
    </div>
  );
}

/** Compact avatar reused for opponents and local-versus players. */
export function AvatarBadge({
  name,
  hue,
  label,
  size = "md",
  pose = "ready",
}: {
  name: string;
  hue: number;
  label?: string;
  size?: "sm" | "md";
  pose?: Pose;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div
        className="border-border grid shrink-0 place-items-center overflow-hidden rounded-full border-2"
        style={{
          width: size === "sm" ? 38 : 52,
          height: size === "sm" ? 38 : 52,
          background: `oklch(0.92 0.05 ${hue})`,
        }}
      >
        <CharacterSprite kind="opponent" hue={hue} pose={pose} className="h-10 w-10 translate-y-1" />
      </div>
      <div className="min-w-0">
        <p className="font-display text-ink truncate text-sm font-extrabold">{name}</p>
        {label && <p className="text-muted-foreground truncate text-[11px]">{label}</p>}
      </div>
    </div>
  );
}
