import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Shield, Swords, Zap } from "lucide-react";
import {
  Avatar,
  CoachBubble,
  CrystalZone,
  EnemySprite,
  FloatingText,
  GameButton,
  Hero,
  HudChip,
  IconButton,
  Meter,
  Scene,
  type HeroState,
} from "@/components/game/kit";
import {
  DevPanel,
  KeyboardInput,
  LiveCamera,
  type RecogStatus,
} from "@/components/game/InputPanel";
import { PauseOverlay } from "@/components/game/Overlays";
import {
  pick,
  type BattleMode,
  type Difficulty,
  type EnemyKind,
  type InputMode,
  type Opponent,
} from "@/game/data";
import {
  MAX_ENEMIES,
  comboAttack,
  makeEnemy,
  speedRating,
  useTicker,
  type Enemy,
} from "@/game/engine";
import type { MultiResult } from "@/components/game/Results";
import type { Settings } from "@/game/storage";
import { cn } from "@/lib/utils";

const MATCH_SECONDS = 90;

type Float = {
  id: number;
  text: string;
  tone: "success" | "danger" | "target" | "magic";
  x: number;
  y: number;
};

export function Battle({
  opponent,
  battleMode,
  difficulty,
  inputMode,
  settings,
  onFinish,
  onMenu,
  onOpenSettings,
  onRestart,
}: {
  opponent: Opponent;
  battleMode: BattleMode;
  difficulty: Difficulty;
  inputMode: InputMode;
  settings: Settings;
  onFinish: (r: MultiResult) => void;
  onMenu: () => void;
  onOpenSettings: () => void;
  onRestart: () => void;
}) {
  const hard = battleMode === "hard";
  const [enemies, setEnemies] = useState<Enemy[]>(() => [makeEnemy({ y: -4 }, difficulty)]);
  const [time, setTime] = useState(MATCH_SECONDS);
  const [round, setRound] = useState(1);
  const [paused, setPaused] = useState(false);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [meter, setMeter] = useState(0);
  const [crystal, setCrystal] = useState(100);
  const [heroState, setHeroState] = useState<HeroState>("ready");
  const [status, setStatus] = useState<RecogStatus>("hands");
  const [confidence, setConfidence] = useState(50);

  const [oppScore, setOppScore] = useState(0);
  const [oppCombo, setOppCombo] = useState(0);
  const [oppBestCombo, setOppBestCombo] = useState(0);
  const [oppMeter, setOppMeter] = useState(0);
  const [oppCrystal, setOppCrystal] = useState(100);
  const [oppIncoming, setOppIncoming] = useState(0);

  const [warning, setWarning] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [attackFx, setAttackFx] = useState<"out" | "in" | null>(null);
  const [comeback, setComeback] = useState(false);
  const [coach, setCoach] = useState("Ready hands? Sign the orange word!");
  const [floats, setFloats] = useState<Float[]>([]);
  const [shake, setShake] = useState(false);

  const stats = useRef({
    correct: 0,
    total: 0,
    attacksSent: 0,
    enemiesSent: 0,
    attacksReceived: 0,
    defended: 0,
    clearedIncoming: 0,
    bestSpeed: "—",
    oppAttacks: 0,
    oppEnemies: 0,
    oppCorrect: 0,
    oppTotal: 0,
  });
  const floatId = useRef(0);
  const busy = useRef(false);
  const finished = useRef(false);
  const cooldown = useRef(0);
  const defenceCombo = useRef(0);

  const running = !paused;
  const target = useMemo(
    () => enemies.filter((e) => e.status === "idle").sort((a, b) => b.y - a.y)[0],
    [enemies],
  );

  const addFloat = useCallback((text: string, tone: Float["tone"], x = 50, y = 40) => {
    const id = ++floatId.current;
    setFloats((f) => [...f, { id, text, tone, x, y }]);
    setTimeout(() => setFloats((f) => f.filter((i) => i.id !== id)), 1200);
  }, []);

  const flashHero = (s: HeroState) => {
    setHeroState(s);
    setTimeout(() => setHeroState("ready"), 700);
  };

  const showBanner = (text: string) => {
    setBanner(text);
    setTimeout(() => setBanner(null), 1400);
  };

  /* ---------- field ---------- */
  useTicker(
    () => {
      setEnemies((list) => {
        const crowded = list.length >= MAX_ENEMIES - 1;
        const moved = list.map((e) =>
          e.status === "defeated" ? e : { ...e, y: e.y + e.speed * (crowded ? 0.3 : 0.45) },
        );
        const gone = moved.filter((e) => e.y >= 100 && e.status !== "defeated");
        if (gone.length) missEnemy(gone.length);
        return moved.filter((e) => e.y < 100 && e.status !== "defeated");
      });
    },
    90,
    running,
  );

  useTicker(
    () => {
      const fieldLimit = hard ? MAX_ENEMIES - 3 : MAX_ENEMIES;
      setEnemies((list) =>
        list.filter((e) => e.status !== "defeated").length >= fieldLimit
          ? list
          : [...list, makeEnemy({}, difficulty)],
      );
    },
    difficulty === "hard" ? 2200 : 2800,
    running,
  );

  useTicker(() => setTime((t) => t - 1), 1000, running);
  useEffect(() => {
    if (time === 60 || time === 30) setRound((r) => r + 1);
  }, [time]);

  /* ---------- simulated opponent ---------- */
  useTicker(
    () => {
      if (!running) return;
      const roll = Math.random();
      const behind = oppScore < score - 400;
      const skill = opponent.skill + (behind ? 0.08 : 0);
      stats.current.oppTotal += 1;
      if (roll < skill) {
        stats.current.oppCorrect += 1;
        setOppCombo((c) => {
          const n = c + 1;
          setOppBestCombo((b) => Math.max(b, n));
          return n;
        });
        setOppScore((s) => s + 100 + oppCombo * 12);
        if (hard) setOppMeter((m) => Math.min(100, m + 22 + Math.random() * 8));
      } else {
        setOppCombo(0);
        if (hard) setOppMeter((m) => Math.min(100, m + 8));
      }
    },
    1500 + Math.round(Math.random() * 900),
    running,
  );

  /* opponent attack */
  useEffect(() => {
    if (!hard || oppMeter < 100 || time > MATCH_SECONDS - 6) return;
    setOppMeter(0);
    const count = Math.min(3, 1 + Math.floor(Math.random() * 3));
    stats.current.oppAttacks += 1;
    stats.current.oppEnemies += count;
    stats.current.attacksReceived += 1;
    setWarning(count > 1 ? `RIVAL ATTACK · ${count} SIGNS!` : "RIVAL ATTACK · 1 SIGN!");
    setAttackFx("in");
    setCoach("Incoming word attack!");
    setTimeout(() => {
      setWarning(null);
      setAttackFx(null);
      setEnemies((list) => {
        const room = Math.max(0, MAX_ENEMIES - list.length);
        const kinds: EnemyKind[] = ["basic", "fast", "shield"];
        const added = Array.from({ length: Math.min(room, count) }, (_, i) =>
          makeEnemy(
            { kind: kinds[i % 3], fromOpponent: true, hideWord: i === 2, y: -8 - i * 6 },
            difficulty,
          ),
        );
        return [...list, ...added];
      });
      setEnemies((l) => l.map((e) => (e.hideWord ? { ...e, hideWord: true } : e)));
      setTimeout(() => setEnemies((l) => l.map((e) => ({ ...e, hideWord: false }))), 1600);
      flashHero("damage");
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }, 1300);
  }, [oppMeter, hard, time, difficulty]);

  /* comeback */
  useEffect(() => {
    if (comeback) return;
    if (score < oppScore - 700 && time < MATCH_SECONDS - 20) {
      setComeback(true);
      showBanner("COMEBACK BOOST!");
      setCrystal((c) => Math.min(100, c + 10));
      setTimeout(() => setComeback(false), 15000);
    }
  }, [score, oppScore, time, comeback]);

  /* ---------- resolve ---------- */
  function missEnemy(count = 1) {
    setCrystal((c) => Math.max(0, c - 12 * count));
    setCombo(0);
    if (hard) setMeter((m) => Math.max(0, m - 18 * count));
    defenceCombo.current = 0;
    setShake(true);
    setTimeout(() => setShake(false), 400);
    flashHero("damage");
    setCoach("That one slipped through. You've got the next one!");
    addFloat("MISSED!", "danger", 50, 70);
  }

  function sendAttack(name: string, count: number, kinds: EnemyKind[]) {
    if (!hard || cooldown.current > Date.now() || time > MATCH_SECONDS - 5) return;
    cooldown.current = Date.now() + 3500;
    stats.current.attacksSent += 1;
    stats.current.enemiesSent += Math.min(4, count);
    setOppIncoming((n) => n + count);
    setOppCrystal((c) => Math.max(0, c - 6 * count));
    setAttackFx("out");
    showBanner(name);
    setTimeout(() => {
      setAttackFx(null);
      setOppIncoming((n) => Math.max(0, n - count));
    }, 1400);
    void kinds;
  }

  function resolve(
    kind: "correct" | "wrong" | "uncertain",
    fast?: boolean,
    measuredConfidence?: number,
  ) {
    if (!target || busy.current || !running) return;
    busy.current = true;
    setStatus("checking");
    setHeroState("signing");
    setTimeout(() => {
      busy.current = false;
      stats.current.total += 1;
      if (kind === "correct") {
        const resultConfidence = measuredConfidence ?? 78 + Math.floor(Math.random() * 20);
        const elapsed = fast ? 1200 : Date.now() - target.bornAt;
        const rating = speedRating(elapsed);
        if (rating.label !== "STEADY") stats.current.bestSpeed = rating.label;
        const nextCombo = combo + 1;
        const gained = 100 + combo * 15 + rating.bonus * 2;
        stats.current.correct += 1;
        setScore((s) => s + gained);
        setCombo(nextCombo);
        setBestCombo((b) => Math.max(b, nextCombo));
        setStatus("accepted");
        setConfidence(resultConfidence);
        setEnemies((l) => l.map((e) => (e.id === target.id ? { ...e, status: "defeated" } : e)));
        setTimeout(() => setEnemies((l) => l.filter((e) => e.id !== target.id)), 400);
        addFloat(`+${gained}`, "success", target.x, target.y);
        if (rating.tag) addFloat(rating.tag, "target", 44, 26);
        flashHero(nextCombo >= 5 ? "combo" : "correct");
        setCoach(pick(["Great hand shape!", "Your combo is growing!", "Perfect defence!"]));

        if (target.fromOpponent) {
          stats.current.clearedIncoming += 1;
          defenceCombo.current += 1;
          if (hard) setMeter((m) => Math.min(100, m + 8));
          if (defenceCombo.current === 2) addFloat("NICE DEFENCE!", "magic", 50, 34);
          if (defenceCombo.current === 3) {
            stats.current.defended += 1;
            showBanner("PERFECT DEFENCE!");
            sendAttack("COUNTER SIGN!", 1, ["basic"]);
          }
        }

        if (hard) {
          setMeter((m) => {
            const next = Math.min(100, m + rating.bonus + nextCombo * 2 + (comeback ? 8 : 0));
            return next;
          });
          const atk = comboAttack(nextCombo);
          if (atk) sendAttack(atk.name, atk.count, atk.kinds);
        }
      } else {
        const uncertain = kind === "uncertain";
        setStatus(uncertain ? "almost" : "rejected");
        setConfidence((c) => Math.max(12, c - (uncertain ? 10 : 22)));
        if (hard) setMeter((m) => Math.max(0, m - (uncertain ? 4 : 10)));
        setEnemies((l) => l.map((e) => (e.id === target.id ? { ...e, status: "hit" } : e)));
        setTimeout(
          () =>
            setEnemies((l) => l.map((e) => (e.id === target.id ? { ...e, status: "idle" } : e))),
          450,
        );
        addFloat(uncertain ? "ALMOST!" : "TRY AGAIN!", "danger", target.x, target.y);
        flashHero("wrong");
        setCoach(pick(["Almost! Try once more.", "Watch the hand shape!"]));
      }
    }, 380);
  }

  /* meter full → auto attack ready hint */
  useEffect(() => {
    if (hard && meter >= 100) {
      setMeter(0);
      sendAttack("ATTACK READY!", 2, ["basic", "fast"]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meter]);

  /* ---------- end ---------- */
  const end = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    const s = stats.current;
    const playerAcc = s.total ? Math.round((s.correct / s.total) * 100) : 0;
    const oppAcc = s.oppTotal ? Math.round((s.oppCorrect / s.oppTotal) * 100) : opponent.accuracy;
    const playerTotal = score + crystal * 6 + bestCombo * 10;
    const rivalTotal = oppScore + oppCrystal * 6 + oppBestCombo * 10;
    const outcome =
      Math.abs(playerTotal - rivalTotal) < 60
        ? "draw"
        : playerTotal > rivalTotal
          ? "victory"
          : "defeat";
    const summary: string[] = [];
    if (hard) {
      summary.push(
        outcome === "victory"
          ? "You won through faster signs."
          : "Their combos landed more attacks.",
      );
      if (bestCombo >= 8) summary.push(`Your x${bestCombo} combo created the deciding attack.`);
      summary.push(
        `You blocked ${s.clearedIncoming}/${Math.max(1, s.oppEnemies)} incoming enemies.`,
      );
    } else {
      summary.push(
        outcome === "victory"
          ? "Steady accuracy kept you ahead all match."
          : "Keep the combo alive to close the score gap.",
      );
    }
    summary.push("Practise these signs to improve your defence.");
    onFinish({
      outcome,
      battleMode,
      opponent,
      player: {
        score,
        accuracy: playerAcc,
        bestCombo,
        attacksSent: s.attacksSent,
        enemiesSent: s.enemiesSent,
        defended: s.defended,
        cleared: s.clearedIncoming,
        bestSpeed: s.bestSpeed,
      },
      rival: {
        score: oppScore,
        accuracy: oppAcc,
        bestCombo: oppBestCombo,
        attacksSent: s.oppAttacks,
        enemiesSent: s.oppEnemies,
      },
      summary,
    });
  }, [
    score,
    crystal,
    bestCombo,
    oppScore,
    oppCrystal,
    oppBestCombo,
    opponent,
    battleMode,
    hard,
    onFinish,
  ]);

  useEffect(() => {
    if (time <= 0 || crystal <= 0 || oppCrystal <= 0) end();
  }, [time, crystal, oppCrystal, end]);

  return (
    <Scene dim={0.18} className={cn(shake && "anim-shake-screen")}>
      <div className="flex h-full flex-col">
        {/* top: opponent + shared timer */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 p-2 sm:p-3">
          <div className="flex min-w-0 flex-col gap-1">
            <HudChip label="You" value={score} tone="target" />
            <HudChip label="Combo" value={`x${combo}`} tone="success" />
            {hard && (
              <div className="w-36 text-cream drop-shadow sm:w-52">
                <Meter value={meter} label="Attack" tone="magic" stages />
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="hud-chip text-lg">{Math.max(0, time)}s</span>
            <span className="hud-chip text-[0.6rem]">ROUND {round}</span>
            <span className="font-display text-xl font-black text-cream text-outline">VS</span>
            <span className="hud-chip text-[0.6rem]">{hard ? "HARD BATTLE" : "NORMAL BATTLE"}</span>
          </div>

          <div className="flex min-w-0 flex-col items-end gap-1">
            <div className="hud-chip max-w-full">
              <Avatar index={opponent.avatar} size={22} />
              <span className="truncate text-xs">{opponent.name}</span>
              <span className="tabular-nums">{oppScore}</span>
            </div>
            <HudChip label="Combo" value={`x${oppCombo}`} />
            {hard && (
              <div className="w-36 text-cream drop-shadow sm:w-52">
                <Meter value={oppMeter} label="Their attack" tone="danger" stages />
              </div>
            )}
            {hard && oppIncoming > 0 && (
              <span className="hud-chip border-magic text-xs">
                <Zap className="h-3.5 w-3.5 text-magic" aria-hidden /> Sending {oppIncoming}
              </span>
            )}
          </div>
        </div>

        {/* opponent simplified field */}
        <div className="mx-2 mb-1 flex items-center gap-2 rounded-xl border-[3px] border-ink bg-ink/45 px-2 py-1 backdrop-blur sm:mx-3">
          <span className="font-display text-[0.6rem] font-black uppercase tracking-widest text-cream">
            Their field
          </span>
          <div className="relative h-8 flex-1 overflow-hidden rounded-lg bg-cream/15">
            {Array.from({ length: Math.min(5, 2 + Math.floor(oppCombo / 2)) }).map((_, i) => (
              <span
                key={i}
                className="anim-bob absolute top-1 h-6 w-6 rounded-full border-2 border-ink bg-sky-mid"
                style={{ left: `${8 + i * 17}%`, animationDelay: `${i * 0.3}s` }}
                aria-hidden
              />
            ))}
          </div>
          <span className="hud-chip text-[0.6rem]">
            <Shield className="h-3 w-3" aria-hidden /> {oppCrystal}%
          </span>
        </div>

        {/* player field */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div className="pointer-events-none absolute right-2 top-2 z-30 flex flex-col items-end gap-1">
            {hard ? (
              <>
                <span className="rounded-full border border-magic bg-magic px-2 py-0.5 font-display text-[0.52rem] font-black uppercase tracking-widest text-cream shadow-sm">
                  Purple = rival attack
                </span>
                <span className="rounded-full border border-success bg-success px-2 py-0.5 font-display text-[0.52rem] font-black uppercase tracking-widest text-[oklch(0.2_0.05_180)] shadow-sm">
                  Green = field spawn
                </span>
              </>
            ) : (
              <span className="rounded-full border border-cream/40 bg-ink/80 px-2 py-0.5 font-display text-[0.52rem] font-black uppercase tracking-widest text-cream shadow-sm">
                Normal battle · no rival attacks
              </span>
            )}
          </div>
          {attackFx === "in" && (
            <div
              aria-hidden
              className="anim-portal absolute left-1/2 top-4 h-20 w-20 -translate-x-1/2 rounded-full border-[6px] border-dashed border-magic bg-magic/30"
            />
          )}
          {attackFx === "out" && (
            <span
              aria-hidden
              className="anim-attack absolute bottom-16 left-16 h-8 w-8 rounded-full bg-target"
              style={{ ["--fly-x" as string]: "60vw", ["--fly-y" as string]: "-45vh" }}
            />
          )}
          {warning && (
            <div className="absolute inset-x-0 top-2 z-40 flex justify-center">
              <span className="word-label anim-target border-danger bg-danger px-4 py-1 text-lg text-cream">
                ⚠ {warning}
              </span>
            </div>
          )}
          {banner && (
            <div className="pointer-events-none absolute inset-0 z-40 grid place-items-center">
              <span className="anim-scene font-display text-4xl font-black text-target text-outline sm:text-6xl">
                {banner}
              </span>
            </div>
          )}
          {comeback && (
            <span className="hud-chip absolute left-2 top-2 z-30 border-success text-xs">
              COMEBACK BOOST
            </span>
          )}

          {enemies.map((e) => (
            <EnemySprite
              key={e.id}
              kind={e.kind}
              word={e.word}
              hideWord={e.hideWord}
              fromOpponent={e.fromOpponent}
              active={target?.id === e.id}
              status={e.status}
              className={target?.id === e.id ? "z-20" : "z-10 opacity-80"}
              style={{ left: `${e.x}%`, top: `${e.y}%`, transition: "top 90ms linear" }}
            />
          ))}
          {floats.map((f) => (
            <FloatingText
              key={f.id}
              text={f.text}
              tone={f.tone}
              style={{ left: `${f.x}%`, top: `${f.y}%` }}
            />
          ))}
          {settings.coachMessages && (
            <CoachBubble
              message={coach}
              className="absolute bottom-16 left-1 z-30 origin-bottom-left scale-90 sm:bottom-2 sm:left-2 sm:scale-100"
            />
          )}
          <Hero
            state={heroState}
            className="absolute bottom-0 right-2 z-20 h-28 w-20 sm:h-40 sm:w-28"
          />
          <div className="absolute inset-x-0 bottom-0">
            <CrystalZone health={crystal} flash={crystal < 40} />
          </div>
        </div>

        {/* input row */}
        <div className="flex shrink-0 items-end gap-3 p-2 sm:p-3">
          <div className="w-full max-w-md">
            {inputMode === "camera" ? (
              <div className="flex items-end gap-3">
                <div className="w-40 sm:w-52">
                  <LiveCamera
                    targets={target ? [target.signId] : []}
                    active={running && !!target}
                    showConfidence={settings.showConfidence}
                    onResult={(result) =>
                      resolve(
                        result.accepted ? "correct" : "wrong",
                        false,
                        Math.round(result.confidence * 100),
                      )
                    }
                    onError={() => setStatus("nohands")}
                  />
                </div>
                <div className="space-y-2">
                  <span className="word-label block bg-target text-center text-lg text-[oklch(0.2_0.05_50)]">
                    {target?.word ?? "—"}
                  </span>
                  <span className="hud-chip block text-center text-xs">Show sign to camera</span>
                </div>
              </div>
            ) : (
              <KeyboardInput
                target={target?.word ?? ""}
                onSubmit={(v) =>
                  resolve(
                    v.trim().toLowerCase() === (target?.word ?? "").toLowerCase()
                      ? "correct"
                      : "wrong",
                  )
                }
                disabled={!target}
                status={status}
                confidence={confidence}
                showConfidence={settings.showConfidence}
              />
            )}
          </div>
          <div className="ml-auto flex items-end gap-2">
            <DevPanel
              title="Battle prototype controls"
              actions={[
                { label: "Player Correct", onClick: () => resolve("correct") },
                { label: "Player Incorrect", onClick: () => resolve("wrong") },
                { label: "Player Fast Clear", onClick: () => resolve("correct", true) },
                { label: "Add Combo", onClick: () => setCombo((c) => c + 1) },
                { label: "Fill Attack Meter", onClick: () => setMeter(100) },
                {
                  label: "Trigger Player Attack",
                  onClick: () => sendAttack("SIGN STORM!", 3, ["basic", "fast", "shield"]),
                },
                { label: "Trigger Opp Attack", onClick: () => setOppMeter(100) },
                {
                  label: "Add Incoming Enemy",
                  onClick: () =>
                    setEnemies((l) =>
                      l.length >= MAX_ENEMIES
                        ? l
                        : [...l, makeEnemy({ fromOpponent: true }, difficulty)],
                    ),
                },
                {
                  label: "Clear Incoming",
                  onClick: () => setEnemies((l) => l.filter((e) => !e.fromOpponent)),
                },
                {
                  label: "Comeback Boost",
                  onClick: () => {
                    setComeback(true);
                    showBanner("COMEBACK BOOST!");
                  },
                },
                { label: "End Match", onClick: () => setTime(0) },
              ]}
            />
            <IconButton label="Pause" onClick={() => setPaused(true)}>
              <Pause className="mx-auto h-5 w-5" aria-hidden />
            </IconButton>
          </div>
        </div>
      </div>

      {paused && (
        <PauseOverlay
          onResume={() => setPaused(false)}
          onRestart={onRestart}
          onSettings={onOpenSettings}
          onMenu={onMenu}
        />
      )}
      <span className="sr-only" aria-live="polite">
        {warning ?? banner ?? ""}
      </span>
      <span className="sr-only">
        <Swords aria-hidden /> Simulated opponent controlled by this device
      </span>
    </Scene>
  );
}
