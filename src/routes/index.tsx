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
import { MultiResults, type MultiResult } from "@/components/game/Results";
import { SentenceArcade } from "@/components/game/SentenceArcade";
import { SentenceResults, type SentenceRunResult } from "@/components/game/SentenceResults";
import { SignLibrary } from "@/components/game/SignLibrary";
import type { Opponent } from "@/game/data";
import { useSave } from "@/game/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign Game — Arcade Singapore Sign Language Defence" },
      {
        name: "description",
        content:
          "Sign Game is an arcade browser prototype: defend the sky village crystal by signing complete Singapore Sign Language sequences.",
      },
      { property: "og:title", content: "Sign Game — Build sentences with signs." },
      {
        property: "og:description",
        content: "Complete sign sequences in order to protect the communication crystal.",
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
  const [sentenceRun, setSentenceRun] = useState<SentenceRunResult | null>(null);
  const [multi, setMulti] = useState<MultiResult | null>(null);
  const [focusSigns, setFocusSigns] = useState<string[] | undefined>();
  const [focusSentence, setFocusSentence] = useState<string | undefined>();
  const [librarySection, setLibrarySection] = useState<"signs" | "sentences">("signs");
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

  const finishSentenceRun = useCallback(
    (result: SentenceRunResult) => {
      update({
        bestScore: Math.max(save.bestScore, result.score),
        lastSingle: result,
        level: save.level + (result.sentencesCompleted >= 3 ? 1 : 0),
      });
      setSentenceRun(result);
      setScene("results");
    },
    [save.bestScore, save.level, update],
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
            setFocusSentence(undefined);
            setLibrarySection("signs");
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
        <SentenceArcade
          key={runKey}
          inputMode={s.inputMode}
          difficulty={s.difficulty}
          settings={s}
          unlockedSentences={save.sentencesUnlocked}
          onSignAttempt={recordAttempt}
          onSentenceComplete={recordSentence}
          onFinish={finishSentenceRun}
          onMenu={() => setScene("menu")}
          onOpenSettings={() => setShowSettings(true)}
          onRestart={() => setRunKey((k) => k + 1)}
        />
      )}

      {scene === "results" && sentenceRun && (
        <SentenceResults
          result={sentenceRun}
          onTryAgain={() => {
            setRunKey((k) => k + 1);
            setScene("play");
          }}
          onPractiseWeak={() => {
            setFocusSigns(undefined);
            setFocusSentence(sentenceRun.weakSentenceId ?? sentenceRun.bestSentenceId);
            setLibrarySection("sentences");
            setScene("library");
          }}
          onQuests={() => {
            setFocusSigns(undefined);
            setFocusSentence(undefined);
            setLibrarySection("sentences");
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
            setFocusSentence(undefined);
            setLibrarySection("signs");
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
          focusSentence={focusSentence}
          initialSection={librarySection}
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
