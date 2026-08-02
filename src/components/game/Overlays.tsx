import { GameButton, Overlay, SignMark, Stars } from "@/components/game/kit";
import { signById } from "@/game/data";
import type { Settings } from "@/game/storage";
import { cn } from "@/lib/utils";

export function PauseOverlay({
  onResume,
  onRestart,
  onSettings,
  onMenu,
}: {
  onResume: () => void;
  onRestart: () => void;
  onSettings: () => void;
  onMenu: () => void;
}) {
  return (
    <Overlay labelledBy="pause-title">
      <div className="panel w-full max-w-xs space-y-3 p-5 text-center">
        <h2 id="pause-title" className="font-display text-3xl font-black">
          PAUSED
        </h2>
        <GameButton tone="play" size="lg" className="w-full" onClick={onResume}>
          Resume
        </GameButton>
        <GameButton tone="success" className="w-full" onClick={onRestart}>
          Restart
        </GameButton>
        <GameButton tone="magic" className="w-full" onClick={onSettings}>
          Settings
        </GameButton>
        <GameButton tone="neutral" className="w-full" onClick={onMenu}>
          Main Menu
        </GameButton>
      </div>
    </Overlay>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between gap-3 rounded-xl border-[3px] border-ink bg-cream px-3 py-2 text-left font-display text-sm font-extrabold"
    >
      <span>{label}</span>
      <span
        className={cn(
          "relative h-7 w-14 shrink-0 rounded-full border-[3px] border-ink transition-colors",
          value ? "bg-success" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full border-2 border-ink bg-cream transition-all",
            value ? "left-7" : "left-0.5",
          )}
        />
        <span className="sr-only">{value ? "On" : "Off"}</span>
      </span>
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
  options: T[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="mb-1 font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length},1fr)` }}>
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onChange(o)}
            className={cn(
              "btn-game !px-2 !py-1.5 text-xs uppercase",
              value === o ? "bg-magic text-cream" : "bg-cream text-ink",
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SettingsOverlay({
  settings,
  onChange,
  onReset,
  onClose,
}: {
  settings: Settings;
  onChange: (p: Partial<Settings>) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  return (
    <Overlay labelledBy="settings-title">
      <div className="panel max-h-[88vh] w-full max-w-md space-y-3 overflow-y-auto p-5">
        <h2 id="settings-title" className="font-display text-3xl font-black">
          SETTINGS
        </h2>
        <Segmented
          label="Default input mode"
          value={settings.inputMode}
          options={["camera", "keyboard"]}
          onChange={(v) => onChange({ inputMode: v })}
        />
        <Segmented
          label="Default difficulty"
          value={settings.difficulty}
          options={["easy", "normal", "hard"]}
          onChange={(v) => onChange({ difficulty: v })}
        />
        <Segmented
          label="Camera view size"
          value={settings.cameraSize}
          options={["small", "medium", "large"]}
          onChange={(v) => onChange({ cameraSize: v })}
        />
        <Segmented
          label="Sign example size"
          value={settings.exampleSize}
          options={["small", "medium", "large"]}
          onChange={(v) => onChange({ exampleSize: v })}
        />
        <Toggle
          label="Sound effects"
          value={settings.sound}
          onChange={(v) => onChange({ sound: v })}
        />
        <Toggle label="Music" value={settings.music} onChange={(v) => onChange({ music: v })} />
        <Toggle
          label="Reduced motion"
          value={settings.reducedMotion}
          onChange={(v) => onChange({ reducedMotion: v })}
        />
        <Toggle
          label="High contrast"
          value={settings.highContrast}
          onChange={(v) => onChange({ highContrast: v })}
        />
        <Toggle
          label="Coach messages"
          value={settings.coachMessages}
          onChange={(v) => onChange({ coachMessages: v })}
        />
        <Toggle
          label="Confidence display"
          value={settings.showConfidence}
          onChange={(v) => onChange({ showConfidence: v })}
        />
        <div className="flex gap-2 pt-1">
          <GameButton tone="danger" className="flex-1" onClick={onReset}>
            Reset progress
          </GameButton>
          <GameButton tone="play" className="flex-1" onClick={onClose}>
            Done
          </GameButton>
        </div>
      </div>
    </Overlay>
  );
}

export function MasteryRow({
  signId,
  accuracy,
  stars,
  improved,
}: {
  signId: string;
  accuracy: number;
  stars: number;
  improved: boolean;
}) {
  const sign = signById(signId);
  return (
    <li className="flex items-center gap-3 rounded-xl border-[3px] border-ink bg-cream px-3 py-2">
      <SignMark signId={sign.id} label={sign.name} size={36} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-black">{sign.name}</p>
        <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full border-2 border-ink bg-muted">
          <div
            className="h-full"
            style={{
              width: `${accuracy}%`,
              background:
                accuracy > 66
                  ? "var(--success)"
                  : accuracy > 33
                    ? "var(--target)"
                    : "var(--danger)",
            }}
          />
        </div>
      </div>
      <Stars n={stars} />
      <span
        className={cn(
          "font-display text-xs font-black",
          improved ? "text-success" : "text-muted-foreground",
        )}
      >
        {improved ? "▲ UP" : "— SAME"}
      </span>
    </li>
  );
}
