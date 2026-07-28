import { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared illustrated sky-village environment. Purely decorative SVG/CSS,
 * reused by every scene so the whole game shares one world.
 */
export function SkyScene({
  variant = "village",
  className,
  children,
  dim,
}: {
  variant?: "village" | "portal" | "arena";
  className?: string;
  children?: React.ReactNode;
  dim?: boolean;
}) {
  const clouds = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        top: 6 + i * 13,
        scale: 0.6 + ((i * 37) % 70) / 100,
        dur: 60 + i * 14,
        delay: -i * 11,
      })),
    [],
  );

  return (
    <div className={cn("sg-scene bg-sky-deep", className)}>
      {/* sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, var(--color-sky-deep) 0%, var(--color-sky) 45%, oklch(0.95 0.03 250) 100%)",
        }}
        aria-hidden
      />

      {/* sun / magic halo */}
      <div
        className="bg-target/25 sg-glow absolute -top-24 -right-24 h-72 w-72 rounded-full blur-2xl"
        aria-hidden
      />
      {variant === "portal" && (
        <div
          className="bg-magic/25 sg-glow absolute top-1/4 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full blur-3xl"
          aria-hidden
        />
      )}

      {/* clouds */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {clouds.map((c, i) => (
          <svg
            key={i}
            viewBox="0 0 120 50"
            className="absolute h-16 w-40 text-white/70"
            style={{
              top: `${c.top}%`,
              transform: `scale(${c.scale})`,
              animation: `sg-drift ${c.dur}s linear ${c.delay}s infinite`,
            }}
          >
            <g fill="currentColor">
              <ellipse cx="40" cy="32" rx="34" ry="16" />
              <ellipse cx="62" cy="24" rx="24" ry="18" />
              <ellipse cx="84" cy="34" rx="22" ry="13" />
            </g>
          </svg>
        ))}
      </div>

      {/* floating islands + village */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%]" aria-hidden>
        <FloatingIsland className="absolute bottom-[18%] left-[4%] w-40 opacity-70" delay={0} />
        <FloatingIsland className="absolute bottom-[42%] right-[7%] w-32 opacity-55" delay={1.2} />
        <FloatingIsland
          className="absolute bottom-[-4%] left-1/2 w-[min(760px,110%)] -translate-x-1/2"
          delay={0.6}
          big
        />
      </div>

      {dim && <div className="absolute inset-0 bg-[oklch(0.2_0.05_275_/_0.35)]" aria-hidden />}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function FloatingIsland({
  className,
  delay = 0,
  big,
}: {
  className?: string;
  delay?: number;
  big?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 300 190"
      className={cn("sg-float", className)}
      style={{ animationDelay: `${delay}s` }}
      aria-hidden
    >
      <ellipse cx="150" cy="72" rx="128" ry="34" fill="oklch(0.78 0.13 150)" />
      <path
        d="M22 72c14 44 44 84 128 108 84-24 114-64 128-108z"
        fill="oklch(0.62 0.1 60)"
        opacity="0.9"
      />
      <ellipse cx="150" cy="66" rx="128" ry="30" fill="oklch(0.85 0.14 152)" />
      {big && (
        <g>
          {/* little colourful buildings */}
          <g transform="translate(74 18)">
            <rect x="0" y="14" width="34" height="34" rx="6" fill="oklch(0.95 0.03 250)" />
            <path d="M-6 16 17-4l23 20z" fill="oklch(0.72 0.18 55)" />
            <rect x="12" y="30" width="11" height="18" rx="3" fill="oklch(0.62 0.19 300)" />
          </g>
          <g transform="translate(132 4)">
            <rect x="0" y="18" width="40" height="44" rx="7" fill="oklch(0.97 0.02 250)" />
            <path d="M-6 20 20-4l26 24z" fill="oklch(0.72 0.13 175)" />
            <circle cx="20" cy="34" r="7" fill="oklch(0.8 0.13 200)" />
          </g>
          <g transform="translate(190 22)">
            <rect x="0" y="12" width="28" height="30" rx="5" fill="oklch(0.95 0.03 250)" />
            <path d="M-5 14 14-4l19 18z" fill="oklch(0.64 0.2 22)" />
          </g>
          {/* flag */}
          <g transform="translate(52 8)">
            <rect x="0" y="0" width="3" height="46" rx="1.5" fill="oklch(0.45 0.05 268)" />
            <path d="M3 4h26l-7 8 7 8H3z" fill="oklch(0.62 0.19 300)" />
          </g>
        </g>
      )}
    </svg>
  );
}

/** The communication crystal the player protects. */
export function Crystal({ flash, className }: { flash?: boolean; className?: string }) {
  return (
    <div className={cn("relative", className)} aria-hidden>
      <div
        className={cn(
          "bg-crystal/40 sg-glow absolute inset-0 rounded-full blur-xl",
          flash && "bg-danger/60",
        )}
      />
      <svg viewBox="0 0 80 110" className="sg-float relative h-full w-full">
        <path d="M40 4 70 42 40 106 10 42z" fill="oklch(0.8 0.13 200)" />
        <path d="M40 4 70 42 40 106z" fill="oklch(0.68 0.13 210)" />
        <path d="M40 4 10 42h60z" fill="oklch(0.9 0.09 195)" opacity="0.85" />
        <path d="M40 4 40 106" stroke="oklch(0.98 0.02 200)" strokeWidth="1.5" opacity="0.6" />
      </svg>
    </div>
  );
}

/** Magical portal used for attacks and incoming waves. */
export function Portal({ className, tone = "magic" }: { className?: string; tone?: "magic" | "danger" }) {
  return (
    <div className={cn("relative", className)} aria-hidden>
      <div
        className={cn(
          "sg-glow absolute inset-0 rounded-full blur-lg",
          tone === "magic" ? "bg-magic/50" : "bg-danger/50",
        )}
      />
      <svg viewBox="0 0 100 44" className="relative h-full w-full">
        <ellipse
          cx="50"
          cy="22"
          rx="46"
          ry="18"
          fill="none"
          stroke={tone === "magic" ? "oklch(0.62 0.19 300)" : "oklch(0.64 0.2 22)"}
          strokeWidth="5"
        />
        <ellipse
          cx="50"
          cy="22"
          rx="34"
          ry="12"
          fill={tone === "magic" ? "oklch(0.62 0.19 300 / 0.4)" : "oklch(0.64 0.2 22 / 0.4)"}
        />
      </svg>
    </div>
  );
}
