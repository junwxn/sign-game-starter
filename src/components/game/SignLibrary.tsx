import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Search, Star } from "lucide-react";
import { SignPose } from "@/components/game/CharacterArt";
import {
  CoachBubble,
  GameButton,
  IconButton,
  Meter,
  Scene,
  SignMark,
  Stars,
} from "@/components/game/kit";
import { cameraGridSizeClass } from "@/components/game/displaySizes";
import { LiveCamera, type RecogStatus } from "@/components/game/InputPanel";
import { SentenceQuests, SegmentedControl } from "@/components/game/SentenceQuests";
import {
  SentenceQuestDetail,
  type SentenceSessionResult,
} from "@/components/game/SentenceQuestDetail";
import { SIGNS, signById } from "@/game/data";
import type { Mastery, SentenceProgress, Settings } from "@/game/storage";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Food and Drink", "Actions", "Places", "Time", "Answers"] as const;

export function SignLibrary({
  mastery,
  favourites,
  settings,
  focusSigns,
  sentenceProgress,
  sentenceFavourites,
  sentencesUnlocked,
  focusSentence,
  initialSection = "signs",
  onToggleSentenceFavourite,
  onRecordSentence,
  onToggleFavourite,
  onAttempt,
  onBack,
}: {
  mastery: Record<string, Mastery>;
  favourites: string[];
  settings: Settings;
  focusSigns?: string[];
  sentenceProgress: Record<string, SentenceProgress>;
  sentenceFavourites: string[];
  sentencesUnlocked: string[];
  focusSentence?: string;
  initialSection?: "signs" | "sentences";
  onToggleSentenceFavourite: (id: string) => void;
  onRecordSentence: (id: string, r: SentenceSessionResult) => void;
  onToggleFavourite: (id: string) => void;
  onAttempt: (id: string, correct: boolean, confidence: number) => void;
  onBack: () => void;
}) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [openId, setOpenId] = useState<string | null>(focusSigns?.[0] ?? null);
  const [section, setSection] = useState<"signs" | "sentences">(initialSection);
  const [openSentence, setOpenSentence] = useState<string | null>(focusSentence ?? null);

  const list = useMemo(
    () =>
      SIGNS.filter(
        (s) =>
          (cat === "All" || s.category === cat) &&
          s.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query, cat],
  );

  if (openId) {
    return (
      <SignDetail
        signId={openId}
        mastery={mastery[openId]}
        favourite={favourites.includes(openId)}
        settings={settings}
        onToggleFavourite={() => onToggleFavourite(openId)}
        onAttempt={onAttempt}
        onNavigate={(dir) => {
          const i = SIGNS.findIndex((s) => s.id === openId);
          const next = (i + dir + SIGNS.length) % SIGNS.length;
          setOpenId(SIGNS[next].id);
        }}
        onClose={() => setOpenId(null)}
      />
    );
  }

  if (openSentence) {
    return (
      <SentenceQuestDetail
        sentenceId={openSentence}
        progress={sentenceProgress[openSentence]}
        favourite={sentenceFavourites.includes(openSentence)}
        settings={settings}
        onToggleFavourite={() => onToggleSentenceFavourite(openSentence)}
        onSignAttempt={onAttempt}
        onRecord={(id, r) => onRecordSentence(id, r)}
        onClose={() => setOpenSentence(null)}
      />
    );
  }

  const segment = (
    <SegmentedControl
      value={section}
      label="Collection section"
      options={[
        { value: "signs" as const, label: "Signs" },
        { value: "sentences" as const, label: "Sentences" },
      ]}
      onChange={setSection}
    />
  );

  if (section === "sentences") {
    return (
      <Scene dim={0.3}>
        <div className="flex h-full flex-col p-3 sm:p-4">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
            <IconButton label="Back to main menu" onClick={onBack}>
              <ArrowLeft className="mx-auto h-5 w-5" aria-hidden />
            </IconButton>
            <h2 className="truncate font-display text-2xl font-black text-cream text-outline sm:text-4xl">
              Sentence Quests
            </h2>
          </div>
          <div className="mt-3">{segment}</div>
          <div className="min-h-0 flex-1">
            <SentenceQuests
              progress={sentenceProgress}
              favourites={sentenceFavourites}
              unlocked={sentencesUnlocked}
              focusSentence={focusSentence}
              onOpen={setOpenSentence}
            />
          </div>
        </div>
      </Scene>
    );
  }

  return (
    <Scene dim={0.3}>
      <div className="flex h-full flex-col p-3 sm:p-4">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
          <IconButton label="Back to main menu" onClick={onBack}>
            <ArrowLeft className="mx-auto h-5 w-5" aria-hidden />
          </IconButton>
          <h2 className="truncate font-display text-2xl font-black text-cream text-outline sm:text-4xl">
            My Sign Collection
          </h2>
        </div>

        <div className="mt-3">{segment}</div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <label className="sr-only" htmlFor="sign-search">
              Search signs
            </label>
            <input
              id="sign-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search signs…"
              className="w-full rounded-full border-[3px] border-ink bg-cream py-2 pl-9 pr-3 font-display font-bold text-ink"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={cat === c}
                onClick={() => setCat(c)}
                className={cn(
                  "btn-game !px-3 !py-1 text-xs uppercase",
                  cat === c ? "bg-target text-[oklch(0.2_0.05_50)]" : "bg-cream text-ink",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {focusSigns && focusSigns.length > 0 && (
          <p className="mt-2 font-display text-xs font-extrabold uppercase tracking-widest text-cream drop-shadow">
            Weak signs from your last run are highlighted
          </p>
        )}

        <ul className="collection-scroll mt-3 grid flex-1 grid-cols-1 content-start gap-4 overflow-y-scroll pb-4 pr-2 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => {
            const m = mastery[s.id];
            const weak = focusSigns?.includes(s.id);
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(s.id)}
                  className={cn(
                    "btn-game min-h-[14rem] w-full flex-col !items-center gap-2 !px-4 !py-5",
                    weak ? "bg-target text-[oklch(0.2_0.05_50)]" : "bg-cream text-ink",
                  )}
                >
                  <SignMark signId={s.id} label={s.name} size={112} />
                  <span className="font-display text-base font-black">{s.name}</span>
                  <Stars n={m?.stars ?? 0} />
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest opacity-70">
                    Best {m?.best ?? 0}%{favourites.includes(s.id) && " ★"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </Scene>
  );
}

function SignDetail({
  signId,
  mastery,
  favourite,
  settings,
  onToggleFavourite,
  onAttempt,
  onNavigate,
  onClose,
}: {
  signId: string;
  mastery?: Mastery;
  favourite: boolean;
  settings: Settings;
  onToggleFavourite: () => void;
  onAttempt: (id: string, correct: boolean, confidence: number) => void;
  onNavigate: (dir: number) => void;
  onClose: () => void;
}) {
  const sign = signById(signId);
  const [practising, setPractising] = useState(false);
  const [tries, setTries] = useState(0);
  const [confidence, setConfidence] = useState(48);
  const [status, setStatus] = useState<RecogStatus>("hands");
  const [coach, setCoach] = useState("Ready hands? Shape first, then movement.");

  const attempt = (correct: boolean, measuredConfidence?: number) => {
    const conf =
      measuredConfidence ??
      (correct ? 74 + Math.floor(Math.random() * 24) : 28 + Math.floor(Math.random() * 22));
    setConfidence(conf);
    setStatus(correct ? "accepted" : "almost");
    setTries((t) => t + 1);
    setCoach(correct ? "Great hand shape!" : "Almost! Try once more.");
    onAttempt(signId, correct, conf);
  };

  return (
    <Scene dim={0.35}>
      <div className="h-full overflow-y-auto p-3 sm:p-4">
        <div className="mx-auto w-full max-w-3xl space-y-3 pb-6">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
            <IconButton label="Back to collection" onClick={onClose}>
              <ArrowLeft className="mx-auto h-5 w-5" aria-hidden />
            </IconButton>
            <h2 className="truncate font-display text-3xl font-black text-cream text-outline sm:text-5xl">
              {sign.name}
            </h2>
            <IconButton
              label={favourite ? "Remove favourite" : "Add favourite"}
              onClick={onToggleFavourite}
              className={favourite ? "bg-target" : ""}
            >
              <Star className={cn("mx-auto h-5 w-5", favourite && "fill-current")} aria-hidden />
            </IconButton>
          </div>

          <div className="grid gap-3 md:grid-cols-[1.15fr_0.85fr]">
            <div className="panel p-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="sign-demo-card">
                  <SignPose signId={sign.id} label={sign.name} className="h-48 w-full" />
                  <p>Mascot preview · follow reference</p>
                </div>
                {sign.referenceImage ? (
                  <a
                    href={sign.referenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="sign-demo-card sign-demo-card--verified"
                  >
                    <img
                      src={sign.referenceImage}
                      alt={`${sign.name} reference from the ${sign.referenceLabel}`}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <p>Verified SgSL reference</p>
                  </a>
                ) : (
                  <a
                    href={sign.referenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="sign-demo-card sign-demo-card--lesson"
                  >
                    <ExternalLink className="h-8 w-8" aria-hidden />
                    <strong>Open Deaf-led lesson</strong>
                    <span>Reference media is not redistributed in the game.</span>
                  </a>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Stars n={mastery?.stars ?? 0} size={20} />
                <span className="hud-chip text-xs">{mastery?.attempts ?? 0} attempts</span>
                <span className="hud-chip text-xs">Best {mastery?.best ?? 0}%</span>
              </div>
            </div>

            <div className="panel space-y-2 p-4 text-sm font-semibold">
              <p>
                <strong className="font-display uppercase text-target-deep">Hand shape · </strong>
                {sign.handShape}
              </p>
              <p>
                <strong className="font-display uppercase text-magic">Movement · </strong>
                {sign.movement}
              </p>
              <p>
                <strong className="font-display uppercase text-danger">Common mistake · </strong>
                {sign.mistake}
              </p>
            </div>
          </div>

          {!practising ? (
            <GameButton
              tone="play"
              size="lg"
              className="w-full"
              onClick={() => setPractising(true)}
            >
              Practise Sign
            </GameButton>
          ) : (
            <div className="panel space-y-3 p-4">
              <div className={cn("grid gap-3", cameraGridSizeClass[settings.cameraSize])}>
                {settings.inputMode === "camera" ? (
                  <LiveCamera
                    targets={[signId]}
                    showConfidence={settings.showConfidence}
                    onResult={(result) =>
                      attempt(result.accepted, Math.round(result.confidence * 100))
                    }
                    onError={() => setStatus("nohands")}
                  />
                ) : (
                  <div className="panel grid min-h-48 place-items-center p-4 text-center">
                    <p className="font-display text-sm font-black uppercase text-muted-foreground">
                      Use the practice controls to record a keyboard-mode attempt.
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <CoachBubble message={coach} />
                  <Meter
                    value={confidence}
                    label="Confidence"
                    tone={confidence > 65 ? "success" : "target"}
                  />
                  <div className="flex gap-2 text-xs">
                    <span className="hud-chip">Attempts {tries}</span>
                  </div>
                  {settings.inputMode === "keyboard" && (
                    <div className="flex flex-wrap gap-2">
                      <GameButton tone="success" onClick={() => attempt(true)}>
                        Correct Attempt
                      </GameButton>
                      <GameButton tone="danger" onClick={() => attempt(false)}>
                        Try Again
                      </GameButton>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <GameButton tone="neutral" onClick={() => onNavigate(-1)}>
                  <ArrowLeft className="h-4 w-4" aria-hidden /> Previous Sign
                </GameButton>
                <GameButton tone="neutral" onClick={() => onNavigate(1)}>
                  Next Sign <ArrowRight className="h-4 w-4" aria-hidden />
                </GameButton>
                <GameButton tone="magic" className="ml-auto" onClick={onClose}>
                  Return to Collection
                </GameButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </Scene>
  );
}
