import { GameOverlay, GameButton } from "./ui";
import { useStore } from "@/game/store";
import type { Difficulty, InputStyle, Settings } from "@/game/types";
import { cn } from "@/lib/utils";

function Toggle({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="border-border bg-card/70 flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border-2 px-3 py-2 text-left"
    >
      <span className="min-w-0">
        <span className="text-ink block text-sm font-bold">{label}</span>
        {hint && <span className="text-muted-foreground block text-[11px]">{hint}</span>}
      </span>
      <span
        className={cn(
          "grid h-6 w-11 shrink-0 items-center rounded-full border-2 px-0.5 transition-colors",
          value ? "bg-success border-success" : "bg-muted border-border",
        )}
      >
        <span
          className={cn(
            "bg-card h-4 w-4 rounded-full transition-transform",
            value ? "translate-x-5" : "translate-x-0",
          )}
        />
      </span>
      <span className="sr-only">{value ? "On" : "Off"}</span>
    </button>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="text-muted-foreground mb-1 text-[11px] font-bold tracking-wide uppercase">{label}</p>
      <div className="bg-muted border-border flex gap-1 rounded-xl border-2 p-1" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            aria-pressed={value === o.value}
            className={cn(
              "font-display min-h-9 flex-1 rounded-lg px-2 py-1 text-xs font-extrabold transition-colors",
              value === o.value ? "bg-magic text-magic-foreground" : "text-muted-foreground hover:text-ink",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SettingsOverlay({ onClose }: { onClose: () => void }) {
  const { settings, setSettings, resetAll } = useStore();
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setSettings({ [k]: v } as Partial<Settings>);

  return (
    <GameOverlay title="Settings" subtitle="Saved on this device" onClose={onClose}>
      <div className="max-h-[62vh] space-y-3 overflow-y-auto pr-1 sg-scroll">
        <Segmented<InputStyle>
          label="Default input style"
          value={settings.inputStyle}
          onChange={(v) => set("inputStyle", v)}
          options={[
            { value: "camera", label: "Camera Prototype" },
            { value: "keyboard", label: "Keyboard Demo" },
          ]}
        />
        <Segmented<Difficulty>
          label="Default difficulty"
          value={settings.difficulty}
          onChange={(v) => set("difficulty", v)}
          options={[
            { value: "easy", label: "Easy" },
            { value: "normal", label: "Normal" },
            { value: "hard", label: "Hard" },
          ]}
        />
        <Segmented<Settings["textSize"]>
          label="Text size"
          value={settings.textSize}
          onChange={(v) => set("textSize", v)}
          options={[
            { value: "md", label: "Normal" },
            { value: "lg", label: "Large" },
            { value: "xl", label: "Extra large" },
          ]}
        />
        <Toggle label="Sound effects" value={settings.sound} onChange={(v) => set("sound", v)} />
        <Toggle label="Music" value={settings.music} onChange={(v) => set("music", v)} />
        <Toggle label="Reduced motion" value={settings.reducedMotion} onChange={(v) => set("reducedMotion", v)} hint="Calms animations across the game" />
        <Toggle label="High contrast" value={settings.highContrast} onChange={(v) => set("highContrast", v)} />
        <Toggle label="Coach messages" value={settings.coachMessages} onChange={(v) => set("coachMessages", v)} />
        <Toggle label="Confidence display" value={settings.showConfidence} onChange={(v) => set("showConfidence", v)} />
        <Toggle label="Left-handed layout" value={settings.leftHanded} onChange={(v) => set("leftHanded", v)} hint="Mirrors the character and input side" />

        <GameButton
          variant="danger"
          className="w-full"
          onClick={() => {
            if (window.confirm("Reset all local progress, mastery and scores?")) resetAll();
          }}
        >
          Reset progress
        </GameButton>
      </div>
    </GameOverlay>
  );
}
