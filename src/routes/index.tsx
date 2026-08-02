import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { Battle } from "@/components/game/Battle";
import { LocalVersus } from "@/components/game/LocalVersus";
import {
  BattleModeSelect,
  CameraCheckScene,
  MainMenu,
  Matchmaking,
  ModeSelect,
  MultiplayerMenu,
  SplashScene,
} from "@/components/game/Menus";
import { SettingsOverlay } from "@/components/game/Overlays";
import {
  MultiResults,
  SingleResults,
  type MultiResult,
  type SingleResult,
} from "@/components/game/Results";
import { SignLibrary } from "@/components/game/SignLibrary";
import { SinglePlayer } from "@/components/game/SinglePlayer";
import type { Opponent } from "@/game/data";
import { useSave } from "@/game/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign Game — Arcade Singapore Sign Language Defence" },
      {
        name: "description",
        content:
          "Sign Game is an arcade browser prototype: defend the sky village crystal by signing falling word creatures before they land.",
      },
      { property: "og:title", content: "Sign Game — Sign fast. Save the words." },
      {
        property: "og:description",
        content:
          "Protect the communication crystal from mischievous word creatures in this Singapore Sign Language arcade prototype.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignGame,
});

type SceneName =
  | "splash"
  | "menu"
  | "modeSelect"
  | "cameraCheck"
  | "play"
  | "results"
  | "mpMenu"
  | "battleSelect"
  | "matchmaking"
  | "battle"
  | "mpResults"
  | "local"
  | "library";

