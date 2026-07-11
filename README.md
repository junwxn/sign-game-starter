# Sign Game — starter

Falling-word arcade game built against a swappable `SignRecognizer` interface.
Today the recognizer is a keyboard mock; on integration day it becomes the
webcam CV pipeline by changing one constructor.

## Run it

```bash
npm install
npm run dev        # opens on http://localhost:5173
```

Type the word on a falling enemy and press Enter. The verdict arrives after a
delay and correct words are sometimes rejected — that's deliberate (see
`src/config.ts`, `MOCK`): the mock imitates the timing and fallibility of real
sign recognition so the game is tuned for CV from day one.

`?input=keyboard` (default) / `?input=cv` switches the recognizer. CV mode
shows a "not implemented" message until `LiveRecognizer` exists.

After game over: **R** restarts, **E** downloads the session's attempt log as
JSONL (raw material for the latency and false-accept evidence later).

## File map

```
src/
  config.ts                  every tunable number, keyed by input mode
  vocab.ts                   placeholder word list (replace with final signs)
  logging.ts                 JSONL attempt logger
  recognizer/
    types.ts                 THE CONTRACT — game/CV integration boundary
    KeyboardMockRecognizer.ts  typing stand-in with latency + false rejects
    LiveRecognizer.ts        Yi Da's starting point (roadmap in comments)
  scenes/
    GameScene.ts             spawning, descent, attempt resolution, HUD
  main.ts                    Phaser bootstrap
```

Rule of thumb: the scene talks only to `SignRecognizer`. If a change requires
the scene to know *which* recognizer is behind the interface, the change
belongs in the recognizer, not the scene.

## Build order from here

1. Juice: particles on kill, sound (Phaser audio), score popups, combo streaks.
2. Waves: escalate speed/spawn rate over time; brief "wave N" interstitials.
3. Hint button: after 2 failed attempts on a word, show the reference sign
   video/GIF (this is the *teaching* moment — log hint usage too).
4. CV-shaped screens: a calibration scene slot (framing check before play)
   and a results screen with per-word stats from the logger.
5. Menu scene with mode/difficulty selection.

## Why these choices (decision log seeds)

- **Phaser 3 (3.90), not Phaser 4:** v4 is out, but nearly all tutorials,
  examples, and answers target v3, and v3 is the battle-tested API. Revisit
  post-hackathon.
- **TypeScript:** the recognizer contract is the whole integration plan; types
  make it enforceable.
- **No physics engine:** enemies move in `update()` by `speed × delta` — a
  descending-words game doesn't need collision physics.
- **Config-driven tunables per input mode:** typing "water" and signing WATER
  take different times; game feel must be retunable without touching scenes.

## Learning Phaser (half a day, in order)

1. Official "Making your first Phaser 3 game" tutorial — phaser.io/tutorials
2. The concepts this project already uses (look them up as you meet them):
   Scene lifecycle (`create`/`update`), GameObjects (text, rectangle,
   container), tweens, time events, keyboard input, camera shake.
3. labs.phaser.io — runnable examples for everything (particles, audio, UI).
