import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { CoachBubble } from "@/components/Coach";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_SETTINGS, useSettings, type Settings } from "@/lib/settings-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Sign Game" },
      {
        name: "description",
        content:
          "Adjust difficulty, input mode, sound, coach messages, motion and accessibility options. Saved locally in your browser.",
      },
      { property: "og:title", content: "Settings — Sign Game" },
      {
        property: "og:description",
        content: "Personalise the Sign Game prototype experience.",
      },
    ],
  }),
  component: SettingsPage,
});

const TOGGLES: { key: keyof Settings; label: string; hint: string }[] = [
  { key: "soundEffects", label: "Sound effects", hint: "Pops and chimes for correct signs" },
  { key: "backgroundMusic", label: "Background music", hint: "Soft arcade loop while playing" },
  { key: "coachMessages", label: "Coach messages", hint: "Encouragement from Pip" },
  { key: "autoHints", label: "Automatic hints", hint: "Show a hint after two misses" },
  { key: "reducedMotion", label: "Reduced motion", hint: "Calm the animations across the app" },
  { key: "highContrast", label: "High contrast", hint: "Stronger text and border contrast" },
  { key: "showConfidence", label: "Show confidence score", hint: "Display the recognition bar" },
];

function SettingsPage() {
  const { settings, setSettings } = useSettings();

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Preferences are saved in your browser — no account needed.
        </p>
      </header>

      <CoachBubble message="Mistakes help you learn — set it up however feels comfy!" size={60} />

      <section className="card-soft p-5">
        <h2 className="text-lg font-extrabold">Difficulty</h2>
        <Segmented
          options={["Easy", "Normal", "Challenge"]}
          value={settings.difficulty}
          onChange={(v) => set("difficulty", v as Settings["difficulty"])}
        />
        <h2 className="mt-5 text-lg font-extrabold">Input mode</h2>
        <Segmented
          options={["Camera", "Keyboard"]}
          value={settings.inputMode}
          onChange={(v) => set("inputMode", v as Settings["inputMode"])}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Camera mode is a visual preview only — this prototype never requests webcam access.
        </p>
      </section>

      <section className="card-soft divide-y divide-border p-2">
        {TOGGLES.map((t) => (
          <div key={t.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-4">
            <div className="min-w-0">
              <p className="text-sm font-extrabold">{t.label}</p>
              <p className="text-xs text-muted-foreground">{t.hint}</p>
            </div>
            <Switch
              checked={settings[t.key] as boolean}
              onCheckedChange={(v) => set(t.key, v as Settings[typeof t.key])}
              aria-label={t.label}
            />
          </div>
        ))}
      </section>

      <Button
        variant="outline"
        className="rounded-xl font-extrabold"
        onClick={() => setSettings(DEFAULT_SETTINGS)}
      >
        <RotateCcw className="mr-1.5 h-4 w-4" /> Reset to defaults
      </Button>
    </div>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mt-3 inline-flex w-full flex-wrap gap-1 rounded-2xl bg-muted p-1 sm:w-auto">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            "flex-1 rounded-xl px-5 py-2 text-sm font-extrabold transition-all sm:flex-none",
            value === o
              ? "bg-card text-card-foreground shadow-[var(--shadow-soft)]"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