function SignGame() {
  const {
    save,
    update,
    setSettings,
    recordAttempt,
    toggleFavourite,
    toggleSentenceFavourite,
    recordSentence,
    reset,
  } = useSave();

  const [scene, setScene] = useState<SceneName>("splash");
  const [showSettings, setShowSettings] = useState(false);
  const [opponent, setOpponent] = useState<Opponent | null>(null);
  const [single, setSingle] = useState<SingleResult | null>(null);
  const [multi, setMulti] = useState<MultiResult | null>(null);
  const [isBest, setIsBest] = useState(false);
  const [focusSigns, setFocusSigns] = useState<string[] | undefined>();
  const [runKey, setRunKey] = useState(0);
  const [cameraDestination, setCameraDestination] = useState<{
    next: SceneName;
    back: SceneName;
  }>({ next: "play", back: "modeSelect" });

  const s = save.settings;

  const enterGame = (next: SceneName, back: SceneName) => {
    if (s.inputMode === "camera") {
      setCameraDestination({ next, back });
      setScene("cameraCheck");
    } else {
      setScene(next);
    }
  };

  const finishSingle = useCallback(
    (r: SingleResult, attempts: { signId: string; correct: boolean; confidence: number }[]) => {
      attempts.forEach((a) => recordAttempt(a.signId, a.correct, a.confidence));
      const best = r.score > save.bestScore;
      setIsBest(best);
      update({
        bestScore: Math.max(save.bestScore, r.score),
        lastSingle: r,
        level: save.level + (r.score > 800 ? 1 : 0),
      });
      setSingle(r);
      setScene("results");
    },
    [recordAttempt, save.bestScore, save.level, update],
  );

  return (
    <main className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-sky-soft">
      <h1 className="sr-only">Sign Game — arcade Singapore Sign Language prototype</h1>

      {scene === "splash" && <SplashScene onStart={() => setScene("menu")} />}

      {scene === "menu" && (
        <MainMenu
          best={save.bestScore}
          level={save.level}
          character={s.character}
          onCharacterChange={(character) => setSettings({ character })}
          onPlay={() => setScene("modeSelect")}
          onMultiplayer={() => setScene("mpMenu")}
          onLibrary={() => {
            setFocusSigns(undefined);
            setScene("library");
          }}
          onSettings={() => setShowSettings(true)}
        />
      )}

      {scene === "modeSelect" && (
        <ModeSelect
          inputMode={s.inputMode}
          difficulty={s.difficulty}
          onChange={setSettings}
          onBack={() => setScene("menu")}
          onStart={() => {
            setRunKey((k) => k + 1);
            enterGame("play", "modeSelect");
          }}
        />
      )}

      {scene === "cameraCheck" && (
        <CameraCheckScene
          onContinue={() => setScene(cameraDestination.next)}
          onBack={() => setScene(cameraDestination.back)}
        />
      )}

      {scene === "play" && (
        <SinglePlayer
          key={runKey}
          inputMode={s.inputMode}
          difficulty={s.difficulty}
          settings={s}
          onFinish={finishSingle}
          onMenu={() => setScene("menu")}
          onOpenSettings={() => setShowSettings(true)}
          onRestart={() => setRunKey((k) => k + 1)}
        />
      )}

      {scene === "results" && single && (
        <SingleResults
          result={single}
          isBest={isBest}
          onPlayAgain={() => {
            setRunKey((k) => k + 1);
            setScene("play");
          }}
          onPractise={() => {
            setFocusSigns(single.weakSigns.length ? single.weakSigns : ["good"]);
            setScene("library");
          }}
          onMenu={() => setScene("menu")}
        />
      )}

      {scene === "mpMenu" && (
        <MultiplayerMenu
          onQuick={() => setScene("battleSelect")}
          onLocal={() => enterGame("local", "mpMenu")}
          onBack={() => setScene("menu")}
        />
      )}

      {scene === "battleSelect" && (
        <BattleModeSelect
          battleMode={s.battleMode}
          difficulty={s.difficulty}
          onChange={setSettings}
          onBack={() => setScene("mpMenu")}
          onStart={() => enterGame("matchmaking", "battleSelect")}
        />
      )}

      {scene === "matchmaking" && (
        <Matchmaking
          difficulty={s.difficulty}
          onCancel={() => setScene("mpMenu")}
          onFound={(o) => {
            setOpponent(o);
            setRunKey((k) => k + 1);
            setScene("battle");
          }}
        />
      )}

      {scene === "battle" && opponent && (
        <Battle
          key={runKey}
          opponent={opponent}
          battleMode={s.battleMode}
          difficulty={s.difficulty}
          inputMode={s.inputMode}
          settings={s}
          onMenu={() => setScene("menu")}
          onOpenSettings={() => setShowSettings(true)}
          onRestart={() => setRunKey((k) => k + 1)}
          onFinish={(r) => {
            update({ lastMulti: r });
            setMulti(r);
            setScene("mpResults");
          }}
        />
      )}

      {scene === "mpResults" && multi && (
        <MultiResults
          result={multi}
          onRematch={() => {
            setRunKey((k) => k + 1);
            setScene("battle");
          }}
          onChangeMode={() => setScene("battleSelect")}
          onLibrary={() => {
            setFocusSigns(undefined);
            setScene("library");
          }}
          onMenu={() => setScene("menu")}
        />
      )}

      {scene === "local" && (
        <LocalVersus
          inputMode={s.inputMode}
          difficulty={s.difficulty}
          settings={s}
          onAttempt={recordAttempt}
          onExit={() => setScene("menu")}
          onSave={(data) => update({ localVersus: data })}
        />
      )}

      {scene === "library" && (
        <SignLibrary
          mastery={save.mastery}
          favourites={save.favourites}
          settings={s}
          focusSigns={focusSigns}
          sentenceProgress={save.sentenceProgress}
          sentenceFavourites={save.sentenceFavourites}
          sentencesUnlocked={save.sentencesUnlocked}
          onToggleSentenceFavourite={toggleSentenceFavourite}
          onRecordSentence={recordSentence}
          onToggleFavourite={toggleFavourite}
          onAttempt={recordAttempt}
          onBack={() => setScene("menu")}
        />
      )}

      {showSettings && (
        <SettingsOverlay
          settings={s}
          onChange={setSettings}
          onReset={reset}
          onClose={() => setShowSettings(false)}
        />
      )}
    </main>
  );
}
