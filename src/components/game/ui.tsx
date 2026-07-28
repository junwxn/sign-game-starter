import type { ButtonHTMLAttributes, ReactNode } from "react";
import { X, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------- GameButton ---------------- */
type Variant = "primary" | "magic" | "target" | "success" | "danger" | "ghost";
type Size = "sm" | "md" | "lg" | "xl";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground border-primary/60",
  magic: "bg-magic text-magic-foreground border-magic/60",
  target: "bg-target text-target-foreground border-target/60",
  success: "bg-success text-success-foreground border-success/60",
  danger: "bg-danger text-danger-foreground border-danger/60",
  ghost: "bg-card text-foreground border-border",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-7 py-3.5 text-lg",
  xl: "px-10 py-5 text-2xl",
};

export function GameButton({
  variant = "primary",
  size = "md",
  className,
  children,
  icon,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}) {
  return (
    <button
      {...rest}
      className={cn(
        "font-display inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border-2 font-extrabold tracking-wide",
        "shadow-[0_5px_0_0_var(--shadow-edge)] transition-all duration-150",
        "hover:-translate-y-0.5 hover:shadow-[0_7px_0_0_var(--shadow-edge)]",
        "active:translate-y-1 active:shadow-[0_2px_0_0_var(--shadow-edge)]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}

/* ---------------- IconButton ---------------- */
export function IconButton({
  label,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      {...rest}
      aria-label={label}
      title={label}
      className={cn(
        "bg-card text-foreground border-border grid h-11 w-11 place-items-center rounded-full border-2",
        "shadow-[0_4px_0_0_var(--shadow-edge)] transition-transform active:translate-y-1",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function BackButton({ onClick, label = "Back" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="sg-hud-chip hover:bg-accent min-h-11 gap-1.5 px-4 transition-colors"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
}

/* ---------------- GameOverlay ---------------- */
export function GameOverlay({
  title,
  subtitle,
  onClose,
  children,
  wide,
  closeLabel = "Close",
}: {
  title: string;
  subtitle?: string;
  onClose?: () => void;
  children: ReactNode;
  wide?: boolean;
  closeLabel?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[oklch(0.2_0.05_275_/_0.62)] p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={cn(
          "sg-panel sg-pop relative my-auto w-full p-5 sm:p-7",
          wide ? "max-w-3xl" : "max-w-md",
        )}
      >
        {onClose && (
          <IconButton label={closeLabel} onClick={onClose} className="absolute top-3 right-3 z-10">
            <X className="h-5 w-5" aria-hidden />
          </IconButton>
        )}
        <h2 className="font-display text-ink pr-12 text-2xl font-black">{title}</h2>
        {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

/* ---------------- Choice tiles ---------------- */
export function ChoiceTile({
  selected,
  onClick,
  title,
  hint,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  hint?: string;
  icon: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex min-h-20 flex-1 flex-col items-center justify-center gap-1 rounded-2xl border-3 border-2 p-3 text-center transition-all",
        selected
          ? "border-target bg-target/15 text-ink shadow-[0_4px_0_0_var(--shadow-edge)]"
          : "border-border bg-card/70 text-muted-foreground hover:border-magic/50",
      )}
    >
      <span className={cn("grid h-8 w-8 place-items-center", selected && "text-target")}>
        {icon}
      </span>
      <span className="font-display text-ink text-sm font-extrabold">{title}</span>
      {hint && <span className="text-[11px] leading-tight">{hint}</span>}
      {selected && <span className="sr-only">Selected</span>}
    </button>
  );
}

/* ---------------- Stars ---------------- */
export function Stars({ value, max = 3, size = 16 }: { value: number; max?: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          aria-hidden
          className={i < value ? "text-target" : "text-muted-foreground/40"}
        >
          <path
            fill="currentColor"
            d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4 6.2 20.4l1.1-6.5L2.6 9.3l6.5-.9z"
          />
        </svg>
      ))}
    </span>
  );
}

/* ---------------- Meter ---------------- */
export function Meter({
  value,
  tone = "magic",
  label,
  showValue,
}: {
  value: number;
  tone?: "magic" | "target" | "success" | "danger" | "crystal";
  label?: string;
  showValue?: boolean;
}) {
  const bg = {
    magic: "bg-magic",
    target: "bg-target",
    success: "bg-success",
    danger: "bg-danger",
    crystal: "bg-crystal",
  }[tone];
  return (
    <div className="w-full">
      {label && (
        <div className="text-muted-foreground mb-1 flex justify-between text-[11px] font-bold tracking-wide uppercase">
          <span>{label}</span>
          {showValue && <span>{Math.round(value)}%</span>}
        </div>
      )}
      <div
        className="bg-muted border-border h-3 w-full overflow-hidden rounded-full border-2"
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "progress"}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-300", bg)}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}
