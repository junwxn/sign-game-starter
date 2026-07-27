import { createContext, createElement, useContext, useEffect, type ReactNode } from "react";
import { useLocalStorage } from "./use-local-storage";

export interface Settings {
  difficulty: "Easy" | "Normal" | "Challenge";
  inputMode: "Camera" | "Keyboard";
  soundEffects: boolean;
  backgroundMusic: boolean;
  coachMessages: boolean;
  autoHints: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  showConfidence: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  difficulty: "Normal",
  inputMode: "Camera",
  soundEffects: true,
  backgroundMusic: false,
  coachMessages: true,
  autoHints: true,
  reducedMotion: false,
  highContrast: false,
  showConfidence: true,
};

interface Ctx {
  settings: Settings;
  setSettings: (next: Settings | ((prev: Settings) => Settings)) => void;
  favourites: string[];
  toggleFavourite: (id: string) => void;
  practised: string[];
  markPractised: (id: string) => void;
}

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<Settings>("signgame.settings", DEFAULT_SETTINGS);
  const [favourites, setFavourites] = useLocalStorage<string[]>("signgame.favourites", ["hello", "help"]);
  const [practised, setPractised] = useLocalStorage<string[]>("signgame.practised", []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("reduce-motion", settings.reducedMotion);
    root.classList.toggle("high-contrast", settings.highContrast);
  }, [settings.reducedMotion, settings.highContrast]);

  const toggleFavourite = (id: string) =>
    setFavourites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));

  const markPractised = (id: string) =>
    setPractised((prev) => (prev.includes(id) ? prev : [...prev, id]));

  return createElement(
    SettingsContext.Provider,
    { value: { settings, setSettings, favourites, toggleFavourite, practised, markPractised } },
    children,
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
