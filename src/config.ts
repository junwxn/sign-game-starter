// ---------------------------------------------------------------------------
// Every game-feel number lives here, and anything that differs between input
// modes is keyed by mode. Tuning for CV should never require touching scene
// code — only this file. (Decision log: config-driven tunables, 2026-07-09.)
// ---------------------------------------------------------------------------

export type InputMode = 'keyboard' | 'cv';

/** Read ?input=keyboard|cv from the URL. Defaults to keyboard. */
export const INPUT_MODE: InputMode =
  new URLSearchParams(window.location.search).get('input') === 'cv' ? 'cv' : 'keyboard';

export const GAME = {
  width: 800,
  height: 600,

  /** ms between enemy spawns. CV is slower: producing a sign takes 1–2.5 s. */
  spawnIntervalMs: { keyboard: 2600, cv: 5200 } as Record<InputMode, number>,

  /** enemy descent speed in px/second. */
  descentSpeed: { keyboard: 55, cv: 26 } as Record<InputMode, number>,

  /** max enemies on screen at once. */
  maxEnemies: { keyboard: 4, cv: 3 } as Record<InputMode, number>,

  startingLives: 3,
  pointsPerKill: 10,
} as const;

/**
 * The keyboard mock deliberately imitates the *pessimistic* shape of CV input:
 * attempts take time and sometimes fail even when correct. Tune the game
 * against these numbers and integration day holds no surprises.
 */
export const MOCK = {
  latencyMs: 1500,       // time between Enter and the verdict
  falseRejectRate: 0.15, // correct word still rejected this often — retry is part of the loop
} as const;
